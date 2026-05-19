import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { businessDaysBetween, frenchHolidays } from '../../common/holidays';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  /**
   * Variables de paie mensuelles agrégées par salarié.
   * Source de vérité pour transmission au logiciel de paie.
   */
  async variables(opts: { month: string; tenantId?: string }) {
    const empWhere: any = { status: 'actif' };
    if (opts.tenantId) empWhere.tenantId = opts.tenantId;
    const employees = await this.prisma.employee.findMany({
      where: empWhere,
      include: { tenant: { select: { code: true, name: true, siret: true } } },
    });

    const [year, mo] = opts.month.split('-').map(Number);
    const monthStart = new Date(year, mo - 1, 1);
    const monthEnd = new Date(year, mo, 0);
    const isoStart = monthStart.toISOString().slice(0, 10);
    const isoEnd = monthEnd.toISOString().slice(0, 10);
    const businessDays = businessDaysBetween(isoStart, isoEnd);

    const rows = await Promise.all(employees.map(async (e) => {
      // Timesheets
      const sheets = await this.prisma.timesheet.findMany({
        where: { employeeId: e.id, date: { gte: monthStart, lte: monthEnd } },
      });
      const workedHours = sheets.reduce((s, t) => s + (t.hoursWorked || 0), 0);
      const workedDays = sheets.length;
      const baseHours = (e.weeklyHours || 35) / 5 * workedDays;
      const overtimeHours = Math.max(0, workedHours - baseHours);

      // Leaves
      const leaves = await this.prisma.leave.findMany({
        where: { employeeId: e.id, status: 'approuve', OR: [{ startDate: { lte: monthEnd }, endDate: { gte: monthStart } }] },
        include: { type: true },
      });
      let cpDays = 0, rttDays = 0, sickDays = 0, otherAbsenceDays = 0;
      leaves.forEach((l) => {
        const ls = new Date(Math.max(l.startDate.getTime(), monthStart.getTime()));
        const le = new Date(Math.min(l.endDate.getTime(), monthEnd.getTime()));
        const days = businessDaysBetween(ls.toISOString().slice(0, 10), le.toISOString().slice(0, 10));
        switch (l.type.code) {
          case 'CP': cpDays += days; break;
          case 'RTT': rttDays += days; break;
          case 'MAL': case 'MAT': case 'PAT': sickDays += days; break;
          default: if (l.type.code !== 'TT') otherAbsenceDays += days;
        }
      });

      // Heures sup approuvées
      const otReqs = await this.prisma.overtimeRequest.findMany({
        where: { employeeId: e.id, status: 'approuve', date: { gte: monthStart, lte: monthEnd } },
      });
      const overtimeApproved = otReqs.reduce((s, r) => s + r.hours, 0);

      // Tickets restau : jours travaillés
      const mealVouchersCount = Math.max(0, businessDays - cpDays - rttDays - sickDays - otherAbsenceDays);

      // Primes
      const primes = await this.prisma.payrollVariable.findMany({ where: { employeeId: e.id, month: opts.month } });
      const bonuses = primes.filter((p) => p.type === 'prime').reduce((s, p) => s + p.amount, 0);
      const deductions = primes.filter((p) => p.type === 'retenue').reduce((s, p) => s + p.amount, 0);

      // Frais approuvés/remboursés
      const exp = await this.prisma.expenseReport.findMany({
        where: { employeeId: e.id, status: { in: ['approuve', 'rembourse'] } },
        include: { lines: { where: { date: { gte: monthStart, lte: monthEnd } } } },
      });
      const expenses = exp.flatMap((r) => r.lines).reduce((s, l) => s + l.amount, 0);

      const totalGross = (e.grossSalary || 0) + bonuses - deductions
        + overtimeApproved * ((e.grossSalary || 0) / (e.weeklyHours || 35) / 4.33) * 1.25;

      return {
        employeeId: e.id, matricule: e.matricule,
        firstName: e.firstName, lastName: e.lastName,
        companyCode: e.tenant?.code || '', companyName: e.tenant?.name || '',
        siret: e.tenant?.siret || '',
        iban: e.iban || '',
        baseSalary: e.grossSalary,
        workedDays, workedHours, overtimeHours, overtimeApproved,
        cpDays, rttDays, sickDays, otherAbsenceDays,
        mealVouchersCount,
        bonuses, deductions, expenses,
        totalGross,
      };
    }));

    return rows;
  }

  /**
   * Génère les bulletins (simulés) du mois pour tous les salariés.
   */
  async generatePayslips(month: string, tenantId?: string) {
    const rows = await this.variables({ month, tenantId });
    const created: any[] = [];
    for (const r of rows) {
      const gross = r.totalGross;
      const charges = Math.round(gross * 0.22);
      const net = Math.round(gross * 0.78);
      const cost = Math.round(gross * 1.42);
      const ps = await this.prisma.payslip.upsert({
        where: { employeeId_month: { employeeId: r.employeeId, month } },
        create: { employeeId: r.employeeId, month, gross, socialCharges: charges, net, employerCost: cost, status: 'edite' },
        update: { gross, socialCharges: charges, net, employerCost: cost },
      });
      created.push(ps);
    }
    return { count: created.length, payslips: created };
  }

  payslipsList(opts: { employeeId?: string; month?: string; tenantId?: string }) {
    const where: any = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.month) where.month = opts.month;
    if (opts.tenantId) where.employee = { tenantId: opts.tenantId };
    return this.prisma.payslip.findMany({
      where, orderBy: [{ month: 'desc' }],
      include: { employee: { select: { id: true, firstName: true, lastName: true, matricule: true } } },
    });
  }

  addVariable(data: { employeeId: string; month: string; type: string; label: string; amount: number }) {
    return this.prisma.payrollVariable.create({ data });
  }

  listVariablesForMonth(month: string, employeeId?: string) {
    const where: any = { month };
    if (employeeId) where.employeeId = employeeId;
    return this.prisma.payrollVariable.findMany({ where, include: { employee: { select: { firstName: true, lastName: true } } } });
  }

  deleteVariable(id: string) {
    return this.prisma.payrollVariable.delete({ where: { id } });
  }
}
