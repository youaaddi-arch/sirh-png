'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, FileText, Trash2, Download, History } from 'lucide-react';

export default function RgpdPage() {
  const [tab, setTab] = useState<'registry' | 'audit' | 'rights'>('registry');
  const [activities, setActivities] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    api.get('/rgpd/activities').then(setActivities);
    api.get('/rgpd/audit').then(setAudit);
    api.get('/rgpd/export-requests').then(setRequests);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-600" /> Conformité RGPD
        </h1>
        <p className="text-slate-500 text-sm">Registre des traitements (art. 30), audit, droits des personnes (art. 15-22).</p>
      </div>

      <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-white">
        <TabBtn current={tab} value="registry" onClick={() => setTab('registry')} icon={FileText} label="Registre" />
        <TabBtn current={tab} value="audit"    onClick={() => setTab('audit')}    icon={History}  label="Audit" />
        <TabBtn current={tab} value="rights"   onClick={() => setTab('rights')}   icon={Trash2}   label="Droits" />
      </div>

      {tab === 'registry' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Article 30 RGPD : le responsable de traitement tient un registre des activités de traitement.
            {activities.length > 0 && <strong> {activities.length} traitements documentés.</strong>}
          </p>
          {activities.map((a) => (
            <Card key={a.id}>
              <CardHeader><CardTitle>{a.name}</CardTitle></CardHeader>
              <CardBody className="text-sm space-y-2">
                <Row label="Finalité" value={a.purpose} />
                <Row label="Base légale" value={
                  <Badge variant={a.legalBasis === 'consentement' ? 'amber' : 'blue'}>{a.legalBasis}</Badge>
                } />
                <Row label="Catégories de données" value={
                  <div className="flex flex-wrap gap-1">{(a.dataCategories || []).map((c: string) => <Badge key={c} variant="gray">{c}</Badge>)}</div>
                } />
                <Row label="Personnes concernées" value={(a.dataSubjects || []).join(', ')} />
                <Row label="Destinataires" value={(a.recipients || []).join(', ')} />
                <Row label="Durée de conservation" value={a.retentionPeriod} />
                <Row label="Mesures de sécurité" value={a.securityMeasures} />
                <Row label="Transferts hors UE" value={a.transfersOutsideEU ? '⚠️ Oui' : '✓ Non'} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <Card>
          <CardHeader><CardTitle>Journal d'audit (100 dernières actions)</CardTitle></CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Date</th><th>Utilisateur</th><th>Action</th><th>Entité</th><th>IP</th>
              </tr></thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 text-xs">{new Date(a.at).toLocaleString('fr-FR')}</td>
                    <td className="text-xs">{a.user?.email || '—'}</td>
                    <td className="text-xs font-mono">{a.action}</td>
                    <td><Badge variant="gray">{a.entityType || '—'}</Badge></td>
                    <td className="text-xs text-slate-500 font-mono">{a.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === 'rights' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Droits des personnes concernées</CardTitle></CardHeader>
            <CardBody>
              <p className="text-sm text-slate-600 mb-4">
                Le RGPD garantit 6 droits aux personnes concernées. Pour exercer un droit pour un salarié,
                rendez-vous sur sa fiche puis cliquez sur "Exporter mes données" ou "Anonymiser".
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  ['Droit d\'accès', 'Art. 15 — Obtenir copie des données'],
                  ['Droit de rectification', 'Art. 16 — Corriger les données inexactes'],
                  ['Droit à l\'effacement', 'Art. 17 — Droit à l\'oubli'],
                  ['Droit à la limitation', 'Art. 18 — Geler le traitement'],
                  ['Droit à la portabilité', 'Art. 20 — Récupérer ses données en format structuré'],
                  ['Droit d\'opposition', 'Art. 21 — S\'opposer au traitement'],
                ].map(([r, d]) => (
                  <li key={r} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                    <Shield className="w-4 h-4 text-brand-600 mt-0.5" />
                    <div><strong>{r}</strong> — <span className="text-slate-600">{d}</span></div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Historique des demandes</CardTitle></CardHeader>
            <CardBody>
              {requests.length === 0 ? <p className="text-sm text-slate-500">Aucune demande</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                    <th className="py-2">Date</th><th>Type</th><th>Salarié</th><th>Statut</th>
                  </tr></thead>
                  <tbody>
                    {requests.map((r: any) => (
                      <tr key={r.id} className="border-b border-slate-100">
                        <td className="py-2 text-xs">{new Date(r.requestedAt).toLocaleString('fr-FR')}</td>
                        <td>
                          {r.type === 'portability' ? <Badge variant="blue"><Download className="inline w-3 h-3" /> Portabilité</Badge> :
                           <Badge variant="red"><Trash2 className="inline w-3 h-3" /> Effacement</Badge>}
                        </td>
                        <td className="text-xs font-mono">{r.employeeId}</td>
                        <td><Badge variant={r.status === 'completed' ? 'green' : 'amber'}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function TabBtn({ current, value, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm flex items-center gap-1 ${current === value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid md:grid-cols-4 gap-2 py-1 border-b border-slate-100">
      <dt className="text-xs uppercase text-slate-500 font-semibold">{label}</dt>
      <dd className="md:col-span-3 text-slate-900">{value || '—'}</dd>
    </div>
  );
}
