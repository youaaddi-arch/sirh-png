'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function AlertsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    const q = new URLSearchParams();
    if (u.role === 'manager' && u.employee?.id) q.set('managerId', u.employee.id);
    if (u.tenantId) q.set('tenantId', u.tenantId);
    q.set('role', u.role);
    api.get<any[]>(`/alerts?${q}`).then(setList).finally(() => setLoading(false));
  }, []);

  const grouped = list.reduce<Record<string, any[]>>((acc, a) => {
    (acc[a.severity] = acc[a.severity] || []).push(a); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alertes RH</h1>
        <p className="text-slate-500 text-sm">Cycle de vie des salariés : périodes d'essai, CDD, tests à renouveler.</p>
      </div>

      {loading ? <div className="text-slate-500">Chargement…</div> : list.length === 0 ? (
        <Card><CardBody className="text-center py-12 text-slate-400">Aucune alerte 🎉</CardBody></Card>
      ) : (
        <>
          {grouped.critical?.length > 0 && (
            <AlertGroup title="Critiques" alerts={grouped.critical} icon={AlertTriangle} color="red" />
          )}
          {grouped.warning?.length > 0 && (
            <AlertGroup title="Avertissements" alerts={grouped.warning} icon={AlertCircle} color="amber" />
          )}
          {grouped.info?.length > 0 && (
            <AlertGroup title="Informations" alerts={grouped.info} icon={Info} color="blue" />
          )}
        </>
      )}
    </div>
  );
}

function AlertGroup({ title, alerts, icon: Icon, color }: any) {
  const colors: any = {
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <Icon className={`w-5 h-5 text-${color}-500`} /> {title} ({alerts.length})
      </h2>
      <div className="space-y-2">
        {alerts.map((a: any, i: number) => (
          <div key={i} className={`border-l-4 rounded-r p-3 ${colors[color]}`}>
            <div className="font-semibold">{a.title}</div>
            <div className="text-sm">{a.body}</div>
            {a.dueDate && <div className="text-xs mt-1">Échéance : {new Date(a.dueDate).toLocaleDateString('fr-FR')}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
