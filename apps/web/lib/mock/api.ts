/**
 * Mock API client-side : intercepte les appels /api/* et répond
 * en localStorage avec seed data. Permet de voir la v2 fonctionnelle
 * sans backend NestJS.
 */
import {
  SEED_TENANTS, SEED_EMPLOYEES, SEED_LEAVE_TYPES, SEED_LEAVES,
  SEED_BALANCES, SEED_EXPENSES, SEED_TESTS, SEED_HOLIDAYS_2026,
  SEED_CONVENTIONS, SEED_REVIEWS,
} from './seed';

const STORE_KEY = 'sirh.mock.v1';

interface Store {
  tenants: any[]; employees: any[]; leaveTypes: any[]; leaves: any[];
  balances: any[]; expenseReports: any[]; tests: any[]; holidays: any[];
  conventions: any[]; reviews: any[]; timesheets: any[];
  notifications: any[]; auditLog: any[]; overtimeRequests: any[];
  payrollVariables: any[]; payslips: any[]; hireProcesses: any[];
  onboardings: any[]; letters: any[];
  processingActivities: any[]; exportRequests: any[];
}

function load(): Store {
  if (typeof window === 'undefined') return defaults();
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  const d = defaults();
  save(d);
  return d;
}

function defaults(): Store {
  return {
    tenants: [...SEED_TENANTS],
    employees: [...SEED_EMPLOYEES],
    leaveTypes: [...SEED_LEAVE_TYPES],
    leaves: [...SEED_LEAVES],
    balances: [...SEED_BALANCES],
    expenseReports: [...SEED_EXPENSES],
    tests: [...SEED_TESTS],
    holidays: [...SEED_HOLIDAYS_2026],
    conventions: [...SEED_CONVENTIONS],
    reviews: [...SEED_REVIEWS],
    timesheets: [],
    notifications: [],
    auditLog: [],
    overtimeRequests: [],
    payrollVariables: [],
    payslips: [],
    hireProcesses: [],
    onboardings: [],
    letters: [],
    processingActivities: [],
    exportRequests: [],
  };
}

