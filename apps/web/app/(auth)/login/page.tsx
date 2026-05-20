'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@pn-groupe.fr');
  const [password, setPassword] = useState('Admin2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Identifiants incorrects');
      localStorage.setItem('sirh.token', data.token);
      localStorage.setItem('sirh.user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 to-brand-900 text-white p-10 hidden md:flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white text-brand-700 flex items-center justify-center font-bold text-xl">PN</div>
              <div>
                <div className="text-xl font-bold">Paris Nord Groupe</div>
                <div className="text-brand-100 text-sm">SIRH multi-entités</div>
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
        </div>
      </div>
    </div>
  );
}
