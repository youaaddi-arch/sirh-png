import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLeaveDto, RejectLeaveDto } from './dto/leave.dto';
import { businessDaysBetween, frenchHolidays } from '../../common/holidays';

const DEFAULT_TYPES = [
  { code: 'CP',  name: 'Congés Payés',     color: '#2447df', annualDays: 25, paid: true },
  { code: 'RTT', name: 'RTT',              color: '#10b981', annualDays: 10, paid: true },
  { code: 'MAL', name: 'Maladie',          color: '#ef4444', annualDays: 0,  paid: true },
  { code: 'MAT', name: 'Maternité',        color: '#ec4899', annualDays: 0,  paid: true },
  { code: 'PAT', name: 'Paternité',        color: '#8b5cf6', annualDays: 0,  paid: true },
  { code: 'FAM', name: 'Événement familial', color: '#f59e0b', annualDays: 0, paid: true },
  { code: 'TT',  name: 'Télétravail',      color: '#06b6d4', annualDays: 0,  paid: true },
  { code: 'SS',  name: 'Sans solde',       color: '#6b7280', annualDays: 0,  paid: false },
];

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  // === TYPES ===
  async listTypes(tenantId?: string) {
    let types = await this.prisma.leaveType.findMany({
      where: { active: true, OR: [{ tenantId }, { tenantId: null }] },
    });
    // Auto-seed défaut si vide
    if (types.length === 0) {
      await Promise.all(DEFAULT_TYPES.map((t) => this.prisma.leaveType.create({ data: { ...t, tenantId: tenantId || null } })));
      types = await this.prisma.leaveType.findMany({ where: { active: true } });
    }
    return types;
  }

  // === LEAVES ===
  list(filters: { employeeId?: string; status?: string; managerId?: string; tenantId?: string } = {}) {
    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.tenantId) where.employee = { tenantId: filters.tenantId };
    if (filters.managerId) where.employee = { ...(where.employee || {}), managerId: filters.managerId };
    return this.prisma.leave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        type: true,
        employee: { select: { id: true, firstName: true, lastName: true, jobTitle: true, managerId: true, tenantId: true } },
      },
    });
  }

  async get(id: string) {
    const l = await this.prisma.leave.findUnique({ where: { id }, include: { type: true, employee: true } });
    if (!l) throw new NotFoundException('Demande de congé introuvable');
    return l;
  }

  async create(dto: CreateLeaveDto) {
    const days = businessDaysBetween(dto.startDate, dto.endDate)
      - (dto.halfDayStart ? 0.5 : 0)
      - (dto.halfDayEnd ? 0.5 : 0);
    if (days <= 0) throw new BadRequestException('Période invalide');

    return this.prisma.leave.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days,
        status: 'en_attente',
      },
    });
  }

  async approve(id: string, approvedById: string) {
    const l = await this.get(id);
    if (l.status !== 'en_attente') throw new BadRequestException('Cette demande n\'est pas en attente');
    await this.prisma.leave.update({
      where: { id },
      data: { status: 'approuve', approvedById, approvedAt: new Date() },
    });
    // Notification au salarié
    const emp = await this.prisma.employee.findUnique({ where: { id: l.employeeId } });
    if (emp?.userId) {
      await this.prisma.notification.create({
        data: {
          userId: emp.userId, type: 'leave', title: 'Congé approuvé',
          body: `Votre demande du ${l.startDate.toISOString().slice(0,10)} au ${l.endDate.toISOString().slice(0,10)} a été approuvée.`,
          link: '/leaves',
        },
      });
    }
    return this.get(id);
  }

  async reject(id: string, approvedById: string, reason?: string) {
    const l = await this.get(id);
    if (l.status !== 'en_attente') throw new BadRequestException('Cette demande n\'est pas en attente');
    await this.prisma.leave.update({
      where: { id },
      data: { status: 'refuse', approvedById, approvedAt: new Date(), rejectReason: reason },
    });
    const emp = await this.prisma.employee.findUnique({ where: { id: l.employeeId } });
    if (emp?.userId) {
      await this.prisma.notification.create({
        data: {
          userId: emp.userId, type: 'leave', title: 'Congé refusé',
          body: `Votre demande a été refusée. ${reason || ''}`,
          link: '/leaves',
        },
      });
    }
    return this.get(id);
  }

  async cancel(id: string, userId: string) {
    const l = await this.get(id);
    const emp = await this.prisma.employee.findUnique({ where: { id: l.employeeId } });
    if (emp?.userId !== userId) throw new ForbiddenException('Vous ne pouvez annuler que vos propres demandes');
    return this.prisma.leave.update({ where: { id }, data: { status: 'annule' } });
  }

  // === BALANCES ===
  async getBalance(employeeId: string, year = new Date().getFullYear()) {
    const types = await this.listTypes();
    const balances = await this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { type: true },
    });

    // Auto-création des soldes manquants pour les types annuels
    const missing = types.filter((t) => t.annualDays > 0 && !balances.find((b) => b.typeId === t.id));
    for (const t of missing) {
      const taken = await this.prisma.leave.aggregate({
        _sum: { days: true },
        where: { employeeId, typeId: t.id, status: 'approuve' },
      });
      const pending = await this.prisma.leave.aggregate({
        _sum: { days: true },
        where: { employeeId, typeId: t.id, status: 'en_attente' },
      });
      const created = await this.prisma.leaveBalance.create({
        data: {
          employeeId, typeId: t.id, year,
          acquired: t.annualDays,
          taken: taken._sum.days || 0,
          pending: pending._sum.days || 0,
        },
        include: { type: true },
      });
      balances.push(created);
    }
    return balances;
  }

  // === Jours fériés
  holidays(year = new Date().getFullYear()) {
    return frenchHolidays(year);
  }
}
