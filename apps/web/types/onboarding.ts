export interface OnboardingTask {
  id: string;
  name: string;
  category: 'Administratif' | 'Santé' | 'IT' | 'Formation' | 'RH' | 'Équipe';
  daysAfterStart?: number;
  ownerRole?: 'rh' | 'manager' | 'it' | 'employe';
  required?: boolean;
  done?: boolean;
  doneAt?: string;
  doneById?: string;
  dueDate?: string;
}

export interface Onboarding {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string; jobTitle: string; email: string; tenant?: { code: string; name: string } };
  startDate: string;
  tasks: OnboardingTask[];
  status: 'en_cours' | 'termine' | 'annule';
  createdAt: string;
}

export interface OnboardingTemplate {
  name: string;
  appliesTo: string[];
  taskCount: number;
  tasks: OnboardingTask[];
}
