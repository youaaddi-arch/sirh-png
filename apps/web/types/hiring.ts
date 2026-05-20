export type HireStatus =
  | 'pre_embauche'
  | 'soumis'
  | 'valide'
  | 'contrat_genere'
  | 'contrat_signe'
  | 'embauche'
  | 'annule';

export interface HireDocument {
  id: string;
  key: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export interface HireProcess {
  id: string;
  tenantId: string;
  tenant?: { id: string; code: string; name: string; address?: string };
  token: string;
  expiresAt?: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  contractType: string;
  statusClass: string;
  grossSalary: number;
  startDate: string;
  weeklyHours: number;
  managerId?: string;
  manager?: { id: string; firstName: string; lastName: string };
  status: HireStatus;
  draftData?: Record<string, any>;
  documents?: HireDocument[];
  history?: Array<{ at: string; by: string; action: string }>;
  createdAt: string;
  submittedAt?: string;
  validatedAt?: string;
  finalizedAt?: string;
}
