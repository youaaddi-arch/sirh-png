'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building2, Search, Plus, Download } from 'lucide-react';
import type { Tenant } from '@/types/tenant';

export default function CompaniesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    api.get<Tenant[]>('/tenants')
      .then(setTenants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => tenants.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [t.code, t.name, t.siret, t.siren, t.repName, t.address].some((v) => (v || '').toLowerCase().includes(q));
  }), [tenants, search, typeFilter]);

  // Group by code prefix (e.g. "003-DBS")
  const grouped = useMemo(() => {
    const map = new Map<string, Tenant[]>();
    filtered.forEach((t) => {
      const prefix = (t.code || '').replace(/-[A-Z0-9]+$/, '');
      if (!map.has(prefix)) map.set(prefix, []);
      map.get(prefix)!.push(t);
    });
    return Array.from(map.entries()).sort();
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sociétés &amp; établissements</h1>
          <p className="text-slate-500 text-sm">
            {filtered.length} entité{filtered.length > 1 ? 's' : ''} sur {tenants.length} — {new Set(tenants.map(t => t.code.replace(/-[A-Z0-9]+$/, ''))).size} sociétés
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => exportCsv(tenants)}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link href="/companies/new" className="btn btn-primary">
            <Plus className="w-4 h-4" /> Nouvelle entité
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="!p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="input pl-10"
                placeholder="Code, nom, SIRET, dirigeant…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input min-w-[160px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Tous</option>
              <option value="SIEGE">Siège</option>
              <option value="ETS">Établissement</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card><CardBody>
          <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>
        </CardBody></Card>
      )}

      {loading ? (
        <Card><CardBody><div className="text-slate-500 text-center py-10">Chargement…</div></CardBody></Card>
      ) : grouped.length === 0 ? (
        <Card><CardBody><div className="text-slate-400 text-center py-10">Aucune entité</div></CardBody></Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(([code, list]) => (
            <Card key={code} className="overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {code.slice(0, 3)}
                  </span>
                  <div>
                    <div className="font-semibold">{code} — {list[0].name}</div>
                    <div className="text-xs text-slate-500">
                      SIREN {list[0].siren || '—'} • {list.length} entité{list.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white">
                    <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-2">Type</th>
                    <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-2">Nom</th>
                    <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-2">SIRET</th>
                    <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-2">Représentant</th>
                    <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-2">Adresse</th>
                    <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Badge variant={t.type === 'SIEGE' ? 'purple' : 'blue'}>{t.type}</Badge>
                      </td>
                      <td className="px-4 py-3">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.siret || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{t.repName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{t.address || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/companies/${t.id}`} className="text-brand-600 hover:underline text-xs">
                          Paramétrer →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function exportCsv(tenants: Tenant[]) {
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headers = ['Code', 'Nom', 'Type', 'SIREN', 'SIRET', 'Représentant', 'Adresse', 'Convention'];
  const rows = tenants.map((t) => [t.code, t.name, t.type, t.siren, t.siret, t.repName, t.address, t.conventionCode]);
  const csv = [headers.map(escape).join(';'), ...rows.map((r) => r.map(escape).join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'societes.csv'; a.click();
  URL.revokeObjectURL(url);
}
