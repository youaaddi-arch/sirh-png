import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../integrations/email/email.service';
import { LetterService } from '../letter/letter.service';
import { pickTemplate, OnboardingTask } from './onboarding-templates';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private config: ConfigService,
    private letters: LetterService,
  ) {}

  list(filters: { tenantId?: string; status?: string } = {}) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.tenantId) where.employee = { tenantId: filters.tenantId };
    return this.prisma.onboarding.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, jobTitle: true, email: true, tenantId: true, tenant: { select: { code: true, name: true } } },
        },
      },
    });
  }

  async get(id: string) {
    const o = await this.prisma.onboarding.findUnique({
      where: { id },
      include: { employee: { include: { tenant: true } } },
    });
    if (!o) throw new NotFoundException('Onboarding introuvable');
    return o;
  }

  async getByEmployee(employeeId: string) {
    return this.prisma.onboarding.findUnique({ where: { employeeId } });
  }

  /**
   * Crée l'onboarding pour un salarié — applique automatiquement le template
   * correspondant au jobTitle (Formateur, Manager, IT, etc.)
   */
  async createForEmployee(employeeId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException('Salarié introuvable');

    const existing = await this.prisma.onboarding.findUnique({ where: { employeeId } });
    if (existing) return existing;

    const tpl = pickTemplate(emp.jobTitle);
    const tasks = tpl.tasks.map((t) => ({
      ...t,
      done: false,
      dueDate: t.daysAfterStart != null
        ? new Date(new Date(emp.contractStart).getTime() + t.daysAfterStart * 86400000).toISOString().slice(0, 10)
        : null,
    }));

    return this.prisma.onboarding.create({
      data: {
        employeeId: emp.id,
        startDate: emp.contractStart,
        tasks: tasks as any,
      },
    });
  }

  /**
   * PROVISIONING AUTOMATIQUE après signature du contrat.
   * Déclenché par ContractService.sign quand le contrat passe à `signe`.
   *
   * Actions :
   * 1. Crée le compte User (si pas déjà créé) + mot de passe temporaire
   * 2. Envoie email d'accueil avec identifiants
   * 3. Génère et envoie courrier de convocation visite médicale
   * 4. Génère et envoie courrier d'affiliation mutuelle
   * 5. Crée l'Onboarding avec le template adapté
   * 6. Marque les tâches "contract" et "DPAE" comme faites
   * 7. Notification au manager
   */
  async provisionAfterSignature(employeeId: string, performedBy: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { tenant: true, manager: true },
    });
    if (!emp) throw new NotFoundException('Salarié introuvable');

    const actions: string[] = [];

    // 1. Compte utilisateur
    let user = await this.prisma.user.findUnique({ where: { email: emp.email } });
    let password = '';
    if (!user) {
      password = this.generatePassword();
      const pepper = this.config.get('ARGON2_PEPPER', '');
      const hash = await argon2.hash(password + pepper, { type: argon2.argon2id });
      user = await this.prisma.user.create({
        data: {
          tenantId: emp.tenantId,
          email: emp.email,
          passwordHash: hash,
          role: 'employe',
        },
      });
      await this.prisma.employee.update({ where: { id: emp.id }, data: { userId: user.id } });
      actions.push('Compte utilisateur créé');
    }

    // 2. Email identifiants
    if (password) {
      const webUrl = this.config.get('WEB_BASE_URL', 'http://localhost:3000');
      await this.email.sendOnboardingCredentials({
        to: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        password,
        webUrl: `${webUrl}/login`,
        tenantName: emp.tenant.name,
      });
      actions.push('Email d\'accueil envoyé');
    }

    // 3. Convocation visite médicale
    try {
      await this.letters.create({
        tenantId: emp.tenantId,
        employeeId: emp.id,
        type: 'convocation_visite_medicale',
      }, performedBy);
      actions.push('Convocation visite médicale générée');
    } catch (e) { this.logger.warn('Convocation médicale: ' + (e as Error).message); }

    // 4. Affiliation mutuelle
    try {
      await this.letters.create({
        tenantId: emp.tenantId,
        employeeId: emp.id,
        type: 'affiliation_mutuelle',
      }, performedBy);
      actions.push('Formulaire affiliation mutuelle généré');
    } catch (e) { this.logger.warn('Mutuelle: ' + (e as Error).message); }

    // 5. Onboarding selon template
    const ob = await this.createForEmployee(emp.id);
    actions.push(`Onboarding créé (template auto: ${pickTemplate(emp.jobTitle).name})`);

    // 6. Marque certaines tâches déjà faites
    const tasks = ob.tasks as any[];
    for (const t of tasks) {
      if (['contract', 'medical_appt', 'mutuelle', 'credentials'].includes(t.id)) {
        t.done = true;
        t.doneAt = new Date().toISOString();
        t.doneById = performedBy;
      }
    }
    await this.prisma.onboarding.update({ where: { id: ob.id }, data: { tasks: tasks as any } });

    // 7. Notification au manager
    if (emp.managerId) {
      const manager = await this.prisma.employee.findUnique({ where: { id: emp.managerId } });
      if (manager?.userId) {
        await this.prisma.notification.create({
          data: {
            userId: manager.userId,
            type: 'onboarding',
            title: 'Nouveau collaborateur dans votre équipe',
            body: `${emp.firstName} ${emp.lastName} démarre le ${emp.contractStart.toISOString().slice(0, 10)}. Tâches d'onboarding à suivre.`,
            link: `/onboarding/${ob.id}`,
          },
        });
        actions.push('Manager notifié');
      }
    }

    return { onboarding: ob, actions };
  }

  /**
   * Coche / décoche une tâche d'onboarding.
   */
  async toggleTask(onboardingId: string, taskId: string, done: boolean, userId: string) {
    const ob = await this.get(onboardingId);
    const tasks = ob.tasks as any[];
    const t = tasks.find((x) => x.id === taskId);
    if (!t) throw new NotFoundException('Tâche introuvable');
    t.done = done;
    t.doneAt = done ? new Date().toISOString() : null;
    t.doneById = done ? userId : null;

    const allRequired = tasks.filter((x) => x.required).every((x) => x.done);
    const updates: any = { tasks: tasks as any };
    if (allRequired) updates.status = 'termine';
    else updates.status = 'en_cours';

    return this.prisma.onboarding.update({ where: { id: onboardingId }, data: updates });
  }

  private generatePassword(): string {
    return randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) + 'A1!';
  }
}
