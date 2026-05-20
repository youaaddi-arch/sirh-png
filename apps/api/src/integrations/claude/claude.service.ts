import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ContractContext {
  tenant: any;
  employee: { firstName: string; lastName: string; civility?: string; birthDate?: Date | string; birthPlace?: string; address?: string; socialSecurity?: string };
  contract: { type: string; position: string; statusClass: string; classification?: string; coefficient?: string; weeklyHours: number; grossSalary: number; startDate: Date | string; endDate?: Date | string };
  convention?: any;
  trialPeriodDays: number;
  cpAnnual: number;
}

/**
 * Service d'IA Claude — génération de contrats conformes au droit français.
 *
 * Si ANTHROPIC_API_KEY est configuré → appel réel à l'API Claude (Sonnet 4.6)
 * Sinon → génération depuis un template français complet (fallback MVP).
 */
@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);

  constructor(private config: ConfigService) {}

  async generateContract(ctx: ContractContext): Promise<{ content: string; model: string; promptVersion: string }> {
    const apiKey = this.config.get('ANTHROPIC_API_KEY');
    if (apiKey) {
      try {
        return await this.callClaudeApi(ctx, apiKey);
      } catch (e) {
        this.logger.warn(`Claude API failed (${(e as Error).message}), falling back to template`);
      }
    }
    return { content: this.renderTemplate(ctx), model: 'template-mvp', promptVersion: 'v1' };
  }

  private async callClaudeApi(ctx: ContractContext, apiKey: string) {
    const systemPrompt = `Tu es un juriste français expert en droit du travail. Tu rédiges des contrats de travail conformes au Code du travail et à la convention collective applicable.

Règles strictes :
- Tous les articles obligatoires (engagement, période d'essai, rémunération, durée du travail, congés payés, convention collective, lieu de travail, protection sociale)
- Mentionner les organismes paramétrés (mutuelle, prévoyance, retraite, visite médicale)
- Style juridique formel français, articles numérotés
- Pas d'invention d'éléments non fournis
- Sortie en Markdown propre`;

    const userPrompt = `Génère un contrat de travail ${ctx.contract.type} pour :
${JSON.stringify({ tenant: ctx.tenant, employee: ctx.employee, contract: ctx.contract, convention: ctx.convention?.name, trialPeriodDays: ctx.trialPeriodDays, cpAnnual: ctx.cpAnnual }, null, 2)}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
    const data: any = await res.json();
    const content = data.content?.[0]?.text || '';
    return { content, model: 'claude-sonnet-4-6', promptVersion: 'v1' };
  }

  /**
   * Template de contrat de travail français complet — fallback MVP.
   * Conforme aux articles L.1221-1 et suivants du Code du travail.
   */
  private renderTemplate(ctx: ContractContext): string {
    const { tenant, employee, contract, convention, trialPeriodDays, cpAnnual } = ctx;
    const civility = employee.civility ? employee.civility + ' ' : '';
    const fullName = `${civility}${employee.firstName} ${employee.lastName.toUpperCase()}`;
    const startDate = new Date(contract.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const trialEndIso = new Date(new Date(contract.startDate).getTime() + trialPeriodDays * 86400000);
    const trialEnd = trialEndIso.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const grossEur = (contract.grossSalary || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    const med = tenant.medicalProvider?.name || '[organisme de santé au travail à compléter]';
    const mut = tenant.healthInsurance?.name || '[mutuelle à compléter]';
    const prv = tenant.providentInsurance?.name || '[prévoyance à compléter]';
    const ret = tenant.pensionFund?.name || 'AG2R LA MONDIALE';
    const city = (tenant.address || '').split(' ').slice(-1)[0] || 'Paris';

    return `# CONTRAT DE TRAVAIL À DURÉE ${contract.type === 'CDI' ? 'INDÉTERMINÉE' : 'DÉTERMINÉE'}

**Entre les soussignés :**

La société **${tenant.name}**, SIRET ${tenant.siret || '—'}, dont le siège social est sis ${tenant.address || ''}, représentée par ${tenant.repName || 'son représentant légal'}, agissant en qualité de ${tenant.repRole || 'représentant légal'},

ci-après dénommée **« l'Employeur »**, d'une part,

Et :

**${fullName}**${employee.birthDate ? `, né(e) le ${new Date(employee.birthDate).toLocaleDateString('fr-FR')}` : ''}${employee.birthPlace ? ` à ${employee.birthPlace}` : ''},
${employee.address ? `demeurant ${employee.address},` : ''}
${employee.socialSecurity ? `de nationalité française, immatriculé(e) à la Sécurité Sociale sous le numéro ${employee.socialSecurity},` : ''}

ci-après dénommé(e) **« le Salarié »**, d'autre part,

**Il a été convenu ce qui suit :**

---

## ARTICLE 1 — ENGAGEMENT

Le Salarié est engagé par l'Employeur en qualité de **${contract.position}**, statut ${contract.statusClass}${contract.classification ? `, classification ${contract.classification}` : ''}${contract.coefficient ? `, coefficient ${contract.coefficient}` : ''}, à compter du **${startDate}**.

${contract.type === 'CDD' && contract.endDate ? `Le présent contrat est conclu pour une durée déterminée, jusqu'au ${new Date(contract.endDate).toLocaleDateString('fr-FR')}.` : 'Le présent contrat est conclu pour une durée indéterminée.'}

L'engagement est soumis au résultat satisfaisant de la visite médicale d'embauche.

## ARTICLE 2 — PÉRIODE D'ESSAI

Conformément à la convention collective ${convention?.name ? `« ${convention.name} »` : 'applicable'} (IDCC ${convention?.code?.replace('IDCC_', '') || '—'}), la période d'essai est fixée à **${trialPeriodDays} jours calendaires**, soit jusqu'au **${trialEnd}**.

Cette période d'essai pourra être renouvelée une fois pour la même durée, par accord exprès et écrit des parties, dans les conditions prévues par la convention collective.

Pendant la période d'essai, chacune des parties pourra rompre le contrat dans les conditions des articles L.1221-25 et L.1221-26 du Code du travail.

## ARTICLE 3 — RÉMUNÉRATION

La rémunération brute mensuelle du Salarié est fixée à **${grossEur}**, versée mensuellement à terme échu, par virement bancaire sur le compte communiqué par le Salarié.

Cette rémunération sera revalorisée selon les dispositions de la convention collective applicable.

## ARTICLE 4 — DURÉE DU TRAVAIL

La durée hebdomadaire de travail est de **${contract.weeklyHours} heures**, réparties selon le planning communiqué par l'Employeur, dans le respect des dispositions légales et conventionnelles relatives à la durée du travail.

Les heures supplémentaires éventuelles devront faire l'objet d'une autorisation préalable de la hiérarchie.

## ARTICLE 5 — CONGÉS PAYÉS

Le Salarié bénéficie de **${cpAnnual} jours ouvrés** de congés payés annuels, selon les dispositions de la convention collective applicable.

Les dates de congés sont fixées par accord entre les parties, en tenant compte des nécessités du service.

## ARTICLE 6 — CONVENTION COLLECTIVE

Le présent contrat est soumis à la convention collective ${convention?.name ? `**« ${convention.name} »**` : 'applicable'}${convention?.brochure ? ` (brochure JO n°${convention.brochure})` : ''}.

Un exemplaire de cette convention est tenu à la disposition du Salarié.

## ARTICLE 7 — LIEU DE TRAVAIL

Le Salarié exercera ses fonctions à l'adresse suivante : **${tenant.address || '[adresse à compléter]'}**.

L'Employeur se réserve la possibilité de modifier le lieu de travail dans un même secteur géographique, sans que cette modification ne constitue une modification du contrat.

## ARTICLE 8 — VISITE MÉDICALE D'EMBAUCHE

Le Salarié sera convoqué à une visite médicale d'embauche auprès de **${med}** dans le délai légal (avant l'expiration de la période d'essai, ou avant la prise effective du poste pour les postes à risque).

## ARTICLE 9 — PROTECTION SOCIALE COMPLÉMENTAIRE

Le Salarié bénéficiera des couvertures complémentaires obligatoires :

- **Complémentaire santé** : ${mut} (part employeur ${tenant.healthInsurance?.shareEmployer || 50}%)
- **Prévoyance** : ${prv}
- **Retraite complémentaire** : ${ret}

L'affiliation est effective dès la date d'embauche.

## ARTICLE 10 — OBLIGATIONS DU SALARIÉ

Le Salarié s'engage à :
- exercer ses fonctions avec diligence et loyauté ;
- respecter le règlement intérieur de l'entreprise et les consignes de sécurité ;
- observer la discrétion la plus stricte sur toute information confidentielle dont il aurait connaissance dans l'exercice de ses fonctions ;
- informer sans délai l'Employeur de tout changement d'adresse ou de situation personnelle.

## ARTICLE 11 — RUPTURE DU CONTRAT

En dehors de la période d'essai, le contrat pourra être rompu dans les conditions du Code du travail et de la convention collective applicable, sous réserve du respect du préavis.

## ARTICLE 12 — RÈGLEMENT INTÉRIEUR

Un règlement intérieur s'applique au sein de l'entreprise. Un exemplaire est remis au Salarié et affiché sur les lieux de travail.

---

Fait à **${city}**, le **${today}**, en deux exemplaires originaux, dont un remis à chaque partie.

| **Pour l'Employeur** | **Le Salarié** |
|:---|:---|
| ${tenant.repName || ''} | ${employee.firstName} ${employee.lastName.toUpperCase()} |
| _(Signature précédée de la mention « Lu et approuvé »)_ | _(Signature précédée de la mention « Lu et approuvé »)_ |
`;
  }
}
