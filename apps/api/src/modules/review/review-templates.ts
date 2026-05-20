/**
 * Trames d'entretien — questions structurées par type d'entretien.
 */

export interface ReviewSection {
  title: string;
  questions: Array<{
    key: string;
    label: string;
    type: 'text' | 'longtext' | 'rating' | 'choice';
    options?: string[];
  }>;
}

export interface ReviewTemplate {
  type: string;
  label: string;
  sections: ReviewSection[];
}

export const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    type: 'annuel',
    label: 'Entretien annuel d\'évaluation',
    sections: [
      {
        title: 'Bilan de la période écoulée',
        questions: [
          { key: 'goals_review', label: 'Bilan des objectifs de l\'année', type: 'longtext' },
          { key: 'achievements', label: 'Principales réalisations', type: 'longtext' },
          { key: 'difficulties', label: 'Difficultés rencontrées', type: 'longtext' },
        ],
      },
      {
        title: 'Évaluation des compétences',
        questions: [
          { key: 'technical_skills', label: 'Compétences techniques (1-5)', type: 'rating' },
          { key: 'autonomy', label: 'Autonomie (1-5)', type: 'rating' },
          { key: 'teamwork', label: 'Travail d\'équipe (1-5)', type: 'rating' },
          { key: 'initiative', label: 'Initiative & proactivité (1-5)', type: 'rating' },
          { key: 'communication', label: 'Communication (1-5)', type: 'rating' },
        ],
      },
      {
        title: 'Souhaits & perspectives',
        questions: [
          { key: 'training_needs', label: 'Besoins en formation', type: 'longtext' },
          { key: 'career_aspirations', label: 'Souhaits d\'évolution', type: 'longtext' },
          { key: 'next_goals', label: 'Objectifs pour l\'année à venir', type: 'longtext' },
        ],
      },
    ],
  },
  {
    type: 'professionnel',
    label: 'Entretien professionnel (tous les 2 ans)',
    sections: [
      {
        title: 'Bilan professionnel des 2 dernières années',
        questions: [
          { key: 'evolution', label: 'Évolution de poste / responsabilités', type: 'longtext' },
          { key: 'trainings_done', label: 'Formations suivies', type: 'longtext' },
          { key: 'qualifications', label: 'Acquisitions de qualifications / certifications', type: 'longtext' },
        ],
      },
      {
        title: 'Perspectives d\'évolution professionnelle',
        questions: [
          { key: 'career_plan', label: 'Projet d\'évolution professionnelle', type: 'longtext' },
          { key: 'mobility', label: 'Souhaits de mobilité', type: 'choice', options: ['Aucune', 'Interne — même métier', 'Interne — autre métier', 'Externe'] },
          { key: 'vae', label: 'Souhait de VAE / formation qualifiante', type: 'longtext' },
        ],
      },
      {
        title: 'Actions à mettre en œuvre',
        questions: [
          { key: 'training_plan', label: 'Plan de formation envisagé', type: 'longtext' },
          { key: 'cpf', label: 'Information sur le CPF (Compte Personnel de Formation)', type: 'choice', options: ['Réalisée', 'Non réalisée'] },
        ],
      },
    ],
  },
  {
    type: 'periode_essai',
    label: 'Entretien de fin de période d\'essai',
    sections: [
      {
        title: 'Intégration',
        questions: [
          { key: 'integration', label: 'Comment s\'est passée l\'intégration ?', type: 'longtext' },
          { key: 'team_fit', label: 'Adéquation avec l\'équipe (1-5)', type: 'rating' },
          { key: 'tools_mastery', label: 'Maîtrise des outils (1-5)', type: 'rating' },
        ],
      },
      {
        title: 'Performance',
        questions: [
          { key: 'job_understanding', label: 'Compréhension du poste (1-5)', type: 'rating' },
          { key: 'results', label: 'Premiers résultats observés', type: 'longtext' },
          { key: 'improvement_areas', label: 'Axes d\'amélioration', type: 'longtext' },
        ],
      },
      {
        title: 'Décision',
        questions: [
          { key: 'decision', label: 'Décision', type: 'choice', options: ['Validation de la période d\'essai', 'Renouvellement', 'Rupture de la période d\'essai'] },
          { key: 'reasons', label: 'Motifs', type: 'longtext' },
        ],
      },
    ],
  },
  {
    type: '360',
    label: 'Entretien 360°',
    sections: [
      {
        title: 'Auto-évaluation',
        questions: [
          { key: 'self_strengths', label: 'Vos points forts perçus', type: 'longtext' },
          { key: 'self_improvements', label: 'Vos axes de progrès', type: 'longtext' },
        ],
      },
      {
        title: 'Évaluation par les pairs',
        questions: [
          { key: 'peers_collab', label: 'Qualité de collaboration (1-5)', type: 'rating' },
          { key: 'peers_communication', label: 'Communication transversale (1-5)', type: 'rating' },
          { key: 'peers_comments', label: 'Commentaires des pairs', type: 'longtext' },
        ],
      },
      {
        title: 'Plan de développement',
        questions: [
          { key: 'dev_actions', label: 'Actions de développement à mettre en place', type: 'longtext' },
        ],
      },
    ],
  },
];

export function getTemplate(type: string): ReviewTemplate | undefined {
  return REVIEW_TEMPLATES.find((t) => t.type === type);
}
