'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';

export function Topbar({ user }: { user?: { firstName?: string; lastName?: string; email?: string; role?: string } }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem('sirh.token');
    localStorage.removeItem('sirh.user');
    router.push('/login');
  }

  const initials = user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?';
  const name = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}` : user?.email;
  const roleLabel = ({ admin: 'Administrateur', rh: 'RH', manager: 'Manager', paie: 'Paie', employe: 'Collaborateur' } as any)[user?.role || ''] || user?.role;

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
      <div className="relative max-w-md flex-1 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input className="input pl-10 bg-slate-50 border-slate-200" placeholder="Rechercher un collaborateur, un congé…" />
      </div>
      <div className="flex-1 lg:hidden" />
      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 relative">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">3</span>
      </button>
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 hover:bg-slate-100 rounded-lg pl-1 pr-2 py-1">
          <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center text-sm">{initials}</span>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-slate-500">{roleLabel}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 card overflow-hidden z-20">
            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-red-600 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
