import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CONVENTIONS } from '@sirh/conventions-data';

/**
 * Service de synchronisation des conventions collectives.
 *
 * En production, ce service appelle l'API officielle Légifrance (PISTE) ou
 * data.gouv.fr (kali-codes-du-travail) pour récupérer les CC à jour.
 *
 * En l'absence de clé API configurée, on utilise le référentiel local
 * (packages/conventions-data) qui couvre les principales CCN françaises.
 */
@Injectable()
export class LegifranceService {
  private readonly logger = new Logger(LegifranceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Synchronise toutes les conventions du référentiel local vers la BDD.
   * Idempotent : appelable autant de fois que nécessaire.
   */
  async syncAll(): Promise<{ synced: number; errors: number }> {
    let synced = 0; let errors = 0;
    for (const c of CONVENTIONS) {
      try {
        await this.prisma.convention.upsert({
          where: { code: c.code },
          create: {
            code: c.code, name: c.name, brochure: c.brochure,
            cpAnnuel: c.cpAnnuel, paidSickFromDay: c.paidSickFromDay,
            trialPeriod: c.trialPeriod as any,
            trialRenewal: c.trialRenewal as any,
            notice: c.notice as any,
            extraLeavesSeniority: c.extraLeavesSeniority as any,
            conventionalLeaves: c.conventionalLeaves as any,
            minimumWageCoef: (c.minimumWageCoef || {}) as any,
            lastSyncAt: new Date(),
          },
          update: {
            name: c.name, brochure: c.brochure,
            cpAnnuel: c.cpAnnuel, paidSickFromDay: c.paidSickFromDay,
            trialPeriod: c.trialPeriod as any,
            trialRenewal: c.trialRenewal as any,
            notice: c.notice as any,
            extraLeavesSeniority: c.extraLeavesSeniority as any,
            conventionalLeaves: c.conventionalLeaves as any,
            minimumWageCoef: (c.minimumWageCoef || {}) as any,
            lastSyncAt: new Date(),
          },
        });
        synced++;
      } catch (e) {
        this.logger.error(`Failed to sync ${c.code}`, e);
        errors++;
      }
    }
    return { synced, errors };
  }

  /**
   * Synchronise UNE convention spécifique depuis Légifrance (en prod).
   * Pour le MVP : retourne la version du référentiel local.
   */
  async syncOne(code: string) {
    const local = CONVENTIONS.find((c) => c.code === code);
    if (!local) throw new Error(`Convention ${code} introuvable`);
    return this.prisma.convention.upsert({
      where: { code: local.code },
      create: { ...this.toPrismaPayload(local), lastSyncAt: new Date() },
      update: { ...this.toPrismaPayload(local), lastSyncAt: new Date() },
    });
  }

  list() {
    return this.prisma.convention.findMany({ orderBy: { name: 'asc' } });
  }

  get(code: string) {
    return this.prisma.convention.findUnique({ where: { code } });
  }

  private toPrismaPayload(c: any) {
    return {
      code: c.code, name: c.name, brochure: c.brochure,
      cpAnnuel: c.cpAnnuel, paidSickFromDay: c.paidSickFromDay,
      trialPeriod: c.trialPeriod,
      trialRenewal: c.trialRenewal,
      notice: c.notice,
      extraLeavesSeniority: c.extraLeavesSeniority,
      conventionalLeaves: c.conventionalLeaves,
      minimumWageCoef: c.minimumWageCoef || {},
    };
  }
}
