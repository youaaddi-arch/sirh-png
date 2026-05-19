'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Check, X, Calendar } from 'lucide-react';
import type { Leave, LeaveBalance, LeaveType, Holiday } from '@/types/leave';

const STATUS_META: Record<string, { label: string; variant: any }> = {
  en_attente: { label: 'En attente', variant: 'amber' },
  approuve:   { label: 'Approuvé',   variant: 'green' },
  refuse:     { label: 'Refusé',     variant: 'red' },
  annule:     { label: 'Annulé',     variant: 'gray' },
};

export default function LeavesPage() {
  const [me, setMe] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<'mine' | 'team' | 'all'>('mine');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    api.get<LeaveType[]>('/leaves/types').then(setTypes);
    api.get<Holiday[]>('/leaves/holidays').then(setHolidays);
    api.get<any[]>('/employees').then(setEmployees).catch(() => {});
    if (u.employee?.id) {
      api.get<LeaveBalance[]>(`/leaves/balance/${u.employee.id}`).then(setBalances);
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    const params = new URLSearchParams();
    if (filter === 'mine' && me.employee?.id) params.set('employeeId', me.employee.id);
    if (filter === 'team' && me.employee?.id) params.set('managerId', me.employee.id);
    api.get<Leave[]>(`/leaves?${params}`).then(setLeaves);
  }, [me, filter]);

  function reload() {
    if (!me) return;
    const params = new URLSearchParams();
    if (filter === 'mine' && me.employee?.id) params.set('employeeId', me.employee.id);
    if (filter === 'team' && me.employee?.id) params.set('managerId', me.employee.id);
    api.get<Leave[]>(`/leaves?${params}`).then(setLeaves);
    if (me.employee?.id) api.get<LeaveBalance[]>(`/leaves/balance/${me.employee.id}`).then(setBalances);
  }

  async function approve(id: string) {
    try { await api.patch(`/leaves/${id}/approve`); reload(); } catch (e: any) { alert(e.message); }
  }
  async function reject(id: string) {
    const reason = prompt('Motif du refus ?') || undefined;
    try { await api.patch(`/leaves/${id}/reject`, { reason }); reload(); } catch (e: any) { alert(e.message); }
  }
  async function cancel(id: string) {
    if (!confirm('Annuler cette demande ?')) return;
    try { await api.patch(`/leaves/${id}/cancel`); reload(); } catch (e: any) { alert(e.message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Congés &amp; absences</h1>
          <p className="text-slate-500 text-sm">Demandes, soldes et calendrier d'absences.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Nouvelle demande</button>
      </div>

      {/* Soldes */}
      {balances.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {balances.map((b) => {
            const remaining = b.acquired - b.taken - b.pending;
            return (
              <Card key={b.id}><CardBody className="!p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{b.type?.name}</span>
                  <span className="w-3 h-3 rounded-full" style={{ background: b.type?.color }} />
                </div>
                <div className="text-2xl font-bold mt-2">{remaining.toFixed(1)}<span className="text-sm font-normal text-slate-500"> / {b.acquired}j</span></div>
                <div className="bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="h-full" style={{ width: `${(b.taken / b.acquired) * 100}%`, background: b.type?.color }} />
                </div>
                <div className="text-xs text-slate-500 mt-1">Pris : {b.taken}j • En attente : {b.pending}j</div>
              </CardBody></Card>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-white">
        <button onClick={() => setFilter('mine')} className={`px-4 py-2 text-sm ${filter === 'mine' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>Mes demandes</button>
        {(me?.role === 'manager' || me?.role === 'rh' || me?.role === 'admin') && (
          <button onClick={() => setFilter('team')} className={`px-4 py-2 text-sm ${filter === 'team' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>Mon équipe</button>
        )}
        {(me?.role === 'rh' || me?.role === 'admin') && (
          <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>Toutes</button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Collaborateur</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Type</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Période</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Durée</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Motif</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Aucune demande</td></tr>
              ) : leaves.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{l.employee?.firstName} {l.employee?.lastName}</td>
                  <td className="px-4 py-3">
                    <span className="badge" style={{ background: (l.type?.color || '#999') + '20', color: l.type?.color }}>{l.type?.code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(l.startDate).toLocaleDateString('fr-FR')} → {new Date(l.endDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 font-semibold">{l.days}j</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{l.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_META[l.status].variant}>{STATUS_META[l.status].label}</Badge>
                    {l.rejectReason && <div className="text-xs text-red-500 mt-1">{l.rejectReason}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {l.status === 'en_attente' && filter !== 'mine' && (
                        <>
                          <button onClick={() => approve(l.id)} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600" title="Approuver"><Check className="w-4 h-4" /></button>
                          <button onClick={() => reject(l.id)} className="p-1.5 rounded hover:bg-red-100 text-red-600" title="Refuser"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      {l.status === 'en_attente' && filter === 'mine' && (
                        <button onClick={() => cancel(l.id)} className="text-xs text-slate-500 hover:text-red-600">Annuler</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Jours fériés à venir */}
      {holidays.length > 0 && (
        <Card>
          <CardHeader><CardTitle><Calendar className="inline w-5 h-5 mr-2" /> Jours fériés {new Date().getFullYear()}</CardTitle></CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
              {holidays.map((h) => (
                <div key={h.date} className="flex justify-between p-2 bg-slate-50 rounded">
                  <span>{h.name}</span>
                  <span className="text-slate-500">{new Date(h.date).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {showNew && <NewLeaveModal me={me} types={types} employees={employees} onClose={() => { setShowNew(false); reload(); }} />}
    </div>
  );
}

function NewLeaveModal({ me, types, employees, onClose }: any) {
  const today = new Date().toISOString().slice(0, 10);
  const [employeeId, setEmployeeId] = useState(me?.employee?.id || '');
  const [typeId, setTypeId] = useState(types[0]?.id || '');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const canSelectOther = ['manager', 'rh', 'admin'].includes(me?.role);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/leaves', { employeeId, typeId, startDate, endDate, reason });
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200"><h3 className="font-semibold text-lg">Nouvelle demande de congé</h3></div>
        <div className="p-5 space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          {canSelectOther && (
            <div>
              <label className="label">Collaborateur</label>
              <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="input">
                <option value="">—</option>
                {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Type de congé</label>
            <select required value={typeId} onChange={(e) => setTypeId(e.target.value)} className="input">
              {types.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date début</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Date fin</label>
              <input type="date" required value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Motif (optionnel)</label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="input" placeholder="Ex. vacances été" />
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Envoi…' : 'Envoyer la demande'}</button>
        </div>
      </form>
    </div>
  );
}
