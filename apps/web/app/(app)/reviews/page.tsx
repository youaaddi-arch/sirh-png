'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Star } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  annuel: 'Annuel',
  professionnel: 'Professionnel (2 ans)',
  periode_essai: 'Période d\'essai',
  '360': '360°',
};
const STATUS_META: any = {
  planifie: { label: 'Planifié', variant: 'amber' },
  en_cours: { label: 'En cours', variant: 'blue' },
  realise: { label: 'Réalisé', variant: 'green' },
  signe: { label: 'Signé', variant: 'purple' },
  annule: { label: 'Annulé', variant: 'red' },
};

export default function ReviewsPage() {
  const [me, setMe] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    api.get<any[]>('/reviews/templates').then(setTemplates);
    api.get<any[]>('/employees').then(setEmployees).catch(() => {});
  }, []);

  function reload() {
    if (!me) return;
    const q = new URLSearchParams();
    if (me.role === 'employe' && me.employee?.id) q.set('employeeId', me.employee.id);
    if (me.role === 'manager' && me.employee?.id) q.set('reviewerId', me.employee.id);
    if ((me.role === 'rh' || me.role === 'admin') && me.tenantId) q.set('tenantId', me.tenantId);
    api.get<any[]>(`/reviews?${q}`).then(setList);
  }
  useEffect(reload, [me]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Entretiens</h1>
          <p className="text-slate-500 text-sm">Planification, conduite et signature des entretiens d'évaluation.</p>
        </div>
        {(me?.role === 'manager' || me?.role === 'rh' || me?.role === 'admin') && (
          <button onClick={() => setShow(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Planifier un entretien</button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Salarié</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Type</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Date prévue</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Évaluateur</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Note</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Aucun entretien</td></tr>
              ) : list.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{r.employee?.firstName} {r.employee?.lastName}</td>
                  <td className="px-4 py-3"><Badge variant="blue">{TYPE_LABEL[r.type] || r.type}</Badge></td>
                  <td className="px-4 py-3 text-xs">{r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3">{r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : '—'}</td>
                  <td className="px-4 py-3">{r.overallRating ? '⭐'.repeat(r.overallRating) : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_META[r.status].variant}>{STATUS_META[r.status].label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/reviews/${r.id}`} className="text-brand-600 hover:underline text-xs">Ouvrir →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {show && <ScheduleModal employees={employees} templates={templates} me={me} onClose={() => { setShow(false); reload(); }} />}
    </div>
  );
}

function ScheduleModal({ employees, templates, me, onClose }: any) {
  const [employeeId, setEmployeeId] = useState('');
  const [reviewerId, setReviewerId] = useState(me?.employee?.id || '');
  const [type, setType] = useState('annuel');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      await api.post('/reviews', { employeeId, reviewerId, type, scheduledAt });
      onClose();
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200"><h3 className="font-semibold text-lg">Planifier un entretien</h3></div>
        <div className="p-5 space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <div>
            <label className="label">Salarié</label>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="input">
              <option value="">—</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.jobTitle}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Évaluateur</label>
            <select required value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} className="input">
              <option value="">—</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type d'entretien</label>
            <select required value={type} onChange={(e) => setType(e.target.value)} className="input">
              {templates.map((t: any) => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date prévue</label>
            <input type="date" required value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input" />
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" className="btn btn-primary">Planifier</button>
        </div>
      </form>
    </div>
  );
}
