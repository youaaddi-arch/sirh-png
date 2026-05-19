'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { ArrowLeft, Send } from 'lucide-react';
import type { Tenant } from '@/types/tenant';

export default function NewHirePage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [data, setData] = useState<any>({
    firstName: '', lastName: '', email: '',
    tenantId: '', jobTitle: '',
    contractType: 'CDI', statusClass: 'Employé',
    grossSalary: 2500, startDate: new Date().toISOString().slice(0, 10),
    weeklyHours: 35, managerId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<any>(null);

  useEffect(() => {
    api.get<Tenant[]>('/tenants').then((list) => {
      setTenants(list);
      if (list[0]) setData((d: any) => ({ ...d, tenantId: list[0].id }));
    });
    api.get<any[]>('/employees').then(setEmployees).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...data, grossSalary: Number(data.grossSalary), weeklyHours: Number(data.weeklyHours) };
      if (!payload.managerId) delete payload.managerId;
      const c = await api.post('/hire-processes', payload);
      setCreated(c);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (created) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/preboarding/${created.token}`;
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Embauche démarrée ✅</h1>
        <Card>
          <CardHeader><CardTitle>Lien de pré-embauche à envoyer au candidat</CardTitle></CardHeader>
          <CardBody>
            <p className="text-sm text-slate-600 mb-3">
              Le candidat <strong>{created.firstName} {created.lastName}</strong> recevra ce lien pour remplir ses infos et joindre ses pièces :
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs break-all mb-3">{url}</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => navigator.clipboard.writeText(url)} className="btn btn-primary">Copier le lien</button>
              <a href={url} target="_blank" rel="noopener" className="btn btn-secondary">Ouvrir comme candidat ➜</a>
              <button onClick={() => router.push('/hiring')} className="btn btn-secondary">Retour à la liste</button>
            </div>
            <div className="mt-4 text-sm text-slate-500">📧 À envoyer à : <strong>{created.email}</strong></div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Démarrer une embauche</h1>
      </div>

      {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Informations du candidat</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input required label="Prénom" value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
            <Input required label="Nom" value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
            <Input required type="email" className="md:col-span-2" label="Email du candidat (lien envoyé ici)"
                   value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Poste et contrat</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Select required label="Société d'affectation" value={data.tenantId} onChange={(e) => setData({ ...data, tenantId: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
            </Select>
            <Input required label="Intitulé du poste" value={data.jobTitle} onChange={(e) => setData({ ...data, jobTitle: e.target.value })} />
            <Select label="Type de contrat" value={data.contractType} onChange={(e) => setData({ ...data, contractType: e.target.value })}>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Alternance">Alternance</option>
              <option value="Stage">Stage</option>
            </Select>
            <Select label="Statut" value={data.statusClass} onChange={(e) => setData({ ...data, statusClass: e.target.value })}>
              <option value="Employé">Employé</option>
              <option value="Agent de maîtrise">Agent de maîtrise</option>
              <option value="Cadre">Cadre</option>
            </Select>
            <Input required type="number" label="Salaire brut mensuel (€)" value={data.grossSalary} onChange={(e) => setData({ ...data, grossSalary: e.target.value })} />
            <Input type="number" min={1} max={48} label="Heures par semaine" value={data.weeklyHours} onChange={(e) => setData({ ...data, weeklyHours: e.target.value })} />
            <Input required type="date" label="Date de démarrage" value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value })} />
            <Select label="Manager (responsable)" value={data.managerId} onChange={(e) => setData({ ...data, managerId: e.target.value })}>
              <option value="">—</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.jobTitle}</option>)}
            </Select>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            La période d'essai et les jours de congés annuels seront calculés automatiquement
            selon la convention collective de la société d'affectation.
          </p>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn btn-primary">
          <Send className="w-4 h-4" /> {saving ? 'Création…' : 'Créer et générer le lien candidat'}
        </button>
      </div>
    </form>
  );
}
