export type ContractStatus =
  | 'brouillon'
  | 'envoye'
  | 'signe_salarie'
  | 'signe'
  | 'actif'
  | 'termine'
  | 'annule';

export interface ContractSignature {
  id: string;
  signerRole: 'employee' | 'employer';
  signerName: string;
  signerEmail: string;
  signedAt: string;
  signedIp?: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  tenant?: { id: string; code: string; name: string };
  employeeId?: string;
  employee?: { id: string; firstName: string; lastName: string };
  hireProcessId?: string;
  type: string;
  position: string;
  statusClass: string;
  weeklyHours: number;
  grossSalary: number;
  startDate: string;
  endDate?: string;
  trialPeriodDays: number;
  contentMd: string;
  contentPdfPath?: string;
  generatedByAi: boolean;
  aiModel?: string;
  status: ContractStatus;
  sentAt?: string;
  signedEmployeeAt?: string;
  signedEmployerAt?: string;
  signatures?: ContractSignature[];
  createdAt: string;
}

export interface Letter {
  id: string;
  tenantId: string;
  tenant?: { id: string; code: string; name: string };
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  type: string;
  subject: string;
  contentMd: string;
  date: string;
  status: 'redige' | 'envoye' | 'signe' | 'archive';
  recipientEmail?: string;
  sentAt?: string;
  createdAt: string;
}
