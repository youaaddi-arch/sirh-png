'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, Receipt, FileText, BookOpen } from 'lucide-react';
import type { Leave, LeaveBalance, ExpenseReport, Timesheet } from '@/types/leave';

export default function MySpacePage() {
  const [me, setMe] = useState<any>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [expenses, setExpenses] = useState<ExpenseReport[]>([]);
  const [onboarding, setOnboarding] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    if (u.employee?.id) {
      api.get<LeaveBalance[]>(`/leaves/balance/${u.employee.id}`).then(setBalances).catch(() => {});
      api.get<Leave[]>(`/leaves?employeeId=${u.employee.id}`).then((l) => setLeaves(l.slice(0, 5))).catch(() => {});
      api.get<ExpenseReport[]>(`/expense-reports?employeeId=${u.employee.id}`).then((l) => setExpenses(l.slice(0, 5))).catch(() => {});
      api.get(`/onboarding/by-employee/${u.employee.id}`).then(setOnboarding).catch(() => {});
    }
  }, []);

  async function clock() {
    if (!me?.employee?.id) return;
    try {
      await api.post(`/timesheets/clock/${me.employee.id}`);
      alert('Pointage enregistré ✓');
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <h1 className="text-2xl font-bold">Bonjour {me?.employee?.firstName || me?.email?.split('@')[0]} 👋</h1>
        <p className="text-brand-100 mt-1">{me?.employee?.jobTitle}</p>
        <div className="mt-4">
          <button onClick={clock} className="btn bg-white text-brand-700 hover:bg-slate-100">
            <Clock className="w-4 h-4" /> Pointer (arrivée / départ)
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction href="/leaves" icon={Calendar} color="bg-brand-100 text-brand-700" label="Poser un congé" />
        <QuickAction href="/timesheets" icon={Clock} color="bg-amber-100 text-amber-700" label="Saisir mon temps" />
        <QuickAction href="/expenses" icon={Receipt} color="bg-emerald-100 text-emerald-700" label="Note de frais" />
        <QuickAction href="/trainings" icon={BookOpen} color="bg-purple-100 text-purple-700" label="Mes formations" />
      </div>

      {/* Soldes congés */}
      {balances.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Mes soldes de congés</CardTitle></CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {balances.map((b) => {
                const r = b.acquired - b.taken - b.pending;
                return (
                  <div key={b.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{b.type?.name}</span>
                      <span className="w-3 h-3 rounded-full" style={{ background: b.type?.color }} />
                    </div>
                    <div className="text-2xl font-bold">{r.toFixed(1)}<span className="text-sm font-normal text-slate-500"> / {b.acquired}j</span></div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mes congés */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Mes dernières demandes de congés</CardTitle>
            <Link href="/leaves" className="text-sm text-brand-600 hover:underline">Voir tout →</Link>
          </CardHeader>
          <CardBody>
            {leaves.length === 0 ? <p className="text-sm text-slate-500">Aucune demande</p> : (
              <ul className="space-y-2 text-sm">
                {leaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                    <div>
                      <span className="badge" style={{ background: (l.type?.color || '#999') + '20', color: l.type?.color }}>{l.type?.code}</span>
                      <span className="ml-2">{new Date(l.startDate).toLocaleDateString('fr-FR')} → {new Date(l.endDate).toLocaleDateString('fr-FR')} ({l.days}j)</span>
                    </div>
                    <Badge variant={l.status === 'approuve' ? 'green' : l.status === 'refuse' ? 'red' : 'amber'}>{l.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Notes de frais */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Mes notes de frais</CardTitle>
            <Link href="/expenses" className="text-sm text-brand-600 hover:underline">Voir tout →</Link>
          </CardHeader>
          <CardBody>
            {expenses.length === 0 ? <p className="text-sm text-slate-500">Aucune note</p> : (
              <ul className="space-y-2 text-sm">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                    <div>
                      <span className="font-medium">{e.periodMonth}</span>
                      <span className="text-slate-500 ml-2">{e.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <Badge variant={e.status === 'rembourse' ? 'green' : e.status === 'soumis' ? 'amber' : 'gray'}>{e.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Onboarding en cours */}
      {onboarding && onboarding.status === 'en_cours' && (
        <Card>
          <CardHeader><CardTitle>Mon parcours d'intégration</CardTitle></CardHeader>
          <CardBody>
            <p className="text-sm text-slate-600 mb-2">
              {onboarding.tasks.filter((t: any) => t.done).length} sur {onboarding.tasks.length} tâches complétées
            </p>
            <Link href={`/onboarding/${onboarding.id}`} className="btn btn-primary"><FileText className="w-4 h-4" /> Voir ma checklist</Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function QuickAction({ href, icon: Icon, color, label }: any) {
  return (
    <Link href={href} className="card card-hover p-4 flex items-center gap-3 transition hover:shadow-md">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-medium text-slate-700">{label}</div>
    </Link>
  );
}
