'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Plus, Trash2, Upload, Send } from 'lucide-react';
import type { ExpenseReport } from '@/types/leave';

const CATEGORIES = ['Repas', 'Transport', 'Hébergement', 'Fournitures', 'Logiciels', 'Téléphonie', 'Formation', 'Autre'];

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [r, setR] = useState<ExpenseReport | null>(null);
  const [adding, setAdding] = useState(false);
  const [line, setLine] = useState({ date: new Date().toISOString().slice(0, 10), category: 'Repas', amount: '', description: '', project: '' });

  function reload() { api.get<ExpenseReport>(`/expense-reports/${id}`).then(setR); }
  useEffect(reload, [id]);

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/expense-reports/${id}/lines`, { ...line, amount: Number(line.amount) });
      setAdding(false);
      setLine({ date: new Date().toISOString().slice(0, 10), category: 'Repas', amount: '', description: '', project: '' });
      reload();
    } catch (e: any) { alert(e.message); }
  }

  async function deleteLine(lineId: string) {
    if (!confirm('Supprimer cette ligne ?')) return;
    await api.del(`/expense-reports/lines/${lineId}`);
    reload();
  }

  async function uploadReceipt(lineId: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + `/expense-reports/lines/${lineId}/receipt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('sirh.token')}` },
      body: fd,
    });
    if (!res.ok) { alert('Upload failed'); return; }
    reload();
  }

  async function submit() {
    try { await api.patch(`/expense-reports/${id}/submit`); reload(); } catch (e: any) { alert(e.message); }
  }

  if (!r) return <div className="text-slate-500">Chargement…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
          <h1 className="text-2xl font-bold text-slate-900">Note de frais — {r.periodMonth}</h1>
          <Badge variant={r.status === 'brouillon' ? 'gray' : r.status === 'soumis' ? 'amber' : r.status === 'approuve' ? 'green' : r.status === 'rembourse' ? 'purple' : 'red'}>{r.status}</Badge>
        </div>
        {r.status === 'brouillon' && (
          <button onClick={submit} disabled={r.lines.length === 0} className="btn btn-primary">
            <Send className="w-4 h-4" /> Soumettre pour validation
          </button>
        )}
      </div>

      <Card><CardBody className="!p-4">
        <div className="text-xs uppercase text-slate-500 font-semibold">Total</div>
        <div className="text-3xl font-bold mt-1">{r.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
      </CardBody></Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Lignes de dépense</CardTitle>
          {r.status === 'brouillon' && !adding && (
            <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Ajouter une ligne</button>
          )}
        </CardHeader>
        <CardBody>
          {adding && (
            <form onSubmit={addLine} className="grid md:grid-cols-6 gap-2 mb-4 p-3 bg-slate-50 rounded">
              <input type="date" required value={line.date} onChange={(e) => setLine({ ...line, date: e.target.value })} className="input" />
              <select required value={line.category} onChange={(e) => setLine({ ...line, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" required placeholder="Montant €" value={line.amount} onChange={(e) => setLine({ ...line, amount: e.target.value })} className="input" />
              <input placeholder="Description" value={line.description} onChange={(e) => setLine({ ...line, description: e.target.value })} className="input md:col-span-2" />
              <div className="flex gap-1">
                <button type="submit" className="btn btn-primary btn-sm flex-1">Ajouter</button>
                <button type="button" onClick={() => setAdding(false)} className="btn btn-secondary btn-sm">×</button>
              </div>
            </form>
          )}

          {r.lines.length === 0 ? (
            <p className="text-slate-400 text-center py-6">Aucune ligne. {r.status === 'brouillon' && 'Cliquez "Ajouter une ligne" pour commencer.'}</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Date</th><th>Catégorie</th><th>Description</th><th>Justif</th><th className="text-right">Montant</th><th></th>
              </tr></thead>
              <tbody>
                {r.lines.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-2">{new Date(l.date).toLocaleDateString('fr-FR')}</td>
                    <td><Badge variant="gray">{l.category}</Badge></td>
                    <td className="text-slate-600">{l.description || '—'}</td>
                    <td>
                      {l.receiptPath ? <span className="text-emerald-600 text-xs">📎 OK</span> : (
                        r.status === 'brouillon' && (
                          <label className="text-xs text-brand-600 cursor-pointer hover:underline inline-flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Joindre
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && uploadReceipt(l.id, e.target.files[0])} />
                          </label>
                        )
                      )}
                    </td>
                    <td className="text-right font-semibold">{l.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    <td className="text-right">
                      {r.status === 'brouillon' && (
                        <button onClick={() => deleteLine(l.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
