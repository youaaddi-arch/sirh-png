'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UserCheck, ClipboardList, Settings } from 'lucide-react';
import type { Onboarding } from '@/types/onboarding';

export default function OnboardingPage() {
  const [list, setList] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Onboarding[]>('/onboarding').then(setList).finally(() => setLoading(false));
  }, []);

  const enCours = list.filter((o) => o.status === 'en_cours');
  const termines = list.filter((o) => o.status === 'termine');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Onboarding</h1>
          <p className="text-slate-500 text-sm">
            Parcours d'intégration personnalisés selon le poste, déclenchés automatiquement après signature du contrat.
          </p>
        </div>
        <Link href="/onboarding/templates" className="btn btn-secondary">
          <Settings className="w-4 h-4" /> Voir les templates
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center"><UserCheck className="w-5 h-5" /></div>
          <div><div className="text-xs uppercase text-slate-500 font-semibold">Total</div><div className="text-2xl font-bold">{list.length}</div></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div>
          <div><div className="text-xs uppercase text-slate-500 font-semibold">En cours</div><div className="text-2xl font-bold text-amber-700">{enCours.length}</div></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><UserCheck className="w-5 h-5" /></div>
          <div><div className="text-xs uppercase text-slate-500 font-semibold">Terminés</div><div className="text-2xl font-bold text-emerald-700">{termines.length}</div></div>
        </CardBody></Card>
      </div>

      {loading ? (
        <Card><CardBody><div className="text-slate-500 text-center py-10">Chargement…</div></CardBody></Card>
      ) : list.length === 0 ? (
        <Card><CardBody>
          <div className="text-center py-12 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-2" />
            <p>Aucun onboarding en cours.</p>
            <p className="text-sm mt-2">Les onboardings démarrent automatiquement après la signature d'un contrat depuis <Link href="/hiring" className="text-brand-600 hover:underline">/hiring</Link>.</p>
          </div>
        </CardBody></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Collaborateur</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Poste</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Société</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Démarré le</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Progression</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => {
                  const done = o.tasks.filter((t) => t.done).length;
                  const total = o.tasks.length;
                  const pct = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.employee?.firstName} {o.employee?.lastName}</div>
                        <div className="text-xs text-slate-500">{o.employee?.email}</div>
                      </td>
                      <td className="px-4 py-3">{o.employee?.jobTitle}</td>
                      <td className="px-4 py-3">{o.employee?.tenant && <Badge variant="purple">{o.employee.tenant.code}</Badge>}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.startDate).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[120px] bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{done}/{total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={o.status === 'termine' ? 'green' : 'amber'}>{o.status === 'termine' ? 'Terminé' : 'En cours'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/onboarding/${o.id}`} className="text-brand-600 hover:underline text-xs">Voir détail →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
