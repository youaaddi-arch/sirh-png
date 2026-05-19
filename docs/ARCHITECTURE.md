# SIRH Paris Nord Groupe — Architecture v2 (full-stack)

> **Référence produit : Eurecia** — Couverture fonctionnelle, ergonomie, design.

---

## 0. Décisions validées (réponses utilisateur)

| Sujet | Choix |
|---|---|
| Stratégie | Remplacement total du SPA actuel par une vraie stack full-stack |
| Logiciel de paie | Pas encore choisi → export CSV/Excel générique au démarrage |
| E-signature | Mock pour MVP, migration Yousign plus tard |
| Méthode | Architecture validée d'abord, puis sprints |
| Référence produit | **Eurecia** (fonctionnalités + design) |

---

## 1bis. Cartographie Eurecia → SIRH Paris Nord

Tous les modules d'Eurecia sont couverts. Mapping fonctionnel :

| Module Eurecia | Notre module | Sprint |
|---|---|---|
| **Dossier du personnel** | `employee/` — fiches complètes (Identité, Famille, Banque & Fiscal, Carrière, Contrats, Salaire, Documents) | S1 |
| **Congés & absences** | `leave/` — workflow demande, validation par responsable, soldes, calendrier, congés conventionnels auto | S5 |
| **Temps & activités** | `timesheet/` + `overtime/` — pointage, saisie hebdo, heures sup avec validation direction | S5 |
| **Notes de frais** | `expense/` — soumission, justificatifs, workflow approbation, remboursement | S5 |
| **Talents & performance** | `review/` + `goal/` — entretiens annuels/pro/360°, objectifs SMART, signature dématérialisée | S7 |
| **Formation** | `training/` + `knowledge-test/` — catalogue, inscriptions, plan dev, tests d'actualisation (sécurité, RGPD, Qualiopi) | S7 |
| **Recrutement** | `recruitment/` — offres, pipeline Kanban, candidats, embauche depuis candidat | S7 |
| **Onboarding** | `onboarding/` — parcours par poste, checklist, automatisation post-signature contrat | S4 |
| **Documents & coffre-fort** | `document/` + `letter/` — coffre numérique chiffré, courriers RH auto, archivage légal (CNIL) | S1 / S3 / S4 |
| **Communication & portail** | `notification/` + Espace salarié + Espace manager | S5 / S6 |
| **Rapports & analyses** | Tableaux de bord par rôle, exports CSV/Excel, KPIs RH | S5 / transverse |
| **Paramétrage** | `tenant/` — organismes obligatoires, convention collective synchronisée Légifrance | S1 |
| **Workflows & automatisation** | Triggers post-signature, alertes période d'essai, génération paie auto | S4 / S7 |
| **Multi-entités** | Multi-tenant natif — 36 sociétés / 56 entités du groupe | S0 |
| **Signature électronique** | Mock interne v1 → Yousign API v2 | S3 / Phase 2 |

**Différenciants ajoutés vs Eurecia** :
- 🤖 **IA Claude** pour génération automatique de contrats conformes au droit
- 🇫🇷 **Sync API Légifrance** pour CC à jour automatiquement
- 📷 **OCR Mindee** sur pièces d'identité + carte vitale → pré-saisie automatique
- 🏢 **Multi-sociétés natif** : votre groupe a 36 entités, le SIRH est conçu pour ça (pas un add-on)

## 1. Vue d'ensemble

Application **web SaaS multi-tenant** dédiée au groupe Paris Nord et ses
sociétés (36 sociétés / 56 entités). Une instance, une base PostgreSQL,
isolation par tenant (= société juridique).

