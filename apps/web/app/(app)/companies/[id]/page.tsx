'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { api } from '@/lib/api';
import type { Tenant, Convention } from '@/types/tenant';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Building2, Calendar, RefreshCw } from 'lucide-react';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [stats, setStats] = useState<{ employees: number; departments: number } | null>(null);
  const [convention, setConvention] = useState<Convention | null>(null);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Tenant>(`/tenants/${id}`).then(setTenant),
      api.get<{ employees: number; departments: number }>(`/tenants/${id}/stats`).then(setStats),
      api.get<Convention>(`/tenants/${id}/convention`).then(setConvention).catch(() => {}),
    ]).catch((e) => setError(e.message));
  }, [id]);

  async function syncConvention() {
    setSyncing(true); setSyncMsg('');
    try {
      const c = await api.post<Convention>(`/tenants/${id}/convention/sync`);
      setConvention(c);
      setSyncMsg(`Convention "${c.name}" synchronisée le ${new Date().toLocaleString('fr-FR')}.`);
    } catch (e: any) { setSyncMsg('Erreur : ' + e.message); }
    finally { setSyncing(false); }
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!tenant) return <div className="text-slate-500">Chargement…</div>;

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500 font-semibold">Effectif</div>
            <div className="text-2xl font-bold">{stats?.employees ?? '—'}</div>
          </div>
        </CardBody></Card>
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500 font-semibold">Départements</div>
            <div className="text-2xl font-bold">{stats?.departments ?? '—'}</div>
          </div>
        </CardBody></Card>
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500 font-semibold">Statut</div>
            <div className="mt-1"><Badge variant={tenant.active ? 'green' : 'gray'}>{tenant.active ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        </CardBody></Card>
        <Card><CardBody className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500 font-semibold">Type</div>
            <div className="mt-1"><Badge variant={tenant.type === 'SIEGE' ? 'purple' : 'blue'}>{tenant.type}</Badge></div>
          </div>
        </CardBody></Card>
      </div>

      {/* Convention en vigueur */}
      {convention && (
        <Card>
          <CardHeader><CardTitle>Convention en vigueur</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="font-semibold">{convention.name}</div>
                <div className="text-xs text-slate-500">IDCC {convention.code.replace('IDCC_', '')} • Brochure {convention.brochure || '—'}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Dernière sync : {convention.lastSyncAt ? new Date(convention.lastSyncAt).toLocaleString('fr-FR') : '—'}
                </div>
              </div>
              <button onClick={syncConvention} disabled={syncing} className="btn btn-secondary">
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisation…' : 'Resynchroniser depuis Légifrance'}
              </button>
            </div>
            {syncMsg && <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">{syncMsg}</div>}

            {/* Règles applicables */}
            <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-50 rounded p-3">
                <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Congés annuels</div>
                <div className="font-semibold">{convention.cpAnnuel} jours</div>
              </div>
              <div className="bg-slate-50 rounded p-3">
                <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Période d'essai cadre (CDI)</div>
                <div className="font-semibold">{convention.trialPeriod?.CDI?.Cadre ?? '—'} jours</div>
              </div>
              <div className="bg-slate-50 rounded p-3">
                <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Préavis cadre</div>
                <div className="font-semibold">{convention.notice?.Cadre ?? '—'} jours</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-2">Congés exceptionnels conventionnels</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(convention.conventionalLeaves || {}).map(([k, v]) => (
                  <Badge key={k} variant="blue">{k.replace(/_/g, ' ')} : {v}j</Badge>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Formulaire d'édition */}
      <CompanyForm mode="edit" tenant={tenant} organisationId={tenant.organisationId} />
    </div>
  );
}
