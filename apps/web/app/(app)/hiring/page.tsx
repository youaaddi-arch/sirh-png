'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Mail, Eye } from 'lucide-react';
import type { HireProcess, HireStatus } from '@/types/hiring';

const STATUS_META: Record<HireStatus, { label: string; variant: any }> = {
  pre_embauche:    { label: 'Lien envoyé',       variant: 'amber' },
  soumis:          { label: 'Soumis',            variant: 'blue' },
  valide:          { label: 'Validé',            variant: 'purple' },
  contrat_genere:  { label: 'Contrat généré',    variant: 'purple' },
  contrat_signe:   { label: 'Contrat signé',     variant: 'green' },
  embauche:        { label: 'Embauché',          variant: 'green' },
  annule:          { label: 'Annulé',            variant: 'red' },
};

export default function HiringPage() {
  const [list, setList] = useState<HireProcess[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([
      api.get<HireProcess[]>('/hire-processes'),
      api.get<any>('/hire-processes/stats'),
    ]).then(([l, s]) => { setList(l); setStats(s); })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function copyLink(token: string) {
    const url = `${window.location.origin}/preboarding/${token}`;
    navigator.clipboard.writeText(url).then(() => alert(`Lien copié :\n${url}`));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Embauches en cours</h1>
          <p className="text-slate-500 text-sm">Workflow d'embauche : du pré-onboarding à la création du salarié.</p>
        </div>
        <Link href="/hiring/new" className="btn btn-primary"><Plus className="w-4 h-4" /> Démarrer une embauche</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            ['Total', stats.total, 'text-brand-700'],
            ['Pré-embauche', stats.pre_embauche, 'text-amber-700'],
            ['Soumis', stats.soumis, 'text-blue-700'],
            ['Validés', stats.valide, 'text-purple-700'],
            ['Contrats', stats.contrat, 'text-pink-700'],
            ['Embauchés', stats.embauche, 'text-emerald-700'],
          ].map(([label, value, color]: any) => (
            <Card key={label}><CardBody className="!p-4">
              <div className="text-xs uppercase text-slate-500 font-semibold">{label}</div>
              <div className={`text-2xl font-bold ${color} mt-1`}>{value}</div>
            </CardBody></Card>
          ))}
        </div>
      )}

      {loading ? (
        <Card><CardBody><div className="text-slate-500 text-center py-10">Chargement…</div></CardBody></Card>
      ) : list.length === 0 ? (
        <Card><CardBody>
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">Aucune embauche en cours</div>
            <Link href="/hiring/new" className="btn btn-primary inline-flex"><Plus className="w-4 h-4" /> Démarrer une embauche</Link>
          </div>
        </CardBody></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Candidat</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Poste</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Société</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Démarré le</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.firstName} {p.lastName}</div>
                      <div className="text-xs text-slate-500">{p.email}</div>
                    </td>
                    <td className="px-4 py-3">{p.jobTitle}</td>
                    <td className="px-4 py-3">
                      {p.tenant && <Badge variant="blue">{p.tenant.code}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_META[p.status].variant}>{STATUS_META[p.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => copyLink(p.token)} className="text-brand-600 hover:underline text-xs flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Lien candidat
                        </button>
                        <Link href={`/hiring/${p.id}`} className="text-brand-600 hover:underline text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Détail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
