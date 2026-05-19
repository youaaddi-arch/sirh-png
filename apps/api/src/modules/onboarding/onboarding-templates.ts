/**
 * Templates d'onboarding par type de poste.
 * Lors de la création d'un Onboarding, on choisit automatiquement le template
 * dont `appliesTo` matche le jobTitle (regex case-insensitive).
 */

export interface OnboardingTask {
  id: string;
  name: string;
  category: 'Administratif' | 'Santé' | 'IT' | 'Formation' | 'RH' | 'Équipe';
  daysAfterStart?: number;          // due date offset
  ownerRole?: 'rh' | 'manager' | 'it' | 'employe';
  required?: boolean;
}

export interface OnboardingTemplate {
  name: string;
  appliesTo: RegExp[];              // jobTitle matching
  tasks: OnboardingTask[];
}

const COMMON_TASKS: OnboardingTask[] = [
  { id: 'contract',        name: 'Contrat signé',                          category: 'Administratif', daysAfterStart: 0,   ownerRole: 'rh',      required: true },
  { id: 'dpae',            name: 'Déclaration préalable à l\'embauche (DPAE)', category: 'Administratif', daysAfterStart: 0, ownerRole: 'rh', required: true },
  { id: 'medical_appt',    name: 'Convocation visite médicale envoyée',    category: 'Santé',        daysAfterStart: 1,   ownerRole: 'rh',      required: true },
  { id: 'medical_visit',   name: 'Visite médicale d\'embauche réalisée',   category: 'Santé',        daysAfterStart: 30,  ownerRole: 'employe', required: true },
  { id: 'mutuelle',        name: 'Affiliation mutuelle / formulaire signé',category: 'Santé',        daysAfterStart: 7,   ownerRole: 'rh',      required: true },
  { id: 'credentials',     name: 'Création compte mail et accès SIRH',     category: 'IT',           daysAfterStart: 0,   ownerRole: 'it',      required: true },
  { id: 'equipment',       name: 'Remise du matériel (PC / téléphone)',    category: 'IT',           daysAfterStart: 1,   ownerRole: 'it',      required: true },
  { id: 'badge',           name: 'Badge d\'accès délivré',                 category: 'IT',           daysAfterStart: 1,   ownerRole: 'it',      required: true },
  { id: 'welcome_book',    name: 'Livret d\'accueil remis',                category: 'Administratif', daysAfterStart: 1,   ownerRole: 'rh',      required: true },
  { id: 'team_intro',      name: 'Présentation à l\'équipe',               category: 'Équipe',       daysAfterStart: 1,   ownerRole: 'manager', required: true },
  { id: 'safety_training', name: 'Formation sécurité au poste',            category: 'Formation',    daysAfterStart: 14,  ownerRole: 'manager', required: true },
  { id: 'trial_review',    name: 'Bilan de période d\'essai',              category: 'RH',           daysAfterStart: 60,  ownerRole: 'rh',      required: true },
];

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    name: 'Formateur',
    appliesTo: [/format/i, /formateur/i, /formatrice/i, /enseignant/i, /coach/i, /tuteur/i],
    tasks: [
      ...COMMON_TASKS,
      { id: 'pedagogical',  name: 'Remise du référentiel pédagogique',     category: 'Formation', daysAfterStart: 2,  ownerRole: 'manager', required: true },
      { id: 'tools_acc',    name: 'Accès aux outils LMS / Moodle',          category: 'IT',        daysAfterStart: 1,  ownerRole: 'it',      required: true },
      { id: 'observe_class',name: 'Observation de 2 cours d\'un collègue', category: 'Formation', daysAfterStart: 7,  ownerRole: 'manager' },
      { id: 'qualiopi',     name: 'Présentation des indicateurs Qualiopi', category: 'Formation', daysAfterStart: 14, ownerRole: 'rh',      required: true },
    ],
  },
  {
    name: 'Administratif / RH',
    appliesTo: [/administratif/i, /assistant/i, /secrétaire/i, /secretaire/i, /rh/i, /ressources humaines/i, /paie/i],
    tasks: [
      ...COMMON_TASKS,
      { id: 'cra_access',   name: 'Accès SIRH avec droits RH',              category: 'IT',           daysAfterStart: 1, ownerRole: 'it',    required: true },
      { id: 'process_doc',  name: 'Lecture des procédures internes',        category: 'Administratif', daysAfterStart: 5, ownerRole: 'employe' },
      { id: 'rgpd_training', name: 'Formation RGPD obligatoire',            category: 'Formation',    daysAfterStart: 14, ownerRole: 'rh',   required: true },
    ],
  },
  {
    name: 'Manager / Direction',
    appliesTo: [/directeur/i, /directrice/i, /manager/i, /chef/i, /responsable/i, /president/i, /président/i],
    tasks: [
      ...COMMON_TASKS,
      { id: 'team_meet',    name: 'Réunion 1-1 avec chaque membre de l\'équipe', category: 'Équipe', daysAfterStart: 5,  ownerRole: 'employe' },
      { id: 'budget_review',name: 'Présentation budget / objectifs',        category: 'RH',         daysAfterStart: 7,  ownerRole: 'manager' },
      { id: 'manager_training', name: 'Formation management',               category: 'Formation',   daysAfterStart: 30, ownerRole: 'rh' },
    ],
  },
  {
    name: 'Commercial / Conseiller',
    appliesTo: [/commercial/i, /conseiller/i, /vente/i, /relation client/i],
    tasks: [
      ...COMMON_TASKS,
      { id: 'crm_training', name: 'Formation CRM et outils commerciaux',    category: 'Formation',  daysAfterStart: 3,  ownerRole: 'manager', required: true },
      { id: 'offer_portfolio', name: 'Maîtrise du portefeuille offres',     category: 'Formation',  daysAfterStart: 10, ownerRole: 'manager' },
      { id: 'first_pitch',  name: 'Premier pitch en duo avec collègue',     category: 'Équipe',     daysAfterStart: 14, ownerRole: 'manager' },
    ],
  },
  {
    name: 'IT / Développeur',
    appliesTo: [/développ/i, /developp/i, /developer/i, /technicien/i, /informatique/i, /support/i, /devops/i, /sysadmin/i],
    tasks: [
      ...COMMON_TASKS,
      { id: 'git_access',   name: 'Accès Git / repos / docs techniques',    category: 'IT',         daysAfterStart: 1,  ownerRole: 'it',      required: true },
      { id: 'env_setup',    name: 'Setup environnement de dev',             category: 'IT',         daysAfterStart: 2,  ownerRole: 'employe' },
      { id: 'arch_review',  name: 'Revue de l\'architecture du SI',         category: 'Formation',  daysAfterStart: 5,  ownerRole: 'manager' },
      { id: 'first_ticket', name: 'Premier ticket / contribution',          category: 'Équipe',     daysAfterStart: 14, ownerRole: 'manager' },
    ],
  },
];

/**
 * Sélectionne le template adapté au jobTitle d'un salarié,
 * ou le template "Administratif / RH" par défaut.
 */
export function pickTemplate(jobTitle: string): OnboardingTemplate {
  for (const t of ONBOARDING_TEMPLATES) {
    if (t.appliesTo.some((rx) => rx.test(jobTitle))) return t;
  }
  return ONBOARDING_TEMPLATES.find((t) => t.name === 'Administratif / RH')!;
}
