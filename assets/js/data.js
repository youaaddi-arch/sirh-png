/* Seed data — Paris Nord Groupe SIRH */
(function () {
  // Sociétés extraites du fichier "GROUPE_LISTE_STES_ET_ETS_260225.xlsx"
  const COMPANIES_RAW = [
    {"code":"000-DEFIS","name":"DENIZ FINANCES ET SERVICES DEFIS","type":"SIEGE","siren":"849397161","siret":"84939716100035","rep":"EMIR","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"001-AFPEC","name":"001 -AFPEC","type":"SIEGE","siren":"913471793","siret":"91347179300012","rep":"KEZIBAN DENIS","address":"36 RUE PASCAL 77100 MEAUX"},
    {"code":"001-AFPEC","name":"001 -AFPEC","type":"ETS","siren":"913471793","siret":"91347179300012","rep":"KEZIBAN DENIS","address":"221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"002-CFLSS","name":"CFLSS","type":"SIEGE","siren":"904704863","siret":"90470486300029","rep":"DENIZ FINANCES SERVICES","address":"12 Rue de la Part Dieu 69003 Lyon"},
    {"code":"003-DBS","name":"DIGITAL BUSINESS SCHOOL DBS CMV","type":"SIEGE","siren":"815091764","siret":"81509176400044","rep":"DENIZ FINANCES SERVICES","address":"24 RUE DE CLICHY 75009 PARIS"},
    {"code":"003-DBS","name":"DIGITAL BUSINESS SCHOOL DBS LYON","type":"ETS","siren":"815091764","siret":"81509176400085","rep":"DENIZ FINANCES SERVICES","address":"59 BOULEVARD VIVIER MERLE 69003 LYON"},
    {"code":"003-DBS","name":"DIGITAL BUSINESS SCHOOL DBS LILLE","type":"ETS","siren":"815091764","siret":"81509176400077","rep":"DENIZ FINANCES SERVICES","address":"2 FAUBOURG DES POSTES BUREAU B 2EME ETAGE 59000 LILLE"},
    {"code":"003-DBS","name":"DIGITAL BUSINESS SCHOOL DBS MARSEILLE","type":"ETS","siren":"815091764","siret":"81509176400069","rep":"DENIZ FINANCES SERVICES","address":"9 BIS RUE JACQUES REATTU 13009 MARSEILLE"},
    {"code":"003-DBS","name":"DIGITAL BUSINESS SCHOOL DBS TOULOUSE","type":"ETS","siren":"815091764","siret":"81509176400051","rep":"DENIZ FINANCES SERVICES","address":""},
    {"code":"004-ELFE","name":"ELFE","type":"SIEGE","siren":"895365690","siret":"89536569000018","rep":"NAUSICAA MALOUM","address":"39 BLD DE LA MUETTE 95140 GARGES LES GONESSE"},
    {"code":"005-FRANCE ACCES","name":"FRANCE ACCES","type":"SIEGE","siren":"941425464","siret":"94142546400018","rep":"DELPHINE PAVIS","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"006-FRANCE DIPLOME","name":"FRANCE DIPLOME","type":"SIEGE","siren":"921854600","siret":"92185460000027","rep":"DENIZ FINANCES SERVICES","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"007-MA PIZZA BIO","name":"MA PIZZA BIO","type":"SIEGE","siren":"903451631","siret":"90345163100019","rep":"DENIZ FINANCES SERVICES","address":"39 RUE PAUL BERT 93400 SAINT OUEN"},
    {"code":"008-MYCENES","name":"MYCENES CONSEIL","type":"SIEGE","siren":"899105696","siret":"89910569600038","rep":"KEZIBAN DENIS","address":"16 RUE DE LA POTERIE 93200 SAINT DENIS"},
    {"code":"008-MYCENES","name":"MYCENES CONSEIL SAINT DENIS","type":"ETS","siren":"899105696","siret":"89910569600020","rep":"KEZIBAN DENIS","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"009-ONEL","name":"ONEL ASSOCIATION","type":"SIEGE","siren":"883674574","siret":"88367457400024","rep":"YANN FURET","address":"39 RUE DE LA GARE DE REUILLY 75012 PARIS"},
    {"code":"010-PBA","name":"PARIS BEAUTY ACADEMY","type":"SIEGE","siren":"449651694","siret":"44965169400027","rep":"GWELTAZ FRIGOUT","address":"22 RUE DES VENETS 92 NANTERRE"},
    {"code":"010-PBA","name":"PARIS BEAUTY ACADEMY","type":"ETS","siren":"449651694","siret":"44965169400035","rep":"GWELTAZ FRIGOUT","address":"30 BLD DE DOUAUMONT 75017 PARIS"},
    {"code":"011-PNBS MARSEILLE","name":"PNBS MARSEILLE","type":"SIEGE","siren":"940987498","siret":"94098749800018","rep":"CHERIFA MEKKI","address":"9 BIS RUE JACQUES REATTU 13009 MARSEILLE"},
    {"code":"012-PNBS SUSANOO","name":"PNBS SUSANOO","type":"SIEGE","siren":"883135154","siret":"88313515400028","rep":"MELINA COHEN SETTON","address":"60 RUE DE LA JONQUIERE 75017 PARIS"},
    {"code":"012-PNBS SUSANOO","name":"PNBS ST DENIS POTERIE","type":"ETS","siren":"883135154","siret":"88313515400036","rep":"MELINA COHEN SETTON","address":"16 RUE DE LA POTERIE 93200 SAINT DENIS"},
    {"code":"012-PNBS SUSANOO","name":"PNBS ST DENIS EVRY","type":"ETS","siren":"883135154","siret":"88313515400044","rep":"MELINA COHEN SETTON","address":"34 cours Blaise Pascal 91000 EVRY COURCOURONNES"},
    {"code":"013-PNBS ROUEN","name":"ROUEN PNBS","type":"SIEGE","siren":"949377824","siret":"94937782400022","rep":"DENIZ FINANCES SERVICES","address":"86 RUE LAFAYETTE 76100 ROUEN"},
    {"code":"013-PNBS ROUEN","name":"ROUEN PNBS","type":"ETS","siren":"949377824","siret":"94937782400014","rep":"DENIZ FINANCES SERVICES","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"013-PNBS ROUEN","name":"ROUEN PNBS","type":"ETS","siren":"949377824","siret":"EN COURS","rep":"DENIZ FINANCES SERVICES","address":"13 rue Malouet 76100 ROUEN"},
    {"code":"014-PNFF","name":"EXCELSIOR PNFF","type":"SIEGE","siren":"982283202","siret":"98228320200017","rep":"HERVE ZILBER","address":"14 RUE BEFFROY 92200 NEUILLY SUR SEINE"},
    {"code":"014-PNFF","name":"EXCELSIOR PNFF","type":"ETS","siren":"982283202","siret":"98228320200025","rep":"HERVE ZILBER","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"014-PNFF","name":"EXCELSIOR PNFF","type":"ETS","siren":"982283202","siret":"98228320200033","rep":"HERVE ZILBER","address":"221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"015-POLITICA PNBS ATLANTIQUE","name":"PNBS ATLANTIQUE","type":"SIEGE","siren":"899518880","siret":"89951888000021","rep":"SALAH KIRANE","address":"17 BLD DE BERLIN 44000 NANTES"},
    {"code":"015-POLITICA PNBS ATLANTIQUE","name":"PNBS ATLANTIQUE","type":"ETS","siren":"899518880","siret":"89951888000039","rep":"SALAH KIRANE","address":"221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"016-POLY FRANCHISES","name":"POLY LANGUES FRANCHISES TVA","type":"SIEGE","siren":"978216695","siret":"97821669500012","rep":"DENIZ FINANCES SERVICES","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"017-POLYLANGUES","name":"POLY LANGUES SARL","type":"SIEGE","siren":"519607808","siret":"51960780800028","rep":"EMIR GERANT","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"017-POLYLANGUES","name":"POLY LANGUES MASSY","type":"ETS","siren":"519607808","siret":"51960780800051","rep":"EMIR GERANT","address":"23 BIS RUE MARX DORMOY 91000 MASSY"},
    {"code":"017-POLYLANGUES","name":"POLY LANGUES SAINT DENIS","type":"ETS","siren":"519607808","siret":"51960780800044","rep":"EMIR GERANT","address":"3 RUE DANIELLE CASANOVA 93210 SAINT DENIS"},
    {"code":"017-POLYLANGUES","name":"POLY LANGUES MONTREUIL","type":"ETS","siren":"519607808","siret":"51960780800036","rep":"EMIR GERANT","address":"47 BLD DE CHANZY 93100 MONTREUIL"},
    {"code":"018-QUALIFFORMA","name":"QUALIFFORMA","type":"SIEGE","siren":"914329198","siret":"91432919800016","rep":"KEZIBAN DENIS","address":"96 RUE DE PARADIS 13006 MARSEILLE"},
    {"code":"019-ZURICH INSTITUT","name":"ZURICH INSTITUT","type":"SIEGE","siren":"949601306","siret":"94960130300010","rep":"EMIR","address":"30 BLD DE DOUAUMONT 75017 PARIS"},
    {"code":"020-FORMALSACE","name":"FORM ALSACE","type":"SIEGE","siren":"879460707","siret":"87946070700018","rep":"STEPHANE HRYHOROWICZ","address":"Bâtiment Sxb1 16 Avenue de l'Europe 67300 Schiltigheim"},
    {"code":"020-FORMALSACE","name":"FORM ALSACE","type":"ETS","siren":"879460707","siret":"87946070700026","rep":"STEPHANE HRYHOROWICZ","address":"221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"021-OUEST FORMATION","name":"OUEST FORMATION","type":"SIEGE","siren":"901234187","siret":"90123418700010","rep":"MARION COZIC","address":"34 PLACE DE LA GARE 53000 LAVAL"},
    {"code":"021-OUEST FORMATION","name":"OUEST FORMATION SAINT DENIS 221","type":"ETS","siren":"901234187","siret":"90123418700028","rep":"MARION COZIC","address":"221 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"022-EDU SYNC","name":"EDU SYNC","type":"SIEGE","siren":"984796078","siret":"98479607800017","rep":"DENIZ FINANCES SERVICES","address":"1T Chemin de la Mare aux Biches 78650 Saulx-Marchais"},
    {"code":"023-U TEACH ME","name":"U TEACH ME","type":"SIEGE","siren":"949370217","siret":"94937021700026","rep":"LE QUOC LINDA","address":"14 Route de Wintershouse 67500 Haguenau"},
    {"code":"024-CARE CONSEIL RH","name":"CARE CONSEIL RH","type":"SIEGE","siren":"901888883","siret":"90188888300013","rep":"DAMIEN RENAULT","address":"5 rue du Tunnel 75019 Paris"},
    {"code":"025-PNBS LILLE","name":"PNBS LILLE","type":"SIEGE","siren":"988725818","siret":"98872581800013","rep":"MEKKI DAOUADJI Cherifa","address":"rue du Faubourg des Postes, Centre Commercial Lillenium 59000 Lille"},
    {"code":"026-IDC","name":"IDC","type":"SIEGE","siren":"930556808","siret":"93055680800010","rep":"NOUVELLE ETOILE CAPITAL","address":"153 Avenue Jean Lolive 93500 Pantin"},
    {"code":"027-PNBS LYON","name":"PNBS LYON","type":"SIEGE","siren":"989353339","siret":"98935333900017","rep":"MEKKI DAOUADJI Cherifa","address":"59 Boulevard Marius Vivier Merle 69003 Lyon"},
    {"code":"027-PNBS LYON","name":"PNBS LYON ETS Marseille","type":"ETS","siren":"989353339","siret":"98935333900025","rep":"MEKKI DAOUADJI Cherifa","address":"9 BIS RUE JACQUES REATTU 13009 MARSEILLE"},
    {"code":"028-ILEF","name":"ILEF","type":"SIEGE","siren":"984198259","siret":"98419825900017","rep":"SALAH KIRANE","address":"36 rue Pascal 77100 Meaux"},
    {"code":"029-EQUIPFORM","name":"EQUIPFORM","type":"SIEGE","siren":"992896415","siret":"99289641500013","rep":"DENIZ FINANCES SERVICES","address":"113 AVENUE DU PRESIDENT WILSON 93210 SAINT DENIS"},
    {"code":"030-MYPERSONALI","name":"MYPERSONALI","type":"SIEGE","siren":"888643459","siret":"88864345900017","rep":"Le Guilly Ambre","address":"7 ALLEE DES BERGES, 77400 LAGNY-SUR-MARNE"},
    {"code":"031-ORCEA","name":"ORCEA","type":"SIEGE","siren":"452361330","siret":"45236133000031","rep":"ROCHELLE Catherine","address":"1 BOULEVARD BARABAN, 80000 AMIENS"},
    {"code":"032-PNA","name":"PARIS NORD ALTERNANCE","type":"SIEGE","siren":"100541861","siret":"10054186100017","rep":"DENIZ FINANCES SERVICES","address":"113 AVENUE DU PRESIDENT WILSON, 93210 SAINT-DENIS"},
    {"code":"033-PNLS","name":"PARIS NORD LANGUES ET SERVICES","type":"SIEGE","siren":"100504661","siret":"10050466100016","rep":"DENIZ FINANCES SERVICES","address":"113 AVENUE DU PRESIDENT WILSON, 93210 SAINT-DENIS"},
    {"code":"034-AIMENGLISH","name":"AIMENGLISH","type":"ETS","siren":"848141966","siret":"84814196600020","rep":"RODOLPHE","address":"3 RUE DE GENEVE 69006 LYON"},
    {"code":"035-CHIFFR'ACTIF","name":"CHIFFR'ACTIF","type":"SIEGE","siren":"993750298","siret":"99375029800016","rep":"GÜR Mervé","address":"156 RUE DEPORTES INTERNES RESISTANCE, 45200 MONTARGIS"},
  ];

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

  // Companies with stable IDs
  const companies = COMPANIES_RAW.map((c, i) => ({
    id: `co_${String(i + 1).padStart(3, '0')}`,
    code: c.code, name: c.name, type: c.type || 'SIEGE',
    siren: c.siren, siret: c.siret, rep: c.rep, address: c.address,
    active: true,
  }));

  // Departments
  const departments = [
    { id: 'dep_dir',  name: 'Direction Générale',     parentId: null,     companyId: 'co_001' },
    { id: 'dep_rh',   name: 'Ressources Humaines',    parentId: 'dep_dir', companyId: 'co_001' },
    { id: 'dep_fin',  name: 'Finance & Comptabilité', parentId: 'dep_dir', companyId: 'co_001' },
    { id: 'dep_op',   name: 'Opérations',             parentId: 'dep_dir', companyId: 'co_001' },
    { id: 'dep_ped',  name: 'Pédagogie',              parentId: 'dep_op',  companyId: 'co_005' },
    { id: 'dep_com',  name: 'Communication & Marketing', parentId: 'dep_op', companyId: 'co_001' },
    { id: 'dep_it',   name: 'Système d\'information',  parentId: 'dep_op', companyId: 'co_001' },
    { id: 'dep_jur',  name: 'Juridique',              parentId: 'dep_dir', companyId: 'co_001' },
    { id: 'dep_qua',  name: 'Qualité',                parentId: 'dep_op',  companyId: 'co_001' },
  ];

  const roles = ['admin', 'rh', 'manager', 'employe', 'paie'];

  // Users / Employees
  const employees = [
    {
      id: 'emp_001', matricule: 'PNG-0001', firstName: 'Emir', lastName: 'DENIZ',
      email: 'emir.deniz@pn-groupe.fr', phone: '+33 1 48 09 00 00', role: 'admin',
      jobTitle: 'Président', departmentId: 'dep_dir', companyId: 'co_001',
      managerId: null, contractType: 'CDI', contractStart: '2018-01-01', status: 'actif',
      birthDate: '1975-05-12', address: '113 Avenue du Président Wilson, 93210 Saint-Denis',
      iban: 'FR76 1000 0000 0000 0000 0000 001', socialSecurity: '175051234567890',
      salary: 8500, password: 'admin',
    },
    {
      id: 'emp_002', matricule: 'PNG-0002', firstName: 'Keziban', lastName: 'DENIZ',
      email: 'keziban.deniz@pn-groupe.fr', phone: '+33 1 48 09 00 01', role: 'rh',
      jobTitle: 'Directrice des Ressources Humaines', departmentId: 'dep_rh', companyId: 'co_001',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2018-06-01', status: 'actif',
      birthDate: '1980-03-22', address: '36 rue Pascal, 77100 Meaux',
      salary: 6500, password: 'rh',
    },
    {
      id: 'emp_003', matricule: 'PNG-0003', firstName: 'Delphine', lastName: 'PAVIS',
      email: 'delphine.pavis@pn-groupe.fr', phone: '+33 1 48 09 00 02', role: 'manager',
      jobTitle: 'Responsable Pédagogique - France Accès', departmentId: 'dep_ped', companyId: 'co_011',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2020-09-01', status: 'actif',
      birthDate: '1985-07-10', salary: 4800, password: 'manager',
    },
    {
      id: 'emp_004', matricule: 'PNG-0004', firstName: 'Hervé', lastName: 'ZILBER',
      email: 'herve.zilber@pn-groupe.fr', phone: '+33 1 48 09 00 03', role: 'manager',
      jobTitle: 'Directeur PNFF', departmentId: 'dep_op', companyId: 'co_026',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2021-01-15', status: 'actif',
      salary: 5200, password: 'manager',
    },
    {
      id: 'emp_005', matricule: 'PNG-0005', firstName: 'Mélina', lastName: 'COHEN SETTON',
      email: 'melina.cohen@pn-groupe.fr', phone: '+33 1 48 09 00 04', role: 'manager',
      jobTitle: 'Directrice PNBS Susanoo', departmentId: 'dep_op', companyId: 'co_020',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2019-04-10', status: 'actif',
      salary: 5400, password: 'manager',
    },
    {
      id: 'emp_006', matricule: 'PNG-0006', firstName: 'Cherifa', lastName: 'MEKKI',
      email: 'cherifa.mekki@pn-groupe.fr', phone: '+33 4 91 00 00 05', role: 'manager',
      jobTitle: 'Directrice PNBS Marseille', departmentId: 'dep_op', companyId: 'co_019',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2022-03-01', status: 'actif',
      salary: 4900, password: 'manager',
    },
    {
      id: 'emp_007', matricule: 'PNG-0007', firstName: 'Marion', lastName: 'COZIC',
      email: 'marion.cozic@pn-groupe.fr', phone: '+33 2 43 00 00 06', role: 'manager',
      jobTitle: 'Directrice Ouest Formation', departmentId: 'dep_op', companyId: 'co_040',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2023-01-15', status: 'actif',
      salary: 4600, password: 'manager',
    },
    {
      id: 'emp_008', matricule: 'PNG-0008', firstName: 'Damien', lastName: 'RENAULT',
      email: 'damien.renault@pn-groupe.fr', phone: '+33 1 48 09 00 07', role: 'rh',
      jobTitle: 'Consultant RH', departmentId: 'dep_rh', companyId: 'co_044',
      managerId: 'emp_002', contractType: 'CDI', contractStart: '2022-06-01', status: 'actif',
      salary: 4200, password: 'rh',
    },
    {
      id: 'emp_009', matricule: 'PNG-0009', firstName: 'Yann', lastName: 'FURET',
      email: 'yann.furet@pn-groupe.fr', phone: '+33 1 48 09 00 08', role: 'manager',
      jobTitle: 'Directeur ONEL', departmentId: 'dep_op', companyId: 'co_016',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2020-11-01', status: 'actif',
      salary: 4700, password: 'manager',
    },
    {
      id: 'emp_010', matricule: 'PNG-0010', firstName: 'Stéphane', lastName: 'HRYHOROWICZ',
      email: 'stephane.h@pn-groupe.fr', phone: '+33 3 88 00 00 10', role: 'manager',
      jobTitle: 'Directeur Form Alsace', departmentId: 'dep_op', companyId: 'co_038',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2021-09-01', status: 'actif',
      salary: 4500, password: 'manager',
    },
    {
      id: 'emp_011', matricule: 'PNG-0011', firstName: 'Sophie', lastName: 'MARTIN',
      email: 'sophie.martin@pn-groupe.fr', phone: '+33 1 48 09 00 11', role: 'employe',
      jobTitle: 'Assistante RH', departmentId: 'dep_rh', companyId: 'co_001',
      managerId: 'emp_002', contractType: 'CDI', contractStart: '2023-04-01', status: 'actif',
      salary: 2400, password: 'employe',
    },
    {
      id: 'emp_012', matricule: 'PNG-0012', firstName: 'Thomas', lastName: 'BERNARD',
      email: 'thomas.bernard@pn-groupe.fr', phone: '+33 1 48 09 00 12', role: 'paie',
      jobTitle: 'Gestionnaire de paie', departmentId: 'dep_fin', companyId: 'co_001',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2022-09-15', status: 'actif',
      salary: 3200, password: 'paie',
    },
    {
      id: 'emp_013', matricule: 'PNG-0013', firstName: 'Camille', lastName: 'DUBOIS',
      email: 'camille.dubois@pn-groupe.fr', phone: '+33 1 48 09 00 13', role: 'employe',
      jobTitle: 'Formatrice anglais', departmentId: 'dep_ped', companyId: 'co_032',
      managerId: 'emp_003', contractType: 'CDI', contractStart: '2023-09-01', status: 'actif',
      salary: 2800, password: 'employe',
    },
    {
      id: 'emp_014', matricule: 'PNG-0014', firstName: 'Lucas', lastName: 'PETIT',
      email: 'lucas.petit@pn-groupe.fr', phone: '+33 1 48 09 00 14', role: 'employe',
      jobTitle: 'Développeur Web', departmentId: 'dep_it', companyId: 'co_001',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2023-11-01', status: 'actif',
      salary: 3400, password: 'employe',
    },
    {
      id: 'emp_015', matricule: 'PNG-0015', firstName: 'Emma', lastName: 'ROBERT',
      email: 'emma.robert@pn-groupe.fr', phone: '+33 1 48 09 00 15', role: 'employe',
      jobTitle: 'Chargée de communication', departmentId: 'dep_com', companyId: 'co_001',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2024-02-15', status: 'actif',
      salary: 2900, password: 'employe',
    },
    {
      id: 'emp_016', matricule: 'PNG-0016', firstName: 'Nausicaa', lastName: 'MALOUM',
      email: 'nausicaa.maloum@pn-groupe.fr', phone: '+33 1 48 09 00 16', role: 'manager',
      jobTitle: 'Directrice ELFE', departmentId: 'dep_op', companyId: 'co_010',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2022-09-01', status: 'actif',
      salary: 4700, password: 'manager',
    },
    {
      id: 'emp_017', matricule: 'PNG-0017', firstName: 'Gweltaz', lastName: 'FRIGOUT',
      email: 'g.frigout@pn-groupe.fr', phone: '+33 1 48 09 00 17', role: 'manager',
      jobTitle: 'Directeur Paris Beauty Academy', departmentId: 'dep_op', companyId: 'co_017',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2021-06-01', status: 'actif',
      salary: 4900, password: 'manager',
    },
    {
      id: 'emp_018', matricule: 'PNG-0018', firstName: 'Salah', lastName: 'KIRANE',
      email: 'salah.kirane@pn-groupe.fr', phone: '+33 1 48 09 00 18', role: 'manager',
      jobTitle: 'Directeur PNBS Atlantique', departmentId: 'dep_op', companyId: 'co_029',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2022-11-01', status: 'actif',
      salary: 4800, password: 'manager',
    },
    {
      id: 'emp_019', matricule: 'PNG-0019', firstName: 'Linda', lastName: 'LE QUOC',
      email: 'linda.lequoc@pn-groupe.fr', phone: '+33 1 48 09 00 19', role: 'manager',
      jobTitle: 'Directrice U Teach Me', departmentId: 'dep_op', companyId: 'co_043',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2024-01-01', status: 'actif',
      salary: 4400, password: 'manager',
    },
    {
      id: 'emp_020', matricule: 'PNG-0020', firstName: 'Ambre', lastName: 'LE GUILLY',
      email: 'ambre.leguilly@pn-groupe.fr', phone: '+33 1 60 00 00 20', role: 'manager',
      jobTitle: 'Directrice MyPersonali', departmentId: 'dep_op', companyId: 'co_051',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2023-05-15', status: 'actif',
      salary: 4500, password: 'manager',
    },
    {
      id: 'emp_021', matricule: 'PNG-0021', firstName: 'Mervé', lastName: 'GÜR',
      email: 'merve.gur@pn-groupe.fr', phone: '+33 2 38 00 00 21', role: 'manager',
      jobTitle: 'Directrice Chiffr\'Actif', departmentId: 'dep_fin', companyId: 'co_056',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2024-03-01', status: 'actif',
      salary: 4600, password: 'manager',
    },
    {
      id: 'emp_022', matricule: 'PNG-0022', firstName: 'Julie', lastName: 'LEROY',
      email: 'julie.leroy@pn-groupe.fr', phone: '+33 1 48 09 00 22', role: 'employe',
      jobTitle: 'Formatrice', departmentId: 'dep_ped', companyId: 'co_020',
      managerId: 'emp_005', contractType: 'CDI', contractStart: '2024-04-15', status: 'actif',
      salary: 2700, password: 'employe',
    },
    {
      id: 'emp_023', matricule: 'PNG-0023', firstName: 'Nicolas', lastName: 'MOREAU',
      email: 'nicolas.moreau@pn-groupe.fr', phone: '+33 4 91 00 00 23', role: 'employe',
      jobTitle: 'Conseiller pédagogique', departmentId: 'dep_ped', companyId: 'co_019',
      managerId: 'emp_006', contractType: 'CDD', contractStart: '2025-01-01', contractEnd: '2025-12-31', status: 'actif',
      salary: 2600, password: 'employe',
    },
    {
      id: 'emp_024', matricule: 'PNG-0024', firstName: 'Marie', lastName: 'GIRARD',
      email: 'marie.girard@pn-groupe.fr', phone: '+33 1 48 09 00 24', role: 'employe',
      jobTitle: 'Assistante administrative', departmentId: 'dep_op', companyId: 'co_001',
      managerId: 'emp_001', contractType: 'CDI', contractStart: '2024-09-01', status: 'actif',
      salary: 2300, password: 'employe',
    },
    {
      id: 'emp_025', matricule: 'PNG-0025', firstName: 'Antoine', lastName: 'ROUX',
      email: 'antoine.roux@pn-groupe.fr', phone: '+33 3 88 00 00 25', role: 'employe',
      jobTitle: 'Formateur informatique', departmentId: 'dep_ped', companyId: 'co_038',
      managerId: 'emp_010', contractType: 'CDI', contractStart: '2024-11-01', status: 'actif',
      salary: 3000, password: 'employe',
    },
  ];

  // Leave types
  const leaveTypes = [
    { id: 'lt_cp', code: 'CP',  name: 'Congés Payés',     color: '#2447df', annualDays: 25, paid: true },
    { id: 'lt_rt', code: 'RTT', name: 'RTT',              color: '#10b981', annualDays: 10, paid: true },
    { id: 'lt_ma', code: 'MAL', name: 'Maladie',          color: '#ef4444', annualDays: 0,  paid: true },
    { id: 'lt_mp', code: 'MAT', name: 'Maternité',        color: '#ec4899', annualDays: 0,  paid: true },
    { id: 'lt_pa', code: 'PAT', name: 'Paternité',        color: '#8b5cf6', annualDays: 0,  paid: true },
    { id: 'lt_fa', code: 'FAM', name: 'Événement familial', color: '#f59e0b', annualDays: 0, paid: true },
    { id: 'lt_ss', code: 'SS',  name: 'Sans solde',       color: '#6b7280', annualDays: 0,  paid: false },
    { id: 'lt_tt', code: 'TT',  name: 'Télétravail',      color: '#06b6d4', annualDays: 0,  paid: true },
  ];

  // Leaves
  const leaves = [
    { id: 'lv_001', employeeId: 'emp_011', typeId: 'lt_cp', startDate: addDays(5),  endDate: addDays(12), days: 6, reason: 'Vacances été', status: 'en_attente', createdAt: addDays(-2) },
    { id: 'lv_002', employeeId: 'emp_013', typeId: 'lt_cp', startDate: addDays(20), endDate: addDays(27), days: 6, reason: 'Vacances',      status: 'approuve', approvedBy: 'emp_003', createdAt: addDays(-10) },
    { id: 'lv_003', employeeId: 'emp_014', typeId: 'lt_rt', startDate: addDays(3),  endDate: addDays(3),  days: 1, reason: 'RTT',           status: 'approuve', approvedBy: 'emp_001', createdAt: addDays(-1) },
    { id: 'lv_004', employeeId: 'emp_015', typeId: 'lt_cp', startDate: addDays(-10),endDate: addDays(-8), days: 3, reason: 'Pont',          status: 'approuve', approvedBy: 'emp_001', createdAt: addDays(-15) },
    { id: 'lv_005', employeeId: 'emp_022', typeId: 'lt_ma', startDate: addDays(-3), endDate: addDays(-1), days: 3, reason: 'Grippe', status: 'approuve', approvedBy: 'emp_005', createdAt: addDays(-3) },
    { id: 'lv_006', employeeId: 'emp_024', typeId: 'lt_cp', startDate: addDays(40), endDate: addDays(52), days: 9, reason: 'Vacances été', status: 'en_attente', createdAt: addDays(-1) },
    { id: 'lv_007', employeeId: 'emp_023', typeId: 'lt_cp', startDate: addDays(15), endDate: addDays(19), days: 4, reason: 'Famille', status: 'en_attente', createdAt: today.toISOString() },
  ];

  // Leave balances
  const leaveBalances = employees.flatMap(e => [
    { id: U.uid('bal'), employeeId: e.id, typeId: 'lt_cp', acquired: 25, taken: Math.floor(Math.random() * 10), pending: 0 },
    { id: U.uid('bal'), employeeId: e.id, typeId: 'lt_rt', acquired: 10, taken: Math.floor(Math.random() * 4),  pending: 0 },
  ]);

  // Timesheets
  const now = new Date();
  const timesheets = [];
  for (const emp of employees.slice(0, 15)) {
    for (let i = 0; i < 14; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      timesheets.push({
        id: U.uid('ts'),
        employeeId: emp.id, date: iso(d),
        startTime: '09:00', endTime: '17:30', breakMinutes: 60,
        hours: 7.5,
        project: ['Administration', 'Pédagogie', 'Recrutement', 'Formation'][i % 4],
        notes: '', status: i > 6 ? 'valide' : 'en_attente',
      });
    }
  }

  // Expenses
  const expenses = [
    { id: 'ex_001', employeeId: 'emp_003', date: addDays(-5),  category: 'Repas',       amount: 28.50, currency: 'EUR', project: 'Réunion ped.', status: 'en_attente', receipt: true, notes: 'Déjeuner client' },
    { id: 'ex_002', employeeId: 'emp_004', date: addDays(-7),  category: 'Transport',   amount: 142.00, currency: 'EUR', project: 'Déplacement Rouen', status: 'approuve', receipt: true, approvedBy: 'emp_001' },
    { id: 'ex_003', employeeId: 'emp_005', date: addDays(-3),  category: 'Hébergement', amount: 89.00, currency: 'EUR', project: 'Salon RH', status: 'en_attente', receipt: true },
    { id: 'ex_004', employeeId: 'emp_011', date: addDays(-12), category: 'Fournitures', amount: 45.20, currency: 'EUR', project: 'Bureau', status: 'rembourse', receipt: true, approvedBy: 'emp_002' },
    { id: 'ex_005', employeeId: 'emp_014', date: addDays(-2),  category: 'Logiciels',   amount: 99.00, currency: 'EUR', project: 'Licence', status: 'en_attente', receipt: true, notes: 'Abonnement annuel' },
    { id: 'ex_006', employeeId: 'emp_006', date: addDays(-15), category: 'Transport',   amount: 178.50, currency: 'EUR', project: 'TGV Paris-Marseille', status: 'rembourse', receipt: true, approvedBy: 'emp_001' },
  ];

  // Trainings
  const trainings = [
    { id: 'tr_001', title: 'Excel Avancé', provider: 'Form Alsace', category: 'Bureautique', duration: 14, startDate: addDays(30),  endDate: addDays(32),  capacity: 12, cost: 850,  certifying: true,  description: 'Formation Excel niveau avancé : tableaux croisés dynamiques, macros, Power Query.' },
    { id: 'tr_002', title: 'Management d\'équipe', provider: 'Care Conseil RH', category: 'Management', duration: 21, startDate: addDays(45),  endDate: addDays(48), capacity: 8, cost: 1500, certifying: true, description: 'Outils et postures du manager moderne.' },
    { id: 'tr_003', title: 'Anglais professionnel', provider: 'Poly Langues', category: 'Langues', duration: 30, startDate: addDays(15),  endDate: addDays(45),  capacity: 10, cost: 1200, certifying: true, description: 'Préparation TOEIC, anglais business.' },
    { id: 'tr_004', title: 'RGPD pour RH', provider: 'Mycènes Conseil', category: 'Juridique', duration: 7,  startDate: addDays(20),  endDate: addDays(20),  capacity: 15, cost: 350,  certifying: false, description: 'Conformité RGPD dans la gestion RH.' },
    { id: 'tr_005', title: 'Cybersécurité fondamentaux', provider: 'DBS', category: 'Informatique', duration: 14, startDate: addDays(60), endDate: addDays(62), capacity: 20, cost: 950,  certifying: true, description: 'Sécurité des SI et bonnes pratiques.' },
    { id: 'tr_006', title: 'Pédagogie active', provider: 'Edu Sync', category: 'Pédagogie', duration: 7, startDate: addDays(10), endDate: addDays(10), capacity: 12, cost: 480, certifying: false, description: 'Méthodes pédagogiques actives pour formateurs.' },
  ];
  const trainingEnrollments = [
    { id: 'te_001', employeeId: 'emp_011', trainingId: 'tr_001', status: 'inscrit', requestedAt: addDays(-3) },
    { id: 'te_002', employeeId: 'emp_013', trainingId: 'tr_003', status: 'valide',  requestedAt: addDays(-15), approvedBy: 'emp_002' },
    { id: 'te_003', employeeId: 'emp_015', trainingId: 'tr_002', status: 'en_attente', requestedAt: addDays(-1) },
    { id: 'te_004', employeeId: 'emp_024', trainingId: 'tr_004', status: 'inscrit', requestedAt: addDays(-2) },
    { id: 'te_005', employeeId: 'emp_022', trainingId: 'tr_006', status: 'valide', requestedAt: addDays(-20), approvedBy: 'emp_005' },
  ];

  // Recruitment
  const jobs = [
    { id: 'jb_001', title: 'Formateur Pâtisserie',  departmentId: 'dep_ped', companyId: 'co_017', location: 'Paris', contract: 'CDI', salary: '32-38k€', status: 'ouvert',  postedAt: addDays(-10), description: 'Recherche formateur expérimenté en pâtisserie pour Paris Beauty Academy.' },
    { id: 'jb_002', title: 'Conseiller commercial', departmentId: 'dep_com', companyId: 'co_001', location: 'Saint-Denis', contract: 'CDI', salary: '28-32k€', status: 'ouvert', postedAt: addDays(-5),  description: 'Développement commercial et acquisition clients B2C.' },
    { id: 'jb_003', title: 'Responsable QSE',       departmentId: 'dep_qua', companyId: 'co_001', location: 'Saint-Denis', contract: 'CDI', salary: '45-55k€', status: 'ouvert', postedAt: addDays(-20), description: 'Pilotage de la démarche qualité Qualiopi du groupe.' },
    { id: 'jb_004', title: 'Développeur Full-Stack', departmentId: 'dep_it', companyId: 'co_001', location: 'Saint-Denis', contract: 'CDI', salary: '40-50k€', status: 'ouvert', postedAt: addDays(-3),  description: 'Développement de l\'écosystème SaaS du groupe.' },
    { id: 'jb_005', title: 'Formateur Anglais',     departmentId: 'dep_ped', companyId: 'co_032', location: 'Massy', contract: 'CDD', salary: '24-28k€', status: 'pourvu',  postedAt: addDays(-45), description: 'Formateur anglais entreprises.' },
  ];
  const candidates = [
    { id: 'ca_001', firstName: 'Pierre',  lastName: 'DURAND',    email: 'p.durand@mail.com',   phone: '+33 6 11 22 33 44', jobId: 'jb_001', stage: 'entretien', source: 'Indeed',    rating: 4, addedAt: addDays(-8) },
    { id: 'ca_002', firstName: 'Aïcha',   lastName: 'BENALI',    email: 'a.benali@mail.com',   phone: '+33 6 22 33 44 55', jobId: 'jb_001', stage: 'preselection', source: 'LinkedIn', rating: 3, addedAt: addDays(-6) },
    { id: 'ca_003', firstName: 'Karim',   lastName: 'NACER',     email: 'k.nacer@mail.com',    phone: '+33 6 33 44 55 66', jobId: 'jb_002', stage: 'nouveau',    source: 'Site web',  rating: 0, addedAt: addDays(-2) },
    { id: 'ca_004', firstName: 'Élise',   lastName: 'FAURE',     email: 'e.faure@mail.com',    phone: '+33 6 44 55 66 77', jobId: 'jb_002', stage: 'entretien',  source: 'Cooptation', rating: 5, addedAt: addDays(-4) },
    { id: 'ca_005', firstName: 'Mohamed', lastName: 'EL AMRANI', email: 'm.elamrani@mail.com', phone: '+33 6 55 66 77 88', jobId: 'jb_003', stage: 'offre',     source: 'LinkedIn',  rating: 5, addedAt: addDays(-30) },
    { id: 'ca_006', firstName: 'Léa',     lastName: 'CHEVALIER', email: 'l.chevalier@mail.com',phone: '+33 6 66 77 88 99', jobId: 'jb_004', stage: 'preselection', source: 'Welcome to the Jungle', rating: 4, addedAt: addDays(-2) },
    { id: 'ca_007', firstName: 'Sébastien',lastName: 'GARNIER',  email: 's.garnier@mail.com',  phone: '+33 6 77 88 99 00', jobId: 'jb_004', stage: 'nouveau',    source: 'Site web',  rating: 0, addedAt: addDays(-1) },
    { id: 'ca_008', firstName: 'Inès',    lastName: 'PERRIN',    email: 'i.perrin@mail.com',   phone: '+33 6 88 99 00 11', jobId: 'jb_001', stage: 'refuse',     source: 'Indeed',    rating: 2, addedAt: addDays(-12) },
  ];

  // Reviews
  const reviews = [
    { id: 'rv_001', employeeId: 'emp_011', reviewerId: 'emp_002', type: 'annuel',     periodStart: '2024-01-01', periodEnd: '2024-12-31', status: 'planifie', scheduledAt: addDays(20), overallRating: 0, comments: '' },
    { id: 'rv_002', employeeId: 'emp_013', reviewerId: 'emp_003', type: 'annuel',     periodStart: '2024-01-01', periodEnd: '2024-12-31', status: 'realise',  scheduledAt: addDays(-30), overallRating: 4, comments: 'Très bonne progression pédagogique.' },
    { id: 'rv_003', employeeId: 'emp_014', reviewerId: 'emp_001', type: 'professionnel', periodStart: '2023-11-01', periodEnd: '2025-11-01', status: 'planifie', scheduledAt: addDays(15), overallRating: 0, comments: '' },
    { id: 'rv_004', employeeId: 'emp_015', reviewerId: 'emp_001', type: 'annuel',     periodStart: '2024-01-01', periodEnd: '2024-12-31', status: 'realise',  scheduledAt: addDays(-20), overallRating: 5, comments: 'Excellent travail sur la refonte de la com.' },
    { id: 'rv_005', employeeId: 'emp_022', reviewerId: 'emp_005', type: 'periode_essai', periodStart: '2024-04-15', periodEnd: '2024-10-15', status: 'realise', scheduledAt: addDays(-60), overallRating: 4, comments: 'Validation période d\'essai.' },
    { id: 'rv_006', employeeId: 'emp_023', reviewerId: 'emp_006', type: 'annuel', periodStart: '2025-01-01', periodEnd: '2025-12-31', status: 'planifie', scheduledAt: addDays(180), overallRating: 0, comments: '' },
  ];

  const goals = [
    { id: 'gl_001', employeeId: 'emp_011', title: 'Mettre en place le SIRH', target: 'Q3 2026', progress: 60, status: 'en_cours' },
    { id: 'gl_002', employeeId: 'emp_013', title: 'Certification TOEIC formateurs', target: 'Décembre 2026', progress: 30, status: 'en_cours' },
    { id: 'gl_003', employeeId: 'emp_014', title: 'Refonte du site web groupe', target: 'Septembre 2026', progress: 45, status: 'en_cours' },
    { id: 'gl_004', employeeId: 'emp_015', title: '50 publications LinkedIn / an', target: '2026', progress: 35, status: 'en_cours' },
    { id: 'gl_005', employeeId: 'emp_003', title: 'Audit Qualiopi - 0 non-conformité', target: 'Audit 2026', progress: 80, status: 'en_cours' },
  ];

  // Documents
  const documents = [
    { id: 'dc_001', employeeId: 'emp_011', name: 'Contrat de travail.pdf',  type: 'contrat',  category: 'Contractuel', uploadedAt: '2023-04-01', size: 245678 },
    { id: 'dc_002', employeeId: 'emp_011', name: 'Bulletin de paie 04-2026.pdf', type: 'paie', category: 'Paie', uploadedAt: addDays(-10), size: 89412 },
    { id: 'dc_003', employeeId: 'emp_011', name: 'Bulletin de paie 03-2026.pdf', type: 'paie', category: 'Paie', uploadedAt: addDays(-40), size: 88102 },
    { id: 'dc_004', employeeId: 'emp_013', name: 'Contrat de travail.pdf',  type: 'contrat',  category: 'Contractuel', uploadedAt: '2023-09-01', size: 256712 },
    { id: 'dc_005', employeeId: 'emp_013', name: 'Diplôme master.pdf',      type: 'diplome',  category: 'Justificatifs', uploadedAt: '2023-09-01', size: 1245890 },
    { id: 'dc_006', employeeId: 'emp_014', name: 'Avenant télétravail.pdf', type: 'avenant', category: 'Contractuel', uploadedAt: addDays(-60), size: 124589 },
    { id: 'dc_007', employeeId: 'emp_015', name: 'Bulletin de paie 04-2026.pdf', type: 'paie', category: 'Paie', uploadedAt: addDays(-10), size: 87125 },
  ];

  // Payslips
  const payslips = [];
  ['2026-04', '2026-03', '2026-02', '2026-01'].forEach((m) => {
    employees.forEach((e) => {
      payslips.push({
        id: U.uid('ps'),
        employeeId: e.id, month: m,
        gross: e.salary, net: Math.round(e.salary * 0.78),
        socialCharges: Math.round(e.salary * 0.22),
        employerCost: Math.round(e.salary * 1.42),
        status: 'edite',
      });
    });
  });

  // Onboarding
  const onboardings = [
    {
      id: 'ob_001', employeeId: 'emp_025', startDate: '2024-11-01',
      status: 'en_cours',
      tasks: [
        { id: 't1', name: 'Contrat signé',         done: true,  category: 'Administratif' },
        { id: 't2', name: 'Déclaration DPAE',      done: true,  category: 'Administratif' },
        { id: 't3', name: 'Visite médicale',       done: true,  category: 'Santé' },
        { id: 't4', name: 'Création compte mail',  done: true,  category: 'IT' },
        { id: 't5', name: 'Remise badge accès',    done: true,  category: 'IT' },
        { id: 't6', name: 'Livret d\'accueil',     done: true,  category: 'Administratif' },
        { id: 't7', name: 'Formation sécurité',    done: false, category: 'Formation' },
        { id: 't8', name: 'Entretien fin de période d\'essai', done: false, category: 'RH' },
      ],
    },
    {
      id: 'ob_002', employeeId: 'emp_024', startDate: '2024-09-01',
      status: 'termine',
      tasks: [
        { id: 't1', name: 'Contrat signé', done: true, category: 'Administratif' },
        { id: 't2', name: 'DPAE', done: true, category: 'Administratif' },
        { id: 't3', name: 'Visite médicale', done: true, category: 'Santé' },
        { id: 't4', name: 'Mail et matériel', done: true, category: 'IT' },
        { id: 't5', name: 'Livret d\'accueil', done: true, category: 'Administratif' },
        { id: 't6', name: 'Formation sécurité', done: true, category: 'Formation' },
        { id: 't7', name: 'Bilan période d\'essai', done: true, category: 'RH' },
      ],
    },
  ];

  // Notifications
  const notifications = [
    { id: 'nt_001', userId: 'emp_001', type: 'leave',    title: 'Nouvelle demande de congé', body: 'Sophie MARTIN demande 6 jours.', date: addDays(-2), read: false, link: '#/conges' },
    { id: 'nt_002', userId: 'emp_001', type: 'expense',  title: 'Note de frais à valider',   body: 'Mélina COHEN — 89€', date: addDays(-3), read: false, link: '#/frais' },
    { id: 'nt_003', userId: 'emp_002', type: 'review',   title: 'Entretien à préparer',      body: 'Sophie MARTIN — dans 20j', date: addDays(-1), read: false, link: '#/entretiens' },
    { id: 'nt_004', userId: 'emp_001', type: 'recruit',  title: 'Nouveau candidat',          body: 'Karim NACER - Conseiller commercial', date: addDays(-2), read: true, link: '#/recrutement' },
  ];

  // Holidays (jours fériés FR)
  const holidays = [
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

  window.SEED = {
    companies, departments, employees,
    leaveTypes, leaves, leaveBalances,
    timesheets, expenses,
    trainings, trainingEnrollments,
    jobs, candidates,
    reviews, goals,
    documents, payslips, onboardings,
    notifications, holidays,
    settings: {
      companyName: 'Paris Nord Groupe',
      slogan: 'L\'éducation au cœur de notre engagement',
      defaultCurrency: 'EUR',
      workDaysPerWeek: 5,
      hoursPerDay: 7.5,
      annualCP: 25,
      annualRTT: 10,
      fiscalYearStart: '01-01',
      logoUrl: '',
      timezone: 'Europe/Paris',
    },
  };
})();
