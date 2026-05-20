'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Check, X, Euro } from 'lucide-react';
import type { ExpenseReport } from '@/types/leave';

const STATUS_META: any = {
  brouillon: { label: 'Brouillon', variant: 'gray' },
  soumis:    { label: 'Soumis',    variant: 'amber' },
  approuve:  { label: 'Approuvé',  variant: 'green' },
  refuse:    { label: 'Refusé',    variant: 'red' },
  rembourse: { label: 'Remboursé', variant: 'purple' },
};

export default function ExpensesPage() {
  const [me, setMe] = useState<any>(null);
  const [list, setList] = useState<ExpenseReport[]>([]);
  const [filter, setFilter] = useState<'mine' | 'team'>('mine');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
  }, []);

  function reload() {
    if (!me) return;
    const p = new URLSearchParams();
    if (filter === 'mine' && me.employee?.id) p.set('employeeId', me.employee.id);
    if (filter === 'team' && me.employee?.id) p.set('managerId', me.employee.id);
    api.get<ExpenseReport[]>(`/expense-reports?${p}`).then(setList);
  }
  useEffect(reload, [me, filter]);

  async function action(id: string, verb: 'submit' | 'approve' | 'reject' | 'reimburse') {
    try {
      await api.patch(`/expense-reports/${id}/${verb}`,
        verb === 'reject' ? { reason: prompt('Motif ?') || '' } : {});
      reload();
    } catch (e: any) { alert(e.message); }
  }

  async function createReport() {
    if (!me?.employee?.id) return;
    const month = new Date().toISOString().slice(0, 7);
    const r = await api.post<ExpenseReport>('/expense-reports', { employeeId: me.employee.id, periodMonth: month });
    window.location.href = `/expenses/${r.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notes de frais</h1>
          <p className="text-slate-500 text-sm">Soumission, validation et remboursement des frais professionnels.</p>
        </div>
        <button onClick={createReport} className="btn btn-primary"><Plus className="w-4 h-4" /> Nouvelle note</button>
      </div>

      <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-white">
        <button onClick={() => setFilter('mine')} className={`px-4 py-2 text-sm ${filter === 'mine' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>Mes notes</button>
        {(me?.role === 'manager' || me?.role === 'rh' || me?.role === 'admin') && (
          <button onClick={() => setFilter('team')} className={`px-4 py-2 text-sm ${filter === 'team' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>Mon équipe</button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Salarié</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Période</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Lignes</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Total</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Aucune note</td></tr>
              ) : list.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{r.employee?.firstName} {r.employee?.lastName}</td>
                  <td className="px-4 py-3">{r.periodMonth}</td>
                  <td className="px-4 py-3">{r.lines.length}</td>
                  <td className="px-4 py-3 font-semibold">{r.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_META[r.status].variant}>{STATUS_META[r.status].label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {r.status === 'brouillon' && filter === 'mine' && (
                        <button onClick={() => action(r.id, 'submit')} className="text-xs text-brand-600 hover:underline">Soumettre</button>
                      )}
                      {r.status === 'soumis' && filter !== 'mine' && (
                        <>
                          <button onClick={() => action(r.id, 'approve')} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                          <button onClick={() => action(r.id, 'reject')} className="p-1.5 rounded hover:bg-red-100 text-red-600"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      {r.status === 'approuve' && (me?.role === 'admin' || me?.role === 'paie') && (
                        <button onClick={() => action(r.id, 'reimburse')} className="text-xs text-purple-600 hover:underline">Marquer remboursé</button>
                      )}
                      <Link href={`/expenses/${r.id}`} className="text-xs text-brand-600 hover:underline ml-2">Détail →</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
