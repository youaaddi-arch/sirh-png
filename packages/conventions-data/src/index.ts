/* Référentiel des conventions collectives — données et helpers */

export interface ConventionRule {
  code: string;
  name: string;
  brochure?: string;
  cpAnnuel: number;
  paidSickFromDay: number;
  trialPeriod: Record<string, Record<string, number>>;
  trialRenewal: Record<string, number>;
  notice: Record<string, number>;
  extraLeavesSeniority: Record<string, number>;
  conventionalLeaves: Record<string, number>;
  minimumWageCoef?: Record<string, number>;
}

export const CONVENTIONS: ConventionRule[] = [
  {
    code: 'IDCC_3249',
    name: 'Organismes de formation (Formation professionnelle)',
    brochure: '3249',
    cpAnnuel: 25,
    paidSickFromDay: 1,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesSeniority: { '5': 1, '10': 2, '15': 3 },
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 5, deces_enfant: 5, deces_parent: 3, deces_grandparent: 1, demenagement: 1 },
    minimumWageCoef: { '200': 1801, '210': 1820, '220': 1860, '240': 1950, '260': 2050, '280': 2200, '300': 2400, '350': 2800, '400': 3300, '500': 4200 },
  },
  {
    code: 'IDCC_2120',
    name: 'Banques (CCN du personnel)',
    brochure: '3161',
    cpAnnuel: 26,
    paidSickFromDay: 1,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 180 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 180, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesSeniority: { '5': 1, '10': 2, '15': 3, '20': 4 },
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 5, deces_enfant: 5, deces_parent: 3 },
  },
  {
    code: 'IDCC_2378',
    name: 'Bureaux d\'études techniques (Syntec)',
    brochure: '3018',
    cpAnnuel: 25,
    paidSickFromDay: 1,
    trialPeriod: { CDI: { 'Employé': 60, 'ETAM': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'ETAM': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'ETAM': 60, 'Employé': 30 },
    extraLeavesSeniority: { '5': 1, '10': 2, '20': 3 },
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 4, deces_enfant: 5, deces_parent: 3 },
  },
  {
    code: 'IDCC_1090',
    name: 'Restauration rapide',
    brochure: '3245',
    cpAnnuel: 25,
    paidSickFromDay: 7,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 30 },
    notice: { Cadre: 90, 'Agent de maîtrise': 30, 'Employé': 15 },
    extraLeavesSeniority: { '5': 1, '15': 2 },
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3, deces_parent: 1 },
  },
  {
    code: 'IDCC_1979',
    name: 'Hôtels, cafés, restaurants (HCR)',
    brochure: '3292',
    cpAnnuel: 25,
    paidSickFromDay: 5,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesSeniority: { '5': 1, '15': 2 },
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3 },
  },
  {
    code: 'IDCC_1672',
    name: 'Coiffure et professions connexes',
    brochure: '3159',
    cpAnnuel: 25,
    paidSickFromDay: 7,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesSeniority: { '5': 1, '10': 2, '20': 3 },
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3 },
  },
  {
    code: 'IDCC_3127',
    name: 'Esthétique-cosmétique et enseignement technique',
    brochure: '3034',
    cpAnnuel: 25,
    paidSickFromDay: 5,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesSeniority: { '5': 1, '10': 2 },
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3 },
  },
];

// Helpers
export function trialPeriodDays(conventionCode: string, contractType: string, statusClass: string): number {
  const c = CONVENTIONS.find((x) => x.code === conventionCode);
  if (!c) return 60;
  const map = c.trialPeriod[contractType] || c.trialPeriod.CDI || {};
  return map[statusClass] || map.default || map['Employé'] || 60;
}

export function annualLeaveDays(conventionCode: string, seniorityYears = 0): number {
  const c = CONVENTIONS.find((x) => x.code === conventionCode);
  if (!c) return 25;
  let extra = 0;
  for (const [y, d] of Object.entries(c.extraLeavesSeniority)) {
    if (seniorityYears >= +y) extra = d;
  }
  return c.cpAnnuel + extra;
}

export function noticeDays(conventionCode: string, statusClass: string): number {
  const c = CONVENTIONS.find((x) => x.code === conventionCode);
  if (!c) return 30;
  return c.notice[statusClass] || c.notice['Employé'] || 30;
}

export function eventLeaveDays(conventionCode: string, eventCode: string): number {
  const c = CONVENTIONS.find((x) => x.code === conventionCode);
  return c?.conventionalLeaves[eventCode] ?? 0;
}
