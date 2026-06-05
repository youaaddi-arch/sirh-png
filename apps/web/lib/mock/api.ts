/**
 * Mock API client-side complet (CRUD persistant) — fait tourner la v2
 * comme un vrai SIRH sans backend NestJS.
 *
 * Données persistées en localStorage. Reset via /settings → "Vider les données".
 */
import {
  SEED_TENANTS, SEED_EMPLOYEES, SEED_LEAVE_TYPES, SEED_LEAVES,
  SEED_BALANCES, SEED_EXPENSES, SEED_TESTS, SEED_HOLIDAYS_2026,
  SEED_CONVENTIONS, SEED_REVIEWS,
} from './seed';

const STORE_KEY = 'sirh.mock.v2';

interface Store {
  tenants: any[]; employees: any[]; leaveTypes: any[]; leaves: any[];
  balances: any[]; expenseReports: any[]; tests: any[]; holidays: any[];
  conventions: any[]; reviews: any[]; timesheets: any[];
  notifications: any[]; auditLog: any[]; overtimeRequests: any[];
  payrollVariables: any[]; payslips: any[]; hireProcesses: any[];
  onboardings: any[]; letters: any[]; contracts: any[];
  documents: any[]; processingActivities: any[]; exportRequests: any[];
  goals: any[]; trainings: any[]; trainingEnrollments: any[];
  jobs: any[]; candidates: any[];
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
    expenseReports: JSON.parse(JSON.stringify(SEED_EXPENSES)),
    tests: [...SEED_TESTS],
    holidays: [...SEED_HOLIDAYS_2026],
    conventions: [...SEED_CONVENTIONS],
    reviews: [...SEED_REVIEWS],
    timesheets: [], notifications: [], auditLog: [],
    overtimeRequests: [], payrollVariables: [], payslips: [],
    hireProcesses: [], onboardings: [], letters: [], contracts: [],
    documents: [], processingActivities: [], exportRequests: [],
    goals: [], trainings: seedTrainings(), trainingEnrollments: [],
    jobs: seedJobs(), candidates: [],
  };
}

function seedJobs() {
  const t = today();
  return [
    { id: 'jb1', title: 'Formateur Anglais', tenantId: 't7', contract: 'CDI', location: 'Paris', salary: '28-32k€', status: 'ouvert', postedAt: addDays(t, -10), description: 'Formateur anglais pour entreprises.' },
    { id: 'jb2', title: 'Conseiller commercial', tenantId: 't1', contract: 'CDI', location: 'Saint-Denis', salary: '24-28k€', status: 'ouvert', postedAt: addDays(t, -5), description: 'Développement commercial B2C.' },
    { id: 'jb3', title: 'Développeur Web', tenantId: 't1', contract: 'CDI', location: 'Saint-Denis', salary: '38-45k€', status: 'ouvert', postedAt: addDays(t, -3), description: 'Stack Next.js + NestJS.' },
  ];
}
function seedTrainings() {
  const t = today();
  return [
    { id: 'tr1', title: 'Excel Avancé', provider: 'Form Alsace', category: 'Bureautique', duration: 14, startDate: addDays(t, 30), endDate: addDays(t, 32), capacity: 12, cost: 850, certifying: true, description: 'Tableaux croisés dynamiques, macros, Power Query.' },
    { id: 'tr2', title: 'Management d\'équipe', provider: 'Care Conseil RH', category: 'Management', duration: 21, startDate: addDays(t, 45), endDate: addDays(t, 48), capacity: 8, cost: 1500, certifying: true, description: 'Outils et postures du manager.' },
    { id: 'tr3', title: 'RGPD pour RH', provider: 'Mycènes', category: 'Juridique', duration: 7, startDate: addDays(t, 20), endDate: addDays(t, 20), capacity: 15, cost: 350, certifying: false, description: 'Conformité RGPD RH.' },
  ];
}
function today() { return new Date(); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }

