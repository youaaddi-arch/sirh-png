# SIRH Paris Nord Groupe

> **SIRH multi-entités complet, type Eurecia** — pour le groupe Paris Nord.

Plateforme RH web couvrant tous les processus essentiels : congés, temps, notes
de frais, entretiens, formation, recrutement, paie, documents, organigramme,
rapports, onboarding et référentiel multi-sociétés.

## Lancement

C'est une **application web autonome** : aucune installation requise.

```bash
# Option 1 : ouvrir directement
xdg-open index.html        # Linux
open index.html            # macOS
start index.html           # Windows

# Option 2 : serveur statique local
python3 -m http.server 8080
# puis http://localhost:8080
```

## Comptes de démonstration

| Rôle             | Email                          | Mot de passe |
|------------------|--------------------------------|--------------|
| Administrateur   | emir.deniz@pn-groupe.fr        | `admin`      |
| RH               | keziban.deniz@pn-groupe.fr     | `rh`         |
| Manager          | delphine.pavis@pn-groupe.fr    | `manager`    |
| Paie             | thomas.bernard@pn-groupe.fr    | `paie`       |
| Collaborateur    | sophie.martin@pn-groupe.fr     | `employe`    |

## Modules

- **Tableau de bord** — KPIs, validations en attente, anniversaires, planning.
- **Collaborateurs** — Fiches complètes (profil, carrière, congés, paie, documents, équipe).
- **Organigramme** — Vue hiérarchique et effectifs par département.
- **Onboarding** — Workflows d'intégration avec checklist.
- **Congés & absences** — Demandes, soldes par type, calendrier, validation.
- **Temps de travail** — Pointage, saisie hebdo, validation.
- **Notes de frais** — Soumission, workflow d'approbation, remboursement.
- **Paie** — Bulletins, masse salariale, déclarations sociales.
- **Entretiens & objectifs** — Annuels, professionnels, période d'essai, 360°.
- **Formation** — Catalogue, inscriptions, plan de développement.
- **Recrutement** — Offres, pipeline Kanban, gestion des candidats.
- **Documents** — Coffre-fort numérique par collaborateur.
- **Rapports** — Effectifs, contrats, masse salariale, exports.
- **Sociétés** — Référentiel multi-entités (sièges + établissements).
- **Paramètres** — Types de congés, départements, import/export JSON.

## Périmètre des sociétés

Les **36 sociétés et 56 entités (sièges + établissements)** du groupe Paris
Nord sont pré-chargées dans le module « Sociétés » à partir du référentiel
interne (`GROUPE_LISTE_STES_ET_ETS`). Quelques exemples : DEFIS, AFPEC, CFLSS,
DBS, ELFE, France Accès, France Diplôme, ONEL, PBA, PNBS (Susanoo, Marseille,
Rouen, Lille, Lyon, Atlantique), PNFF, Poly Langues, Qualifforma, Zurich
Institut, Form Alsace, Ouest Formation, Edu Sync, U Teach Me, Care Conseil RH,
IDC, ILEF, Equipform, MyPersonali, Orcea, PNA, PNLS, AimEnglish, Chiffr'Actif…

## Stack technique

- **Front pur** : HTML + Tailwind CSS (CDN) + JavaScript vanilla.
- **Persistance** : `localStorage` (export / import JSON depuis Paramètres).
- **Routage** : hash router (`#/conges`, `#/collaborateurs/emp_001`, …).
- **Aucune dépendance backend** — fonctionne ouvert depuis le disque.

## Structure

```
index.html
assets/
├── css/app.css
└── js/
    ├── utils.js   data.js   store.js   router.js   app.js
    └── views/
        ├── auth.js          dashboard.js
        ├── employees.js     leave.js          time.js
        ├── expenses.js      reviews.js        training.js
        ├── recruitment.js   documents.js      orgchart.js
        ├── reports.js       companies.js      payroll.js
        ├── onboarding.js    settings.js
```

## Sauvegarde / restauration

Allez dans **Paramètres → Données** :
- **Exporter** : télécharge l'intégralité de la base au format JSON.
- **Importer** : restaure depuis un export précédent.
- **Réinitialiser** : remet la base aux données initiales (irréversible).
