/**
 * 8 modèles de courriers RH conformes au droit français.
 */

export interface LetterTemplateContext {
  tenant: any;
  employee: any;
  data?: any;
}

const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const fmtEur = (n: number) => (n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const upper = (s: string) => (s || '').toUpperCase();
const city = (t: any) => (t.address || '').split(' ').slice(-1)[0] || 'Paris';
const rep = (t: any) => t.repName || 'le représentant légal';

export const LETTER_TEMPLATES: Record<string, { label: string; subject: (e: any) => string; build: (ctx: LetterTemplateContext) => string }> = {
  attestation_employeur: {
    label: 'Attestation employeur',
    subject: () => 'Attestation employeur',
    build: ({ tenant, employee }) => `# ATTESTATION EMPLOYEUR

Je soussigné(e), ${rep(tenant)}, agissant en qualité de représentant légal de la société **${tenant.name}**
(SIRET ${tenant.siret || '—'}), sise ${tenant.address || '—'},

atteste que :

**${employee.firstName} ${upper(employee.lastName)}**${employee.birthDate ? `, né(e) le ${fmtDate(employee.birthDate)}` : ''}${employee.birthPlace ? ` à ${employee.birthPlace}` : ''},
demeurant ${employee.address || '—'},

est employé(e) au sein de notre société depuis le **${fmtDate(employee.contractStart)}**,
en qualité de **${employee.jobTitle}**, dans le cadre d'un contrat **${employee.contractType}**.

Sa rémunération brute mensuelle s'élève à **${fmtEur(employee.grossSalary || 0)}**.

La présente attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}
${tenant.name}`,
  },

  certificat_travail: {
    label: 'Certificat de travail',
    subject: () => 'Certificat de travail',
    build: ({ tenant, employee }) => `# CERTIFICAT DE TRAVAIL

Nous soussignés, société **${tenant.name}** — SIRET ${tenant.siret || '—'},
représentée par ${rep(tenant)},

certifions que **${employee.firstName} ${upper(employee.lastName)}**, demeurant ${employee.address || '—'},
a été employé(e) au sein de notre société du **${fmtDate(employee.contractStart)}** ${employee.contractEnd ? `au **${fmtDate(employee.contractEnd)}**` : '— à ce jour'},
en qualité de **${employee.jobTitle}**, contrat **${employee.contractType}**.

${employee.contractEnd ? 'L\'intéressé(e) nous quitte libre de tout engagement.' : ''}

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}`,
  },

  promesse_embauche: {
    label: 'Promesse d\'embauche',
    subject: (e) => `Promesse d'embauche — ${e.jobTitle}`,
    build: ({ tenant, employee }) => `# PROMESSE D'EMBAUCHE

Madame, Monsieur ${upper(employee.lastName)},

Suite à notre entretien, nous avons le plaisir de vous confirmer notre proposition d'embauche
au sein de notre société **${tenant.name}**.

**Conditions de la proposition :**
- Poste : ${employee.jobTitle}
- Type de contrat : ${employee.contractType}
- Date de prise de poste prévue : ${fmtDate(employee.contractStart)}
- Rémunération brute mensuelle : ${fmtEur(employee.grossSalary || 0)}
- Durée hebdomadaire : ${employee.weeklyHours || 35} heures
- Statut : ${employee.classification || 'à préciser'}
- Convention collective applicable : ${employee.convention || ''}

Cette promesse est ferme et engageante. Pour confirmer votre accord, nous vous remercions
de bien vouloir nous retourner ce courrier signé avec la mention manuscrite « Lu et approuvé — Bon pour accord ».

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

Pour la société,
${rep(tenant)}`,
  },

  avertissement: {
    label: 'Avertissement disciplinaire',
    subject: () => 'Avertissement disciplinaire',
    build: ({ tenant, employee, data }) => `# AVERTISSEMENT DISCIPLINAIRE

Madame / Monsieur ${upper(employee.lastName)},

Nous avons à déplorer de votre part un comportement fautif qui nous conduit à vous notifier,
par la présente, un avertissement disciplinaire.

**Faits reprochés :**
${data?.facts || '[À compléter : faits précis, dates, circonstances]'}

Cet avertissement constitue une sanction disciplinaire au sens de l'article L.1331-1 du Code du travail
et du règlement intérieur de l'entreprise. Il sera versé à votre dossier individuel.

Nous vous demandons de remédier immédiatement à cette situation. À défaut, nous serons
contraints de prendre des mesures plus sévères pouvant aller jusqu'à la rupture de votre contrat.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}
${tenant.name}`,
  },

  felicitations: {
    label: 'Lettre de félicitations',
    subject: () => 'Félicitations',
    build: ({ tenant, employee, data }) => `Madame / Monsieur ${upper(employee.lastName)},

Nous tenons à vous féliciter${data?.reason ? ` ${data.reason}` : ' pour votre travail remarquable et votre engagement'} au sein de notre société **${tenant.name}**.

Votre implication contribue grandement à la qualité et au succès de nos activités. Nous sommes
fiers de vous compter parmi nos collaborateurs.

Veuillez agréer, Madame / Monsieur, l'expression de notre considération distinguée.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}`,
  },

  rupture_conventionnelle: {
    label: 'Convention de rupture conventionnelle',
    subject: () => 'Convention de rupture conventionnelle',
    build: ({ tenant, employee }) => `# CONVENTION DE RUPTURE CONVENTIONNELLE

**Entre :**
La société **${tenant.name}**, SIRET ${tenant.siret || '—'},
représentée par ${rep(tenant)}, ci-après dénommée **« l'Employeur »**,

**Et :**
**${employee.firstName} ${upper(employee.lastName)}**, né(e) le ${fmtDate(employee.birthDate)},
demeurant ${employee.address || '—'},
employé(e) en qualité de **${employee.jobTitle}** depuis le ${fmtDate(employee.contractStart)},
ci-après dénommé(e) **« le Salarié »**,

Conformément aux articles L.1237-11 et suivants du Code du travail, il a été convenu
d'une rupture conventionnelle du contrat de travail.

**Conditions :**
- Date envisagée de rupture du contrat : [à compléter]
- Indemnité spécifique de rupture conventionnelle : [montant à calculer]
- Solde de tout compte établi à la date de rupture
- Délai de rétractation : 15 jours calendaires à compter de la signature
- Homologation DREETS dans un délai de 15 jours ouvrables suivant la fin du délai de rétractation

Fait à ${city(tenant)}, le ${fmtDate(new Date())}, en deux exemplaires originaux.

| Pour l'Employeur | Le Salarié |
|:---|:---|
| ${rep(tenant)} | ${employee.firstName} ${upper(employee.lastName)} |`,
  },

  augmentation: {
    label: 'Notification d\'augmentation de salaire',
    subject: () => 'Notification d\'augmentation de salaire',
    build: ({ tenant, employee, data }) => `Madame / Monsieur ${upper(employee.lastName)},

Nous avons le plaisir de vous informer qu'à compter du **${fmtDate(data?.effectiveDate || new Date())}**,
votre rémunération brute mensuelle est revalorisée et s'élèvera désormais à **${fmtEur(data?.newSalary || employee.grossSalary)}**${data?.previousSalary ? ` (au lieu de ${fmtEur(data.previousSalary)})` : ''}.

Cette décision témoigne de la reconnaissance par la société de la qualité de votre travail et
de votre engagement au quotidien.

L'ensemble des autres conditions de votre contrat de travail demeure inchangé.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}
${tenant.name}`,
  },

  convocation_visite_medicale: {
    label: 'Convocation à la visite médicale d\'embauche',
    subject: () => 'Convocation à la visite médicale d\'embauche',
    build: ({ tenant, employee, data }) => `Madame / Monsieur ${upper(employee.lastName)},

Conformément aux articles R.4624-10 et suivants du Code du travail, nous vous convions à une
visite médicale d'embauche auprès du service de santé au travail.

**Coordonnées de l'organisme :**
- Organisme : **${tenant.medicalProvider?.name || '[organisme à paramétrer]'}**
- Adresse : ${tenant.medicalProvider?.address || '—'}
- Téléphone : ${tenant.medicalProvider?.phone || '—'}
${tenant.medicalProvider?.email ? `- Email : ${tenant.medicalProvider.email}` : ''}

**Date et heure du rendez-vous :** ${data?.appointmentDate ? fmtDate(data.appointmentDate) : '[à fixer avec l\'organisme]'}${data?.appointmentTime ? ' à ' + data.appointmentTime : ''}

Cette visite est OBLIGATOIRE. Le temps passé en visite médicale est rémunéré comme temps de travail.
Merci de vous munir de votre carte vitale et d'une pièce d'identité.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}`,
  },

  affiliation_mutuelle: {
    label: 'Affiliation mutuelle santé',
    subject: () => 'Affiliation à la mutuelle santé d\'entreprise',
    build: ({ tenant, employee }) => `Madame / Monsieur ${upper(employee.lastName)},

Conformément à l'article L.911-7 du Code de la Sécurité sociale, notre entreprise vous affilie
à la complémentaire santé collective obligatoire en vigueur :

**Organisme :** ${tenant.healthInsurance?.name || '[mutuelle à paramétrer]'}
**N° de contrat :** ${tenant.healthInsurance?.contractNumber || '—'}
**Téléphone :** ${tenant.healthInsurance?.phone || '—'}
**Part employeur :** ${tenant.healthInsurance?.shareEmployer || 50}%
**Part salariale :** ${100 - (tenant.healthInsurance?.shareEmployer || 50)}% (prélevée sur votre bulletin de paie)

**Effet :** à compter de votre date d'embauche, soit le ${fmtDate(employee.contractStart)}.

Vous trouverez en pièce jointe le bulletin d'affiliation à compléter et nous retourner sous 15 jours,
accompagné d'un RIB et d'une copie de votre attestation Vitale.

Vous pouvez bénéficier d'une dispense d'affiliation dans les cas prévus par la loi
(article D.911-2 du Code de la Sécurité sociale) — formulaire disponible auprès du service RH.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}`,
  },

  refus_conge: {
    label: 'Refus de congé',
    subject: () => 'Refus de demande de congé',
    build: ({ tenant, employee, data }) => `Madame / Monsieur ${upper(employee.lastName)},

Suite à votre demande de congé pour la période du ${fmtDate(data?.startDate)} au ${fmtDate(data?.endDate)},
nous sommes au regret de ne pouvoir y donner une suite favorable.

**Motif du refus :** ${data?.reason || '[À préciser : nécessités de service, absences déjà programmées sur la période, charge de travail…]'}

Nous restons à votre disposition pour étudier ensemble une autre période qui conviendrait
mieux à l'organisation du service.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(tenant)}, le ${fmtDate(new Date())}.

${rep(tenant)}`,
  },
};
