'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, Clock, CheckCircle, XCircle } from 'lucide-react';

const CATEGORY_LABEL: Record<string, string> = {
  securite: 'Sécurité', rgpd: 'RGPD', qualiopi: 'Qualiopi', technique: 'Technique',
};

export default function TestsPage() {
  const [me, setMe] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
    api.get<any[]>('/knowledge-tests').then(setTests);
    if (u.employee?.id) api.get<any[]>(`/knowledge-tests/attempts/by-employee/${u.employee.id}`).then(setAttempts);
  }, []);

  async function start(testId: string) {
    if (!me?.employee?.id) { alert('Aucun salarié rattaché à votre compte'); return; }
    const att = await api.post(`/knowledge-tests/${testId}/start`, { employeeId: me.employee.id });
    window.location.href = `/tests/${testId}/attempt/${att.id}`;
  }

  function lastAttempt(testId: string) {
    return attempts.filter((a) => a.testId === testId).sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))[0];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tests de connaissances</h1>
        <p className="text-slate-500 text-sm">Tests obligatoires pour la conformité (sécurité, RGPD, Qualiopi).</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((t) => {
          const last = lastAttempt(t.id);
          const passed = last?.passed;
          const expired = last?.expiresAt && new Date(last.expiresAt) < new Date();
          return (
            <Card key={t.id}>
              <CardBody>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                  <Badge variant="blue">{CATEGORY_LABEL[t.category] || t.category}</Badge>
                </div>
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                <div className="text-xs text-slate-500 mt-3 space-y-1">
                  <div>📊 Score requis : {t.passingScore}%</div>
                  <div>⏱ Validité : {t.validityMonths} mois</div>
                  {last && (
                    <div className={passed && !expired ? 'text-emerald-700' : 'text-red-700'}>
                      {passed && !expired ? (
                        <span><CheckCircle className="inline w-3 h-3 mr-1" /> Validé — score {last.score}% — expire le {last.expiresAt ? new Date(last.expiresAt).toLocaleDateString('fr-FR') : '—'}</span>
                      ) : (
                        <span><XCircle className="inline w-3 h-3 mr-1" /> {expired ? `Expiré le ${new Date(last.expiresAt).toLocaleDateString('fr-FR')}` : `Échoué (${last.score}%)`}</span>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => start(t.id)} className="btn btn-primary w-full mt-4">
                  {last && passed && !expired ? 'Repasser le test' : 'Démarrer le test'}
                </button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {attempts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Mon historique</CardTitle></CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Test</th><th>Catégorie</th><th>Démarré</th><th>Score</th><th>Résultat</th>
              </tr></thead>
              <tbody>
                {attempts.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2">{a.test?.title}</td>
                    <td><Badge variant="blue">{CATEGORY_LABEL[a.test?.category] || a.test?.category}</Badge></td>
                    <td className="text-xs">{new Date(a.startedAt).toLocaleString('fr-FR')}</td>
                    <td className="font-semibold">{a.score ? `${a.score}%` : '—'}</td>
                    <td>
                      {a.completedAt ? (
                        <Badge variant={a.passed ? 'green' : 'red'}>{a.passed ? 'Validé' : 'Échoué'}</Badge>
                      ) : <Badge variant="amber">En cours</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
