'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Sparkles, Eye } from 'lucide-react';
import type { Contract, ContractStatus } from '@/types/contract';

const STATUS_META: Record<ContractStatus, { label: string; variant: any }> = {
  brouillon:     { label: 'Brouillon',           variant: 'gray' },
  envoye:        { label: 'Envoyé pour signature', variant: 'amber' },
  signe_salarie: { label: 'Signé salarié',       variant: 'blue' },
  signe:         { label: 'Signé',               variant: 'green' },
  actif:         { label: 'Actif',               variant: 'green' },
  termine:       { label: 'Terminé',             variant: 'gray' },
  annule:        { label: 'Annulé',              variant: 'red' },
};

export default function ContractsPage() {
  const [list, setList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Contract[]>('/contracts').then(setList).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contrats de travail</h1>
          <p className="text-slate-500 text-sm">
            Contrats générés par IA Claude conformes au droit français et à la convention collective applicable.
          </p>
        </div>
      </div>

      {loading ? (
        <Card><CardBody><div className="text-slate-500 text-center py-10">Chargement…</div></CardBody></Card>
      ) : list.length === 0 ? (
        <Card><CardBody>
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2" />
            <p>Aucun contrat encore généré.</p>
            <p className="text-sm mt-2">Les contrats sont générés depuis la fiche d'embauche (<Link href="/hiring" className="text-brand-600 hover:underline">/hiring</Link>) ou depuis la fiche salarié.</p>
          </div>
        </CardBody></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Type</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Salarié</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Poste</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Société</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Date début</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Salaire brut</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">IA</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3"><Badge variant="blue">{c.type}</Badge></td>
                    <td className="px-4 py-3">
                      {c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : <em className="text-slate-400">En attente d'embauche</em>}
                    </td>
                    <td className="px-4 py-3">{c.position}</td>
                    <td className="px-4 py-3">
                      {c.tenant && <Badge variant="purple">{c.tenant.code}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(c.startDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {c.grossSalary.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-4 py-3"><Badge variant={STATUS_META[c.status].variant}>{STATUS_META[c.status].label}</Badge></td>
                    <td className="px-4 py-3">
                      {c.generatedByAi && <span className="text-amber-600 inline-flex items-center gap-1 text-xs"><Sparkles className="w-3 h-3" /> {c.aiModel}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/contracts/${c.id}`} className="text-brand-600 hover:underline text-xs inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Voir
                      </Link>
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
