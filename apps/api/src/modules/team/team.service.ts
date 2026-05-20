import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { frenchHolidays } from '../../common/holidays';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vue d'ensemble pour un manager : tout ce qui attend sa validation.
   * Ou pour un admin/RH : tout en attente sur son tenant.
   */
  async pendingFor(opts: { managerId?: string; tenantId?: string }) {
    const where: any = {};
    if (opts.managerId) where.employee = { managerId: opts.managerId };
    if (opts.tenantId) where.employee = { ...(where.employee || {}), tenantId: opts.tenantId };

    const [leaves, overtime, expenses] = await Promise.all([
      this.prisma.leave.findMany({
        where: { status: 'en_attente', ...where },
        orderBy: { createdAt: 'desc' },
        include: { type: true, employee: { select: { id: true, firstName: true, lastName: true, jobTitle: true } } },
      }),
      this.prisma.overtimeRequest.findMany({
        where: { status: 'en_attente', ...where },
        orderBy: { createdAt: 'desc' },
        include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.expenseReport.findMany({
        where: { status: 'soumis', ...where },
        orderBy: { submittedAt: 'desc' },
        include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      }),
    ]);

    return { leaves, overtime, expenses };
  }

  /**
   * Planning équipe : qui est absent sur la période [from, to]
   */
  async planning(opts: { from: string; to: string; managerId?: string; tenantId?: string }) {
    const from = new Date(opts.from);
    const to = new Date(opts.to);

    const employeeFilter: any = { status: 'actif' };
    if (opts.managerId) employeeFilter.managerId = opts.managerId;
    if (opts.tenantId) employeeFilter.tenantId = opts.tenantId;

    const employees = await this.prisma.employee.findMany({
      where: employeeFilter,
      select: { id: true, firstName: true, lastName: true, jobTitle: true, managerId: true, tenantId: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    const empIds = employees.map((e) => e.id);
    const leaves = await this.prisma.leave.findMany({
      where: {
        status: 'approuve',
        employeeId: { in: empIds },
        OR: [
          { startDate: { lte: to }, endDate: { gte: from } },
        ],
      },
      include: { type: true },
    });

    // Calcul des jours fériés sur la période
    const yearStart = from.getFullYear();
    const yearEnd = to.getFullYear();
    let holidays: { date: string; name: string }[] = [];
    for (let y = yearStart; y <= yearEnd; y++) holidays = holidays.concat(frenchHolidays(y));

    return { employees, leaves, holidays };
  }

  /**
   * KPIs équipe pour le dashboard manager.
   */
  async stats(opts: { managerId?: string; tenantId?: string }) {
    const empWhere: any = { status: 'actif' };
    if (opts.managerId) empWhere.managerId = opts.managerId;
    if (opts.tenantId) empWhere.tenantId = opts.tenantId;

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart); todayEnd.setHours(23, 59, 59, 999);
    const next30 = new Date(todayStart); next30.setDate(next30.getDate() + 30);

    const empIds = (await this.prisma.employee.findMany({ where: empWhere, select: { id: true } })).map((e) => e.id);

    const [
      totalEmployees, pendingLeaves, pendingOvertime, pendingExpenses,
      todayAbsent, upcomingLeaves, expiringContracts, birthdaysMonth,
    ] = await Promise.all([
      this.prisma.employee.count({ where: empWhere }),
      this.prisma.leave.count({ where: { status: 'en_attente', employeeId: { in: empIds } } }),
      this.prisma.overtimeRequest.count({ where: { status: 'en_attente', employeeId: { in: empIds } } }),
      this.prisma.expenseReport.count({ where: { status: 'soumis', employeeId: { in: empIds } } }),
      this.prisma.leave.count({
        where: { status: 'approuve', employeeId: { in: empIds }, startDate: { lte: todayEnd }, endDate: { gte: todayStart } },
      }),
      this.prisma.leave.count({
        where: { status: 'approuve', employeeId: { in: empIds }, startDate: { gte: todayStart, lte: next30 } },
      }),
      this.prisma.employee.count({
        where: { ...empWhere, contractEnd: { not: null, gte: todayStart, lte: next30 } },
      }),
      this.countBirthdaysInMonth(empIds, todayStart.getMonth()),
    ]);

    return {
      totalEmployees,
      pendingLeaves, pendingOvertime, pendingExpenses,
      todayAbsent, upcomingLeaves,
      expiringContracts, birthdaysMonth,
    };
  }

  private async countBirthdaysInMonth(empIds: string[], month: number) {
    const rows = await this.prisma.employee.findMany({
      where: { id: { in: empIds }, birthDate: { not: null } },
      select: { birthDate: true },
    });
    return rows.filter((r) => r.birthDate && r.birthDate.getMonth() === month).length;
  }

  /**
   * Membres de l'équipe directe d'un manager.
   */
  async team(managerId: string) {
    return this.prisma.employee.findMany({
      where: { managerId, status: 'actif' },
      select: {
        id: true, firstName: true, lastName: true, jobTitle: true,
        email: true, contractStart: true, contractEnd: true,
        photoUrl: true,
      },
      orderBy: [{ lastName: 'asc' }],
    });
  }

  /**
   * Anniversaires du mois pour les employés visibles.
   */
  async birthdays(opts: { managerId?: string; tenantId?: string; month?: number }) {
    const empWhere: any = { status: 'actif', birthDate: { not: null } };
    if (opts.managerId) empWhere.managerId = opts.managerId;
    if (opts.tenantId) empWhere.tenantId = opts.tenantId;
    const all = await this.prisma.employee.findMany({
      where: empWhere,
      select: { id: true, firstName: true, lastName: true, jobTitle: true, birthDate: true },
    });
    const targetMonth = opts.month != null ? opts.month : new Date().getMonth();
    return all.filter((e) => e.birthDate && e.birthDate.getMonth() === targetMonth)
      .sort((a, b) => (a.birthDate?.getDate() || 0) - (b.birthDate?.getDate() || 0));
  }
}
