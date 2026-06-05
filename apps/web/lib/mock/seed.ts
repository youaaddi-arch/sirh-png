/**
 * Seed data pour le mode démo offline.
 * Identifiants et données du groupe Paris Nord — équivalent v1.
 */

export const SEED_TENANTS = [
  { id: 't1', code: '000-DEFIS', name: 'DENIZ FINANCES ET SERVICES DEFIS', type: 'SIEGE', siren: '849397161', siret: '84939716100035', address: '113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'EMIR', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't2', code: '001-AFPEC', name: '001 -AFPEC', type: 'SIEGE', siren: '913471793', siret: '91347179300012', address: '36 RUE PASCAL 77100 MEAUX', repName: 'KEZIBAN DENIS', conventionCode: 'IDCC_3249', establishments: [{"id": "t2_e1", "name": "001 -AFPEC", "siret": "91347179300012", "address": "221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}] },
  { id: 't3', code: '002-CFLSS', name: 'CFLSS', type: 'SIEGE', siren: '904704863', siret: '90470486300029', address: '12 Rue de la Part Dieu 69003 Lyon', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't4', code: '003-DBS', name: 'DIGITAL BUSINESS SCHOOL  DBS CMV', type: 'SIEGE', siren: '815091764', siret: '81509176400044', address: '24 RUE DE CLICHY 75009 PARIS', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [{"id": "t4_e1", "name": "DIGITAL BUSINESS SCHOOL  DBS LYON", "siret": "81509176400085", "address": "59 BOULEVARD VIVIER MERLE 69003 LYON"}, {"id": "t4_e2", "name": "DIGITAL BUSINESS SCHOOL  DBS LILLE", "siret": "81509176400077", "address": "2 FAUBOURG DES POSTES  BUREAU B 2EME ETAGE 59000 LILLE"}, {"id": "t4_e3", "name": "DIGITAL BUSINESS SCHOOL  DBS MARSEILLE", "siret": "81509176400069", "address": "9 BIS RUE JACQUES REATTU 13009 MARSEILLE"}, {"id": "t4_e4", "name": "DIGITAL BUSINESS SCHOOL  DBS TOULOUSE", "siret": "81509176400051", "address": ""}] },
  { id: 't5', code: '004-ELFE', name: 'ELFE', type: 'SIEGE', siren: '895365690', siret: '89536569000018', address: '39 BLD DE LA MUETTE 95140 GARGES LES GONESSE', repName: 'NAUSICAA MALOUM', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't6', code: '005-FRANCE ACCES', name: 'FRANCE ACCES', type: 'SIEGE', siren: '941425464', siret: '94142546400018', address: '113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'DELPHINE PAVIS', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't7', code: '006-FRANCE DIPLOME', name: 'France DIPLOME', type: 'SIEGE', siren: '921854600', siret: '92185460000027', address: '113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't8', code: '007-MA PIZZA BIO', name: 'MA PIZZA BIO', type: 'SIEGE', siren: '903451631', siret: '90345163100019', address: '39 RUE PAUL BERT 93400 SAINT OUEN', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't9', code: '008-MYCENES', name: 'MYCENES CONSEIL', type: 'SIEGE', siren: '899105696', siret: '89910569600038', address: '16 RUE DE LA POTERIE 93200 SAINT DENIS', repName: 'KEZIBAN DENIS', conventionCode: 'IDCC_3249', establishments: [{"id": "t9_e1", "name": "MYCENES CONSEIL SAINT DENIS", "siret": "89910569600020", "address": "113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}] },
  { id: 't10', code: '009-ONEL', name: 'ONEL ASSOCIATION', type: 'SIEGE', siren: '883674574', siret: '88367457400024', address: '39 RUE DE LA GARE DE REUILLY 75012 PARIS', repName: 'YANN FURET', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't11', code: '010-PBA', name: 'PARIS BEAUTY ACADEMY', type: 'SIEGE', siren: '449651694', siret: '44965169400027', address: '22 RUE DES VENETS 92 NANTERRE', repName: 'GWELTAZ FRIGOUT', conventionCode: 'IDCC_3249', establishments: [{"id": "t11_e1", "name": "PARIS BEAUTY ACADEMY", "siret": "44965169400035", "address": "30 BLD DE DOUAUMONT 75017 PARIS"}] },
  { id: 't12', code: '011-PNBS MARSEILLE', name: 'PNBS MARSEILLE PNBS', type: 'SIEGE', siren: '940987498', siret: '94098749800018', address: '9 BIS RUE JACQUES REATTU 13009 MARSEILLE', repName: 'CHERIFA MEKKI', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't13', code: '012-PNBS SUSANOO', name: 'PNBS SUSANOO', type: 'SIEGE', siren: '883135154', siret: '88313515400028', address: '60 RUE DE LA JONQUIERE 75017 PARIS', repName: 'MELINA COHEN SETTON', conventionCode: 'IDCC_3249', establishments: [{"id": "t13_e1", "name": "PNBS ST DENIS POTERIE", "siret": "88313515400036", "address": "16 RUE DE LA POTERIE 93200 SAINT DENIS"}, {"id": "t13_e2", "name": "PNBS ST DENIS EVRY", "siret": "88313515400044", "address": "34 cours Blaise Pascal 91000 EVRY COURCOURONNES"}] },
  { id: 't14', code: '013-PNBS ROUEN', name: 'ROUEN PNBS', type: 'SIEGE', siren: '949377824', siret: '94937782400022', address: '86 RUE LAFAYETTE 76100 ROUEN', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [{"id": "t14_e1", "name": "ROUEN PNBS", "siret": "94937782400014", "address": "113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}, {"id": "t14_e2", "name": "ROUEN PNBS", "siret": "EN COURS", "address": "13 rue Malouet 76100 ROUEN"}] },
  { id: 't15', code: '014-PNFF', name: 'EXCELSIOR PNFF', type: 'SIEGE', siren: '982283202', siret: '98228320200017', address: '14 RUE BEFFROY 92200 NEUILLY SUR SEINE', repName: 'HERVE ZILBER', conventionCode: 'IDCC_3249', establishments: [{"id": "t15_e1", "name": "EXCELSIOR PNFF", "siret": "98228320200025", "address": "113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}, {"id": "t15_e2", "name": "EXCELSIOR PNFF", "siret": "98228320200033", "address": "221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}] },
  { id: 't16', code: '015-POLITICA PNBS ATLANTIQUE', name: 'PNBS ATLANTIQUE', type: 'SIEGE', siren: '89951888', siret: '89951888000021', address: '17 BLD DE BERLIN 44000 NANTES', repName: 'SALAH KIRANE', conventionCode: 'IDCC_3249', establishments: [{"id": "t16_e1", "name": "PNBS ATLANTIQUE", "siret": "89951888000039", "address": "221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}] },
  { id: 't17', code: '016-POLY FRANCHISES', name: 'POLY LANGUES FRANCHISES TVA', type: 'SIEGE', siren: '978216695', siret: '97821669500012', address: '113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't18', code: '017-POLYLANGUES', name: 'POLY LANGUES SARL', type: 'SIEGE', siren: '519607808', siret: '51960780800028', address: '113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'EMIR GERANT', conventionCode: 'IDCC_3249', establishments: [{"id": "t18_e1", "name": "POLY LANGUES MASSY", "siret": "51960780800051", "address": "23 BIS RUE MARX DORMOY 91000 MASSY"}, {"id": "t18_e2", "name": "POLY LANGUES SAINT DENIS", "siret": "51960780800044", "address": "3 RUE DANIELLE CASANOVA 93210 SAINT DENIS"}, {"id": "t18_e3", "name": "POLY LANGUES  MONTREUIL", "siret": "51960780800036", "address": "47 BLD DE CHANZY 93100 MONTREUIL"}] },
  { id: 't19', code: '018-QUALIFFORMA', name: 'QUALIFFORMA', type: 'SIEGE', siren: '914329198', siret: '91432919800016', address: '96 RUE DE PARADIS 13006 MARSEILLE', repName: 'KEZIBAN DENIS', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't20', code: '019-ZURICH INSTITUT', name: 'ZURICH INSTITUT', type: 'SIEGE', siren: '949601306', siret: '94960130300010', address: '30 BLD DE DOUAUMONT 75017 PARIS', repName: 'EMIR', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't21', code: '020-FORMALSACE', name: 'FORM ALSACE', type: 'SIEGE', siren: '879460707', siret: '87946070700018', address: 'Bâtiment Sxb1 16 Avenue de l\'Europe 67300 Schiltigheim', repName: 'STEPHANE HRYHOROWICZ', conventionCode: 'IDCC_3249', establishments: [{"id": "t21_e1", "name": "FORM ALSACE", "siret": "87946070700026", "address": "221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}] },
  { id: 't22', code: '021-OUEST FORMATION', name: 'OUEST FORMATION', type: 'SIEGE', siren: '901234187', siret: '90123418700010', address: '34 PLACE DE LA GARE 53000 LAVAL', repName: 'MARION COZIC', conventionCode: 'IDCC_3249', establishments: [{"id": "t22_e1", "name": "OUEST FORMATION SAINT DENIS 221", "siret": "90123418700028", "address": "221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"}] },
  { id: 't23', code: '022-EDU SYNC', name: 'EDU SYNC', type: 'SIEGE', siren: '984796078', siret: '98479607800017', address: '1T Chemin de la Mare aux Biches 78650 Saulx-Marchais', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't24', code: '023-U TEACH ME', name: 'U TEACH ME', type: 'SIEGE', siren: '949370217', siret: '94937021700026', address: '14 Route de Wintershouse 67500 Haguenau', repName: 'LE QUOC LINDA', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't25', code: '024-CARE CONSEIL RH', name: 'CARE CONSEIL RH', type: 'SIEGE', siren: '901888883', siret: '90188888300013', address: '5 rue du Tunnel 75019 Paris', repName: 'DAMIEN RENAULT', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't26', code: '025- PNBS LILLE', name: 'PNBS LILLE', type: 'SIEGE', siren: '988725818', siret: '98872581800013', address: 'rue du Faubourg des Postes, Centre Commercial Lillenium 59000 Lille', repName: 'MEKKI DAOUADJI Cherifa', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't27', code: '026-IDC', name: 'IDC', type: 'SIEGE', siren: '930556808', siret: '93055680800010', address: '153 Avenue Jean Lolive 93500 Pantin', repName: 'NOUVELLE  ETOILE CAPITAL', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't28', code: '027-PNBS LYON', name: 'PNBS LYON', type: 'SIEGE', siren: '989353339', siret: '98935333900017', address: '59 Boulevard Marius Vivier Merle 69003 Lyon', repName: 'MEKKI DAOUADJI Cherifa', conventionCode: 'IDCC_3249', establishments: [{"id": "t28_e1", "name": "PNBS LYON ETS Marseille", "siret": "98935333900025", "address": "9 BIS RUE JACQUES REATTU 13009 MARSEILLE"}] },
  { id: 't29', code: '028-ILEF', name: 'ILEF', type: 'SIEGE', siren: '984198259', siret: '98419825900017', address: '36 rue Pascal 77100 Meaux', repName: 'SALAH KIRANE', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't30', code: '029- EQUIPFORM', name: 'EQUIPFORM', type: 'SIEGE', siren: '992896415', siret: '99289641500013', address: '113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't31', code: '030- MYPERSONALI', name: 'MYPERSONALI', type: 'SIEGE', siren: '888643459', siret: '88864345900017', address: '7 ALLEE DES BERGES, 77400 LAGNY-SUR-MARNE', repName: 'Le Guilly Ambre', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't32', code: '031- ORCEA', name: 'ORCEA', type: 'SIEGE', siren: '452361330', siret: '45236133000031', address: '1 BOULEVARD BARABAN, 80000 AMIENS', repName: 'ROCHELLE Catherine', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't33', code: '032- PNA PARIS NORD ALTERNANCE', name: 'PARIS NORD ALTERNANCE', type: 'SIEGE', siren: '100541861', siret: '10054186100017', address: '113 AVENUE DU PRESIDENT WILSON, 93210 SAINT-DENIS', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't34', code: '033- PNLS PARIS NORD LANGUES ET SERVICES', name: 'PARIS NORD LANGUES ET SERVICES', type: 'SIEGE', siren: '100504661', siret: '10050466100016', address: '113 AVENUE DU PRESIDENT WILSON, 93210 SAINT-DENIS', repName: 'DENIZ FINANCES SERVICES', conventionCode: 'IDCC_3249', establishments: [] },
  { id: 't35', code: '034- AIMENGLISH', name: 'AIMENGLISH', type: 'SIEGE', siren: '848141966', siret: '84814196600020', address: '3 RUE DE GENEVE 69006 LYON', repName: 'RODOLPHE', conventionCode: 'IDCC_3249', establishments: [{"id": "t35_e1", "name": "AIMENGLISH", "siret": "84814196600020", "address": "3 RUE DE GENEVE 69006 LYON"}] },
  { id: 't36', code: '035- CHIFFR\'ACTIF', name: 'CHIFFR\'ACTIF', type: 'SIEGE', siren: '993750298', siret: '99375029800016', address: '156 RUE DEPORTES INTERNES RESISTANCE, 45200 MONTARGIS', repName: 'GÜR Mervé', conventionCode: 'IDCC_3249', establishments: [{"id": "t36_e1", "name": "CHIFFR\u0027ACTIF", "siret": "99375029800016", "address": "156 RUE DEPORTES INTERNES RESISTANCE, 45200 MONTARGIS"}] },
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