function save(s: Store) {
  if (typeof window !== 'undefined') localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;

function audit(s: Store, action: string, entity: string, entityId?: string) {
  s.auditLog.unshift({
    id: uid('au'), at: new Date().toISOString(),
    action, entityType: entity, entityId,
    user: { email: (typeof window !== 'undefined' && localStorage.getItem('sirh.user')) ? JSON.parse(localStorage.getItem('sirh.user')!).email : 'system' },
  });
  if (s.auditLog.length > 1000) s.auditLog.length = 1000;
}

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
    audit(s, 'LOGIN', 'auth'); save(s);
    return {
      token: 'mock-' + emp.id,
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
    return s.tenants.find((t) => t.id === p.split('/')[2]);
  }
  if (method === 'GET' && /^\/tenants\/[^/]+\/convention$/.test(p)) {
    const t = s.tenants.find((x) => x.id === p.split('/')[2]);
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
    s.tenants.push(t); audit(s, 'CREATE', 'tenant', t.id); save(s); return t;
  }
  if (method === 'PATCH' && /^\/tenants\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    const idx = s.tenants.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Société introuvable');
    s.tenants[idx] = { ...s.tenants[idx], ...body };
    audit(s, 'UPDATE', 'tenant', id); save(s);
    return s.tenants[idx];
  }
  if (method === 'DELETE' && /^\/tenants\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    s.tenants = s.tenants.filter((t) => t.id !== id);
    audit(s, 'DELETE', 'tenant', id); save(s);
    return { ok: true };
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
  if (method === 'POST' && p === '/employees') {
    const count = s.employees.length + 1;
    const e = {
      id: uid('e'),
      matricule: body.matricule || `PNG-${String(count).padStart(4, '0')}`,
      status: 'actif', weeklyHours: 35, classification: 'Employé',
      ...body,
    };
    s.employees.push(e); audit(s, 'CREATE', 'employee', e.id); save(s); return e;
  }
  if (method === 'PATCH' && /^\/employees\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    const idx = s.employees.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error('Salarié introuvable');
    s.employees[idx] = { ...s.employees[idx], ...body };
    audit(s, 'UPDATE', 'employee', id); save(s);
    return s.employees[idx];
  }
  if (method === 'DELETE' && /^\/employees\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    s.employees = s.employees.filter((e) => e.id !== id);
    audit(s, 'DELETE', 'employee', id); save(s);
    return { ok: true };
  }

  // ==== HIRING ====
  if (method === 'GET' && p === '/hire-processes') {
    return s.hireProcesses.map((h) => ({
      ...h,
      tenant: s.tenants.find((t) => t.id === h.tenantId),
      manager: s.employees.find((e) => e.id === h.managerId),
    }));
  }
  if (method === 'GET' && p === '/hire-processes/stats') {
    const c = (status: string) => s.hireProcesses.filter((h) => h.status === status).length;
    return {
      total: s.hireProcesses.length,
      pre_embauche: c('pre_embauche'),
      soumis: c('soumis'),
      valide: c('valide'),
      contrat: c('contrat_genere') + c('contrat_signe'),
      embauche: c('embauche'),
    };
  }
  if (method === 'GET' && /^\/hire-processes\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    const h = s.hireProcesses.find((x) => x.id === id);
    if (!h) throw new Error('Embauche introuvable');
    return {
      ...h,
      tenant: s.tenants.find((t) => t.id === h.tenantId),
      manager: s.employees.find((e) => e.id === h.managerId),
    };
  }
  if (method === 'POST' && p === '/hire-processes') {
    const h = {
      id: uid('hp'),
      token: Math.random().toString(36).slice(2, 14),
      status: 'pre_embauche',
      createdAt: new Date().toISOString(),
      draftData: {},
      documents: [],
      history: [{ at: new Date().toISOString(), action: 'Dossier créé' }],
      ...body,
    };
    s.hireProcesses.push(h); audit(s, 'CREATE', 'hire', h.id); save(s); return h;
  }
  if (method === 'PATCH' && /^\/hire-processes\/[^/]+\/advance$/.test(p)) {
    const id = p.split('/')[2];
    const h = s.hireProcesses.find((x) => x.id === id);
    if (!h) throw new Error('Embauche introuvable');
    h.status = body.status;
    h.history = [...(h.history || []), { at: new Date().toISOString(), action: body.status, reason: body.reason }];
    // Si embauche finalisée, créer le salarié
    if (body.status === 'embauche' && h.draftData?.firstName) {
      const count = s.employees.length + 1;
      const emp = {
        id: uid('e'),
        matricule: `PNG-${String(count).padStart(4, '0')}`,
        firstName: h.draftData.firstName || h.firstName,
        lastName: h.draftData.lastName || h.lastName,
        email: h.email,
        password: 'temp' + Math.floor(Math.random() * 9999),
        role: 'employe',
        jobTitle: h.jobTitle,
        tenantId: h.tenantId, managerId: h.managerId,
        contractType: h.contractType, contractStart: h.startDate,
        grossSalary: h.grossSalary, weeklyHours: h.weeklyHours || 35,
        classification: h.statusClass || 'Employé',
        status: 'actif',
        birthDate: h.draftData.birthDate, address: h.draftData.address,
        socialSecurity: h.draftData.socialSecurity,
        iban: h.draftData.iban, bic: h.draftData.bic,
      };
      s.employees.push(emp);
      h.employeeId = emp.id;
      audit(s, 'CREATE', 'employee', emp.id);
    }
    save(s);
    return h;
  }
  if (method === 'DELETE' && /^\/hire-processes\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    s.hireProcesses = s.hireProcesses.filter((h) => h.id !== id);
    audit(s, 'DELETE', 'hire', id); save(s);
    return { ok: true };
  }

  // ==== PREBOARDING (PUBLIC) ====
  if (method === 'GET' && /^\/preboarding\/[^/]+$/.test(p)) {
    const token = p.split('/')[2];
    const h = s.hireProcesses.find((x) => x.token === token);
    if (!h) throw new Error('Lien invalide');
    return { ...h, tenant: s.tenants.find((t) => t.id === h.tenantId) };
  }
  if (method === 'PATCH' && /^\/preboarding\/[^/]+$/.test(p)) {
    const token = p.split('/')[2];
    const h = s.hireProcesses.find((x) => x.token === token);
    if (!h) throw new Error('Lien invalide');
    h.draftData = { ...(h.draftData || {}), ...body };
    save(s); return h;
  }
  if (method === 'POST' && /^\/preboarding\/[^/]+\/submit$/.test(p)) {
    const token = p.split('/')[2];
    const h = s.hireProcesses.find((x) => x.token === token);
    if (!h) throw new Error('Lien invalide');
    h.status = 'soumis'; h.submittedAt = new Date().toISOString();
    save(s); return h;
  }

  // ==== CONTRACTS ====
  if (method === 'GET' && p === '/contracts') {
    let list = s.contracts;
    if (q.employeeId) list = list.filter((c) => c.employeeId === q.employeeId);
    if (q.tenantId) list = list.filter((c) => c.tenantId === q.tenantId);
    return list.map((c) => ({
      ...c,
      tenant: s.tenants.find((t) => t.id === c.tenantId),
      employee: s.employees.find((e) => e.id === c.employeeId),
    }));
  }
  if (method === 'GET' && /^\/contracts\/[^/]+$/.test(p)) {
    const id = p.split('/')[2];
    const c = s.contracts.find((x) => x.id === id);
    if (!c) throw new Error('Contrat introuvable');
    return {
      ...c,
      tenant: s.tenants.find((t) => t.id === c.tenantId),
      employee: s.employees.find((e) => e.id === c.employeeId),
    };
  }
  if (method === 'POST' && p === '/contracts/generate-from-hire') {
    const h = s.hireProcesses.find((x) => x.id === body.hireProcessId);
    if (!h) throw new Error('Embauche introuvable');
    const c = {
      id: uid('ct'),
      tenantId: h.tenantId, hireProcessId: h.id,
      type: h.contractType, position: h.jobTitle,
      statusClass: h.statusClass, weeklyHours: h.weeklyHours,
      grossSalary: h.grossSalary, startDate: h.startDate,
      trialPeriodDays: h.contractType === 'CDI' ? 60 : 30,
      contentMd: generateContractContent(h, s.tenants.find((t) => t.id === h.tenantId)),
      generatedByAi: true, aiModel: 'template',
      status: 'brouillon',
      signatures: [],
    };
    s.contracts.push(c); audit(s, 'CREATE', 'contract', c.id); save(s); return c;
  }
  if (method === 'POST' && /^\/contracts\/[^/]+\/send$/.test(p)) {
    const id = p.split('/')[2];
    const c = s.contracts.find((x) => x.id === id);
    if (!c) throw new Error('Not found');
    c.status = 'envoye'; c.sentAt = new Date().toISOString();
    save(s); return c;
  }
  if (method === 'POST' && p === '/contracts') {
    const c = {
      id: uid('ct'),
      status: body.status || 'brouillon',
      generatedByAi: false,
      signatures: [],
      createdAt: new Date().toISOString(),
      ...body,
    };
    s.contracts.push(c); audit(s, 'CREATE', 'contract', c.id); save(s); return c;
  }
  if (method === 'POST' && p === '/contracts/avenant') {
    const emp = s.employees.find((e) => e.id === body.employeeId);
    if (!emp) throw new Error('Salarié introuvable');
    const tenant = s.tenants.find((t) => t.id === emp.tenantId);
    const previous = [...s.contracts].filter((c) => c.employeeId === emp.id).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))[0];
    const changes = body.changes || {};
    const reason = body.reason || 'Modification des conditions du contrat';
    const c = {
      id: uid('av'),
      employeeId: emp.id,
      tenantId: emp.tenantId,
      parentContractId: previous?.id,
      type: 'Avenant',
      position: changes.jobTitle ?? emp.jobTitle,
      statusClass: changes.classification ?? emp.classification,
      weeklyHours: changes.weeklyHours ?? emp.weeklyHours,
      grossSalary: changes.grossSalary ?? emp.grossSalary,
      contractType: changes.contractType ?? emp.contractType,
      workTime: changes.workTime ?? emp.workTime,
      startDate: body.effectiveDate || new Date().toISOString().slice(0, 10),
      reason,
      changes,
      previous: previous ? {
        jobTitle: previous.position,
        grossSalary: previous.grossSalary,
        weeklyHours: previous.weeklyHours,
        contractType: previous.type,
      } : {
        jobTitle: emp.jobTitle,
        grossSalary: emp.grossSalary,
        weeklyHours: emp.weeklyHours,
        contractType: emp.contractType,
      },
      contentMd: `# AVENANT AU CONTRAT DE TRAVAIL\n\nEntre **${tenant?.name || ''}** et **${emp.firstName} ${emp.lastName}**.\n\n**Motif :** ${reason}\n\n**Date d'effet :** ${body.effectiveDate || new Date().toISOString().slice(0, 10)}\n\n## Modifications apportées\n\n${Object.entries(changes).map(([k, v]) => `- **${k}** : ${v}`).join('\n')}\n\n_Toutes les autres clauses du contrat initial demeurent inchangées._`,
      status: 'brouillon',
      signatures: [],
      createdAt: new Date().toISOString(),
    };
    s.contracts.push(c); audit(s, 'CREATE', 'avenant', c.id); save(s); return c;
  }
  if (method === 'POST' && /^\/contracts\/[^/]+\/sign$/.test(p)) {
    const id = p.split('/')[2];
    const c = s.contracts.find((x) => x.id === id);
    if (!c) throw new Error('Not found');
    c.signatures = c.signatures || [];
    c.signatures.push({ id: uid('sig'), signerRole: body.role, signerName: body.signerName, signerEmail: body.signerEmail, signedAt: new Date().toISOString() });
    if (body.role === 'employee') c.signedEmployeeAt = new Date().toISOString();
    if (body.role === 'employer') c.signedEmployerAt = new Date().toISOString();
    if (c.signedEmployeeAt && c.signedEmployerAt) c.status = 'signe';
    else if (body.role === 'employee') c.status = 'signe_salarie';
    save(s); return c;
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
    s.leaves.push(l); audit(s, 'CREATE', 'leave', l.id); save(s); return l;
  }
  if (method === 'PATCH' && /^\/leaves\/[^/]+\/(approve|reject|cancel)$/.test(p)) {
    const id = p.split('/')[2]; const action = p.split('/')[3];
    const l = s.leaves.find((x) => x.id === id);
    if (!l) throw new Error('Not found');
    l.status = action === 'approve' ? 'approuve' : action === 'reject' ? 'refuse' : 'annule';
    if (body?.reason) l.rejectReason = body.reason;
    l.approvedAt = new Date().toISOString();
    // Mise à jour solde
    if (action === 'approve') {
      const bal = s.balances.find((b) => b.employeeId === l.employeeId && b.typeId === l.typeId);
      if (bal) bal.taken = (bal.taken || 0) + (l.days || 0);
    }
    audit(s, action.toUpperCase(), 'leave', id); save(s); return l;
  }

  // ==== TIMESHEETS ====
  if (method === 'GET' && p === '/timesheets') {
    return s.timesheets.filter((t) => !q.employeeId || t.employeeId === q.employeeId);
  }
  if (method === 'POST' && /^\/timesheets\/clock\/[^/]+$/.test(p)) {
    const empId = p.split('/')[3];
    const today = new Date().toISOString().slice(0, 10);
    let t = s.timesheets.find((x) => x.employeeId === empId && x.date.slice(0, 10) === today);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (!t) {
      t = { id: uid('ts'), employeeId: empId, date: today, startTime: time, status: 'en_attente', breakMinutes: 60, hoursWorked: 0 };
      s.timesheets.push(t);
    } else if (!t.endTime) {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = time.split(':').map(Number);
      t.endTime = time;
      t.hoursWorked = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (t.breakMinutes || 0)) / 60);
    }
    save(s); return t;
  }
  if (method === 'POST' && /^\/timesheets\/day\/[^/]+$/.test(p)) {
    const empId = p.split('/')[3];
    const date = body.date.slice(0, 10);
    let t = s.timesheets.find((x) => x.employeeId === empId && x.date.slice(0, 10) === date);
    if (!t) { t = { id: uid('ts'), employeeId: empId, date, status: 'en_attente', breakMinutes: 60 } as any; s.timesheets.push(t); }
    Object.assign(t, body); t.breakMinutes = +body.breakMinutes || 0;
    if (t.startTime && t.endTime) {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = t.endTime.split(':').map(Number);
      t.hoursWorked = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (t.breakMinutes || 0)) / 60);
    }
    save(s); return t;
  }

  // ==== EXPENSES ====
  if (method === 'GET' && p === '/expense-reports') {
    let list = [...s.expenseReports];
    if (q.employeeId) list = list.filter((e) => e.employeeId === q.employeeId);
    if (q.managerId) {
      const teamIds = s.employees.filter((e) => e.managerId === q.managerId).map((e) => e.id);
      list = list.filter((e) => teamIds.includes(e.employeeId));
    }
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
  if (method === 'DELETE' && /^\/expense-reports\/lines\/[^/]+$/.test(p)) {
    const lineId = p.split('/')[3];
    for (const r of s.expenseReports) {
      if (r.lines) {
        r.lines = r.lines.filter((l: any) => l.id !== lineId);
        r.totalAmount = r.lines.reduce((sum: number, l: any) => sum + l.amount, 0);
      }
    }
    save(s); return { ok: true };
  }
  if (method === 'PATCH' && /^\/expense-reports\/[^/]+\/(submit|approve|reject|reimburse)$/.test(p)) {
    const id = p.split('/')[2]; const verb = p.split('/')[3];
    const r = s.expenseReports.find((x) => x.id === id);
    if (!r) throw new Error('Not found');
    r.status = verb === 'submit' ? 'soumis' : verb === 'approve' ? 'approuve' : verb === 'reject' ? 'refuse' : 'rembourse';
    if (verb === 'submit') r.submittedAt = new Date().toISOString();
    save(s); return r;
  }

  // ==== PAYROLL VARIABLES ====
  if (method === 'GET' && p === '/payroll/variables') {
    const month = q.month || new Date().toISOString().slice(0, 7);
    return s.employees.filter((e) => e.status === 'actif').map((e) => {
      const t = s.tenants.find((x) => x.id === e.tenantId);
      // Compter les absences/congés sur le mois
      const monthLeaves = s.leaves.filter((l) =>
        l.employeeId === e.id && l.status === 'approuve' &&
        l.startDate.slice(0, 7) <= month && l.endDate.slice(0, 7) >= month
      );
      let cpDays = 0, rttDays = 0, sickDays = 0, otherDays = 0;
      monthLeaves.forEach((l) => {
        const type = s.leaveTypes.find((lt) => lt.id === l.typeId);
        if (type?.code === 'CP') cpDays += l.days;
        else if (type?.code === 'RTT') rttDays += l.days;
        else if (['MAL', 'MAT', 'PAT'].includes(type?.code || '')) sickDays += l.days;
        else otherDays += l.days;
      });
      // Heures travaillées calculées
      const sheets = s.timesheets.filter((ts) => ts.employeeId === e.id && ts.date.slice(0, 7) === month);
      const workedDays = sheets.length || 20;
      const workedHours = sheets.reduce((sum, ts) => sum + (ts.hoursWorked || 0), 0) || (workedDays * 7);
      const baseHours = (e.weeklyHours || 35) / 5 * workedDays;
      const overtimeHours = Math.max(0, workedHours - baseHours);
      // Primes
      const primes = s.payrollVariables.filter((pv) => pv.employeeId === e.id && pv.month === month);
      const bonuses = primes.filter((pv) => pv.type === 'prime').reduce((sum, pv) => sum + pv.amount, 0);
      const deductions = primes.filter((pv) => pv.type === 'retenue').reduce((sum, pv) => sum + pv.amount, 0);
      // Frais
      const exp = s.expenseReports.filter((r) => r.employeeId === e.id && ['approuve', 'rembourse'].includes(r.status));
      const expenses = exp.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      const mealVouchersCount = Math.max(0, workedDays - cpDays - rttDays - sickDays - otherDays);
      const totalGross = (e.grossSalary || 0) + bonuses - deductions;
      return {
        employeeId: e.id, matricule: e.matricule,
        firstName: e.firstName, lastName: e.lastName,
        companyCode: t?.code || '', companyName: t?.name || '',
        siret: t?.siret || '', iban: e.iban || '',
        baseSalary: e.grossSalary, workedDays, workedHours, overtimeHours,
        cpDays, rttDays, sickDays, otherAbsenceDays: otherDays,
        mealVouchersCount, bonuses, deductions, expenses, totalGross,
      };
    });
  }
  if (method === 'GET' && p === '/payroll/variables/extra') {
    return s.payrollVariables.filter((pv) => pv.month === q.month).map((pv) => ({
      ...pv, employee: s.employees.find((e) => e.id === pv.employeeId),
    }));
  }
  if (method === 'POST' && p === '/payroll/variables/extra') {
    const v = { id: uid('pv'), ...body };
    s.payrollVariables.push(v); save(s); return v;
  }
  if (method === 'DELETE' && /^\/payroll\/variables\/extra\/[^/]+$/.test(p)) {
    const id = p.split('/')[4];
    s.payrollVariables = s.payrollVariables.filter((v) => v.id !== id);
    save(s); return { ok: true };
  }

  // ==== PAYSLIPS ====
  if (method === 'GET' && p === '/payroll/payslips') {
    let list = s.payslips;
    if (q.employeeId) list = list.filter((p) => p.employeeId === q.employeeId);
    if (q.month) list = list.filter((p) => p.month === q.month);
    return list.map((p) => ({ ...p, employee: s.employees.find((e) => e.id === p.employeeId) }));
  }
  if (method === 'POST' && p === '/payroll/generate') {
    const month = body.month;
    s.employees.filter((e) => e.status === 'actif').forEach((e) => {
      const exists = s.payslips.find((p) => p.employeeId === e.id && p.month === month);
      if (exists) return;
      const gross = e.grossSalary;
      s.payslips.push({
        id: uid('ps'), employeeId: e.id, month,
        gross, socialCharges: Math.round(gross * 0.22),
        net: Math.round(gross * 0.78), employerCost: Math.round(gross * 1.42),
        status: 'edite',
      });
    });
    save(s); return { count: s.payslips.filter((p) => p.month === month).length };
  }

  // ==== TEAM ====
  if (method === 'GET' && p === '/team/stats') {
    const empIds = s.employees.filter((e) => e.status === 'actif' && (!q.managerId || e.managerId === q.managerId)).map((e) => e.id);
    return {
      totalEmployees: empIds.length,
      pendingLeaves: s.leaves.filter((l) => l.status === 'en_attente' && empIds.includes(l.employeeId)).length,
      pendingOvertime: s.overtimeRequests.filter((o) => o.status === 'en_attente' && empIds.includes(o.employeeId)).length,
      pendingExpenses: s.expenseReports.filter((e) => e.status === 'soumis' && empIds.includes(e.employeeId)).length,
      todayAbsent: 0, upcomingLeaves: s.leaves.filter((l) => l.status === 'approuve' && new Date(l.startDate) > new Date()).length,
      expiringContracts: 0,
      birthdaysMonth: s.employees.filter((e) => e.birthDate && new Date(e.birthDate).getMonth() === new Date().getMonth()).length,
    };
  }
  if (method === 'GET' && p === '/team/pending') {
    const empIds = q.managerId ? s.employees.filter((e) => e.managerId === q.managerId).map((e) => e.id) : s.employees.map((e) => e.id);
    return {
      leaves: s.leaves.filter((l) => l.status === 'en_attente' && empIds.includes(l.employeeId)).map((l) => ({
        ...l, type: s.leaveTypes.find((t) => t.id === l.typeId),
        employee: s.employees.find((e) => e.id === l.employeeId),
      })),
      overtime: s.overtimeRequests.filter((o) => o.status === 'en_attente' && empIds.includes(o.employeeId)),
      expenses: s.expenseReports.filter((e) => e.status === 'soumis' && empIds.includes(e.employeeId)).map((e) => ({
        ...e, employee: s.employees.find((emp) => emp.id === e.employeeId),
      })),
    };
  }
  if (method === 'GET' && p === '/team/planning') {
    const empIds = q.managerId ? s.employees.filter((e) => e.managerId === q.managerId).map((e) => e.id) : s.employees.map((e) => e.id);
    return {
      employees: s.employees.filter((e) => empIds.includes(e.id) && e.status === 'actif'),
      leaves: s.leaves.filter((l) => l.status === 'approuve' && empIds.includes(l.employeeId)).map((l) => ({
        ...l, type: s.leaveTypes.find((t) => t.id === l.typeId),
      })),
      holidays: s.holidays,
    };
  }
  if (method === 'GET' && p === '/team/birthdays') {
    const month = new Date().getMonth();
    return s.employees.filter((e) => e.birthDate && new Date(e.birthDate).getMonth() === month && (!q.managerId || e.managerId === q.managerId));
  }

  // ==== CONVENTIONS / OVERTIME / TESTS / REVIEWS / ALERTS / LETTERS / ONBOARDING / RGPD ====
  if (method === 'GET' && p === '/conventions') return s.conventions;
  if (method === 'POST' && p === '/conventions/sync') return { synced: s.conventions.length, errors: 0 };
  if (method === 'POST' && /^\/tenants\/[^/]+\/convention\/sync$/.test(p)) {
    const id = p.split('/')[2];
    const t = s.tenants.find((x) => x.id === id);
    return s.conventions.find((c) => c.code === t?.conventionCode);
  }

  if (method === 'GET' && p === '/overtime-requests') {
    return s.overtimeRequests.map((o) => ({ ...o, employee: s.employees.find((e) => e.id === o.employeeId) }));
  }
  if (method === 'POST' && p === '/overtime-requests') {
    const o = { id: uid('ot'), ...body, status: 'en_attente', createdAt: new Date().toISOString() };
    s.overtimeRequests.push(o); save(s); return o;
  }
  if (method === 'PATCH' && /^\/overtime-requests\/[^/]+\/(approve|reject)$/.test(p)) {
    const id = p.split('/')[2]; const verb = p.split('/')[3];
    const o = s.overtimeRequests.find((x) => x.id === id);
    if (!o) throw new Error('Not found');
    o.status = verb === 'approve' ? 'approuve' : 'refuse';
    save(s); return o;
  }

  if (method === 'GET' && p === '/alerts') {
    const today = new Date();
    const alerts: any[] = [];
    s.employees.filter((e) => e.status === 'actif').forEach((e) => {
      if (e.contractStart) {
        const trialEnd = new Date(e.contractStart);
        trialEnd.setDate(trialEnd.getDate() + 60);
        if (trialEnd > today && (trialEnd.getTime() - today.getTime()) < 14 * 86400000) {
          alerts.push({
            type: 'periode_essai', severity: 'warning',
            title: `Fin de période d'essai`,
            body: `${e.firstName} ${e.lastName} — fin de PE le ${trialEnd.toLocaleDateString('fr-FR')}`,
            employeeId: e.id, dueDate: trialEnd,
          });
        }
      }
    });
    return alerts;
  }

  if (method === 'GET' && p === '/knowledge-tests') return s.tests.map((t) => ({ ...t, questions: [] }));
  if (method === 'GET' && /^\/knowledge-tests\/attempts\/by-employee\/[^/]+$/.test(p)) return [];

  if (method === 'GET' && p === '/reviews') {
    let list = s.reviews;
    if (q.employeeId) list = list.filter((r) => r.employeeId === q.employeeId);
    return list.map((r) => ({
      ...r,
      employee: s.employees.find((e) => e.id === r.employeeId),
      reviewer: s.employees.find((e) => e.id === r.reviewerId),
    }));
  }
  if (method === 'POST' && p === '/reviews') {
    const r = { id: uid('rv'), ...body, status: 'planifie', createdAt: new Date().toISOString() };
    s.reviews.push(r); save(s); return r;
  }
  if (method === 'GET' && p === '/reviews/templates') {
    return [
      { type: 'annuel', label: 'Annuel' }, { type: 'professionnel', label: 'Professionnel' },
      { type: 'periode_essai', label: 'Période d\'essai' }, { type: '360', label: '360°' },
    ];
  }

  if (method === 'GET' && p === '/letters') {
    let list = s.letters;
    if (q.employeeId) list = list.filter((l) => l.employeeId === q.employeeId);
    return list.map((l) => ({
      ...l, employee: s.employees.find((e) => e.id === l.employeeId),
    }));
  }
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
  if (method === 'POST' && p === '/letters') {
    const l = { id: uid('lt'), ...body, date: new Date().toISOString(), status: 'redige' };
    s.letters.push(l); save(s); return l;
  }

  if (method === 'GET' && p === '/onboarding') {
    return s.onboardings.map((o) => ({
      ...o, employee: s.employees.find((e) => e.id === o.employeeId),
    }));
  }
  if (method === 'GET' && /^\/onboarding\/by-employee\/[^/]+$/.test(p)) {
    return s.onboardings.find((o) => o.employeeId === p.split('/')[3]) || null;
  }

  if (method === 'GET' && p === '/rgpd/activities') return s.processingActivities;
  if (method === 'GET' && p === '/rgpd/audit') return s.auditLog.slice(0, 100);
  if (method === 'GET' && p === '/rgpd/export-requests') return s.exportRequests;

  // ==== ADMIN / RESET ====
  if (method === 'POST' && p === '/admin/reset') {
    localStorage.removeItem(STORE_KEY); return { ok: true };
  }
  if (method === 'POST' && p === '/admin/clear-employees') {
    s.employees = s.employees.filter((e) => e.role === 'admin');
    s.leaves = []; s.timesheets = []; s.expenseReports = [];
    s.payslips = []; s.payrollVariables = [];
    save(s); return { ok: true };
  }

  return [];
}

