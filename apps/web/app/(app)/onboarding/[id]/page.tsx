'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, CheckCircle2, Circle, Calendar, User } from 'lucide-react';
import type { Onboarding, OnboardingTask } from '@/types/onboarding';

const CATEGORY_COLORS: Record<string, string> = {
  Administratif: 'bg-blue-100 text-blue-700',
  Santé: 'bg-pink-100 text-pink-700',
  IT: 'bg-purple-100 text-purple-700',
  Formation: 'bg-amber-100 text-amber-700',
  RH: 'bg-emerald-100 text-emerald-700',
  Équipe: 'bg-indigo-100 text-indigo-700',
};

export default function OnboardingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [o, setO] = useState<Onboarding | null>(null);
  const [error, setError] = useState('');

  function load() {
    api.get<Onboarding>(`/onboarding/${id}`).then(setO).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function toggle(task: OnboardingTask) {
    try {
      await api.patch(`/onboarding/${id}/tasks/${task.id}`, { done: !task.done });
      load();
    } catch (e: any) { alert(e.message); }
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!o) return <div className="text-slate-500">Chargement…</div>;

  const done = o.tasks.filter((t) => t.done).length;
  const total = o.tasks.length;
  const requiredTotal = o.tasks.filter((t) => t.required).length;
  const requiredDone = o.tasks.filter((t) => t.required && t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Grouper par catégorie
  const byCategory = o.tasks.reduce<Record<string, OnboardingTask[]>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
        <h1 className="text-2xl font-bold text-slate-900">
          Onboarding — {o.employee?.firstName} {o.employee?.lastName}
        </h1>
        <Badge variant={o.status === 'termine' ? 'green' : 'amber'}>
          {o.status === 'termine' ? 'Terminé ✓' : 'En cours'}
        </Badge>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm text-slate-600">
                Poste : <strong>{o.employee?.jobTitle}</strong>
              </div>
              <div className="text-sm text-slate-600">
                Démarré le : <strong>{new Date(o.startDate).toLocaleDateString('fr-FR')}</strong>
              </div>
            </div>
            <div className="text-right min-w-[200px]">
              <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Progression</div>
              <div className="text-2xl font-bold text-brand-700">{pct}%</div>
              <div className="text-xs text-slate-500">{done}/{total} tâches — {requiredDone}/{requiredTotal} obligatoires</div>
            </div>
          </div>
          <div className="mt-3 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardBody>
      </Card>

      {/* Tâches groupées par catégorie */}
      {Object.entries(byCategory).map(([cat, tasks]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle>
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${CATEGORY_COLORS[cat] || 'bg-slate-200'}`} />
              {cat} ({tasks.filter((t) => t.done).length}/{tasks.length})
            </CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 ${
                    t.done ? 'bg-emerald-50' : ''
                  }`}
                  onClick={() => toggle(t)}
                >
                  {t.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${t.done ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {t.name}
                      {t.required && <Badge variant="red">obligatoire</Badge>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                      {t.ownerRole && (
                        <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> {t.ownerRole}</span>
                      )}
                      {t.dueDate && (
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Échéance : {new Date(t.dueDate).toLocaleDateString('fr-FR')}</span>
                      )}
                      {t.doneAt && (
                        <span className="text-emerald-600">✓ Fait le {new Date(t.doneAt).toLocaleString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
