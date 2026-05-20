import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SEED_ACTIVITIES } from './seed-activities';

@Injectable()
export class RgpdService {
  constructor(private prisma: PrismaService) {}

  // ===== Registre des traitements (art. 30) =====
  async listActivities(tenantId?: string) {
    let list = await this.prisma.processingActivity.findMany({
      where: { active: true, OR: [{ tenantId }, { tenantId: null }] },
      orderBy: { name: 'asc' },
    });
    if (list.length === 0) {
      await Promise.all(SEED_ACTIVITIES.map((a) => this.prisma.processingActivity.create({ data: a as any })));
      list = await this.prisma.processingActivity.findMany({ where: { active: true } });
    }
    return list;
  }

  createActivity(data: any) { return this.prisma.processingActivity.create({ data }); }
  updateActivity(id: string, data: any) { return this.prisma.processingActivity.update({ where: { id }, data }); }
  deleteActivity(id: string) { return this.prisma.processingActivity.delete({ where: { id } }); }

  // ===== Audit log =====
  async auditLog(opts: { tenantId?: string; userId?: string; entityType?: string; limit?: number }) {
    const where: any = {};
    if (opts.tenantId) where.tenantId = opts.tenantId;
    if (opts.userId) where.userId = opts.userId;
    if (opts.entityType) where.entityType = opts.entityType;
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { at: 'desc' },
      take: opts.limit || 100,
      include: { user: { select: { email: true } } },
    });
  }

  // ===== Portabilité (art. 20) — export complet du dossier salarié =====
  async exportEmployeeData(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        tenant: { select: { code: true, name: true, siret: true } },
        contracts: { include: { signatures: true } },
        letters: true,
        leaves: { include: { type: true } },
        leaveBalances: { include: { type: true } },
        timesheets: true,
        overtimeRequests: true,
        expenseReports: { include: { lines: true } },
        payslips: true,
        payrollVariables: true,
        reviewsAsEmployee: true,
        goals: true,
        testAttempts: true,
        onboarding: true,
        manager: { select: { firstName: true, lastName: true } },
      },
    });
    if (!employee) throw new NotFoundException('Salarié introuvable');

    // Trace la requête
    await this.prisma.dataExportRequest.create({
      data: { employeeId, type: 'portability', status: 'completed', completedAt: new Date() },
    });

    return {
      exportedAt: new Date().toISOString(),
      legalBasis: 'Article 20 RGPD — Droit à la portabilité',
      dataController: { name: employee.tenant?.name, siret: employee.tenant?.siret },
      employee,
    };
  }

  /**
   * Droit à l'oubli (art. 17) — anonymise le salarié.
   * Les données légalement obligatoires (bulletins paie 50 ans, etc.) sont conservées
   * mais avec champs identifiants vidés.
   */
  async deleteEmployeeData(employeeId: string, reason: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Salarié introuvable');

    // Trace la requête
    const req = await this.prisma.dataExportRequest.create({
      data: { employeeId, type: 'deletion', status: 'completed', completedAt: new Date(), notes: reason },
    });

    // Anonymisation : on ne supprime PAS les bulletins ni les contrats (conservation légale),
    // mais on vide les identifiants personnels.
    const anonId = `ANON-${employeeId.slice(-6)}`;
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName: 'Anonymisé',
        lastName: anonId,
        email: `${anonId}@anonyme.local`,
        phone: null, address: null, postalCode: null, city: null,
        birthDate: null, birthPlace: null,
        socialSecurity: null,
        iban: null, bic: null, bankName: null,
        emergencyName: null, emergencyPhone: null,
        photoUrl: null,
        status: 'inactif',
      },
    });

    // Désactiver le compte utilisateur
    if (employee.userId) {
      await this.prisma.user.update({
        where: { id: employee.userId },
        data: { email: `${anonId}@anonyme.local`, lockedUntil: new Date('2099-12-31') },
      });
    }

    return { ok: true, requestId: req.id, message: `Salarié anonymisé. Documents légaux (bulletins, contrats) conservés selon la durée légale.` };
  }

  // ===== Consentements =====
  recordConsent(data: { employeeId: string; consentType: string; granted: boolean; ip?: string; userAgent?: string }) {
    return this.prisma.consentRecord.create({ data });
  }

  consentsForEmployee(employeeId: string) {
    return this.prisma.consentRecord.findMany({ where: { employeeId }, orderBy: { grantedAt: 'desc' } });
  }

  // ===== Export requests =====
  listExportRequests() {
    return this.prisma.dataExportRequest.findMany({ orderBy: { requestedAt: 'desc' } });
  }
}
