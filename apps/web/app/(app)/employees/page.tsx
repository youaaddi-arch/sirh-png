'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Users, Plus } from 'lucide-react';

export default function EmployeesPage() {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantFilter, setTenantFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/employees'),
      api.get<any[]>('/tenants'),
    ]).then(([e, t]) => { setList(e); setTenants(t); }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => list.filter((e) => {
    if (tenantFilter && e.tenantId !== tenantFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [e.firstName, e.lastName, e.email, e.matricule, e.jobTitle].some((v) => (v || '').toLowerCase().includes(q));
  }), [list, search, tenantFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collaborateurs</h1>
          <p className="text-slate-500 text-sm">{filtered.length} sur {list.length} collaborateur(s)</p>
        </div>
      </div>

      <Card>
        <CardBody className="!p-4 grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="label">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input className="input pl-10" placeholder="Nom, email, matricule, poste…"
                     value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Société</label>
            <select className="input" value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
              <option value="">Toutes</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
            </select>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <Card><CardBody><div className="text-slate-500 text-center py-10">Chargement…</div></CardBody></Card>
      ) : filtered.length === 0 ? (
        <Card><CardBody><div className="text-slate-400 text-center py-10"><Users className="w-12 h-12 mx-auto mb-2" /> Aucun collaborateur</div></CardBody></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Collaborateur</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Poste</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Société</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Contrat</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const t = tenants.find((x) => x.id === e.tenantId);
                  const initials = `${e.firstName?.[0] || ''}${e.lastName?.[0] || ''}`.toUpperCase();
                  return (
                    <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">{initials}</span>
                          <div>
                            <div className="font-medium">{e.firstName} {e.lastName}</div>
                            <div className="text-xs text-slate-500">{e.email} • {e.matricule}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{e.jobTitle}</td>
                      <td className="px-4 py-3">{t && <Badge variant="blue">{t.code}</Badge>}</td>
                      <td className="px-4 py-3"><Badge variant="gray">{e.contractType}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={e.status === 'actif' ? 'green' : 'gray'}>{e.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/employees/${e.id}` as any} className="text-brand-600 hover:underline text-xs">Voir →</Link>
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
