import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string, totpCode?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenant: true, employee: true },
    });
    if (!user) throw new UnauthorizedException('Identifiants incorrects');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Compte temporairement verrouillé');
    }

    const ok = await argon2.verify(user.passwordHash, password + (this.config.get('ARGON2_PEPPER') || ''));
    if (!ok) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: { increment: 1 },
          lockedUntil: user.failedLoginCount + 1 >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : undefined,
        },
      });
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (user.twoFactorEnabled) {
      if (!totpCode) {
        return { requires2fa: true, userId: user.id };
      }
      const valid = authenticator.verify({ token: totpCode, secret: user.twoFactorSecret! });
      if (!valid) throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      token,
      user: {
        id: user.id, email: user.email, role: user.role,
        tenantId: user.tenantId, tenant: user.tenant,
        employee: user.employee ? {
          id: user.employee.id, firstName: user.employee.firstName,
          lastName: user.employee.lastName, jobTitle: user.employee.jobTitle,
        } : null,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password + (this.config.get('ARGON2_PEPPER') || ''), {
      type: argon2.argon2id,
      memoryCost: 19456, timeCost: 2, parallelism: 1,
    });
  }
}
