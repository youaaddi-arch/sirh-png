import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OvertimeService {
  constructor(private prisma: PrismaService) {}

  list(filters: { employeeId?: string; status?: string; managerId?: string } = {}) {
    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.managerId) where.employee = { managerId: filters.managerId };
    return this.prisma.overtimeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  create(data: { employeeId: string; date: string; hours: number; reason: string }) {
    return this.prisma.overtimeRequest.create({
      data: { ...data, date: new Date(data.date), status: 'en_attente' },
    });
  }

  async approve(id: string, approvedById: string) {
    const r = await this.prisma.overtimeRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Demande introuvable');
    if (r.status !== 'en_attente') throw new BadRequestException('Déjà traitée');
    return this.prisma.overtimeRequest.update({
      where: { id }, data: { status: 'approuve', approvedById, approvedAt: new Date() },
    });
  }

  async reject(id: string, approvedById: string, reason?: string) {
    const r = await this.prisma.overtimeRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Demande introuvable');
    return this.prisma.overtimeRequest.update({
      where: { id }, data: { status: 'refuse', approvedById, approvedAt: new Date(), rejectReason: reason },
    });
  }
}
