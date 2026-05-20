'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sirh.token');
    const u = localStorage.getItem('sirh.user');
    if (!token || !u) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(u));
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Chargement…</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar role={user?.role || 'employe'} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
