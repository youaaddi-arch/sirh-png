import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.tenant.findMany({ orderBy: { code: 'asc' } });
  }

  async get(id: string) {
    const t = await this.prisma.tenant.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Tenant introuvable');
    return t;
  }

  create(data: any) {
    return this.prisma.tenant.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }

  async getConvention(tenantId: string) {
    const t = await this.get(tenantId);
    if (!t.conventionCode) return null;
    return this.prisma.convention.findUnique({ where: { code: t.conventionCode } });
  }
}
