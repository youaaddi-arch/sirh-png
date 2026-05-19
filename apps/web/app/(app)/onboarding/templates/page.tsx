'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import type { OnboardingTemplate } from '@/types/onboarding';

export default function OnboardingTemplatesPage() {
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<OnboardingTemplate[]>('/onboarding/templates').then(setTemplates).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/onboarding" className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</Link>
        <h1 className="text-2xl font-bold text-slate-900">Templates d'onboarding</h1>
      </div>

      <p className="text-sm text-slate-600">
        Les templates sont automatiquement sélectionnés selon le titre du poste du nouveau salarié.
      </p>

      {loading ? (
        <div className="text-slate-500">Chargement…</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <Card key={tpl.name}>
              <CardHeader>
                <CardTitle>
                  <ClipboardList className="inline w-5 h-5 mr-2 text-brand-600" />
                  {tpl.name} <Badge variant="blue">{tpl.taskCount} tâches</Badge>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">S'applique aux postes contenant :</div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {tpl.appliesTo.map((m, i) => <code key={i} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{m}</code>)}
                </div>

                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Tâches du parcours</div>
                <ul className="space-y-1.5 text-sm">
                  {tpl.tasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <div className="flex-1">
                        <span className={t.required ? 'font-medium' : ''}>{t.name}</span>
                        <span className="text-xs text-slate-500 ml-2">[{t.category}]</span>
                        {t.daysAfterStart != null && (
                          <span className="text-xs text-slate-400 ml-2">J+{t.daysAfterStart}</span>
                        )}
                        {t.required && <Badge variant="red">obligatoire</Badge>}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
