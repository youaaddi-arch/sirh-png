'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Download } from 'lucide-react';

export default function PayrollPage() {
  const [month, setMonth] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
  }, []);

  function reload() {
    const q = new URLSearchParams();
    if (month) q.set('month', month);
    if (me?.role === 'employe' && me?.employee?.id) q.set('employeeId', me.employee.id);
    if ((me?.role === 'rh' || me?.role === 'paie') && me?.tenantId) q.set('tenantId', me.tenantId);
    api.get<any[]>(`/payroll/payslips?${q}`).then(setList);
  }
  useEffect(reload, [me, month]);

  const totals = list.reduce((acc, p) => ({
    gross: acc.gross + p.gross, charges: acc.charges + p.socialCharges,
    net: acc.net + p.net, cost: acc.cost + p.employerCost,
  }), { gross: 0, charges: 0, net: 0, cost: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulletins de paie</h1>
          <p className="text-slate-500 text-sm">Historique des bulletins édités.</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input" placeholder="Tous mois" />
      </div>

      {list.length > 0 && (
        <div className="grid sm:grid-cols-4 gap-3">
          {[['Bulletins', list.length, 'text-brand-700'],
            ['Brut total', totals.gross.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'text-emerald-700'],
            ['Charges', totals.charges.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'text-amber-700'],
            ['Coût employeur', totals.cost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'text-purple-700']].map(([l, v, c]: any) => (
            <Card key={l}><CardBody className="!p-4">
              <div className="text-xs uppercase text-slate-500 font-semibold">{l}</div>
              <div className={`text-2xl font-bold mt-1 ${c}`}>{v}</div>
            </CardBody></Card>
          ))}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Mois</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Salarié</th>
                <th className="text-right text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Brut</th>
                <th className="text-right text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Charges</th>
                <th className="text-right text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Net</th>
                <th className="text-right text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Coût employeur</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Aucun bulletin</td></tr>
              ) : list.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.month}</td>
                  <td className="px-4 py-3">{p.employee?.firstName} {p.employee?.lastName}</td>
                  <td className="px-4 py-3 text-right">{p.gross.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.socialCharges.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{p.net.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p.employerCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-4 py-3"><Badge variant="green">{p.status}</Badge></td>
                  <td className="px-4 py-3 text-right"><button className="text-brand-600 hover:underline text-xs flex items-center gap-1"><Download className="w-3 h-3" /> PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
