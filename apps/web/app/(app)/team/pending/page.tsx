'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, X, Calendar, Clock, Receipt } from 'lucide-react';

export default function PendingValidationsPage() {
  const [me, setMe] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    load(u);
  }, []);

  function load(u: any) {
    const params = new URLSearchParams();
    if (u.role === 'manager' && u.employee?.id) params.set('managerId', u.employee.id);
    if ((u.role === 'rh' || u.role === 'admin') && u.tenantId) params.set('tenantId', u.tenantId);
    api.get(`/team/pending?${params}`).then(setData);
  }

  async function actLeave(id: string, verb: 'approve' | 'reject') {
    const body = verb === 'reject' ? { reason: prompt('Motif du refus ?') || '' } : undefined;
    try { await api.patch(`/leaves/${id}/${verb}`, body); load(me); } catch (e: any) { alert(e.message); }
  }
  async function actExpense(id: string, verb: 'approve' | 'reject') {
    const body = verb === 'reject' ? { reason: prompt('Motif ?') || '' } : undefined;
    try { await api.patch(`/expense-reports/${id}/${verb}`, body); load(me); } catch (e: any) { alert(e.message); }
  }
  async function actOvertime(id: string, verb: 'approve' | 'reject') {
    const body = verb === 'reject' ? { reason: prompt('Motif ?') || '' } : undefined;
    try { await api.patch(`/overtime-requests/${id}/${verb}`, body); load(me); } catch (e: any) { alert(e.message); }
  }

  if (!data) return <div className="text-slate-500">Chargement…</div>;

  const total = data.leaves.length + data.overtime.length + data.expenses.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Validations en attente ({total})</h1>
        <p className="text-slate-500 text-sm">Toutes les demandes en attente de votre validation regroupées.</p>
      </div>

      {/* Congés */}
      <Card>
        <CardHeader><CardTitle><Calendar className="inline w-5 h-5 mr-2 text-brand-600" /> Congés ({data.leaves.length})</CardTitle></CardHeader>
        <CardBody>
          {data.leaves.length === 0 ? <p className="text-sm text-slate-500">Aucune demande</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Collaborateur</th><th>Type</th><th>Période</th><th>Durée</th><th>Motif</th><th></th>
              </tr></thead>
              <tbody>
                {data.leaves.map((l: any) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2">{l.employee?.firstName} {l.employee?.lastName}</td>
                    <td><span className="badge" style={{ background: (l.type?.color || '#999') + '20', color: l.type?.color }}>{l.type?.code}</span></td>
                    <td className="text-xs">{new Date(l.startDate).toLocaleDateString('fr-FR')} → {new Date(l.endDate).toLocaleDateString('fr-FR')}</td>
                    <td className="font-semibold">{l.days}j</td>
                    <td className="text-slate-600 text-xs">{l.reason || '—'}</td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => actLeave(l.id, 'approve')} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => actLeave(l.id, 'reject')} className="p-1.5 rounded hover:bg-red-100 text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Heures sup */}
      <Card>
        <CardHeader><CardTitle><Clock className="inline w-5 h-5 mr-2 text-amber-600" /> Heures supplémentaires ({data.overtime.length})</CardTitle></CardHeader>
        <CardBody>
          {data.overtime.length === 0 ? <p className="text-sm text-slate-500">Aucune demande</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Collaborateur</th><th>Date</th><th>Heures</th><th>Motif</th><th></th>
              </tr></thead>
              <tbody>
                {data.overtime.map((o: any) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2">{o.employee?.firstName} {o.employee?.lastName}</td>
                    <td>{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                    <td className="font-semibold">{o.hours}h</td>
                    <td className="text-slate-600 text-xs">{o.reason}</td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => actOvertime(o.id, 'approve')} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => actOvertime(o.id, 'reject')} className="p-1.5 rounded hover:bg-red-100 text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Notes de frais */}
      <Card>
        <CardHeader><CardTitle><Receipt className="inline w-5 h-5 mr-2 text-emerald-600" /> Notes de frais ({data.expenses.length})</CardTitle></CardHeader>
        <CardBody>
          {data.expenses.length === 0 ? <p className="text-sm text-slate-500">Aucune demande</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Collaborateur</th><th>Période</th><th>Lignes</th><th>Total</th><th></th>
              </tr></thead>
              <tbody>
                {data.expenses.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2">{e.employee?.firstName} {e.employee?.lastName}</td>
                    <td>{e.periodMonth}</td>
                    <td>{e.lines?.length}</td>
                    <td className="font-semibold">{e.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => actExpense(e.id, 'approve')} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => actExpense(e.id, 'reject')} className="p-1.5 rounded hover:bg-red-100 text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
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
