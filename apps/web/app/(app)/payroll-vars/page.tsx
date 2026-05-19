'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Download, Plus, RefreshCw } from 'lucide-react';

export default function PayrollVarsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [genResult, setGenResult] = useState<string>('');

  useEffect(() => { api.get<any[]>('/tenants').then(setTenants); }, []);

  function load() {
    setLoading(true);
    const q = new URLSearchParams({ month });
    if (tenantId) q.set('tenantId', tenantId);
    Promise.all([
      api.get<any[]>(`/payroll/variables?${q}`),
      api.get<any[]>(`/payroll/variables/extra?month=${month}`),
    ]).then(([v, e]) => { setRows(v); setExtras(e); }).finally(() => setLoading(false));
  }
  useEffect(load, [month, tenantId]);

  async function addPrime() {
    const employees = await api.get<any[]>('/employees');
    const employee = prompt('Email du salarié :');
    if (!employee) return;
    const emp = employees.find((e) => e.email === employee);
    if (!emp) { alert('Salarié introuvable'); return; }
    const label = prompt('Libellé :') || 'Prime';
    const amount = Number(prompt('Montant € :') || '0');
    const type = prompt('Type (prime|retenue) :', 'prime') || 'prime';
    await api.post('/payroll/variables/extra', { employeeId: emp.id, month, type, label, amount });
    load();
  }

  async function deleteVar(id: string) {
    if (!confirm('Supprimer cette ligne ?')) return;
    await api.del(`/payroll/variables/extra/${id}`);
    load();
  }

  async function generatePayslips() {
    if (!confirm(`Générer les bulletins du mois ${month} ?`)) return;
    const r = await api.post('/payroll/generate', { month, tenantId: tenantId || undefined });
    setGenResult(`${r.count} bulletins générés ✓`);
    setTimeout(() => setGenResult(''), 5000);
  }

  function exportCsv() {
    const headers = ['Matricule', 'Prénom', 'Nom', 'Société', 'SIRET', 'IBAN', 'Salaire base', 'Jours travaillés', 'Heures', 'H. sup.', 'CP', 'RTT', 'Maladie', 'Autres abs.', 'Tickets repas', 'Primes', 'Retenues', 'Frais', 'Brut total'];
    const lines = [headers.join(';')];
    rows.forEach((r) => {
      lines.push([r.matricule, r.firstName, r.lastName, r.companyName, r.siret, r.iban, r.baseSalary, r.workedDays, r.workedHours.toFixed(1), r.overtimeHours.toFixed(1), r.cpDays, r.rttDays, r.sickDays, r.otherAbsenceDays, r.mealVouchersCount, r.bonuses.toFixed(2), r.deductions.toFixed(2), r.expenses.toFixed(2), r.totalGross.toFixed(2)].join(';'));
    });
    download(`variables-paie-${month}.csv`, lines.join('\n'), 'text/csv;charset=utf-8');
  }

  function exportSilae() {
    const lines = ['Matricule;Rubrique;Valeur'];
    rows.forEach((r) => {
      lines.push(`${r.matricule};SALAIRE_BASE;${r.baseSalary.toFixed(2)}`);
      lines.push(`${r.matricule};HEURES_SUP;${r.overtimeHours.toFixed(2)}`);
      lines.push(`${r.matricule};CP_PRIS;${r.cpDays}`);
      lines.push(`${r.matricule};RTT_PRIS;${r.rttDays}`);
      lines.push(`${r.matricule};MALADIE;${r.sickDays}`);
      lines.push(`${r.matricule};TICKETS_REPAS;${r.mealVouchersCount}`);
      if (r.bonuses) lines.push(`${r.matricule};PRIME;${r.bonuses.toFixed(2)}`);
      if (r.deductions) lines.push(`${r.matricule};RETENUE;${r.deductions.toFixed(2)}`);
      if (r.expenses) lines.push(`${r.matricule};REMB_FRAIS;${r.expenses.toFixed(2)}`);
    });
    download(`silae-${month}.txt`, lines.join('\n'), 'text/plain;charset=utf-8');
  }

  const totals = rows.reduce((acc, r) => ({
    baseSalary: acc.baseSalary + r.baseSalary,
    overtime: acc.overtime + r.overtimeHours,
    cp: acc.cp + r.cpDays,
    sick: acc.sick + r.sickDays,
    bonuses: acc.bonuses + r.bonuses,
    expenses: acc.expenses + r.expenses,
    totalGross: acc.totalGross + r.totalGross,
  }), { baseSalary: 0, overtime: 0, cp: 0, sick: 0, bonuses: 0, expenses: 0, totalGross: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Variables de paie</h1>
          <p className="text-slate-500 text-sm">Export mensuel pour transmission au logiciel de paie.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input" />
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="input">
            <option value="">Toutes sociétés</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
          </select>
          <button onClick={exportCsv} className="btn btn-secondary"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={exportSilae} className="btn btn-secondary"><Download className="w-4 h-4" /> Silae</button>
          <button onClick={generatePayslips} className="btn btn-primary"><RefreshCw className="w-4 h-4" /> Générer bulletins</button>
        </div>
      </div>

      {genResult && <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3 text-sm">{genResult}</div>}

      <div className="grid sm:grid-cols-4 gap-3">
        {[['Collaborateurs', rows.length, 'text-brand-700'],
          ['H. sup totales', totals.overtime.toFixed(1) + 'h', 'text-amber-700'],
          ['Total primes', totals.bonuses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'text-emerald-700'],
          ['Brut total', totals.totalGross.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'text-purple-700']].map(([l, v, c]: any) => (
          <Card key={l}><CardBody className="!p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold">{l}</div>
            <div className={`text-2xl font-bold mt-1 ${c}`}>{v}</div>
          </CardBody></Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {['Matricule', 'Nom', 'Société', 'Brut base', 'Jours trav.', 'H. trav.', 'H. sup.', 'CP', 'RTT', 'MAL', 'Tickets', 'Primes', 'Frais', 'Brut total'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase font-semibold text-slate-500 px-2 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={14} className="text-center py-6 text-slate-400">Chargement…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-6 text-slate-400">Aucun salarié</td></tr>
              ) : rows.map((r) => (
                <tr key={r.employeeId} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-2 py-2 font-mono">{r.matricule}</td>
                  <td className="px-2 py-2 font-medium">{r.firstName} {r.lastName}</td>
                  <td className="px-2 py-2"><span className="badge badge-blue">{r.companyCode}</span></td>
                  <td className="px-2 py-2">{r.baseSalary.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-2 py-2">{r.workedDays}</td>
                  <td className="px-2 py-2">{r.workedHours.toFixed(1)}</td>
                  <td className={`px-2 py-2 ${r.overtimeHours > 0 ? 'text-amber-700 font-semibold' : ''}`}>{r.overtimeHours.toFixed(1)}</td>
                  <td className="px-2 py-2">{r.cpDays}</td>
                  <td className="px-2 py-2">{r.rttDays}</td>
                  <td className={`px-2 py-2 ${r.sickDays > 0 ? 'text-red-700 font-semibold' : ''}`}>{r.sickDays}</td>
                  <td className="px-2 py-2">{r.mealVouchersCount}</td>
                  <td className={`px-2 py-2 ${r.bonuses > 0 ? 'text-emerald-700' : ''}`}>{r.bonuses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-2 py-2">{r.expenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-2 py-2 font-semibold">{r.totalGross.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Primes & retenues */}
      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold">Primes et retenues du mois</h3>
          <button onClick={addPrime} className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
        <CardBody>
          {extras.length === 0 ? <p className="text-sm text-slate-500">Aucune prime/retenue ce mois</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Salarié</th><th>Type</th><th>Libellé</th><th>Montant</th><th></th>
              </tr></thead>
              <tbody>
                {extras.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="py-2">{e.employee?.firstName} {e.employee?.lastName}</td>
                    <td><span className={`badge ${e.type === 'prime' ? 'badge-green' : 'badge-red'}`}>{e.type}</span></td>
                    <td>{e.label}</td>
                    <td className={`font-semibold ${e.type === 'prime' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {e.type === 'prime' ? '+' : '-'}{e.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td><button onClick={() => deleteVar(e.id)} className="text-red-600 hover:underline text-xs">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
