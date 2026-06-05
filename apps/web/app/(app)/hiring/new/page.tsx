'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { ArrowLeft, Send, Copy, ExternalLink, Upload, X } from 'lucide-react';

const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI — Contrat à durée indéterminée' },
  { value: 'CDD', label: 'CDD — Contrat à durée déterminée' },
  { value: 'Apprentissage', label: 'Apprentissage' },
  { value: 'Professionnalisation', label: 'Professionnalisation' },
  { value: 'Stage', label: 'Stage' },
  { value: 'Interim', label: 'Intérim' },
  { value: 'Freelance', label: 'Freelance / Prestation' },
];

const CIVILITES = ['M.', 'Mme', 'Mlle'];
const STATUTS = ['Salarié', 'Cadre', 'Agent de maîtrise', 'Employé', 'Apprenti'];
const NIVEAUX_HIERARCHIQUES = ['N-3', 'N-2', 'N-1', 'N', 'N+1', 'N+2'];
const ID_TYPES = ['CNI', 'Passeport', 'Titre de séjour'];

export default function NewHirePage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [data, setData] = useState<any>({
    // Identité
    civility: 'M.', firstName: '', lastName: '', usageName: '',
    birthDate: '', socialSecurity: '',
    idType: 'CNI', idNumber: '', idExpiryDate: '',
    rqth: false,
    // Coordonnées
    email: '', phone: '',
    address: '', postalCode: '', city: '',
    // Poste
    tenantId: '', jobTitle: '', contractType: 'CDI',
    statusClass: 'Employé', hierarchyLevel: 'N',
    grossSalary: 2500, startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    managerId: '',
    apprenticeshipType: '',
    // Planning hebdomadaire type
    schedule: {
      lundi:    { start: '09:00', end: '17:30', break: 60 },
      mardi:    { start: '09:00', end: '17:30', break: 60 },
      mercredi: { start: '09:00', end: '17:30', break: 60 },
      jeudi:    { start: '09:00', end: '17:30', break: 60 },
      vendredi: { start: '09:00', end: '17:30', break: 60 },
      samedi:   { start: '', end: '', break: 0 },
      dimanche: { start: '', end: '', break: 0 },
    },
    documents: [] as any[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<any>(null);

  useEffect(() => {
    api.get<any[]>('/tenants').then((list) => {
      setTenants(list);
      if (list[0]) setData((d: any) => ({ ...d, tenantId: list[0].id }));
    });
    api.get<any[]>('/employees').then(setEmployees).catch(() => {});
  }, []);

  const weeklyHours = Object.values(data.schedule).reduce((sum: number, day: any) => {
    if (!day.start || !day.end) return sum;
    const [sh, sm] = day.start.split(':').map(Number);
    const [eh, em] = day.end.split(':').map(Number);
    return sum + Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (day.break || 0)) / 60);
  }, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...data,
        grossSalary: Number(data.grossSalary),
        weeklyHours: Math.round(weeklyHours),
      };
      if (!payload.managerId) delete payload.managerId;
      const c = await api.post('/hire-processes', payload);
      setCreated(c);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  function handleFile(key: string, file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setData((d: any) => ({
        ...d,
        documents: [...(d.documents || []).filter((doc: any) => doc.key !== key),
          { key, filename: file.name, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString() }],
      }));
    };
    reader.readAsDataURL(file);
  }

  const isApprenticeship = ['Apprentissage', 'Professionnalisation'].includes(data.contractType);
  const isCdd = ['CDD', 'Stage', 'Interim'].includes(data.contractType);

  if (created) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/preboarding/${created.token}`;
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Embauche démarrée ✅</h1>
        <Card>
          <CardHeader><CardTitle>Lien à envoyer au candidat</CardTitle></CardHeader>
          <CardBody>
            <p className="text-sm text-slate-600 mb-3">
              <strong>{created.firstName} {created.lastName}</strong> reçoit ce lien pour compléter son dossier :
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs break-all mb-3">{url}</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { navigator.clipboard.writeText(url); alert('Lien copié !'); }} className="btn btn-primary">
                <Copy className="w-4 h-4" /> Copier le lien
              </button>
              <a href={url} target="_blank" rel="noopener" className="btn btn-secondary">
                <ExternalLink className="w-4 h-4" /> Ouvrir
              </a>
              <button onClick={() => router.push('/hiring' as any)} className="btn btn-secondary">Retour à la liste</button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pipeline embauche</CardTitle></CardHeader>
          <CardBody className="text-sm space-y-2">
            <div>1. ✅ <strong>Fiche navette créée</strong></div>
            <div>2. ⏳ Candidat complète ses infos et joint les pièces</div>
            <div>3. ⏳ Validation RH</div>
            <div>4. ⏳ Génération du contrat</div>
            <div>5. ⏳ Signature électronique</div>
            <div>6. ⏳ DPAE URSSAF</div>
            <div>7. 🎉 Création du salarié → bascule en <strong>Collaborateurs</strong></div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center gap-3 sticky top-0 bg-slate-100 z-10 py-2">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Démarrer une embauche</h1>
      </div>

      {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>}

      {/* IDENTITÉ */}
      <Card>
        <CardHeader><CardTitle>👤 Identité du futur salarié</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-3 gap-4">
            <Select required label="Civilité" value={data.civility} onChange={(e) => setData({ ...data, civility: e.target.value })}>
              {CIVILITES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input required label="Prénom" value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
            <Input required label="Nom de naissance" value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
            <Input className="md:col-span-3" label="Nom d'usage (si différent)" value={data.usageName} onChange={(e) => setData({ ...data, usageName: e.target.value })} />
            <Input required type="date" label="Date de naissance" value={data.birthDate} onChange={(e) => setData({ ...data, birthDate: e.target.value })} />
            <Input required label="N° Sécurité Sociale (15 chiffres)" value={data.socialSecurity} onChange={(e) => setData({ ...data, socialSecurity: e.target.value })} pattern="[12][0-9]{14}" placeholder="1 85 03 75 110 123 45" />
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={data.rqth} onChange={(e) => setData({ ...data, rqth: e.target.checked })} />
              <span className="text-sm">Reconnu handicapé (RQTH)</span>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* PIÈCE D'IDENTITÉ */}
      <Card>
        <CardHeader><CardTitle>🪪 Pièce d'identité</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-3 gap-4">
            <Select required label="Type de pièce" value={data.idType} onChange={(e) => setData({ ...data, idType: e.target.value })}>
              {ID_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input required label="N° de pièce" value={data.idNumber} onChange={(e) => setData({ ...data, idNumber: e.target.value })} />
            <Input required type="date" label="Date d'expiration" value={data.idExpiryDate} onChange={(e) => setData({ ...data, idExpiryDate: e.target.value })} />
          </div>
        </CardBody>
      </Card>

      {/* COORDONNÉES */}
      <Card>
        <CardHeader><CardTitle>📍 Coordonnées</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input required type="email" label="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
            <Input label="Téléphone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
            <Input required className="md:col-span-2" label="Adresse" value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} />
            <Input required label="Code postal" value={data.postalCode} onChange={(e) => setData({ ...data, postalCode: e.target.value })} />
            <Input required label="Ville" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
          </div>
        </CardBody>
      </Card>

      {/* POSTE ET CONTRAT */}
      <Card>
        <CardHeader><CardTitle>💼 Poste et contrat</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Select required label="Société d'affectation" value={data.tenantId} onChange={(e) => setData({ ...data, tenantId: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
            </Select>
            <Input required label="Intitulé du poste" value={data.jobTitle} onChange={(e) => setData({ ...data, jobTitle: e.target.value })} />
            <Select label="Type de contrat" value={data.contractType} onChange={(e) => setData({ ...data, contractType: e.target.value })}>
              {CONTRACT_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
            <Select label="Statut" value={data.statusClass} onChange={(e) => setData({ ...data, statusClass: e.target.value })}>
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            {isApprenticeship && (
              <Select className="md:col-span-2" label="Diplôme préparé" value={data.apprenticeshipType} onChange={(e) => setData({ ...data, apprenticeshipType: e.target.value })}>
                <option value="">—</option>
                <option value="CAP">CAP</option><option value="BAC_PRO">Bac Pro</option>
                <option value="BTS">BTS</option><option value="LICENCE_PRO">Licence Pro</option>
                <option value="MASTER">Master</option><option value="TITRE_PRO">Titre Pro RNCP</option>
              </Select>
            )}
            <Select label="Niveau hiérarchique" value={data.hierarchyLevel} onChange={(e) => setData({ ...data, hierarchyLevel: e.target.value })}>
              {NIVEAUX_HIERARCHIQUES.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Select label="Manager (valideur des congés)" value={data.managerId} onChange={(e) => setData({ ...data, managerId: e.target.value })}>
              <option value="">—</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.jobTitle}</option>)}
            </Select>
            <Input required type="number" label="Salaire brut mensuel (€)" value={data.grossSalary} onChange={(e) => setData({ ...data, grossSalary: e.target.value })} />
            <Input required type="date" label="Date de début de contrat" value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value })} />
            {(isCdd || isApprenticeship) && (
              <Input required type="date" label="Date de fin de contrat" value={data.endDate} onChange={(e) => setData({ ...data, endDate: e.target.value })} />
            )}
          </div>
        </CardBody>
      </Card>

      {/* PLANNING HEBDOMADAIRE */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Planning hebdomadaire type</CardTitle>
        </CardHeader>
        <CardBody>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Jour</th><th>Début</th><th>Fin</th><th>Pause (min)</th><th>Heures</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.schedule).map(([day, sched]: [string, any]) => {
                let h = 0;
                if (sched.start && sched.end) {
                  const [sh, sm] = sched.start.split(':').map(Number);
                  const [eh, em] = sched.end.split(':').map(Number);
                  h = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (sched.break || 0)) / 60);
                }
                return (
                  <tr key={day} className="border-b border-slate-100">
                    <td className="py-2 capitalize font-medium">{day}</td>
                    <td><input type="time" value={sched.start} onChange={(e) => setData({ ...data, schedule: { ...data.schedule, [day]: { ...sched, start: e.target.value } } })} className="input !py-1 w-28" /></td>
                    <td><input type="time" value={sched.end} onChange={(e) => setData({ ...data, schedule: { ...data.schedule, [day]: { ...sched, end: e.target.value } } })} className="input !py-1 w-28" /></td>
                    <td><input type="number" value={sched.break} onChange={(e) => setData({ ...data, schedule: { ...data.schedule, [day]: { ...sched, break: +e.target.value } } })} className="input !py-1 w-20" /></td>
                    <td className="font-semibold">{h.toFixed(1)}h</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50">
                <td colSpan={4} className="py-2 font-semibold text-right">Total hebdomadaire :</td>
                <td className="font-bold text-brand-700">{weeklyHours.toFixed(1)}h</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* PIÈCES JOINTES */}
      <Card>
        <CardHeader><CardTitle>📎 Pièces jointes</CardTitle></CardHeader>
        <CardBody>
          <p className="text-sm text-slate-500 mb-4">Vous pouvez joindre les pièces dès maintenant, ou demander au salarié de le faire via son lien de pré-embauche.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { key: 'cv', label: 'CV' },
              { key: 'id_card', label: 'Pièce d\'identité' },
              { key: 'vital_card', label: 'Carte vitale' },
              { key: 'rib', label: 'RIB' },
              { key: 'residence_proof', label: 'Justificatif de domicile' },
              { key: 'photo', label: 'Photo d\'identité' },
            ].map((d) => {
              const doc = data.documents.find((x: any) => x.key === d.key);
              return (
                <label key={d.key} className="border border-dashed border-slate-300 rounded p-3 cursor-pointer hover:border-brand-500 hover:bg-brand-50">
                  <div className="text-xs uppercase font-semibold text-slate-500 mb-1">{d.label}</div>
                  {doc ? (
                    <div className="text-sm text-emerald-700">✓ {doc.filename} <span className="text-xs text-slate-500">({Math.round(doc.size / 1024)} Ko)</span></div>
                  ) : (
                    <div className="text-sm text-slate-400 flex items-center gap-1"><Upload className="w-4 h-4" /> Téléverser</div>
                  )}
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && handleFile(d.key, e.target.files[0])} />
                </label>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end pb-8">
        <button type="submit" disabled={saving} className="btn btn-primary">
          <Send className="w-4 h-4" /> {saving ? 'Création…' : 'Démarrer l\'embauche'}
        </button>
      </div>
    </form>
  );
}