- **Front** : Next.js 15 (App Router) + Tailwind + shadcn/ui — design **type Eurecia**
- **Back** : NestJS (TypeScript) avec architecture modulaire DDD
- **BD** : PostgreSQL 16 + Prisma ORM
- **Auth** : NextAuth.js + 2FA TOTP obligatoire pour rôles RH/Admin
- **Stockage fichiers** : MinIO (S3-compatible) chiffré at-rest, hébergement FR
- **Emails** : Brevo (français RGPD) ou Resend
- **IA** : Anthropic Claude Sonnet 4.6 (génération contrats, conformité)
- **OCR** : Mindee (FR, eIDAS) pour pré-saisie auto
- **Signature** : Mock interne au MVP, puis Yousign API
- **Hébergement** : OVH ou Scaleway (européen)
- **CI/CD** : GitHub Actions → Docker → Kubernetes (k3s léger) ou Docker Compose

### Principes design (alignés Eurecia)

- Sidebar verticale bleu marine (`#1e2f7e` / `#161e4a`) avec icônes ligne
- Topbar blanche avec recherche globale + cloche notifications + avatar utilisateur
- Dashboard à **widgets** (KPIs, listes courtes, raccourcis, planning de la semaine)
- Cards blanches `rounded-xl` ombre légère
- Couleur primaire bleu vif (`#2447df`) pour CTA
- Badges colorés : vert (validé), orange (en attente), rouge (refusé), gris (annulé)
- Tableaux avec lignes hover, headers majuscules tracking, pagination
- Modaux centrés `max-w-2xl` avec footer actions
- Toasts éphémères en haut à droite
- Mobile : sidebar repliable hamburger, layout en colonne

---

## 2. Multi-tenancy

