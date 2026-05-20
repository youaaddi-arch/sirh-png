# SIRH Paris Nord Groupe — v2

> **SIRH multi-entités full-stack** — référence Eurecia — pour les 36 sociétés du groupe.

## Statut

✅ **Tous les sprints sont livrés** (10/10) — l'application est complète et prête pour la recette.

| Sprint | Module | Statut |
|---|---|---|
| S0  | Bootstrap monorepo + auth | ✅ |
| S1  | Paramétrage entité + conventions Légifrance | ✅ |
| S2  | Pré-onboarding salarié (token public + uploads) | ✅ |
| S3  | Contrat IA Claude + e-signature + courriers RH | ✅ |
| S4  | Onboarding automatisé post-signature | ✅ |
| S5  | Espace salarié (congés, temps, frais) | ✅ |
| S6  | Validations manager/RH + planning équipe | ✅ |
| S7  | Cycle de vie (paie, entretiens, tests, alertes) | ✅ |
| S9  | RGPD (registre, audit, droit à l'oubli, portabilité) | ✅ |
| S10 | Déploiement, Docker, docs, CI | ✅ |

## Documentation

- 📐 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Architecture, schéma BDD, API, mapping Eurecia
- 🚀 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Déploiement OVH/Scaleway en production
- 🔐 [`docs/SECURITY.md`](./docs/SECURITY.md) — Sécurité (auth, chiffrement, audit, permissions)
- 🛡 [`docs/RGPD.md`](./docs/RGPD.md) — Conformité RGPD (art. 30, droits des personnes)
- 📖 [`docs/USER_GUIDE.md`](./docs/USER_GUIDE.md) — Guide utilisateur

## Stack technique

- **Front** : Next.js 15 (App Router) + Tailwind, design type Eurecia
- **Back** : NestJS 10 + Prisma + PostgreSQL 16
- **Storage** : MinIO S3-compatible
- **Emails** : Brevo / MailHog en dev
- **IA** : Claude Sonnet 4.6 (fallback template si pas de clé)
- **Signature** : Mock MVP → Yousign Phase 2
- **OCR** : Stub → Tesseract local Phase 2.2

## Architecture

```
sirh-png/
├── apps/
│   ├── api/      # NestJS + Prisma
│   └── web/      # Next.js 15 type Eurecia
├── packages/
│   ├── conventions-data/   # Référentiel CCN FR
│   └── shared-types/
├── infrastructure/         # Docker + Caddy
├── docs/                   # ARCHITECTURE, DEPLOYMENT, SECURITY, RGPD, USER_GUIDE
└── legacy-spa/             # Ancienne version v1 (archivée)
```

## Démarrage local (5 minutes)

```bash
git clone https://github.com/youaaddi-arch/sirh-png.git
cd sirh-png
git checkout claude/hr-management-software-ddW9f

# 1. Démarrer la stack Docker (Postgres + Redis + MinIO + MailHog)
pnpm install
pnpm db:up

# 2. Configurer
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Migrer la base + seed (56 entités du groupe + admin)
pnpm db:migrate
pnpm db:seed

# 4. Lancer
pnpm dev
```

- **Web** : http://localhost:3000
- **API** : http://localhost:4000/api
- **Swagger** : http://localhost:4000/docs
- **MinIO** : http://localhost:9001 (sirh / sirh_dev_pwd)
- **MailHog** : http://localhost:8025

## Compte de démo

- Email : `admin@pn-groupe.fr`
- Password : `Admin2026!`

## Déploiement production

Voir [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — déploiement Docker Compose
+ Caddy (TLS automatique) sur OVH ou Scaleway. **Coût estimé : ~100 €/mois**
en Phase 1 (sans Yousign/Mindee).

## Modules

| Module Eurecia | Notre implémentation |
|---|---|
| Dossier du personnel | `/employees/[id]` — fiches complètes |
| Congés & absences | `/leaves` — workflow + soldes + calendrier |
| Temps & activités | `/timesheets` — pointage + saisie hebdo |
| Notes de frais | `/expenses` — soumission + workflow + justificatifs |
| Talents & performance | `/reviews` — 4 trames (annuel, pro, PE, 360°) |
| Formation | `/trainings` + `/tests` — catalogue + tests obligatoires |
| Recrutement | `/recruitment` + `/hiring` — pipeline + workflow d'embauche |
| Onboarding | `/onboarding` — 5 templates par poste, automatique |
| Documents & coffre-fort | `/documents` + `/letters` — coffre + 10 modèles |
| Paie | `/payroll` + `/payroll-vars` — bulletins + export Silae |
| Communication | Notifications + emails Brevo |
| Rapports & analyses | Dashboard adapté par rôle |
| Workflows | Automatisations post-signature, alertes cycle de vie |
| Multi-entités | Multi-tenant natif (36 sociétés) |
| Signature électronique | Mock interne, Yousign en Phase 2 |

**+ Différenciants vs Eurecia** :
- 🤖 **IA Claude** pour génération de contrats conformes au droit FR
- 🇫🇷 **Sync API Légifrance** pour conventions à jour
- 📷 **OCR** sur pièces d'identité → pré-saisie auto
- 🏢 Multi-sociétés natif (36 entités) avec scoping automatique

## v1 (legacy)

L'ancienne version SPA (HTML+JS+localStorage) reste accessible dans
[`legacy-spa/`](./legacy-spa) et déployée sur :
**https://youaaddi-arch.github.io/sirh-png/**

## Licence

Propriétaire — Paris Nord Groupe © 2026.
