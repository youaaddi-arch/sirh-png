# SIRH Paris Nord Groupe — v2

> **SIRH multi-entités complet — référence Eurecia** — pour les 36 sociétés / 56 entités du groupe.

## État du projet

| Phase | Statut |
|---|---|
| 🗂 **v1 (SPA HTML+JS) → archivée** dans [`legacy-spa/`](./legacy-spa) | ✅ Démo encore en ligne sur GitHub Pages |
| 🏗 **v2 (monorepo full-stack)** | 🚧 Sprint 0 — Bootstrap en cours |

## Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — architecture détaillée v2 (schéma BDD, API, sprints, mapping Eurecia)

## Architecture v2

```
sirh-png/
├── apps/
│   ├── api/                  # NestJS + Prisma + PostgreSQL
│   └── web/                  # Next.js 15 (App Router) + Tailwind, design type Eurecia
├── packages/
│   ├── conventions-data/     # Référentiel des CCN françaises
│   └── shared-types/
├── infrastructure/
│   └── docker-compose.yml    # Postgres + Redis + MinIO + MailHog
├── legacy-spa/               # ANCIENNE version (HTML+JS), archivée
└── docs/
```

## Démarrage rapide (développement local)

```bash
# 1. Installer Docker + pnpm
# 2. Cloner et installer
git clone https://github.com/youaaddi-arch/sirh-png.git
cd sirh-png
git checkout claude/hr-management-software-ddW9f
pnpm install

# 3. Démarrer les services (Postgres + MinIO + Redis + MailHog)
pnpm db:up

# 4. Configurer les .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 5. Migrer la base et seeder
pnpm db:migrate
pnpm db:seed

# 6. Lancer en dev (les deux apps en parallèle)
pnpm dev
```

- **Front Next.js** : http://localhost:3000
- **API NestJS** : http://localhost:4000/api
- **Swagger API** : http://localhost:4000/docs
- **MinIO console** : http://localhost:9001 (sirh / sirh_dev_pwd)
- **MailHog** (emails de dev) : http://localhost:8025

## Compte admin par défaut

- Email : `admin@pn-groupe.fr`
- Password : `Admin2026!`

## Roadmap

Voir [docs/ARCHITECTURE.md § 7](./docs/ARCHITECTURE.md#7-roadmap-par-sprints) — 11 sprints sur ~13 semaines.

## Référence Eurecia

Le mapping fonctionnel Eurecia → notre architecture est documenté dans
[ARCHITECTURE.md § 1bis](./docs/ARCHITECTURE.md#1bis-cartographie-eurecia--sirh-paris-nord). Tous les modules
d'Eurecia sont couverts, avec en plus :

- 🤖 **IA Claude** pour génération automatique de contrats conformes au droit français
- 🇫🇷 **API Légifrance** pour conventions collectives à jour automatiquement
- 📷 **OCR** sur pièces d'identité et carte vitale → pré-saisie auto
- 🏢 **Multi-sociétés natif** (36 entités du groupe pré-chargées)

## v1 — Démo statique en ligne

L'ancienne version SPA reste accessible :

- **GitHub Pages** : https://youaaddi-arch.github.io/sirh-png/legacy-spa/
- Comptes démo : `emir.deniz@pn-groupe.fr` / `admin`
