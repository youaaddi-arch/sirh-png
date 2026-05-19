import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdvanceHireProcessDto, CreateHireProcessDto } from './dto/hiring.dto';
import { trialPeriodDays, annualLeaveDays } from '@sirh/conventions-data';

@Injectable()
export class HiringService {
  constructor(private prisma: PrismaService) {}

  list(filters: { tenantId?: string; status?: string } = {}) {
    return this.prisma.hireProcess.findMany({
      where: filters as any,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, code: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        documents: { select: { id: true, key: true, filename: true, uploadedAt: true } },
      },
    });
  }

  async get(id: string) {
    const p = await this.prisma.hireProcess.findUnique({
      where: { id },
      include: {
        tenant: true,
        manager: true,
        assignedTo: { select: { id: true, email: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!p) throw new NotFoundException('Dossier d\'embauche introuvable');
    return p;
  }

  async create(dto: CreateHireProcessDto, createdById: string) {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.prisma.hireProcess.create({
      data: {
        ...dto,
        token,
        expiresAt,
        startDate: new Date(dto.startDate),
        status: 'pre_embauche',
        createdById,
        history: [{ at: new Date().toISOString(), by: createdById, action: 'Dossier créé' }] as any,
      },
    });
  }

  async advance(id: string, dto: AdvanceHireProcessDto, byUserId: string) {
    const p = await this.get(id);
    const next = dto.status;

    const updates: any = {
      status: next,
      history: [...(p.history as any[] || []), {
        at: new Date().toISOString(),
        by: byUserId,
        action: this.stepLabel(next),
        reason: dto.reason,
      }],
    };

    if (next === 'soumis') updates.submittedAt = new Date();
    if (next === 'valide') updates.validatedAt = new Date();

    if (next === 'embauche') {
      // Crée le salarié et coupe la session embauche
      const created = await this.finalize(p);
      updates.finalizedAt = new Date();
      updates.employeeId = created.id;
    }

    return this.prisma.hireProcess.update({ where: { id }, data: updates });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.hireProcess.delete({ where: { id } });
  }

  async stats(tenantId?: string) {
    const where: any = tenantId ? { tenantId } : {};
    const [total, pre, soumis, valide, contrat, embauche] = await Promise.all([
      this.prisma.hireProcess.count({ where }),
      this.prisma.hireProcess.count({ where: { ...where, status: 'pre_embauche' } }),
      this.prisma.hireProcess.count({ where: { ...where, status: 'soumis' } }),
      this.prisma.hireProcess.count({ where: { ...where, status: 'valide' } }),
      this.prisma.hireProcess.count({ where: { ...where, status: { in: ['contrat_genere', 'contrat_signe'] } } }),
      this.prisma.hireProcess.count({ where: { ...where, status: 'embauche' } }),
    ]);
    return { total, pre_embauche: pre, soumis, valide, contrat, embauche };
  }

  /**
   * Crée le salarié final à la finalisation du processus d'embauche.
   * Applique automatiquement les règles de la convention collective
   * (période d'essai et congés annuels).
   */
  private async finalize(p: any) {
    if (!p.draftData) throw new BadRequestException('Données candidat manquantes');
    const draft = p.draftData as any;
    const tenant = await this.prisma.tenant.findUnique({ where: { id: p.tenantId } });
    const conventionCode = tenant?.conventionCode || 'IDCC_3249';
    const trialDays = trialPeriodDays(conventionCode, p.contractType, p.statusClass);

    const count = await this.prisma.employee.count({ where: { tenantId: p.tenantId } });
    const matricule = `PNG-${String(count + 1).padStart(4, '0')}`;

    const employee = await this.prisma.employee.create({
      data: {
        tenantId: p.tenantId,
        matricule,
        civility: draft.civility,
        firstName: draft.firstName || p.firstName,
        lastName:  draft.lastName  || p.lastName,
        maidenName: draft.maidenName,
        nationality: draft.nationality,
        birthDate: draft.birthDate ? new Date(draft.birthDate) : null,
        birthPlace: draft.birthPlace,
        birthCountry: draft.birthCountry,
        socialSecurity: draft.socialSecurity,
        email: p.email,
        phone: draft.phone,
        address: draft.address,
        postalCode: draft.postalCode,
        city: draft.city,
        familySituation: draft.familySituation,
        numChildren: draft.numChildren ?? 0,
        emergencyName: draft.emergencyName,
        emergencyPhone: draft.emergencyPhone,
        rqth: draft.rqth || false,
        iban: draft.iban,
        bic: draft.bic,
        bankName: draft.bankName,
        taxRate: draft.taxRate,
        jobTitle: p.jobTitle,
        managerId: p.managerId,
        classification: p.statusClass,
        contractType: p.contractType,
        contractStart: new Date(p.startDate),
        weeklyHours: p.weeklyHours || 35,
        grossSalary: p.grossSalary,
        status: 'actif',
      },
    });

    // Ouverture des soldes de congés selon convention
    // (LeaveType à créer Sprint 5 — pour l'instant, on log)
    return employee;
  }

  private stepLabel(s: string): string {
    return ({
      pre_embauche: 'Création du dossier',
      soumis: 'Dossier soumis par le candidat',
      valide: 'Pièces validées par RH',
      contrat_genere: 'Contrat généré',
      contrat_signe: 'Contrat signé',
      embauche: 'Salarié créé et embauché',
      annule: 'Dossier annulé',
    })[s] || s;
  }
}
