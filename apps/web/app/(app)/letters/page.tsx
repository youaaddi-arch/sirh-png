'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Mail, Plus, Printer } from 'lucide-react';
import type { Letter } from '@/types/contract';

export default function LettersPage() {
  const [list, setList] = useState<Letter[]>([]);
  const [templates, setTemplates] = useState<Array<{ key: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([
      api.get<Letter[]>('/letters'),
      api.get<any[]>('/letters/templates'),
    ]).then(([l, t]) => { setList(l); setTemplates(t); }).finally(() => setLoading(false));
  }
  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courriers RH</h1>
          <p className="text-slate-500 text-sm">Génération de courriers types : attestations, certificats, convocations, etc.</p>
        </div>
        <Link href="/letters/new" className="btn btn-primary"><Plus className="w-4 h-4" /> Nouveau courrier</Link>
      </div>

      {/* Templates quick access */}
      <div>
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2">Modèles disponibles</div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {templates.map((t) => (
            <Link
              key={t.key}
              href={`/letters/new?type=${t.key}`}
              className="card hover:shadow-md transition p-4 flex items-start gap-3"
            >
              <Mail className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs uppercase text-slate-500 font-semibold">Modèle</div>
                <div className="font-semibold text-sm text-slate-900 mt-0.5">{t.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100"><h2 className="font-semibold">Historique des courriers</h2></div>
        {loading ? (
          <CardBody><div className="text-slate-500 text-center py-6">Chargement…</div></CardBody>
        ) : list.length === 0 ? (
          <CardBody><div className="text-slate-400 text-center py-6">Aucun courrier</div></CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Date</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Type</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Destinataire</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Objet</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3">Statut</th>
                  <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3"><Badge variant="blue">{l.type}</Badge></td>
                    <td className="px-4 py-3">
                      {l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3">{l.subject}</td>
                    <td className="px-4 py-3"><Badge variant={l.status === 'envoye' ? 'green' : 'amber'}>{l.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => previewLetter(l)}
                        className="text-brand-600 hover:underline text-xs inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Aperçu / Imprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function previewLetter(l: Letter) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${l.subject}</title>
    <style>
      body { font-family: Georgia, serif; padding: 40mm 30mm; max-width: 21cm; margin: 0 auto; line-height: 1.7; }
      pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 11pt; }
      h1 { font-size: 14pt; text-align: center; }
      @media print { body { padding: 20mm; } }
    </style></head><body>
    <pre>${l.contentMd.replace(/</g, '&lt;')}</pre>
    <script>setTimeout(() => window.print(), 300);<\/script>
  </body></html>`);
  w.document.close();
}
