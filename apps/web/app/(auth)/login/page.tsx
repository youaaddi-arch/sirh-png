'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('emir.deniz@pn-groupe.fr');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('sirh.token', data.token);
      localStorage.setItem('sirh.user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  const accounts = [
    { role: 'Administrateur', email: 'emir.deniz@pn-groupe.fr', pwd: 'admin' },
    { role: 'RH',              email: 'keziban.deniz@pn-groupe.fr', pwd: 'rh' },
    { role: 'Manager',         email: 'delphine.pavis@pn-groupe.fr', pwd: 'manager' },
    { role: 'Paie',            email: 'thomas.bernard@pn-groupe.fr', pwd: 'paie' },
    { role: 'Collaborateur',   email: 'sophie.martin@pn-groupe.fr', pwd: 'employe' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 to-brand-900 text-white p-10 hidden md:flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo-mark.svg" alt="PaNo" className="w-14 h-14 bg-white rounded-xl p-2" />
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>PaNo</div>
                <div className="text-brand-100 text-xs tracking-wider">by PARIS NORD GROUPE</div>
                <div className="text-brand-200 text-[10px] uppercase tracking-widest font-semibold mt-1">Système d'Information RH</div>
              </div>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4">Bienvenue sur votre espace RH.</h2>
            <p className="text-brand-100 leading-relaxed">
              Une plateforme unifiée pour gérer congés, temps, notes de frais, entretiens,
              formation, recrutement et paie de toutes les sociétés du groupe.
            </p>
          </div>
          <div className="text-brand-200 text-xs">© {new Date().getFullYear()} Paris Nord Groupe</div>
        </div>

        <div className="p-8 md:p-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h1>
          <p className="text-slate-500 text-sm mb-6">Entrez vos identifiants pour accéder au SIRH.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Comptes de démonstration</p>
            <div className="space-y-1 text-xs">
              {accounts.map(a => (
                <button key={a.email} type="button"
                        onClick={() => { setEmail(a.email); setPassword(a.pwd); }}
                        className="w-full text-left flex justify-between items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">{a.role}</span>
                  <span className="text-slate-400 font-mono">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
