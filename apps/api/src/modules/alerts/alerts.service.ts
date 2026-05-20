import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Détection des alertes du cycle de vie RH :
 * - Périodes d'essai arrivant à échéance (J-7 / J-14)
 * - CDD se terminant (J-30 / J-60)
 * - Renouvellements à proposer
 * - Tests de connaissance expirés
 */
@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async forUser(opts: { managerId?: string; tenantId?: string; role?: string }) {
    const empWhere: any = { status: 'actif' };
    if (opts.managerId) empWhere.managerId = opts.managerId;
    if (opts.tenantId && opts.role !== 'manager') empWhere.tenantId = opts.tenantId;

    const today = new Date();
    const in7 = new Date(today.getTime() + 7 * 86400000);
    const in14 = new Date(today.getTime() + 14 * 86400000);
    const in30 = new Date(today.getTime() + 30 * 86400000);
    const in60 = new Date(today.getTime() + 60 * 86400000);
    const in90 = new Date(today.getTime() + 90 * 86400000);

    const employees = await this.prisma.employee.findMany({ where: empWhere, include: { contracts: true } });

    const alerts: Array<{ type: string; severity: 'info' | 'warning' | 'critical'; title: string; body: string; employeeId: string; employeeName: string; dueDate?: Date }> = [];

    for (const e of employees) {
      // Période d'essai : contractStart + trialPeriodDays (sur le dernier contrat actif)
      const activeContract = e.contracts.find((c) => c.status === 'actif' || c.status === 'signe');
      if (activeContract && activeContract.trialPeriodDays > 0) {
        const trialEnd = new Date(activeContract.startDate.getTime() + activeContract.trialPeriodDays * 86400000);
        if (trialEnd > today && trialEnd <= in14) {
          alerts.push({
            type: 'periode_essai',
            severity: trialEnd <= in7 ? 'critical' : 'warning',
            title: 'Fin de période d\'essai imminente',
            body: `${e.firstName} ${e.lastName} — période d'essai jusqu'au ${trialEnd.toLocaleDateString('fr-FR')}. Planifier l'entretien de fin de PE.`,
            employeeId: e.id,
            employeeName: `${e.firstName} ${e.lastName}`,
            dueDate: trialEnd,
          });
        }
      }

      // CDD expirant
      if (e.contractEnd && e.contractEnd > today && e.contractEnd <= in90) {
        const days = Math.ceil((e.contractEnd.getTime() - today.getTime()) / 86400000);
        alerts.push({
          type: 'cdd_expirant',
          severity: days <= 30 ? 'critical' : days <= 60 ? 'warning' : 'info',
          title: `CDD à échéance dans ${days}j`,
          body: `${e.firstName} ${e.lastName} — fin de contrat le ${e.contractEnd.toLocaleDateString('fr-FR')}.`,
          employeeId: e.id,
          employeeName: `${e.firstName} ${e.lastName}`,
          dueDate: e.contractEnd,
        });
      }
    }

    // Tests de connaissance expirés ou jamais passés (pour les obligatoires)
    const empIds = employees.map((e) => e.id);
    if (empIds.length > 0) {
      const tests = await this.prisma.knowledgeTest.findMany({ where: { active: true } });
      for (const e of employees) {
        for (const t of tests) {
          const lastAttempt = await this.prisma.knowledgeTestAttempt.findFirst({
            where: { employeeId: e.id, testId: t.id, passed: true },
            orderBy: { completedAt: 'desc' },
          });
          if (!lastAttempt || (lastAttempt.expiresAt && lastAttempt.expiresAt < today)) {
            alerts.push({
              type: 'test_expire',
              severity: lastAttempt ? 'warning' : 'info',
              title: lastAttempt ? `Test "${t.title}" expiré` : `Test "${t.title}" à passer`,
              body: `${e.firstName} ${e.lastName} — ${lastAttempt ? 'à renouveler' : 'jamais passé'}.`,
              employeeId: e.id,
              employeeName: `${e.firstName} ${e.lastName}`,
            });
          }
        }
      }
    }

    return alerts.sort((a, b) => {
      const sev = { critical: 0, warning: 1, info: 2 };
      return sev[a.severity] - sev[b.severity];
    });
  }
}
