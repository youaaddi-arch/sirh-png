/**
 * 3 tests d'actualisation des connaissances — pour conformité Qualiopi/sécurité.
 * Auto-seedés au premier appel /api/knowledge-tests.
 */

export const SEED_TESTS = [
  {
    title: 'Sécurité au poste de travail',
    category: 'securite',
    description: 'Test annuel obligatoire sur les règles de sécurité (Code du travail L.4121-1).',
    passingScore: 70,
    validityMonths: 12,
    questions: [
      {
        question: 'En cas d\'incendie, quel est le premier réflexe ?',
        options: ['Sauver mes documents', 'Donner l\'alerte et évacuer', 'Combattre le feu', 'Téléphoner à mes proches'],
        correctIndex: 1,
        explanation: 'L\'alerte et l\'évacuation priment sur tout. Ne combattre le feu que si formé et sans risque.',
      },
      {
        question: 'Le port des EPI (Équipements de Protection Individuelle) est :',
        options: ['Recommandé', 'Obligatoire dans les zones signalées', 'Au choix du salarié', 'Réservé aux nouveaux'],
        correctIndex: 1,
        explanation: 'Article R.4321-4 du Code du travail : l\'employeur fournit les EPI, le salarié est tenu de les porter.',
      },
      {
        question: 'Un accident de trajet est considéré comme un accident :',
        options: ['Personnel', 'Du travail', 'Domestique', 'Non couvert'],
        correctIndex: 1,
        explanation: 'L.411-2 du Code de la Sécurité sociale : le trajet domicile-travail est assimilé au travail.',
      },
      {
        question: 'Le DUER (Document Unique d\'Évaluation des Risques) doit être :',
        options: ['Annuel', 'À jour à tout moment et accessible aux salariés', 'Confidentiel', 'Réservé au CHSCT'],
        correctIndex: 1,
        explanation: 'R.4121-1 et suivants : le DUER est obligatoire, accessible et mis à jour annuellement ou à chaque modification.',
      },
      {
        question: 'En cas de droit de retrait :',
        options: ['Je dois prévenir immédiatement et ne pas risquer ma sécurité', 'Je quitte mon poste sans rien dire', 'Je continue à travailler', 'J\'attends l\'inspection du travail'],
        correctIndex: 0,
        explanation: 'L.4131-1 : le salarié peut se retirer d\'une situation dangereuse en alertant immédiatement l\'employeur.',
      },
    ],
  },
  {
    title: 'RGPD et protection des données',
    category: 'rgpd',
    description: 'Test annuel sur la conformité RGPD pour tout salarié manipulant des données personnelles.',
    passingScore: 70,
    validityMonths: 12,
    questions: [
      {
        question: 'Qu\'est-ce qu\'une donnée personnelle au sens du RGPD ?',
        options: ['Uniquement le nom', 'Toute information identifiant directement ou indirectement une personne physique', 'Les données salariales seulement', 'Les données numériques uniquement'],
        correctIndex: 1,
        explanation: 'Article 4 du RGPD : nom, email, adresse IP, photo, n° de SS, etc. — tout identifiant direct ou indirect.',
      },
      {
        question: 'Sur demande d\'un salarié, quels droits dois-je lui garantir ?',
        options: ['Accès uniquement', 'Accès, rectification, effacement, portabilité, opposition', 'Aucun', 'Uniquement la suppression'],
        correctIndex: 1,
        explanation: 'Articles 15 à 22 du RGPD : 6 droits fondamentaux des personnes concernées.',
      },
      {
        question: 'En cas de violation de données personnelles, je dois :',
        options: ['Attendre 30 jours pour analyser', 'Informer immédiatement le DPO ou la CNIL dans les 72h', 'Ne rien faire', 'Supprimer la trace'],
        correctIndex: 1,
        explanation: 'Article 33 RGPD : notification CNIL sous 72h. Sanction si négligence.',
      },
      {
        question: 'Combien de temps puis-je conserver un CV non retenu ?',
        options: ['10 ans', 'Indéfiniment', 'Maximum 2 ans (recommandation CNIL)', '1 mois'],
        correctIndex: 2,
        explanation: 'CNIL recommande 2 ans max après dernier contact si pas de consentement spécifique.',
      },
      {
        question: 'Un mot de passe doit être :',
        options: ['Partagé avec mon équipe', 'Personnel, complexe, non écrit', 'Le même partout', 'Stocké en clair'],
        correctIndex: 1,
        explanation: 'Recommandations CNIL/ANSSI : minimum 12 caractères, complexité, jamais partagé.',
      },
    ],
  },
  {
    title: 'Référentiel Qualiopi',
    category: 'qualiopi',
    description: 'Test sur les exigences Qualiopi pour les organismes de formation.',
    passingScore: 70,
    validityMonths: 12,
    questions: [
      {
        question: 'Le référentiel Qualiopi comporte :',
        options: ['12 indicateurs', '22 indicateurs', '32 indicateurs', '42 indicateurs'],
        correctIndex: 2,
        explanation: 'Le RNQ contient 32 indicateurs répartis en 7 critères.',
      },
      {
        question: 'L\'audit Qualiopi est :',
        options: ['Optionnel', 'Obligatoire pour bénéficier des fonds publics et mutualisés', 'Annuel', 'Uniquement pour les CFA'],
        correctIndex: 1,
        explanation: 'Depuis le 1er janvier 2022, obligatoire pour OPCO, CPF, France Travail, FAF, États, Régions.',
      },
      {
        question: 'Quel est le délai du cycle d\'audit Qualiopi ?',
        options: ['1 an', '3 ans avec audit de surveillance à 18 mois', '5 ans', '6 mois'],
        correctIndex: 1,
        explanation: 'Certification 3 ans avec audit de surveillance entre 14 et 22 mois, renouvellement à 3 ans.',
      },
      {
        question: 'Les indicateurs Qualiopi évaluent notamment :',
        options: ['Le chiffre d\'affaires uniquement', 'Information du public, adaptation, accompagnement, amélioration continue', 'La rentabilité', 'Les locaux uniquement'],
        correctIndex: 1,
        explanation: 'Les 7 critères couvrent l\'ensemble du process formation, de l\'amont à l\'aval.',
      },
      {
        question: 'Que faire en cas de non-conformité mineure lors de l\'audit ?',
        options: ['Perdre la certification', 'Mettre en place un plan d\'actions correctives sous 3 mois', 'Refaire un audit complet', 'Rien'],
        correctIndex: 1,
        explanation: 'Les non-conformités mineures donnent lieu à un plan d\'actions, les majeures peuvent suspendre la certification.',
      },
    ],
  },
];
