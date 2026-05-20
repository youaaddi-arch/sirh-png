export interface LeaveType {
  id: string;
  code: string;
  name: string;
  color: string;
  annualDays: number;
  paid: boolean;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string; jobTitle?: string };
  typeId: string;
  type?: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  halfDayStart: boolean;
  halfDayEnd: boolean;
  reason?: string;
  status: 'en_attente' | 'approuve' | 'refuse' | 'annule';
  approvedById?: string;
  approvedAt?: string;
  rejectReason?: string;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  typeId: string;
  type?: LeaveType;
  year: number;
  acquired: number;
  taken: number;
  pending: number;
  scheduled: number;
}

export interface Holiday { date: string; name: string; }

export interface ExpenseLine {
  id: string;
  reportId: string;
  date: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  project?: string;
  receiptPath?: string;
}

export interface ExpenseReport {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  periodMonth: string;
  status: 'brouillon' | 'soumis' | 'approuve' | 'refuse' | 'rembourse';
  totalAmount: number;
  lines: ExpenseLine[];
  createdAt: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  date: string;
  startTime?: string;
  endTime?: string;
  breakMinutes: number;
  hoursWorked: number;
  project?: string;
  notes?: string;
  status: 'en_attente' | 'valide' | 'refuse';
}
