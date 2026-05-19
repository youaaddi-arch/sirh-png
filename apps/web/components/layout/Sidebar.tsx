'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, Clock, Receipt, FileText,
  GraduationCap, Briefcase, Building2, Settings, Network, Star,
  UserPlus, BarChart3, Mail, BookOpen, PenSquare,
} from 'lucide-react';

const Sitemap = Network;

interface NavItem { href: string; label: string; icon: any; roles?: string[]; }

const SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: 'Mon espace', items: [
    { href: '/my-space', label: 'Accueil', icon: LayoutDashboard },
  ]},
  { title: 'Pilotage', items: [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin','rh','manager','paie'] },
    { href: '/reports',   label: 'Rapports',        icon: BarChart3, roles: ['admin','rh','manager'] },
    { href: '/planning',  label: 'Planning équipe', icon: Calendar, roles: ['admin','rh','manager','paie'] },
  ]},
  { title: 'Collaborateurs', items: [
    { href: '/employees', label: 'Collaborateurs', icon: Users, roles: ['admin','rh','manager','paie'] },
    { href: '/org-chart', label: 'Organigramme', icon: Sitemap },
    { href: '/hiring',    label: 'Embauches',   icon: UserPlus, roles: ['admin','rh'] },
    { href: '/onboarding',label: 'Onboarding',  icon: UserPlus, roles: ['admin','rh'] },
  ]},
  { title: 'Temps & absences', items: [
    { href: '/leaves',     label: 'Congés', icon: Calendar },
    { href: '/timesheets', label: 'Temps',  icon: Clock },
  ]},
  { title: 'Argent', items: [
    { href: '/expenses',     label: 'Notes de frais',   icon: Receipt },
    { href: '/payroll',      label: 'Bulletins de paie', icon: FileText, roles: ['admin','rh','paie'] },
    { href: '/payroll-vars', label: 'Variables de paie', icon: BarChart3, roles: ['admin','rh','paie'] },
  ]},
  { title: 'Performance', items: [
    { href: '/reviews',   label: 'Entretiens', icon: Star },
    { href: '/trainings', label: 'Formation',  icon: BookOpen },
    { href: '/tests',     label: 'Tests',      icon: GraduationCap },
  ]},
  { title: 'Talents', items: [
    { href: '/recruitment', label: 'Recrutement', icon: Briefcase, roles: ['admin','rh','manager'] },
    { href: '/contracts',   label: 'Contrats',    icon: PenSquare, roles: ['admin','rh'] },
    { href: '/letters',     label: 'Courriers RH', icon: Mail,     roles: ['admin','rh','manager'] },
    { href: '/documents',   label: 'Documents',   icon: FileText },
  ]},
  { title: 'Référentiel', items: [
    { href: '/companies', label: 'Sociétés',   icon: Building2, roles: ['admin','rh'] },
    { href: '/settings',  label: 'Paramètres', icon: Settings, roles: ['admin'] },
  ]},
];

export function Sidebar({ role = 'admin' }: { role?: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-60 bg-brand-950 text-slate-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-brand-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white text-brand-700 flex items-center justify-center font-bold">PN</div>
          <div>
            <div className="font-semibold text-white">Paris Nord Groupe</div>
            <div className="text-[11px] text-brand-200">SIRH multi-entités</div>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 px-3 mt-4 mb-1 font-semibold">{s.title}</div>
            {s.items
              .filter((i) => !i.roles || i.roles.includes(role))
              .map((i) => {
                const Icon = i.icon;
                const active = pathname === i.href;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? 'bg-brand-700 text-white shadow'
                        : 'text-slate-300 hover:bg-brand-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{i.label}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-brand-900 text-[11px] text-brand-300 text-center">
        v2.0 Sprint 0 • © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