**Stratégie : tenant_id partagé (single database, shared schema)** — choix
plus simple à maintenir que schema-per-tenant, suffisant pour le périmètre
groupe (~ centaines d'utilisateurs).

- Chaque table métier contient une colonne `tenant_id` (= `company_id` de la société juridique)
- Tous les `SELECT` passent par un middleware Prisma qui injecte le filtre `tenant_id`
- Les rôles **admin groupe** voient tous les tenants ; les rôles **RH/manager/employé** voient leur tenant
- Une table `Organisation` (= Paris Nord Groupe) regroupe N `Tenant`s (= sociétés)

---

## 3. Schéma de base de données

> Tables principales (~30). Notation : `*` = obligatoire, `?` = optionnel, `FK` = clé étrangère.

### 3.1 Organisation & Tenant (= société)

```
Organisation
  id*, name*, slug*, logo_url?, created_at

Tenant (= Société juridique)
  id*, organisation_id* (FK), code* (ex: 003-DBS), name*, type (SIEGE/ETS)
  siren*, siret*, ape_code?, urssaf_code?, urssaf_name?
  address*, rep_name?, rep_role?
  convention_code* (FK Convention.code), convention_extra_json?
  medical_provider {name, address, phone, email, doctor}
  health_insurance {name, contract_number, phone, share_employer}
  provident_insurance {name, contract_number, phone}
  pension_fund {name, code, phone}
  work_injury_fund {name, rate}
  apprenticeship_tax {collector, rate}
  cse_representative?, safety_officer?
  fiscal_year_start*, default_currency*, timezone*, hours_per_day*
  active*, created_at, updated_at
```

### 3.2 Convention collective

```
Convention (référentiel global, non lié à un tenant)
  code* (IDCC_XXXX), name*, brochure
  cp_annuel*, paid_sick_from
  trial_period_json {CDI:{Employé,Cadre,...}, CDD:{...}}
  trial_renewal_json
  notice_json
  extra_leaves_seniority_json {5:1, 10:2, 15:3}
  conventional_leaves_json {mariage:5, naissance:3, deces_conjoint:5,...}
  minimum_wage_coef_json {200: 1801, 210: 1820, ...}
  legifrance_url?, last_sync_at?
```

### 3.3 Utilisateurs & permissions

```
User
  id*, tenant_id* (FK), email* UNIQUE, password_hash*
  role* (admin/rh/manager/paie/employe)
  two_factor_enabled, two_factor_secret?
  last_login_at?, failed_login_count, locked_until?
  created_at, updated_at

Department
  id*, tenant_id* (FK), name*, parent_id? (self FK), manager_id? (FK Employee)
```

### 3.4 Salariés

```
Employee
  id*, user_id? (FK), tenant_id* (FK)
  matricule* UNIQUE per tenant
  civility, first_name*, last_name*, maiden_name?, nationality
  birth_date?, birth_place?, birth_country?
  social_security?, social_security_key?
  email*, phone?, address?, postal_code?, city?, country
  family_situation, num_children, emergency_name, emergency_phone
  rqth, photo_url?
  job_title*, department_id (FK)
  manager_id (FK Employee) — VALIDEUR des congés
  classification (Cadre/AM/Employé), coefficient
  iban?, bic?, bank_name?, tax_rate?
  contract_type*, contract_start*, contract_end?
  weekly_hours*, salary_gross*
  status (actif/inactif/suspendu)
  created_at, updated_at

EmployeeSalaryHistory
  id*, employee_id*, effective_date*, gross_salary*, reason
```

### 3.5 Contrats & courriers

```
Contract
  id*, employee_id*, type*, position*, status_classification*
  start_date*, end_date?, signed_at?, signature_url?
  weekly_hours, gross_salary, trial_period_days, trial_renewal_days
  classification, coefficient
  content_md, content_pdf_url?
  status (genere/envoye/signe/actif/termine/rompu)
  hire_process_id? (FK)
  generated_by_ai, ai_model, ai_prompt_version?

Letter (courriers RH)
  id*, employee_id?, hire_process_id?
  type* (attestation_employeur, certificat_travail, avertissement,
         felicitations, rupture_conventionnelle, augmentation,
         convocation_visite_medicale, affiliation_mutuelle,...)
  subject*, content_md*, content_pdf_url?
  date*, created_by* (FK User), status (redige/envoye/signe)
  recipient_email?, sent_at?, signed_at?
```

### 3.6 Workflow embauche (pré-onboarding)

```
HireProcess
  id*, tenant_id*, token* UNIQUE, expires_at*
  first_name, last_name, email*
  job_title, status_classification, contract_type, start_date, gross_salary
  company_id (FK Tenant), manager_id (FK Employee), assigned_to (FK User)
  status* (pre_embauche/soumis/valide/contrat_genere/contrat_signe/embauche)
  draft_data_json (toutes infos saisies par le candidat)
  ocr_extracted_json (résultats OCR Mindee)
  employee_id? (FK, créé à finalisation)
  contract_id?
  history_json [{at, by, action}]
  created_by*, created_at*, submitted_at?, validated_at?, finalized_at?

HireProcessDocument
  id*, hire_process_id*, key (cv/id_card/vital_card/rib/diploma/...)
  filename, size, mime_type, storage_url*
  uploaded_at, validated_at?, validated_by?
```

### 3.7 Congés & absences

```
LeaveType (par tenant — overridable depuis la convention)
  id*, tenant_id*, code, name, color, annual_days, paid, requires_proof

Leave
  id*, employee_id*, type_id*
  start_date*, end_date*, days*, half_day_start?, half_day_end?
  reason, status* (en_attente/approuve/refuse/annule)
  approved_by? (FK), approved_at?, reject_reason?
  proof_url?, created_at*, updated_at

LeaveBalance
  id*, employee_id*, type_id*, year*
  acquired*, taken*, pending*, scheduled*
```

### 3.8 Temps & heures supplémentaires

```
Timesheet
  id*, employee_id*, date*
  start_time, end_time, break_minutes
  hours_worked, hours_overtime
  project?, notes?
  status (en_attente/valide/refuse), validated_by?

OvertimeRequest
  id*, employee_id*, date*, hours*, reason*
  status (en_attente/approuve/refuse)
  requested_at, approved_by?, approved_at?
```

### 3.9 Notes de frais

```
ExpenseReport
  id*, employee_id*, period_month*, status (brouillon/soumis/approuve/refuse/rembourse)
  submitted_at?, approved_by?, approved_at?, paid_at?, total_amount

ExpenseLine
  id*, report_id*, date*, category*, amount*, currency, vat_amount?
  description, project?, receipt_url?
```

### 3.10 Paie

```
PayrollVariable (mensuel, calculé)
  id*, employee_id*, month*, gross_salary
  worked_days, worked_hours, overtime_hours
  cp_days, rtt_days, sick_days, other_absence_days
  meal_vouchers_count, bonuses_amount, deductions_amount, expenses_amount
  status (brouillon/transmis_paie)

Payslip
  id*, employee_id*, month*
  gross, social_charges, net, employer_cost
  pdf_url?, status (edite/envoye)
```

### 3.11 Performance & talents

```
Review (entretien)
  id*, employee_id*, reviewer_id*
  type (annuel/professionnel/periode_essai/360)
  period_start, period_end, scheduled_at, completed_at?
  overall_rating, strengths, areas, comments
  signed_employee_at?, signed_reviewer_at?
  status (planifie/realise/annule)

Goal (objectif SMART)
  id*, employee_id*, title*, description?, target_date
  progress, status (en_cours/atteint/abandonne)

Training
  id*, tenant_id?, title*, provider, category, duration_hours
  start_date, end_date, capacity, cost, certifying, description, opco_funded

TrainingEnrollment
  id*, employee_id*, training_id*
  status (en_attente/inscrit/valide/annule/realise)
  requested_at, approved_by?, completed_at?, certificate_url?

KnowledgeTest (test de réactualisation)
  id*, tenant_id?, title*, category (securite/rgpd/qualiopi/...)
  questions_json [{question, options, correct_index, explanation}]
  passing_score, validity_months, mandatory_for_jobs_json

KnowledgeTestAttempt
  id*, employee_id*, test_id*
  started_at, completed_at?, score, passed, answers_json
```

### 3.12 Recrutement

```
Job
  id*, tenant_id*, title*, department_id?, location?, contract*, salary_range?
  description_md, status (ouvert/pourvu/ferme)
  posted_at, posted_by

Candidate
  id*, job_id*, first_name*, last_name*, email*, phone?
  source, stage (nouveau/preselection/entretien/offre/embauche/refuse)
  rating, cv_url?, notes_md
  hired_employee_id? (FK)
```

### 3.13 Onboarding

```
OnboardingTemplate (par poste/département)
  id*, tenant_id*, name*, applies_to_job_titles_json[], tasks_json[]

Onboarding
  id*, employee_id*, template_id?, start_date*
  tasks_json [{id, name, category, done, due_date, owner_id}]
  status (en_cours/termine)
```

### 3.14 Documents (coffre-fort)

```
Document
  id*, employee_id?, tenant_id*
  name*, type (contrat/avenant/paie/diplome/justificatif/courrier/...)
  category, storage_url*, mime_type, size
  uploaded_by, uploaded_at, retention_years (paie:50, contrat:5,...)
  encrypted, encryption_key_id?
```

### 3.15 Système

```
Notification
  id*, user_id*, type, title, body, link, read, date

AuditLog (RGPD + sécurité)
  id*, tenant_id*, user_id?, action*, entity_type, entity_id?
  diff_json?, ip?, user_agent?, at*
```

---

## 4. Endpoints API (REST + tRPC pour appels typed depuis le front)

> Tous protégés par JWT + tenant scoping, sauf `/preboarding/:token`.

### 4.1 Auth

```
POST   /auth/login              { email, password } → { token, user, requires2fa }
POST   /auth/2fa/verify         { token_id, code } → { jwt, user }
POST   /auth/2fa/setup          → { qr_url, secret }
POST   /auth/logout
POST   /auth/password-reset
POST   /auth/password-reset/confirm
```

### 4.2 Tenant / Société

```
GET    /tenants                      # liste sociétés visibles
POST   /tenants
GET    /tenants/:id
PATCH  /tenants/:id
GET    /tenants/:id/convention      # convention + règles applicables
POST   /tenants/:id/sync-legifrance # → API Légifrance pour récupérer CC à jour
```

### 4.3 Employés

```
GET    /employees                   # filtrable par status/dept/co
POST   /employees                   # création manuelle
GET    /employees/:id
PATCH  /employees/:id
DELETE /employees/:id
GET    /employees/:id/salary-history
GET    /employees/:id/contracts
GET    /employees/:id/documents
GET    /employees/:id/payslips
GET    /employees/:id/leaves
GET    /employees/:id/team          # subordonnés
```

### 4.4 Pré-embauche (workflow embauche)

```
POST   /hire-processes              # RH démarre
GET    /hire-processes              # liste pour RH
GET    /hire-processes/:id
PATCH  /hire-processes/:id          # avancer statut
POST   /hire-processes/:id/finalize # crée Employee+Contract+Onboarding

# Public (token-based, pas d'auth)
GET    /preboarding/:token
PATCH  /preboarding/:token          # candidat met à jour le draft
POST   /preboarding/:token/documents # upload pièces
POST   /preboarding/:token/submit
POST   /preboarding/:token/ocr-extract # OCR sur une pièce avec Mindee
```

### 4.5 Contrats

```
POST   /contracts/generate-ai       { hire_process_id } → contrat généré par IA
GET    /contracts/:id
POST   /contracts/:id/send-signature # mock : marque "envoyé" + email simulé
POST   /contracts/:id/sign          { signer (employee/employer) }
GET    /contracts/:id/pdf
```

### 4.6 Congés

```
GET    /leaves
POST   /leaves                      # demande
PATCH  /leaves/:id/approve          # manager ou RH
PATCH  /leaves/:id/reject           { reason }
GET    /leave-balances              # mes soldes
GET    /leave-types
```

### 4.7 Temps & heures supp

```
GET    /timesheets?from&to
POST   /timesheets                  # saisie ou clock-in/out
PATCH  /timesheets/:id/validate

POST   /overtime-requests
PATCH  /overtime-requests/:id/approve
```

### 4.8 Notes de frais

```
GET    /expense-reports
POST   /expense-reports
PATCH  /expense-reports/:id/submit
PATCH  /expense-reports/:id/approve
PATCH  /expense-reports/:id/reimburse
POST   /expense-reports/:id/lines
POST   /expense-reports/:id/lines/:lineId/receipt # upload justificatif
```

### 4.9 Paie

```
GET    /payroll/variables?month=YYYY-MM
GET    /payroll/variables/export?month=YYYY-MM&format=csv|silae|payfit
POST   /payroll/generate?month=YYYY-MM # génère payslips simulés
GET    /payslips
GET    /payslips/:id/pdf
```

### 4.10 Performance & talents

```
GET    /reviews
POST   /reviews                     # planifier entretien
PATCH  /reviews/:id/complete
POST   /reviews/:id/sign            { role }

GET    /goals
POST   /goals
PATCH  /goals/:id

GET    /trainings
POST   /trainings
POST   /training-enrollments
PATCH  /training-enrollments/:id/approve

GET    /knowledge-tests
POST   /knowledge-tests/:id/attempt
PATCH  /knowledge-test-attempts/:id/submit
```

### 4.11 Recrutement

```
GET    /jobs ; POST ; PATCH ; DELETE
GET    /candidates ; POST ; PATCH
PATCH  /candidates/:id/stage         { stage }
POST   /candidates/:id/hire          → démarre HireProcess
```

### 4.12 Documents

```
GET    /documents ; POST (upload) ; DELETE
GET    /documents/:id/download
```

### 4.13 Planning & notifications

```
GET    /planning?from&to&dep&mgr     # statuts journaliers calculés
POST   /presences                    # statut manuel

GET    /notifications ; PATCH /notifications/:id/read
```

---

## 5. Arborescence projet

```
sirh-png/
├── apps/
│   ├── web/                        # Next.js 15
│   │   ├── app/
│   │   │   ├── (auth)/login, 2fa, reset-password/
│   │   │   ├── (app)/              # routes protégées
│   │   │   │   ├── dashboard/
│   │   │   │   ├── employees/[id]/
│   │   │   │   ├── leaves/, timesheets/, expenses/
│   │   │   │   ├── payroll/, payroll-vars/
│   │   │   │   ├── reviews/, trainings/, tests/
│   │   │   │   ├── recruitment/, hiring/
│   │   │   │   ├── documents/, letters/, planning/
│   │   │   │   ├── companies/, settings/
│   │   │   │   └── my-space/
│   │   │   ├── preboarding/[token]/  # PUBLIC
│   │   │   └── api/                 # NextAuth callbacks
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn (button, card, dialog, etc.)
│   │   │   ├── layout/Sidebar.tsx, Topbar.tsx
│   │   │   ├── widgets/             # widgets dashboard type Eurecia
│   │   │   └── forms/
│   │   ├── lib/
│   │   │   ├── api.ts              # tRPC client
│   │   │   ├── auth.ts             # session
│   │   │   └── permissions.ts
│   │   └── styles/globals.css
│   │
│   └── api/                         # NestJS
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── tenant/
│       │   │   ├── employee/
│       │   │   ├── hiring/
│       │   │   ├── contract/
│       │   │   ├── leave/
│       │   │   ├── timesheet/
│       │   │   ├── expense/
│       │   │   ├── payroll/
│       │   │   ├── review/
│       │   │   ├── training/
│       │   │   ├── recruitment/
│       │   │   ├── document/
│       │   │   ├── letter/
│       │   │   ├── onboarding/
│       │   │   ├── notification/
│       │   │   └── audit/
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── guards/           # AuthGuard, TenantGuard, RoleGuard
│       │   │   ├── interceptors/     # Audit interceptor
│       │   │   └── middlewares/      # tenant scoping
│       │   ├── integrations/
│       │   │   ├── claude/           # IA
│       │   │   ├── mindee/           # OCR
│       │   │   ├── yousign/          # signature (Phase 2)
│       │   │   ├── brevo/            # emails
│       │   │   ├── legifrance/       # CCN sync
│       │   │   └── storage/          # MinIO S3
│       │   ├── config/, main.ts
│       │   └── prisma/schema.prisma
│       └── test/
│
├── packages/
│   ├── shared-types/                # TS interfaces partagés front/back
│   ├── conventions-data/            # JSON CCN référentiel
│   └── ui-kit/                      # composants visuels partagés
│
├── infrastructure/
│   ├── docker-compose.yml           # dev local (postgres + minio + redis)
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── k8s/                         # manifests Kubernetes (optionnel)
│
├── docs/
│   ├── ARCHITECTURE.md (ce fichier)
│   ├── DATABASE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   └── RGPD.md
│
├── .github/workflows/
│   ├── ci-web.yml, ci-api.yml
│   └── deploy.yml
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 6. Sécurité & conformité RGPD

- **Auth** : JWT 15 min + refresh token 7j (rotatif), 2FA TOTP obligatoire pour
  RH/Admin/Paie, password Argon2id, rate-limit IP, lockout 5 tentatives
- **Données sensibles chiffrées at-rest** : IBAN, n° SS, salaires
  (envelope encryption avec AWS KMS / Vault local)
- **Stockage fichiers** : MinIO chiffré, URLs présignées 5 min
- **Audit trail** complet (qui a vu/modifié quoi)
- **RGPD** :
  - Registre des traitements (RGPD art. 30) en page Paramètres
  - Consentement explicite à l'embauche
  - Droit à l'oubli (anonymisation après délais légaux)
  - Droit à la portabilité (export complet en ZIP)
  - Conservation **automatique** selon CNIL :
    - Bulletins de paie : 50 ans (jusqu'à liquidation retraite)
    - Contrats : 5 ans après fin
    - Notes de frais : 10 ans
    - Candidatures non retenues : 2 ans
- **Hébergement français/européen** : OVH Strasbourg ou Scaleway Paris
- **TLS 1.3** partout, **HSTS**, **CSP** strict
- **Backups** : pg_basebackup quotidien + WAL streaming, restore-test mensuel

---

## 7. Roadmap par sprints

| Sprint | Module | Livrable |
|---|---|---|
| **S0** (1 sem) | Bootstrap | Monorepo, Docker Compose (PG+MinIO+Redis), CI, schéma Prisma, NestJS+Next.js skeleton, layout Eurecia-like (sidebar+topbar), auth basique |
| **S1** (1 sem) | Module 1 — Paramétrage entité | CRUD Tenant complet, organismes obligatoires, conventions collectives (référentiel 50+ CCN), sync Légifrance |
| **S2** (2 sem) | Module 2 — Pré-onboarding | Page publique avec token, upload S3, OCR Mindee sur ID + carte vitale, pré-saisie auto, mode RH manuel |
| **S3** (2 sem) | Module 3 — Contrat | Génération IA Claude depuis CC + saisie, alerte minima conventionnels, mock signature, archivage |
| **S4** (1 sem) | Module 4 — Onboarding auto | Création identifiants, courriers (visite méd, mutuelle), DPAE simulée, parcours par poste |
| **S5** (2 sem) | Module 5 — Espace salarié | Mon espace, congés, planning, heures supp, notes de frais (upload justif) |
| **S6** (1 sem) | Module 6 — Validations manager/RH | Workflows d'approbation, planning équipe, notifications |
| **S7** (1 sem) | Module 7 — Cycle de vie | Alertes période d'essai, renouvellement auto, entretiens, tests réactualisation |
| **S8** (1 sem) | Module 7 (suite) | Variables paie + export multi-format, intégration paie (Silae/PayFit quand choix fait) |
| **S9** (1 sem) | Polish & RGPD | Registre traitements, droit à l'oubli, exports complets, audit, doc utilisateur |
| **S10** (1 sem) | Recette & déploiement OVH | Tests E2E Playwright, montée en prod, formation RH |

**Total : ~13 semaines / 3 mois** pour la v1 production-ready.

---

## 8. Stack et coûts mensuels estimés

| Composant | Outil | Coût mensuel estimé |
|---|---|---|
| Hébergement web + API | OVH Public Cloud (D2-4) | 25 € |
| Base PostgreSQL managée | OVH Cloud DB (1 vCPU, 4Go) | 35 € |
| Stockage S3 | OVH Object Storage 100Go | 6 € |
| Emails transactionnels | Brevo (10k/mois) | 25 € |
| IA Claude API | ~50 contrats/mois × 0.05€ | 5 € |
| OCR Mindee | 100 pages/mois | 50 € |
| Domaine + SSL | (Let's Encrypt gratuit) | 2 € |
| Yousign (Phase 2 uniquement) | Pack 100 sign/mois | 60 € |
| Monitoring (Sentry + UptimeRobot) | Free tier | 0 € |
| **Total Phase 1 (sans Yousign)** | | **~150 €/mois** |
| **Total Phase 2 (avec Yousign)** | | **~210 €/mois** |

---

## 9. Points d'attention non encore tranchés

1. **Hébergeur final** : OVH ou Scaleway ?
2. **Logiciel de paie** : quand le choix sera fait, il faudra développer l'intégration spécifique
3. **OCR** : Mindee (payant, fiable) ou Tesseract local (gratuit, moins fiable) ?
4. **Stratégie de migration** : qu'est-ce qu'on récupère du SPA actuel ? (données seed, design system)
5. **Phase de tests** : on prévoit une phase de recette avec quelques utilisateurs pilotes ?

---

## Validation

Pour démarrer le sprint S0, j'ai besoin de votre validation sur :
- [ ] Le périmètre fonctionnel
- [ ] Le schéma BDD (peut être ajusté en cours de route)
- [ ] L'arborescence projet
- [ ] La roadmap par sprints
- [ ] Le choix d'hébergeur (OVH ou Scaleway)
- [ ] L'utilisation de Mindee pour l'OCR (coût ~50 €/mois)

Une fois validé, je démarre **S0 — Bootstrap** : création du monorepo,
docker-compose, schéma Prisma de base, layout Eurecia-like, authentification.