function generateContractContent(h: any, t: any): string {
  const d = h.draftData || {};
  const fmt = (s: string) => s ? new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return `# CONTRAT DE TRAVAIL ${h.contractType}

**Entre :** la société **${t?.name || ''}**, SIRET ${t?.siret || ''}, représentée par ${t?.repName || ''}

**Et :** ${(d.firstName || h.firstName)} ${(d.lastName || h.lastName).toUpperCase()}${d.birthDate ? `, né(e) le ${fmt(d.birthDate)}` : ''}${d.birthPlace ? ` à ${d.birthPlace}` : ''}
${d.address ? `Demeurant : ${d.address}` : ''}
${d.socialSecurity ? `N° Sécurité Sociale : ${d.socialSecurity}` : ''}

## Article 1 — Engagement
Le salarié est engagé en qualité de **${h.jobTitle}**, statut **${h.statusClass}**, à compter du **${fmt(h.startDate)}**.

## Article 2 — Période d'essai
La période d'essai est de **${h.contractType === 'CDI' ? 60 : 30} jours**.

## Article 3 — Rémunération
Salaire brut mensuel : **${(h.grossSalary || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**

## Article 4 — Durée du travail
${h.weeklyHours || 35} heures hebdomadaires.

## Article 5 — Convention collective
Convention applicable : Organismes de Formation (IDCC 3249).

Fait à Saint-Denis, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}, en deux exemplaires.
`;
}

export function resetMock() {
  if (typeof window !== 'undefined') localStorage.removeItem(STORE_KEY);
}
