import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LegifranceService } from '../../integrations/legifrance/legifrance.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private legifrance: LegifranceService,
  ) {}

  list(filters: { active?: boolean; type?: string } = {}) {
    return this.prisma.tenant.findMany({
      where: filters,
      orderBy: { code: 'asc' },
      include: { organisation: { select: { id: true, name: true, slug: true } } },
    });
  }

  async get(id: string) {
    const t = await this.prisma.tenant.findUnique({
      where: { id },
      include: { organisation: { select: { id: true, name: true, slug: true } } },
    });
    if (!t) throw new NotFoundException('Société introuvable');
    return t;
  }

  async create(dto: CreateTenantDto) {
    const exists = await this.prisma.tenant.findUnique({ where: { code: dto.code } });
    if (exists) throw new BadRequestException(`Le code ${dto.code} est déjà utilisé`);
    return this.prisma.tenant.create({
      data: {
        ...dto,
        medicalProvider: dto.medicalProvider as any,
        healthInsurance: dto.healthInsurance as any,
        providentInsurance: dto.providentInsurance as any,
        pensionFund: dto.pensionFund as any,
        workInjuryFund: dto.workInjuryFund as any,
        apprenticeshipTax: dto.apprenticeshipTax as any,
      } as any,
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.get(id); // 404 si absent
    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...dto,
        medicalProvider: dto.medicalProvider as any,
        healthInsurance: dto.healthInsurance as any,
        providentInsurance: dto.providentInsurance as any,
        pensionFund: dto.pensionFund as any,
        workInjuryFund: dto.workInjuryFund as any,
        apprenticeshipTax: dto.apprenticeshipTax as any,
      } as any,
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.tenant.delete({ where: { id } });
  }

  async getConvention(tenantId: string) {
    const t = await this.get(tenantId);
    if (!t.conventionCode) return null;
    return this.legifrance.get(t.conventionCode);
  }

  async syncConvention(tenantId: string) {
    const t = await this.get(tenantId);
    if (!t.conventionCode) throw new BadRequestException('Aucune convention attribuée');
    return this.legifrance.syncOne(t.conventionCode);
  }

  async stats(tenantId: string) {
    const [employees, departments] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId } }),
      this.prisma.department.count({ where: { tenantId } }),
    ]);
    return { employees, departments };
  }
}
