/**
 * Seed data pour le mode démo offline.
 * Identifiants et données du groupe Paris Nord — équivalent v1.
 */

export const SEED_TENANTS = [
  { id: 't1', code: '000-DEFIS', name: 'DENIZ FINANCES ET SERVICES DEFIS', type: 'SIEGE', siren: '849397161', siret: '84939716100035', address: '113 AVE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'EMIR', conventionCode: 'IDCC_3249' },
  { id: 't2', code: '001-AFPEC', name: 'AFPEC', type: 'SIEGE', siren: '913471793', siret: '91347179300012', address: '36 RUE PASCAL 77100 MEAUX', repName: 'KEZIBAN DENIS', conventionCode: 'IDCC_3249' },
  { id: 't3', code: '003-DBS', name: 'DIGITAL BUSINESS SCHOOL CMV', type: 'SIEGE', siren: '815091764', siret: '81509176400044', address: '24 RUE DE CLICHY 75009 PARIS', repName: 'DFS', conventionCode: 'IDCC_3249' },
  { id: 't4', code: '004-ELFE', name: 'ELFE', type: 'SIEGE', siren: '895365690', siret: '89536569000018', address: '39 BLD DE LA MUETTE 95140 GARGES', repName: 'NAUSICAA MALOUM', conventionCode: 'IDCC_3249' },
  { id: 't5', code: '012-PNBS', name: 'PNBS SUSANOO', type: 'SIEGE', siren: '883135154', siret: '88313515400028', address: '60 RUE DE LA JONQUIERE 75017 PARIS', repName: 'MELINA COHEN SETTON', conventionCode: 'IDCC_3249' },
  { id: 't6', code: '014-PNFF', name: 'EXCELSIOR PNFF', type: 'SIEGE', siren: '982283202', siret: '98228320200017', address: '14 RUE BEFFROY 92200 NEUILLY', repName: 'HERVE ZILBER', conventionCode: 'IDCC_3249' },
  { id: 't7', code: '017-POLY', name: 'POLY LANGUES SARL', type: 'SIEGE', siren: '519607808', siret: '51960780800028', address: '113 AVE WILSON 93210 ST DENIS', repName: 'EMIR', conventionCode: 'IDCC_3249' },
  { id: 't8', code: '024-CARE', name: 'CARE CONSEIL RH', type: 'SIEGE', siren: '901888883', siret: '90188888300013', address: '5 rue du Tunnel 75019 Paris', repName: 'DAMIEN RENAULT', conventionCode: 'IDCC_3249' },
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

export const SEED_EMPLOYEES = [
  { id: 'e1', matricule: 'PNG-0001', firstName: 'Emir', lastName: 'DENIZ', email: 'emir.deniz@pn-groupe.fr', password: 'admin', role: 'admin', jobTitle: 'Président', tenantId: 't1', managerId: null, contractType: 'CDI', contractStart: '2018-01-01', grossSalary: 8500, status: 'actif', classification: 'Cadre', weeklyHours: 35, birthDate: '1975-05-12', familySituation: 'marie', numChildren: 2 },
  { id: 'e2', matricule: 'PNG-0002', firstName: 'Keziban', lastName: 'DENIZ', email: 'keziban.deniz@pn-groupe.fr', password: 'rh', role: 'rh', jobTitle: 'Directrice RH', tenantId: 't1', managerId: 'e1', contractType: 'CDI', contractStart: '2018-06-01', grossSalary: 6500, status: 'actif', classification: 'Cadre', weeklyHours: 35, birthDate: '1980-03-22' },
  { id: 'e3', matricule: 'PNG-0003', firstName: 'Delphine', lastName: 'PAVIS', email: 'delphine.pavis@pn-groupe.fr', password: 'manager', role: 'manager', jobTitle: 'Responsable Pédagogique', tenantId: 't3', managerId: 'e1', contractType: 'CDI', contractStart: '2020-09-01', grossSalary: 4800, status: 'actif', classification: 'Cadre', weeklyHours: 35 },
  { id: 'e4', matricule: 'PNG-0004', firstName: 'Hervé', lastName: 'ZILBER', email: 'herve.zilber@pn-groupe.fr', password: 'manager', role: 'manager', jobTitle: 'Directeur PNFF', tenantId: 't6', managerId: 'e1', contractType: 'CDI', contractStart: '2021-01-15', grossSalary: 5200, status: 'actif', classification: 'Cadre', weeklyHours: 35 },
  { id: 'e5', matricule: 'PNG-0005', firstName: 'Mélina', lastName: 'COHEN SETTON', email: 'melina.cohen@pn-groupe.fr', password: 'manager', role: 'manager', jobTitle: 'Directrice PNBS', tenantId: 't5', managerId: 'e1', contractType: 'CDI', contractStart: '2019-04-10', grossSalary: 5400, status: 'actif', classification: 'Cadre', weeklyHours: 35 },
  { id: 'e6', matricule: 'PNG-0006', firstName: 'Thomas', lastName: 'BERNARD', email: 'thomas.bernard@pn-groupe.fr', password: 'paie', role: 'paie', jobTitle: 'Gestionnaire de paie', tenantId: 't1', managerId: 'e1', contractType: 'CDI', contractStart: '2022-09-15', grossSalary: 3200, status: 'actif', classification: 'Employé', weeklyHours: 35 },
  { id: 'e7', matricule: 'PNG-0007', firstName: 'Sophie', lastName: 'MARTIN', email: 'sophie.martin@pn-groupe.fr', password: 'employe', role: 'employe', jobTitle: 'Assistante RH', tenantId: 't1', managerId: 'e2', contractType: 'CDI', contractStart: '2023-04-01', grossSalary: 2400, status: 'actif', classification: 'Employé', weeklyHours: 35, birthDate: '1995-08-15' },
  { id: 'e8', matricule: 'PNG-0008', firstName: 'Lucas', lastName: 'PETIT', email: 'lucas.petit@pn-groupe.fr', password: 'employe', role: 'employe', jobTitle: 'Développeur Web', tenantId: 't1', managerId: 'e1', contractType: 'CDI', contractStart: '2023-11-01', grossSalary: 3400, status: 'actif', classification: 'Cadre', weeklyHours: 35 },
  { id: 'e9', matricule: 'PNG-0009', firstName: 'Camille', lastName: 'DUBOIS', email: 'camille.dubois@pn-groupe.fr', password: 'employe', role: 'employe', jobTitle: 'Formatrice anglais', tenantId: 't7', managerId: 'e3', contractType: 'CDI', contractStart: '2023-09-01', grossSalary: 2800, status: 'actif', classification: 'Employé', weeklyHours: 35 },
  { id: 'e10', matricule: 'PNG-0010', firstName: 'Damien', lastName: 'RENAULT', email: 'damien.renault@pn-groupe.fr', password: 'rh', role: 'rh', jobTitle: 'Consultant RH', tenantId: 't8', managerId: 'e2', contractType: 'CDI', contractStart: '2022-06-01', grossSalary: 4200, status: 'actif', classification: 'Cadre', weeklyHours: 35 },
];

export const SEED_LEAVE_TYPES = [
  { id: 'lt1', code: 'CP', name: 'Congés Payés', color: '#2447df', annualDays: 25, paid: true },
  { id: 'lt2', code: 'RTT', name: 'RTT', color: '#10b981', annualDays: 10, paid: true },
  { id: 'lt3', code: 'MAL', name: 'Maladie', color: '#ef4444', annualDays: 0, paid: true },
  { id: 'lt4', code: 'MAT', name: 'Maternité', color: '#ec4899', annualDays: 0, paid: true },
  { id: 'lt5', code: 'TT', name: 'Télétravail', color: '#06b6d4', annualDays: 0, paid: true },
];

export const SEED_LEAVES = [
  { id: 'lv1', employeeId: 'e7', typeId: 'lt1', startDate: addDays(5), endDate: addDays(12), days: 6, reason: 'Vacances été', status: 'en_attente', createdAt: addDays(-2) },
  { id: 'lv2', employeeId: 'e9', typeId: 'lt1', startDate: addDays(20), endDate: addDays(27), days: 6, reason: 'Vacances', status: 'approuve', createdAt: addDays(-10) },
  { id: 'lv3', employeeId: 'e8', typeId: 'lt2', startDate: addDays(3), endDate: addDays(3), days: 1, reason: 'RTT', status: 'approuve', createdAt: addDays(-1) },
  { id: 'lv4', employeeId: 'e7', typeId: 'lt3', startDate: addDays(-3), endDate: addDays(-1), days: 3, reason: 'Grippe', status: 'approuve', createdAt: addDays(-3) },
];

export const SEED_BALANCES = SEED_EMPLOYEES.flatMap((e) => [
  { id: `b_${e.id}_cp`, employeeId: e.id, typeId: 'lt1', year: 2026, acquired: 25, taken: 5, pending: 0 },
  { id: `b_${e.id}_rtt`, employeeId: e.id, typeId: 'lt2', year: 2026, acquired: 10, taken: 2, pending: 0 },
]);

export const SEED_EXPENSES = [
  { id: 'ex1', employeeId: 'e3', periodMonth: '2026-04', status: 'soumis', totalAmount: 117.50, createdAt: addDays(-5), lines: [{ id: 'el1', reportId: 'ex1', date: addDays(-5), category: 'Repas', amount: 28.50, currency: 'EUR' }, { id: 'el2', reportId: 'ex1', date: addDays(-7), category: 'Transport', amount: 89.00, currency: 'EUR' }] },
  { id: 'ex2', employeeId: 'e4', periodMonth: '2026-04', status: 'approuve', totalAmount: 142.00, createdAt: addDays(-7), lines: [{ id: 'el3', reportId: 'ex2', date: addDays(-7), category: 'Transport', amount: 142.00, currency: 'EUR' }] },
];

export const SEED_TESTS = [
  { id: 'kt1', title: 'Sécurité au poste de travail', category: 'securite', description: 'Test annuel obligatoire (Code du travail L.4121-1)', passingScore: 70, validityMonths: 12 },
  { id: 'kt2', title: 'RGPD et protection des données', category: 'rgpd', description: 'Test annuel sur la conformité RGPD', passingScore: 70, validityMonths: 12 },
  { id: 'kt3', title: 'Référentiel Qualiopi', category: 'qualiopi', description: 'Test sur les exigences Qualiopi', passingScore: 70, validityMonths: 12 },
];

export const SEED_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Jour de l\'An' },
  { date: '2026-04-06', name: 'Lundi de Pâques' },
  { date: '2026-05-01', name: 'Fête du Travail' },
  { date: '2026-05-08', name: 'Victoire 1945' },
  { date: '2026-05-14', name: 'Ascension' },
  { date: '2026-05-25', name: 'Lundi de Pentecôte' },
  { date: '2026-07-14', name: 'Fête nationale' },
  { date: '2026-08-15', name: 'Assomption' },
  { date: '2026-11-01', name: 'Toussaint' },
  { date: '2026-11-11', name: 'Armistice 1918' },
  { date: '2026-12-25', name: 'Noël' },
];

export const SEED_CONVENTIONS = [
  { code: 'IDCC_3249', name: 'Organismes de formation (Formation professionnelle)', brochure: '3249', cpAnnuel: 25, paidSickFromDay: 1, trialPeriod: { CDI: { 'Employé': 60, 'Agent de maîtrise': 90, 'Cadre': 120 }, CDD: { default: 30 } }, trialRenewal: { Cadre: 120, 'Employé': 60 }, notice: { Cadre: 90, 'Agent de maîtrise': 60, 'Employé': 30 }, conventionalLeaves: { mariage: 5, naissance: 3, deces_conjoint: 5 } },
];

export const SEED_REVIEWS = [
  { id: 'rv1', employeeId: 'e7', reviewerId: 'e2', type: 'annuel', scheduledAt: addDays(20), status: 'planifie' },
  { id: 'rv2', employeeId: 'e8', reviewerId: 'e1', type: 'periode_essai', scheduledAt: addDays(-5), status: 'realise', overallRating: 4 },
];
