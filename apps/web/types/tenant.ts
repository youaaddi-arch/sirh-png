export interface Tenant {
  id: string;
  organisationId: string;
  organisation?: { id: string; name: string; slug: string };
  code: string;
  name: string;
  type: 'SIEGE' | 'ETS';
  siren?: string | null;
  siret?: string | null;
  apeCode?: string | null;
  urssafCode?: string | null;
  urssafName?: string | null;
  address?: string | null;
  repName?: string | null;
  repRole?: string | null;
  conventionCode?: string | null;
  medicalProvider?: { name?: string; address?: string; phone?: string; email?: string; doctor?: string } | null;
  healthInsurance?: { name?: string; contractNumber?: string; phone?: string; shareEmployer?: number } | null;
  providentInsurance?: { name?: string; contractNumber?: string; phone?: string } | null;
  pensionFund?: { name?: string; code?: string } | null;
  workInjuryFund?: { name?: string; rate?: number } | null;
  apprenticeshipTax?: { collector?: string; rate?: number } | null;
  cseRepresentative?: string | null;
  safetyOfficer?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Convention {
  code: string;
  name: string;
  brochure?: string;
  cpAnnuel: number;
  paidSickFromDay: number;
  trialPeriod: Record<string, Record<string, number>>;
  trialRenewal: Record<string, number>;
  notice: Record<string, number>;
  extraLeavesSeniority: Record<string, number>;
  conventionalLeaves: Record<string, number>;
  minimumWageCoef?: Record<string, number>;
  legifranceUrl?: string;
  lastSyncAt?: string;
}
