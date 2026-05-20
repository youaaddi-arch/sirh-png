/* Référentiel des conventions collectives — règles applicables (CP, période essai, préavis) */
window.CONVENTIONS = [
  {
    code: 'IDCC_3249',
    name: 'Organismes de formation (Formation professionnelle)',
    brochure: '3249',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 10: 2, 15: 3 },
    childrenExtraLeave: 1,
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 5, deces_enfant: 5, deces_parent: 3, deces_grandparent: 1, demenagement: 1 },
    paidSickFrom: 1,
    minimumWageCoef: { 200: 1801, 210: 1820, 220: 1860, 240: 1950, 260: 2050, 280: 2200, 300: 2400, 350: 2800, 400: 3300, 500: 4200 },
  },
  {
    code: 'IDCC_2120',
    name: 'Banques (CCN du personnel)',
    brochure: '3161',
    cpAnnuel: 26,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 180 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 180, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesAge: true,
    extraLeavesSeniority: { 5: 1, 10: 2, 15: 3, 20: 4 },
    childrenExtraLeave: 0,
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 5, deces_enfant: 5, deces_parent: 3 },
    paidSickFrom: 1,
  },
  {
    code: 'IDCC_2378',
    name: 'Bureaux d\'études techniques (Syntec)',
    brochure: '3018',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'ETAM': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'ETAM': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'ETAM': 60, 'Employé': 30 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 10: 2, 20: 3 },
    childrenExtraLeave: 1,
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 4, deces_enfant: 5, deces_parent: 3 },
    paidSickFrom: 1,
  },
  {
    code: 'IDCC_1486',
    name: 'Bureaux d\'études — cadres / Syntec cadres',
    brochure: '3018',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120 },
    notice: { Cadre: 90 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 10: 2 },
    childrenExtraLeave: 1,
    conventionalLeaves: { mariage: 5, pacs: 4, naissance: 3, deces_conjoint: 4, deces_enfant: 5, deces_parent: 3 },
    paidSickFrom: 1,
  },
  {
    code: 'IDCC_1090',
    name: 'Restauration rapide',
    brochure: '3245',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 30 },
    notice: { Cadre: 90, 'Agent de maîtrise': 30, 'Employé': 15 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 15: 2 },
    childrenExtraLeave: 0,
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3, deces_parent: 1 },
    paidSickFrom: 7,
  },
  {
    code: 'IDCC_1979',
    name: 'Hôtels, cafés, restaurants (HCR)',
    brochure: '3292',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 15: 2 },
    childrenExtraLeave: 0,
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3 },
    paidSickFrom: 5,
  },
  {
    code: 'IDCC_1672',
    name: 'Coiffure et professions connexes',
    brochure: '3159',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 10: 2, 20: 3 },
    childrenExtraLeave: 0,
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3 },
    paidSickFrom: 7,
  },
  {
    code: 'IDCC_3127',
    name: 'Esthétique-cosmétique et enseignement technique',
    brochure: '3034',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 10: 2 },
    childrenExtraLeave: 0,
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3, deces_enfant: 3 },
    paidSickFrom: 5,
  },
  {
    code: 'IDCC_1606',
    name: 'Bois, pâte à papier, papier carton (production)',
    brochure: '3011',
    cpAnnuel: 25,
    trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } },
    trialRenewal: { Cadre: 120, 'Agent de maîtrise': 90, 'Employé': 60 },
    notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 },
    extraLeavesAge: false,
    extraLeavesSeniority: { 5: 1, 15: 2 },
    childrenExtraLeave: 0,
    conventionalLeaves: { mariage: 4, naissance: 3, deces_conjoint: 3 },
    paidSickFrom: 7,
  },
];

window.Conventions = {
  list: () => window.CONVENTIONS,
  byCode: (code) => window.CONVENTIONS.find(c => c.code === code),
  // Calcul automatique période d'essai (en jours)
  trialPeriodDays: (conventionCode, contractType, status) => {
    const c = window.Conventions.byCode(conventionCode);
    if (!c) return 60;
    const tp = c.trialPeriod[contractType] || c.trialPeriod.CDI;
    return tp[status] || tp.default || tp['Employé'] || 60;
  },
  // Calcul renouvellement période d'essai (en jours)
  trialRenewalDays: (conventionCode, status) => {
    const c = window.Conventions.byCode(conventionCode);
    if (!c) return 0;
    return c.trialRenewal[status] || c.trialRenewal['Employé'] || 0;
  },
  // Préavis (en jours)
  noticeDays: (conventionCode, status) => {
    const c = window.Conventions.byCode(conventionCode);
    if (!c) return 30;
    return c.notice[status] || c.notice['Employé'] || 30;
  },
  // Congés annuels total selon ancienneté
  annualLeaveDays: (conventionCode, seniorityYears = 0) => {
    const c = window.Conventions.byCode(conventionCode);
    if (!c) return 25;
    let extra = 0;
    for (const [y, d] of Object.entries(c.extraLeavesSeniority || {})) {
      if (seniorityYears >= +y) extra = d;
    }
    return c.cpAnnuel + extra;
  },
  // Congés spéciaux selon événement
  eventLeaveDays: (conventionCode, eventCode) => {
    const c = window.Conventions.byCode(conventionCode);
    if (!c) return 0;
    return c.conventionalLeaves[eventCode] || 0;
  },
};