function save(s: Store) {
  if (typeof window !== 'undefined') localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export function mockApi(method: string, path: string, body?: any): any {
  const s = load();
  const url = new URL('http://x' + path);
  const p = url.pathname;
  const q = Object.fromEntries(url.searchParams);

  // ==== AUTH ====
  if (method === 'POST' && p === '/auth/login') {
    const emp = s.employees.find((e) => e.email.toLowerCase() === (body.email || '').toLowerCase() && e.password === body.password);
    if (!emp) throw new Error('Identifiants incorrects');
    const tenant = s.tenants.find((t) => t.id === emp.tenantId);
    return {
      token: 'mock-token-' + emp.id,
      user: {
        id: emp.id, email: emp.email, role: emp.role,
        tenantId: emp.tenantId, tenant,
        employee: { id: emp.id, firstName: emp.firstName, lastName: emp.lastName, jobTitle: emp.jobTitle },
      },
    };
  }

  // ==== TENANTS ====
  if (method === 'GET' && p === '/tenants') return s.tenants;
  if (method === 'GET' && /^\/tenants\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    return s.tenants.find((t) => t.id === id);
  }
  if (method === 'GET' && /^\/tenants\/[^/]+\/convention$/.test(p)) {
    const id = p.split('/')[2];
    const t = s.tenants.find((x) => x.id === id);
    return s.conventions.find((c) => c.code === t?.conventionCode);
  }
  if (method === 'GET' && /^\/tenants\/[^/]+\/stats$/.test(p)) {
    const id = p.split('/')[2];
    return {
      employees: s.employees.filter((e) => e.tenantId === id).length,
      departments: 5,
    };
  }
  if (method === 'POST' && p === '/tenants') {
    const t = { id: uid('t'), active: true, ...body };
    s.tenants.push(t); save(s); return t;
  }
  if (method === 'PATCH' && /^\/tenants\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    const idx = s.tenants.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Not found');
    s.tenants[idx] = { ...s.tenants[idx], ...body }; save(s);
    return s.tenants[idx];
  }

  // ==== EMPLOYEES ====
  if (method === 'GET' && p === '/employees') {
    let list = s.employees;
    if (q.tenantId) list = list.filter((e) => e.tenantId === q.tenantId);
    if (q.managerId) list = list.filter((e) => e.managerId === q.managerId);
    if (q.status) list = list.filter((e) => e.status === q.status);
    return list;
  }
  if (method === 'GET' && /^\/employees\/[^/]+$/.test(p)) {
    return s.employees.find((e) => e.id === p.split('/')[2]);
  }

  // ==== LEAVES ====
  if (method === 'GET' && p === '/leaves/types') return s.leaveTypes;
  if (method === 'GET' && p === '/leaves/holidays') return s.holidays;
  if (method === 'GET' && /^\/leaves\/balance\/[^/]+$/.test(p)) {
    const empId = p.split('/')[3];
    return s.balances.filter((b) => b.employeeId === empId).map((b) => ({
      ...b, type: s.leaveTypes.find((t) => t.id === b.typeId),
    }));
  }
  if (method === 'GET' && p === '/leaves') {
    let list = [...s.leaves];
    if (q.employeeId) list = list.filter((l) => l.employeeId === q.employeeId);
    if (q.status) list = list.filter((l) => l.status === q.status);
    if (q.managerId) {
      const teamIds = s.employees.filter((e) => e.managerId === q.managerId).map((e) => e.id);
      list = list.filter((l) => teamIds.includes(l.employeeId));
    }
    return list.map((l) => ({
      ...l,
      type: s.leaveTypes.find((t) => t.id === l.typeId),
      employee: s.employees.find((e) => e.id === l.employeeId),
    }));
  }
  if (method === 'POST' && p === '/leaves') {
    const days = Math.ceil((new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) / 86400000) + 1;
    const l = { id: uid('l'), ...body, days, status: 'en_attente', createdAt: new Date().toISOString() };
    s.leaves.push(l); save(s); return l;
  }
  if (method === 'PATCH' && /^\/leaves\/[^/]+\/(approve|reject|cancel)$/.test(p)) {
    const id = p.split('/')[2];
    const action = p.split('/')[3];
    const l = s.leaves.find((x) => x.id === id);
    if (!l) throw new Error('Not found');
    l.status = action === 'approve' ? 'approuve' : action === 'reject' ? 'refuse' : 'annule';
    if (body?.reason) l.rejectReason = body.reason;
    save(s); return l;
  }

  // ==== EXPENSES ====
  if (method === 'GET' && p === '/expense-reports') {
    let list = [...s.expenseReports];
    if (q.employeeId) list = list.filter((e) => e.employeeId === q.employeeId);
    if (q.status) list = list.filter((e) => e.status === q.status);
    return list.map((e) => ({ ...e, employee: s.employees.find((emp) => emp.id === e.employeeId) }));
  }
  if (method === 'GET' && /^\/expense-reports\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    const r = s.expenseReports.find((x) => x.id === id);
    return r ? { ...r, employee: s.employees.find((e) => e.id === r.employeeId) } : null;
  }
  if (method === 'POST' && p === '/expense-reports') {
    const r = { id: uid('ex'), ...body, status: 'brouillon', totalAmount: 0, lines: [], createdAt: new Date().toISOString() };
    s.expenseReports.push(r); save(s); return r;
  }
  if (method === 'POST' && /^\/expense-reports\/[^/]+\/lines$/.test(p)) {
    const id = p.split('/')[2];
    const r = s.expenseReports.find((x) => x.id === id);
    if (!r) throw new Error('Not found');
    const line = { id: uid('el'), reportId: id, ...body, amount: Number(body.amount) };
    r.lines = r.lines || [];
    r.lines.push(line);
    r.totalAmount = r.lines.reduce((sum: number, l: any) => sum + l.amount, 0);
    save(s); return line;
  }
  if (method === 'PATCH' && /^\/expense-reports\/[^/]+\/(submit|approve|reject|reimburse)$/.test(p)) {
    const id = p.split('/')[2];
    const verb = p.split('/')[3];
    const r = s.expenseReports.find((x) => x.id === id);
    if (!r) throw new Error('Not found');
    r.status = verb === 'submit' ? 'soumis' : verb === 'approve' ? 'approuve' : verb === 'reject' ? 'refuse' : 'rembourse';
    save(s); return r;
  }

  // ==== TIMESHEETS ====
  if (method === 'GET' && p === '/timesheets') {
    return s.timesheets.filter((t) => !q.employeeId || t.employeeId === q.employeeId);
  }
  if (method === 'POST' && /^\/timesheets\/clock\/[^/]+$/.test(p)) {
    const empId = p.split('/')[3];
    const today = new Date().toISOString().slice(0, 10);
    let t = s.timesheets.find((x) => x.employeeId === empId && x.date.slice(0, 10) === today);
    const now = new Date(); const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (!t) {
      t = { id: uid('ts'), employeeId: empId, date: today, startTime: time, status: 'en_attente', breakMinutes: 0, hoursWorked: 0 };
      s.timesheets.push(t);
    } else if (!t.endTime) {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = time.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm) - (t.breakMinutes || 0);
      t.endTime = time; t.hoursWorked = Math.max(0, mins / 60);
    }
    save(s); return t;
  }
  if (method === 'POST' && /^\/timesheets\/day\/[^/]+$/.test(p)) {
    const empId = p.split('/')[3];
    const date = body.date.slice(0, 10);
    let t = s.timesheets.find((x) => x.employeeId === empId && x.date.slice(0, 10) === date);
    if (!t) { t = { id: uid('ts'), employeeId: empId, date, status: 'en_attente', breakMinutes: 0 } as any; s.timesheets.push(t); }
    Object.assign(t, body);
    if (t.startTime && t.endTime) {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = t.endTime.split(':').map(Number);
      t.hoursWorked = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (t.breakMinutes || 0)) / 60);
    }
    save(s); return t;
  }

  // ==== TEAM ====
  if (method === 'GET' && p === '/team/stats') {
    const empIds = s.employees.filter((e) => !q.managerId || e.managerId === q.managerId).map((e) => e.id);
    return {
      totalEmployees: empIds.length,
      pendingLeaves: s.leaves.filter((l) => l.status === 'en_attente' && empIds.includes(l.employeeId)).length,
      pendingOvertime: 0,
      pendingExpenses: s.expenseReports.filter((e) => e.status === 'soumis' && empIds.includes(e.employeeId)).length,
      todayAbsent: 0, upcomingLeaves: 2,
      expiringContracts: 0, birthdaysMonth: 1,
    };
  }
  if (method === 'GET' && p === '/team/pending') {
    const empIds = q.managerId ? s.employees.filter((e) => e.managerId === q.managerId).map((e) => e.id) : s.employees.map((e) => e.id);
    return {
      leaves: s.leaves.filter((l) => l.status === 'en_attente' && empIds.includes(l.employeeId)).map((l) => ({
        ...l, type: s.leaveTypes.find((t) => t.id === l.typeId),
        employee: s.employees.find((e) => e.id === l.employeeId),
      })),
      overtime: [],
      expenses: s.expenseReports.filter((e) => e.status === 'soumis' && empIds.includes(e.employeeId)).map((e) => ({
        ...e, employee: s.employees.find((emp) => emp.id === e.employeeId),
      })),
    };
  }
  if (method === 'GET' && p === '/team/planning') {
    const empIds = q.managerId ? s.employees.filter((e) => e.managerId === q.managerId).map((e) => e.id) : s.employees.map((e) => e.id);
    return {
      employees: s.employees.filter((e) => empIds.includes(e.id)),
      leaves: s.leaves.filter((l) => l.status === 'approuve' && empIds.includes(l.employeeId)).map((l) => ({
        ...l, type: s.leaveTypes.find((t) => t.id === l.typeId),
      })),
      holidays: s.holidays,
    };
  }
  if (method === 'GET' && p === '/team/birthdays') {
    const month = new Date().getMonth();
    return s.employees.filter((e) => e.birthDate && new Date(e.birthDate).getMonth() === month);
  }

  // ==== CONVENTIONS ====
  if (method === 'GET' && p === '/conventions') return s.conventions;

  // ==== ALERTES ====
  if (method === 'GET' && p === '/alerts') return [];

  // ==== TESTS ====
  if (method === 'GET' && p === '/knowledge-tests') return s.tests.map((t) => ({ ...t, questions: [] }));
  if (method === 'GET' && /^\/knowledge-tests\/attempts\/by-employee\/[^/]+$/.test(p)) return [];

  // ==== REVIEWS ====
  if (method === 'GET' && p === '/reviews') {
    return s.reviews.map((r) => ({
      ...r,
      employee: s.employees.find((e) => e.id === r.employeeId),
      reviewer: s.employees.find((e) => e.id === r.reviewerId),
    }));
  }
  if (method === 'GET' && p === '/reviews/templates') {
    return [{ type: 'annuel', label: 'Annuel' }, { type: 'professionnel', label: 'Professionnel' }, { type: 'periode_essai', label: 'Période d\'essai' }, { type: '360', label: '360°' }];
  }

  // ==== PAYROLL ====
  if (method === 'GET' && p === '/payroll/payslips') return s.payslips;
  if (method === 'GET' && p === '/payroll/variables') {
    return s.employees.filter((e) => e.status === 'actif').map((e) => ({
      employeeId: e.id, matricule: e.matricule, firstName: e.firstName, lastName: e.lastName,
      companyCode: s.tenants.find((t) => t.id === e.tenantId)?.code || '',
      companyName: s.tenants.find((t) => t.id === e.tenantId)?.name || '',
      siret: s.tenants.find((t) => t.id === e.tenantId)?.siret || '',
      iban: '', baseSalary: e.grossSalary,
      workedDays: 20, workedHours: 150, overtimeHours: 0,
      cpDays: 0, rttDays: 0, sickDays: 0, otherAbsenceDays: 0,
      mealVouchersCount: 20, bonuses: 0, deductions: 0, expenses: 0,
      totalGross: e.grossSalary,
    }));
  }
  if (method === 'GET' && p === '/payroll/variables/extra') return [];

  // ==== HIRING ====
  if (method === 'GET' && p === '/hire-processes') return s.hireProcesses;
  if (method === 'GET' && p === '/hire-processes/stats') {
    return { total: 0, pre_embauche: 0, soumis: 0, valide: 0, contrat: 0, embauche: 0 };
  }

  // ==== CONTRACTS ====
  if (method === 'GET' && p === '/contracts') return [];

  // ==== LETTERS ====
  if (method === 'GET' && p === '/letters') return s.letters;
  if (method === 'GET' && p === '/letters/templates') {
    return [
      { key: 'attestation_employeur', label: 'Attestation employeur' },
      { key: 'certificat_travail', label: 'Certificat de travail' },
      { key: 'promesse_embauche', label: 'Promesse d\'embauche' },
      { key: 'avertissement', label: 'Avertissement disciplinaire' },
      { key: 'felicitations', label: 'Lettre de félicitations' },
      { key: 'convocation_visite_medicale', label: 'Convocation visite médicale' },
      { key: 'affiliation_mutuelle', label: 'Affiliation mutuelle' },
      { key: 'augmentation', label: 'Notification d\'augmentation' },
    ];
  }

  // ==== ONBOARDING ====
  if (method === 'GET' && p === '/onboarding') return s.onboardings;
  if (method === 'GET' && /^\/onboarding\/by-employee\/[^/]+$/.test(p)) return null;

  // ==== RGPD ====
  if (method === 'GET' && p === '/rgpd/activities') return [];
  if (method === 'GET' && p === '/rgpd/audit') return [];
  if (method === 'GET' && p === '/rgpd/export-requests') return [];

  // ==== Default ====
  return [];
}

export function resetMock() {
  if (typeof window !== 'undefined') localStorage.removeItem(STORE_KEY);
}
