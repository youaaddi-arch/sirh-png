# Conformité RGPD — SIRH Paris Nord

## Responsable de traitement

**Paris Nord Groupe** — représenté par Emir Deniz, Président.

## Délégué à la Protection des Données (DPO)

À nommer (recommandé pour > 250 salariés ou traitement à grande échelle).

## 1. Registre des traitements (Article 30)

**8 traitements documentés** dans le module `/rgpd` :

| # | Traitement | Base légale | Durée conservation |
|---|---|---|---|
| 1 | Gestion administrative du personnel | Contrat | 5 ans après fin contrat |
| 2 | Gestion de la paie | Obligation légale | Bulletins : 50 ans |
| 3 | Recrutement | Consentement | 2 ans après dernier contact |
| 4 | Gestion temps et activités | Contrat | 5 ans |
| 5 | Formation professionnelle | Obligation légale | 6 ans |
| 6 | Visite médicale | Obligation légale | 5 ans |
| 7 | Badges d'accès | Intérêt légitime | Vidéo : 1 mois, logs : 3 mois |
| 8 | Notifications RH | Contrat | Durée du contrat |

Le registre est consultable depuis l'interface RH (`/rgpd` → onglet **Registre**)
et **modifiable** par les admins.

## 2. Droits des personnes (Articles 15-22)

Tous les droits sont **implémentés et accessibles via l'API** :

| Droit | Endpoint | Action |
|---|---|---|
| Accès (art. 15) | `GET /api/rgpd/export/:employeeId` | Export complet JSON |
| Rectification (art. 16) | `PATCH /api/employees/:id` | Modification |
| Effacement (art. 17) | `POST /api/rgpd/delete/:employeeId` | Anonymisation (conserve docs légaux) |
| Limitation (art. 18) | `PATCH /api/employees/:id { status: 'suspendu' }` | Gel du traitement |
| Portabilité (art. 20) | `GET /api/rgpd/export/:employeeId` | Format JSON structuré |
| Opposition (art. 21) | Manuel — contact DPO | — |

**Délai de réponse légal : 1 mois** (peut être porté à 3 mois en cas de complexité).

## 3. Consentements

Module `ConsentRecord` permettant de tracer les consentements explicites pour :
- Photos pour trombinoscope interne
- Photos pour communication externe
- Contact post-emploi
- Tout traitement basé sur le consentement

## 4. Conservation des données

**Application automatique** des durées légales :

| Donnée | Durée légale | Action après expiration |
|---|---|---|
| Bulletins de paie | **50 ans** (jusqu'à liquidation retraite) | Archivage |
| Contrats de travail | **5 ans** après fin | Suppression |
| Justificatifs comptables (notes de frais) | **10 ans** | Archivage |
| Candidatures non retenues | **2 ans** | Suppression auto |
| Vidéosurveillance | **1 mois** | Suppression auto |
| Logs d'accès | **3 mois** | Suppression auto |

À implémenter en S10.2 : jobs cron pour suppression automatique.

## 5. Sécurité technique

Voir [SECURITY.md](./SECURITY.md).

Mesures principales :
- Chiffrement at-rest des données sensibles (NIR, IBAN, salaires)
- Chiffrement en transit (TLS 1.3)
- Authentification forte (2FA TOTP obligatoire pour RH)
- Audit trail complet de toutes les actions mutatives
- Hébergement français/européen (OVH ou Scaleway)

## 6. Sous-traitants (DPA — Data Processing Agreement)

| Sous-traitant | Service | Données | DPA |
|---|---|---|---|
| OVH / Scaleway | Hébergement | Toutes | ✓ |
| Brevo | Emails transactionnels | Email pro, nom | ✓ |
| Anthropic | IA (génération contrats) | Données du contrat uniquement | Privacy Policy |
| Yousign (Phase 2) | E-signature qualifiée eIDAS | Identité, email, IP | ✓ |
| Mindee (Phase 2) | OCR | Pièces d'identité | ✓ (RGPD compliant) |

**Tous les sous-traitants sont européens ou disposent d'un DPA conforme.**

## 7. Information des personnes

À l'embauche, chaque salarié reçoit :
- Un **livret d'accueil** mentionnant le traitement de ses données
- Le **lien vers la politique de confidentialité** complète
- Les **coordonnées du DPO**
- L'information sur ses droits

Le formulaire de **pré-embauche** demande explicitement le consentement RGPD
(case à cocher obligatoire avant soumission).

## 8. Violations de données

Procédure documentée dans [SECURITY.md § Incident response](./SECURITY.md#incident-response).

## 9. Évaluation d'impact (DPIA / AIPD)

À réaliser pour :
- Toute modification majeure des traitements
- Nouveau traitement présentant un risque élevé pour les personnes

Modèle fourni par la CNIL : https://www.cnil.fr/fr/ce-quil-faut-savoir-sur-lanalyse-dimpact-relative-la-protection-des-donnees-aipd

## 10. Contacts

- **DPO** : dpo@pn-groupe.fr (à nommer)
- **CNIL** : https://www.cnil.fr/fr/plaintes
- **Email RGPD interne** : rgpd@pn-groupe.fr
