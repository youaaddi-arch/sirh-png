'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users, Calendar, Receipt, Clock, AlertCircle,
  TrendingUp, Cake, FileText, Check, X, ArrowRight,
} from 'lucide-react';

interface Stats {
  totalEmployees: number;
  pendingLeaves: number;
  pendingOvertime: number;
  pendingExpenses: number;
  todayAbsent: number;
  upcomingLeaves: number;
  expiringContracts: number;
  birthdaysMonth: number;
}

interface PendingPayload {
  leaves: any[];
  overtime: any[];
  expenses: any[];
}

export default function DashboardPage() {
  const [me, setMe] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingPayload | null>(null);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    load(u);
  }, []);

  function load(u: any) {
    const params = new URLSearchParams();
    if (u.role === 'manager' && u.employee?.id) params.set('managerId', u.employee.id);
    if ((u.role === 'rh' || u.role === 'paie') && u.tenantId) params.set('tenantId', u.tenantId);
    const q = params.toString() ? '?' + params : '';

    Promise.all([
      api.get<Stats>(`/team/stats${q}`).catch(() => null),
      api.get<PendingPayload>(`/team/pending${q}`).catch(() => null),
      api.get<any[]>(`/team/birthdays${q}`).catch(() => []),
    ]).then(([s, p, b]) => {
      setStats(s);
      setPending(p);
      setBirthdays(b || []);
    }).finally(() => setLoading(false));
  }

  async function approveLeave(id: string) {
    try { await api.patch(`/leaves/${id}/approve`); load(me); } catch (e: any) { alert(e.message); }
  }
  async function rejectLeave(id: string) {
    const reason = prompt('Motif du refus ?') || undefined;
    try { await api.patch(`/leaves/${id}/reject`, { reason }); load(me); } catch (e: any) { alert(e.message); }
  }
  async function approveExpense(id: string) {
    try { await api.patch(`/expense-reports/${id}/approve`); load(me); } catch (e: any) { alert(e.message); }
  }
  async function approveOvertime(id: string) {
    try { await api.patch(`/overtime-requests/${id}/approve`); load(me); } catch (e: any) { alert(e.message); }
  }

  if (loading) return <div className="text-slate-500">Chargement…</div>;

  const totalPending = (pending?.leaves.length || 0) + (pending?.overtime.length || 0) + (pending?.expenses.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 text-sm">
            {me?.role === 'manager' ? 'Vue de votre équipe directe.' :
             me?.role === 'rh' ? 'Vue RH consolidée.' :
             me?.role === 'admin' ? 'Vue administrateur.' : 'Aperçu de votre activité.'}
          </p>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Effectif" value={stats?.totalEmployees} icon={Users} color="brand" />
        <Kpi label="À valider" value={totalPending} icon={AlertCircle} color="amber" />
        <Kpi label="Absents aujourd'hui" value={stats?.todayAbsent} icon={Calendar} color="pink" />
        <Kpi label="Absences à venir (30j)" value={stats?.upcomingLeaves} icon={TrendingUp} color="purple" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Congés en attente" value={stats?.pendingLeaves} icon={Calendar} color="amber" />
        <Kpi label="Heures sup en attente" value={stats?.pendingOvertime} icon={Clock} color="cyan" />
        <Kpi label="Notes de frais à valider" value={stats?.pendingExpenses} icon={Receipt} color="emerald" />
        <Kpi label="CDD expirants (90j)" value={stats?.expiringContracts} icon={FileText} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Validations à faire — gros bloc */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>À valider ({totalPending})</CardTitle>
            <Link href="/team/pending" className="text-sm text-brand-600 hover:underline">Voir tout →</Link>
          </CardHeader>
          <CardBody>
            {totalPending === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Aucune validation en attente 🎉</p>
            ) : (
              <div className="space-y-3">
                {pending?.leaves.slice(0, 3).map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{l.employee?.firstName} {l.employee?.lastName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="badge" style={{ background: (l.type?.color || '#999') + '20', color: l.type?.color }}>{l.type?.code}</span>
                        {new Date(l.startDate).toLocaleDateString('fr-FR')} → {new Date(l.endDate).toLocaleDateString('fr-FR')} ({l.days}j)
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => approveLeave(l.id)} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                      <button onClick={() => rejectLeave(l.id)} className="p-1.5 rounded hover:bg-red-100 text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {pending?.expenses.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{e.employee?.firstName} {e.employee?.lastName}</div>
                      <div className="text-xs text-slate-500">
                        <Receipt className="inline w-3 h-3 mr-1" />
                        Note {e.periodMonth} • <strong>{e.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong>
                      </div>
                    </div>
                    <button onClick={() => approveExpense(e.id)} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                  </div>
                ))}
                {pending?.overtime.slice(0, 2).map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{o.employee?.firstName} {o.employee?.lastName}</div>
                      <div className="text-xs text-slate-500">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {o.hours}h supp le {new Date(o.date).toLocaleDateString('fr-FR')} — {o.reason}
                      </div>
                    </div>
                    <button onClick={() => approveOvertime(o.id)} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Anniversaires */}
        <Card>
          <CardHeader><CardTitle><Cake className="inline w-5 h-5 mr-2 text-pink-500" /> Anniversaires du mois</CardTitle></CardHeader>
          <CardBody>
            {birthdays.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun anniversaire ce mois-ci.</p>
            ) : (
              <ul className="space-y-2">
                {birthdays.map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{b.firstName} {b.lastName}</div>
                      <div className="text-xs text-slate-500">{b.jobTitle}</div>
                    </div>
                    <Badge variant="pink">{new Date(b.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink href="/team/planning" label="Planning équipe" icon={Calendar} />
        <QuickLink href="/employees" label="Collaborateurs" icon={Users} />
        <QuickLink href="/hiring" label="Embauches" icon={ArrowRight} />
        <QuickLink href="/team/pending" label="Toutes les validations" icon={AlertCircle} />
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, color }: { label: string; value?: number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || 'bg-slate-100'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{value ?? '—'}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <Link href={href} className="card p-4 flex items-center gap-3 hover:shadow-md transition">
      <Icon className="w-5 h-5 text-brand-600" />
      <span className="font-medium text-slate-700">{label}</span>
    </Link>
  );
}
