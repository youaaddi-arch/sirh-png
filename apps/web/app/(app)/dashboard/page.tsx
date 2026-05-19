'use client';
import { Users, Building2, Calendar, Receipt, Briefcase, Star, BookOpen, FileText } from 'lucide-react';

const KPIS = [
  { label: 'Effectif total',     value: '—',   icon: Users,      bg: 'bg-brand-100 text-brand-700',   sub: 'À connecter' },
  { label: 'Entités du groupe',  value: '—',   icon: Building2,  bg: 'bg-purple-100 text-purple-700', sub: 'sociétés' },
  { label: 'Congés à valider',   value: '—',   icon: Calendar,   bg: 'bg-amber-100 text-amber-700',   sub: 'En attente' },
  { label: 'Notes de frais',     value: '—',   icon: Receipt,    bg: 'bg-emerald-100 text-emerald-700', sub: 'À traiter' },
  { label: 'Postes ouverts',     value: '—',   icon: Briefcase,  bg: 'bg-pink-100 text-pink-700',     sub: 'candidats' },
  { label: 'Entretiens à venir', value: '—',   icon: Star,       bg: 'bg-indigo-100 text-indigo-700', sub: 'Planifiés' },
  { label: 'Formations',         value: '—',   icon: BookOpen,   bg: 'bg-cyan-100 text-cyan-700',     sub: 'Au catalogue' },
  { label: 'CDD à échéance',     value: '—',   icon: FileText,   bg: 'bg-red-100 text-red-700',       sub: '< 90j' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm">Vue d'ensemble de l'activité RH du groupe.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-5 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${k.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{k.label}</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{k.value}</div>
                <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Sprint 0 — Bootstrap en cours</h2>
        <p className="text-sm text-slate-600 mb-4">
          La nouvelle architecture full-stack est en cours de mise en place. Les widgets seront
          connectés aux vraies données dès la fin du Sprint 1.
        </p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>✅ Sprint 0 — Bootstrap monorepo (en cours)</li>
          <li>⏳ Sprint 1 — Paramétrage entité (organismes obligatoires, conventions)</li>
          <li>⏳ Sprint 2 — Pré-onboarding salarié (lien public + OCR)</li>
          <li>⏳ Sprint 3 — Génération contrat IA + signature</li>
          <li>⏳ Sprint 4 — Onboarding automatisé</li>
          <li>⏳ Sprint 5+ — Espace salarié, validations, paie, etc.</li>
        </ul>
      </div>
    </div>
  );
}
