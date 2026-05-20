'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, PenTool, Save, CheckCircle } from 'lucide-react';

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [r, setR] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  function load() { api.get(`/reviews/${id}`).then(setR); }
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    load();
  }, [id]);

  if (!r) return <div className="text-slate-500">Chargement…</div>;

  function setAnswer(sIdx: number, qIdx: number, value: any) {
    const fd = JSON.parse(JSON.stringify(r.formData || { sections: [] }));
    fd.sections[sIdx].questions[qIdx].answer = value;
    setR({ ...r, formData: fd });
  }

  async function save() {
    setSaving(true);
    try { await api.patch(`/reviews/${id}`, { formData: r.formData, overallRating: r.overallRating, strengths: r.strengths, improvements: r.improvements, comments: r.comments }); }
    finally { setSaving(false); }
  }

  async function complete() {
    if (!confirm('Marquer cet entretien comme réalisé ?')) return;
    await api.patch(`/reviews/${id}/complete`);
    load();
  }

  async function sign(role: 'employee' | 'reviewer') {
    await api.patch(`/reviews/${id}/sign/${role}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
        <h1 className="text-2xl font-bold text-slate-900">Entretien — {r.employee?.firstName} {r.employee?.lastName}</h1>
        <Badge variant={r.status === 'signe' ? 'green' : r.status === 'realise' ? 'blue' : 'amber'}>{r.status}</Badge>
      </div>

      <Card>
        <CardBody className="!p-4 flex items-center gap-6 flex-wrap text-sm">
          <div><div className="text-xs uppercase text-slate-500 font-semibold">Type</div><div className="font-semibold">{r.type}</div></div>
          <div><div className="text-xs uppercase text-slate-500 font-semibold">Évaluateur</div><div>{r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : '—'}</div></div>
          <div><div className="text-xs uppercase text-slate-500 font-semibold">Date prévue</div><div>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString('fr-FR') : '—'}</div></div>
        </CardBody>
      </Card>

      {/* Sections de la trame */}
      {(r.formData?.sections || []).map((section: any, sIdx: number) => (
        <Card key={sIdx}>
          <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            {section.questions.map((q: any, qIdx: number) => (
              <div key={q.key}>
                <label className="label">{q.label}</label>
                {q.type === 'rating' ? (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setAnswer(sIdx, qIdx, n)} className={`w-10 h-10 rounded ${q.answer === n ? 'bg-brand-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{n}</button>
                    ))}
                  </div>
                ) : q.type === 'choice' ? (
                  <select value={q.answer || ''} onChange={(e) => setAnswer(sIdx, qIdx, e.target.value)} className="input">
                    <option value="">—</option>
                    {q.options.map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                ) : q.type === 'longtext' ? (
                  <textarea rows={3} value={q.answer || ''} onChange={(e) => setAnswer(sIdx, qIdx, e.target.value)} className="input" />
                ) : (
                  <input value={q.answer || ''} onChange={(e) => setAnswer(sIdx, qIdx, e.target.value)} className="input" />
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      ))}

      {/* Synthèse */}
      <Card>
        <CardHeader><CardTitle>Synthèse</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="label">Note globale (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setR({ ...r, overallRating: n })} className={`w-10 h-10 rounded ${r.overallRating === n ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{n}⭐</button>
              ))}
            </div>
          </div>
          <div><label className="label">Points forts</label><textarea rows={3} value={r.strengths || ''} onChange={(e) => setR({ ...r, strengths: e.target.value })} className="input" /></div>
          <div><label className="label">Axes d'amélioration</label><textarea rows={3} value={r.improvements || ''} onChange={(e) => setR({ ...r, improvements: e.target.value })} className="input" /></div>
          <div><label className="label">Commentaires libres</label><textarea rows={3} value={r.comments || ''} onChange={(e) => setR({ ...r, comments: e.target.value })} className="input" /></div>
        </CardBody>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <button onClick={save} disabled={saving} className="btn btn-primary"><Save className="w-4 h-4" /> Enregistrer</button>
        {r.status !== 'realise' && r.status !== 'signe' && <button onClick={complete} className="btn btn-success"><CheckCircle className="w-4 h-4" /> Marquer comme réalisé</button>}
        {(r.status === 'realise' || r.status === 'signe') && !r.signedEmployeeAt && (
          <button onClick={() => sign('employee')} className="btn btn-secondary"><PenTool className="w-4 h-4" /> Signer (salarié)</button>
        )}
        {(r.status === 'realise' || r.status === 'signe') && !r.signedReviewerAt && (
          <button onClick={() => sign('reviewer')} className="btn btn-secondary"><PenTool className="w-4 h-4" /> Signer (évaluateur)</button>
        )}
      </div>

      {(r.signedEmployeeAt || r.signedReviewerAt) && (
        <Card><CardBody className="text-sm">
          <strong>Signatures :</strong>
          {r.signedEmployeeAt && <div className="text-emerald-700">✓ Salarié — {new Date(r.signedEmployeeAt).toLocaleString('fr-FR')}</div>}
          {r.signedReviewerAt && <div className="text-emerald-700">✓ Évaluateur — {new Date(r.signedReviewerAt).toLocaleString('fr-FR')}</div>}
        </CardBody></Card>
      )}
    </div>
  );
}
