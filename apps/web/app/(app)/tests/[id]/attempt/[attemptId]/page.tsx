'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function TestAttemptPage() {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/knowledge-tests/${id}`).then((t) => {
      setTest(t);
      setAnswers(new Array(t.questions.length).fill(-1));
    });
  }, [id]);

  async function submit() {
    if (answers.some((a) => a === -1)) {
      if (!confirm('Toutes les questions ne sont pas répondues. Soumettre quand même ?')) return;
    }
    setSubmitting(true);
    try {
      const r = await api.post(`/knowledge-tests/attempts/${attemptId}/submit`, { answers });
      setResult(r);
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  }

  if (!test) return <div className="text-slate-500">Chargement…</div>;

  if (result) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/tests')} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
          <h1 className="text-2xl font-bold text-slate-900">Résultat</h1>
        </div>
        <Card>
          <CardBody className="text-center py-12">
            {result.passed ? (
              <>
                <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-emerald-700 mb-2">Test validé !</h2>
                <p className="text-slate-600">Vous avez obtenu {result.score}% (minimum requis : {test.passingScore}%)</p>
                {result.expiresAt && (
                  <p className="text-sm text-slate-500 mt-3">Validité jusqu'au {new Date(result.expiresAt).toLocaleDateString('fr-FR')}</p>
                )}
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-700 mb-2">Test non validé</h2>
                <p className="text-slate-600">Score obtenu : {result.score}% (minimum requis : {test.passingScore}%)</p>
                <button onClick={() => router.push('/tests')} className="btn btn-primary mt-4">Repasser le test</button>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
          <p className="text-sm text-slate-500">Score requis : {test.passingScore}% • {test.questions.length} questions</p>
        </div>
      </div>

      {test.questions.map((q: any, i: number) => (
        <Card key={i}>
          <CardHeader><CardTitle>Question {i + 1} / {test.questions.length}</CardTitle></CardHeader>
          <CardBody>
            <p className="font-medium text-slate-900 mb-3">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((o: string, idx: number) => (
                <label key={idx} className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer ${answers[i] === idx ? 'bg-brand-100 border-2 border-brand-500' : 'border-2 border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name={`q${i}`} checked={answers[i] === idx} onChange={() => { const a = [...answers]; a[i] = idx; setAnswers(a); }} className="mt-1" />
                  <span className="text-sm">{o}</span>
                </label>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}

      <div className="flex justify-end">
        <button onClick={submit} disabled={submitting} className="btn btn-primary">
          {submitting ? 'Validation…' : `Valider mes réponses (${answers.filter((a) => a !== -1).length}/${test.questions.length})`}
        </button>
      </div>
    </div>
  );
}
