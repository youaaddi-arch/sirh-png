/* Types partagés entre apps/web et apps/api */

export type Role = 'admin' | 'rh' | 'paie' | 'manager' | 'employe';

export type ContractType = 'CDI' | 'CDD' | 'Alternance' | 'Stage' | 'Freelance';
export type StatusClassification = 'Cadre' | 'Agent de maîtrise' | 'Employé' | 'ETAM';
export type EmployeeStatus = 'actif' | 'inactif' | 'suspendu';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  tenant?: { id: string; code: string; name: string };
  employee?: { id: string; firstName: string; lastName: string; jobTitle: string };
}

export interface LoginResponse {
  token?: string;
  requires2fa?: boolean;
  userId?: string;
  user?: AuthUser;
}
