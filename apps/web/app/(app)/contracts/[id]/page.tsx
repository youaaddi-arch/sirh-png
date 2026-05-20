'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Send, PenTool, Printer, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Contract } from '@/types/contract';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<Contract | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');

  function load() {
    api.get<Contract>(`/contracts/${id}`).then(setC).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function send() {
    try { await api.post(`/contracts/${id}/send`); load(); } catch (e: any) { alert(e.message); }
  }

  async function sign(role: 'employee' | 'employer') {
    if (!c) return;
    const defaultName = role === 'employee'
      ? (c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : '')
      : (c.tenant?.name || '');
    const name = prompt(`Nom du signataire (${role === 'employee' ? 'salarié' : 'employeur'}) :`, defaultName);
    if (!name) return;
    const email = prompt('Email du signataire :', '') || `${role}@pn-groupe.fr`;
    setSigning(true);
    try {
      await api.post(`/contracts/${id}/sign`, { role, signerName: name, signerEmail: email });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSigning(false); }
  }

  function print() { window.print(); }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!c) return <div className="text-slate-500">Chargement…</div>;

  const empSig = c.signatures?.find(s => s.signerRole === 'employee');
  const erpSig = c.signatures?.find(s => s.signerRole === 'employer');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
          <h1 className="text-2xl font-bold text-slate-900">Contrat — {c.position}</h1>
          <Badge variant={c.status === 'signe' || c.status === 'actif' ? 'green' : 'amber'}>{c.status}</Badge>
        </div>
        <div className="flex gap-2">
          <button onClick={print} className="btn btn-secondary"><Printer className="w-4 h-4" /> Imprimer / PDF</button>
          {c.status === 'brouillon' && <button onClick={send} className="btn btn-primary"><Send className="w-4 h-4" /> Envoyer pour signature</button>}
        </div>
      </div>

      {/* Signature actions */}
      {(c.status === 'envoye' || c.status === 'signe_salarie') && (
        <Card className="no-print border-amber-300 bg-amber-50">
          <CardBody>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">Signatures en cours</h3>
                <p className="text-sm text-slate-600">
                  {empSig ? '✓ Salarié signé' : 'En attente signature salarié'} •
                  {erpSig ? ' ✓ Employeur signé' : ' En attente signature employeur'}
                </p>
              </div>
              <div className="flex gap-2">
                {!empSig && <button onClick={() => sign('employee')} disabled={signing} className="btn btn-primary"><PenTool className="w-4 h-4" /> Signer (salarié)</button>}
                {!erpSig && <button onClick={() => sign('employer')} disabled={signing} className="btn btn-primary"><PenTool className="w-4 h-4" /> Signer (employeur)</button>}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Métadonnées */}
      <div className="grid md:grid-cols-4 gap-3 no-print">
        <Card><CardBody className="!p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold">Type</div>
          <div className="text-lg font-bold mt-1">{c.type}</div>
        </CardBody></Card>
        <Card><CardBody className="!p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold">Statut juridique</div>
          <div className="text-lg font-bold mt-1">{c.statusClass}</div>
        </CardBody></Card>
        <Card><CardBody className="!p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold">Période d'essai</div>
          <div className="text-lg font-bold mt-1">{c.trialPeriodDays} jours</div>
        </CardBody></Card>
        <Card><CardBody className="!p-4">
          <div className="text-xs uppercase text-slate-500 font-semibold">Salaire brut</div>
          <div className="text-lg font-bold mt-1">{c.grossSalary.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
        </CardBody></Card>
      </div>

      {c.generatedByAi && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 inline-flex items-center gap-1 no-print">
          <Sparkles className="w-3 h-3" /> Contrat généré par IA ({c.aiModel}) — à relire avant signature
        </div>
      )}

      {/* Contenu du contrat */}
      <Card className="contract-content">
        <CardBody>
          <pre className="whitespace-pre-wrap font-serif text-[14px] leading-relaxed">{c.contentMd}</pre>
        </CardBody>
      </Card>

      {/* Preuve de signature */}
      {c.signatures && c.signatures.length > 0 && (
        <Card className="no-print">
          <CardHeader><CardTitle>Preuves de signature</CardTitle></CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              {c.signatures.map((s) => (
                <li key={s.id} className="flex items-center gap-2 p-2 bg-emerald-50 rounded">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <strong>{s.signerName}</strong>
                  <span className="text-slate-500">({s.signerRole})</span>
                  <span className="text-slate-400">le {new Date(s.signedAt).toLocaleString('fr-FR')}</span>
                  {s.signedIp && <span className="text-xs text-slate-400 font-mono">IP: {s.signedIp}</span>}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          aside, header { display: none !important; }
          .contract-content { box-shadow: none; border: none; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
