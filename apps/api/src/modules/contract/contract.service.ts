import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClaudeService } from '../../integrations/claude/claude.service';
import { SignatureService } from '../../integrations/signature/signature.service';
import { LegifranceService } from '../../integrations/legifrance/legifrance.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { trialPeriodDays, annualLeaveDays, noticeDays } from '@sirh/conventions-data';
import { SignContractDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private claude: ClaudeService,
    private signature: SignatureService,
    private legifrance: LegifranceService,
    @Inject(forwardRef(() => OnboardingService))
    private onboarding: OnboardingService,
  ) {}

  list(filters: { tenantId?: string; employeeId?: string; status?: string } = {}) {
    return this.prisma.contract.findMany({
      where: filters as any,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        signatures: true,
      },
    });
  }

  async get(id: string) {
    const c = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        tenant: true,
        employee: true,
        signatures: { orderBy: { signedAt: 'asc' } },
      },
    });
    if (!c) throw new NotFoundException('Contrat introuvable');
    return c;
  }

  /**
   * Génère un contrat à partir d'un dossier d'embauche.
   * - Calcule période d'essai et CP depuis la convention
   * - Appelle Claude (ou template) pour rédiger le contrat
   */
  async generateFromHire(hireProcessId: string, createdById: string) {
    const hp = await this.prisma.hireProcess.findUnique({
      where: { id: hireProcessId },
      include: { tenant: true },
    });
    if (!hp) throw new NotFoundException('Dossier d\'embauche introuvable');
    if (!hp.draftData) throw new BadRequestException('Aucune donnée candidat — le candidat doit soumettre son dossier d\'abord');

    const conventionCode = hp.tenant.conventionCode || 'IDCC_3249';
    const convention = await this.legifrance.get(conventionCode);
    const trial = trialPeriodDays(conventionCode, hp.contractType, hp.statusClass);
    const cp = annualLeaveDays(conventionCode, 0);
    const notice = noticeDays(conventionCode, hp.statusClass);

    const draft = hp.draftData as any;
    const { content, model, promptVersion } = await this.claude.generateContract({
      tenant: hp.tenant,
      employee: {
        civility: draft.civility,
        firstName: draft.firstName || hp.firstName,
        lastName: draft.lastName || hp.lastName,
        birthDate: draft.birthDate,
        birthPlace: draft.birthPlace,
        address: [draft.address, draft.postalCode, draft.city].filter(Boolean).join(' '),
        socialSecurity: draft.socialSecurity,
      },
      contract: {
        type: hp.contractType,
        position: hp.jobTitle,
        statusClass: hp.statusClass,
        weeklyHours: hp.weeklyHours,
        grossSalary: hp.grossSalary,
        startDate: hp.startDate,
      },
      convention,
      trialPeriodDays: trial,
      cpAnnual: cp,
    });

    return this.prisma.contract.create({
      data: {
        tenantId: hp.tenantId,
        hireProcessId: hp.id,
        type: hp.contractType,
        position: hp.jobTitle,
        statusClass: hp.statusClass,
        weeklyHours: hp.weeklyHours,
        grossSalary: hp.grossSalary,
        startDate: hp.startDate,
        trialPeriodDays: trial,
        noticeDays: notice,
        contentMd: content,
        generatedByAi: true,
        aiModel: model,
        aiPromptVersion: promptVersion,
        status: 'brouillon',
        createdById,
      },
    });
  }

  /**
   * Génère un contrat pour un salarié existant (avenant, renouvellement, etc.)
   */
  async generateForEmployee(employeeId: string, createdById: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { tenant: true },
    });
    if (!emp) throw new NotFoundException('Salarié introuvable');

    const conventionCode = emp.tenant.conventionCode || 'IDCC_3249';
    const convention = await this.legifrance.get(conventionCode);
    const trial = trialPeriodDays(conventionCode, emp.contractType, emp.classification || 'Employé');
    const cp = annualLeaveDays(conventionCode, 0);

    const { content, model, promptVersion } = await this.claude.generateContract({
      tenant: emp.tenant,
      employee: {
        civility: emp.civility || undefined,
        firstName: emp.firstName,
        lastName: emp.lastName,
        birthDate: emp.birthDate || undefined,
        birthPlace: emp.birthPlace || undefined,
        address: emp.address || undefined,
        socialSecurity: emp.socialSecurity || undefined,
      },
      contract: {
        type: emp.contractType,
        position: emp.jobTitle,
        statusClass: emp.classification || 'Employé',
        weeklyHours: emp.weeklyHours,
        grossSalary: emp.grossSalary,
        startDate: emp.contractStart,
        endDate: emp.contractEnd || undefined,
      },
      convention,
      trialPeriodDays: trial,
      cpAnnual: cp,
    });

    return this.prisma.contract.create({
      data: {
        tenantId: emp.tenantId,
        employeeId: emp.id,
        type: emp.contractType,
        position: emp.jobTitle,
        statusClass: emp.classification || 'Employé',
        weeklyHours: emp.weeklyHours,
        grossSalary: emp.grossSalary,
        startDate: emp.contractStart,
        endDate: emp.contractEnd || undefined,
        trialPeriodDays: trial,
        contentMd: content,
        generatedByAi: true,
        aiModel: model,
        aiPromptVersion: promptVersion,
        status: 'brouillon',
        createdById,
      },
    });
  }

  async send(id: string) {
    const c = await this.get(id);
    if (c.status !== 'brouillon') throw new BadRequestException('Le contrat n\'est pas en brouillon');
    await this.signature.createSession({
      signers: [
        { name: c.employee?.firstName + ' ' + c.employee?.lastName, email: c.employee?.email || '', role: 'employee' },
        { name: c.tenant?.repName || 'Représentant légal', email: '', role: 'employer' },
      ],
    });
    return this.prisma.contract.update({
      where: { id },
      data: { status: 'envoye', sentAt: new Date() },
    });
  }

  /**
   * Signature d'un contrat (par employé ou employeur).
   * Quand les deux ont signé, statut passe à `signe`.
   */
  async sign(id: string, dto: SignContractDto, ip?: string) {
    const c = await this.get(id);
    if (!['envoye', 'signe_salarie'].includes(c.status)) {
      throw new BadRequestException(`Statut actuel "${c.status}" ne permet pas la signature`);
    }
    const exists = c.signatures.find((s) => s.signerRole === dto.role);
    if (exists) throw new BadRequestException(`Déjà signé par ${dto.role}`);

    const proof = await this.signature.sign({ signerName: dto.signerName, signerEmail: dto.signerEmail, role: dto.role, ip });

    await this.prisma.contractSignature.create({
      data: {
        contractId: id,
        signerRole: dto.role,
        signerName: dto.signerName,
        signerEmail: dto.signerEmail,
        signedAt: proof.signedAt,
        signedIp: proof.signedIp,
        signatureData: proof.proofData,
      },
    });

    // Mise à jour du statut
    const totalSigs = c.signatures.length + 1;
    const updates: any = {};
    if (dto.role === 'employee') updates.signedEmployeeAt = new Date();
    if (dto.role === 'employer') updates.signedEmployerAt = new Date();

    if (totalSigs >= 2) {
      updates.status = 'signe';
      // Auto-update du HireProcess associé
      if (c.hireProcessId) {
        await this.prisma.hireProcess.update({
          where: { id: c.hireProcessId },
          data: {
            status: 'contrat_signe',
            history: { push: { at: new Date().toISOString(), by: 'system', action: 'Contrat signé par les deux parties' } } as any,
          },
        }).catch(() => {});
      }
      // PROVISIONING AUTOMATIQUE (Sprint 4) si lié à un employé existant
      if (c.employeeId) {
        await this.onboarding.provisionAfterSignature(c.employeeId, 'system').catch((e) => {
          console.error('Onboarding provisioning failed:', e);
        });
      }
    } else if (dto.role === 'employee') {
      updates.status = 'signe_salarie';
    }

    return this.prisma.contract.update({ where: { id }, data: updates });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.contract.delete({ where: { id } });
  }
}
