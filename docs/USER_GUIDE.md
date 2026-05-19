# Guide utilisateur — SIRH Paris Nord

## 1. Premiers pas

### Connexion

URL : `https://sirh.pn-groupe.fr` (ou `http://localhost:3000` en dev)

Vous recevez vos identifiants par email après signature de votre contrat.

À la première connexion :
- Changez votre mot de passe
- Activez le 2FA (obligatoire pour RH/Admin/Paie)
- Vérifiez vos coordonnées personnelles

## 2. Espace salarié (`/my-space`)

Votre **portail libre-service**. Vous y trouvez :

- **Pointage 1-clic** : "Pointer (arrivée/départ)"
- **Soldes de congés** : CP, RTT, jauges colorées
- **Quick actions** : poser un congé, déclarer un frais, consulter mes formations
- **Mes dernières demandes** et notes de frais
- **Mon parcours d'onboarding** (si en cours)

## 3. Congés (`/leaves`)

### Poser un congé
1. Cliquez "Nouvelle demande"
2. Sélectionnez le type (CP, RTT, MAL, MAT, PAT, FAM, TT, SS)
3. Choisissez les dates → calcul auto en jours ouvrés (exclut weekends + jours fériés FR)
4. Indiquez le motif
5. Soumettez → notification automatique à votre manager

### Validation (manager)
1. Onglet "Mon équipe" sur `/leaves`
2. Pour chaque demande : bouton ✓ (approuver) ou ✗ (refuser avec motif)
3. Notification automatique au salarié

## 4. Temps de travail (`/timesheets`)

- **Pointage** : 1er clic = arrivée, 2e = départ (calcul auto)
- **Saisie hebdo** : navigation par semaine, saisie inline début/fin/pause
- Total heures vs objectif 35h

### Heures supplémentaires
Demande via `/overtime-requests` → validation direction obligatoire.

## 5. Notes de frais (`/expenses`)

1. "Nouvelle note" → période = mois en cours
2. "Ajouter une ligne" → date, catégorie, montant, description
3. **Joindre justificatif** (PDF/JPG/PNG, 5 Mo max) par ligne
4. "Soumettre pour validation" quand toutes les lignes sont saisies
5. Workflow : Brouillon → Soumis → Approuvé → Remboursé

## 6. Formation (`/trainings`)

- Catalogue de formations
- Demande d'inscription → validation hiérarchique
- Plan de développement individuel

## 7. Tests de connaissances (`/tests`)

**3 tests obligatoires** :
- 🛡 **Sécurité au poste** (annuel)
- 🔒 **RGPD** (annuel)
- 📋 **Référentiel Qualiopi** (annuel)

Score minimum **70%**. Validité 12 mois. Renouvellement automatique demandé à l'expiration.

## 8. Entretiens (`/reviews`)

### Pour le manager
1. "Planifier un entretien" → choisir type, date, salarié
2. La trame d'évaluation est pré-remplie selon le type :
   - **Annuel** : bilan, compétences (ratings), perspectives
   - **Professionnel** (tous les 2 ans) : évolution, mobilité, CPF
   - **Période d'essai** : intégration, performance, décision
   - **360°** : auto-évaluation + pairs

### Conduite de l'entretien
- Remplissez la trame question par question (rating 1-5, texte, choix)
- Synthèse : note globale, points forts, axes d'amélioration
- "Marquer comme réalisé" puis **signature côté salarié et évaluateur**

## 9. Embauche (RH)

### Workflow complet en 6 étapes

1. **Démarrer une embauche** (`/hiring/new`) → infos candidat + poste + manager
2. **Lien candidat généré** → à envoyer au futur salarié
3. Le candidat remplit le **formulaire pré-embauche** en 6 étapes et joint ses pièces (CV, ID, vitale, RIB, justif domicile)
4. RH **valide les pièces**
5. RH clique "✨ Générer le contrat avec IA Claude" → contrat conforme au droit + convention collective
6. **Envoi pour e-signature** (mock MVP, Yousign Phase 2)
7. **Provisioning automatique** une fois signé par les 2 parties :
   - Création compte SIRH avec mot de passe → email envoyé
   - Convocation visite médicale (selon SST paramétré)
   - Affiliation mutuelle (selon mutuelle paramétrée)
   - Onboarding personnalisé selon le poste (5 templates)
   - Notification au manager

## 10. Paramétrage entité (`/companies`)

Pour chaque société du groupe (36 au total) :
- Identité juridique (SIREN, SIRET, APE, URSSAF)
- **Convention collective** (référentiel Légifrance sync auto)
- **Visite médicale** (SST)
- **Mutuelle santé** (part employeur)
- **Prévoyance**
- **Caisse de retraite**
- CPAM AT-MP, taxe apprentissage, CSE, référent sécurité

## 11. Paie

### Variables de paie (`/payroll-vars`)
- Tableau mensuel par salarié : jours travaillés, heures sup, CP, RTT, maladie, tickets restau, primes, frais, brut total
- **Export CSV** générique
- **Export Silae** (`matricule;rubrique;valeur`)
- **Génération des bulletins** simulés en 1 clic

### Bulletins (`/payroll`)
- Historique des bulletins par salarié et par mois
- Détail brut / charges / net / coût employeur

## 12. Tableau de bord (`/dashboard`)

Adapté à votre rôle :
- **Admin / RH** : vue consolidée tenant
- **Manager** : vue de votre équipe
- 8 KPIs, validations inline, anniversaires, raccourcis

## 13. RGPD (`/rgpd`)

- **Registre des traitements** (8 traitements documentés, art. 30)
- **Audit log** : qui a fait quoi
- **Droits des personnes** : export de données, droit à l'oubli

## 14. Courriers RH (`/letters`)

10 modèles auto-générés depuis les données salarié + tenant :
- Attestation employeur
- Certificat de travail
- Promesse d'embauche
- Avertissement disciplinaire
- Félicitations
- Rupture conventionnelle
- Notification d'augmentation
- Convocation visite médicale
- Affiliation mutuelle
- Refus de congé

## 15. Support

- 📧 **support-sirh@pn-groupe.fr**
- 📞 Service RH : 01 48 09 XX XX
- 🐛 Signaler un bug : créer une issue sur le repo GitHub
