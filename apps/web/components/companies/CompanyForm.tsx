'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { api } from '@/lib/api';
import type { Tenant, Convention } from '@/types/tenant';
import { Save, ArrowLeft } from 'lucide-react';

interface Props { tenant?: Partial<Tenant>; mode: 'create' | 'edit'; organisationId?: string; }

export function CompanyForm({ tenant, mode, organisationId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<any>({
    code: '', name: '', type: 'SIEGE', siren: '', siret: '', address: '',
    apeCode: '', urssafCode: '', urssafName: '',
    repName: '', repRole: '',
    conventionCode: 'IDCC_3249',
    medicalProvider: {}, healthInsurance: { shareEmployer: 50 },
    providentInsurance: {}, pensionFund: { name: 'AG2R LA MONDIALE' },
    workInjuryFund: { name: 'CPAM', rate: 1.20 },
    apprenticeshipTax: {},
    cseRepresentative: '', safetyOfficer: '',
    active: true,
    organisationId,
    ...tenant,
    medicalProvider: tenant?.medicalProvider || {},
    healthInsurance: tenant?.healthInsurance || { shareEmployer: 50 },
    providentInsurance: tenant?.providentInsurance || {},
    pensionFund: tenant?.pensionFund || { name: 'AG2R LA MONDIALE' },
    workInjuryFund: tenant?.workInjuryFund || { name: 'CPAM', rate: 1.20 },
    apprenticeshipTax: tenant?.apprenticeshipTax || {},
  });
  const [conventions, setConventions] = useState<Convention[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Convention[]>('/conventions')
      .then(setConventions)
      .catch(() => {/* tolérant — la liste reste vide */});
  }, []);

  function setField(path: string, value: any) {
    setData((d: any) => {
      const next = { ...d };
      const parts = path.split('.');
      let target = next;
      for (let i = 0; i < parts.length - 1; i++) {
        target[parts[i]] = { ...(target[parts[i]] || {}) };
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...data,
        // numbers
        healthInsurance: { ...data.healthInsurance, shareEmployer: Number(data.healthInsurance.shareEmployer) || 50 },
        workInjuryFund:  { ...data.workInjuryFund,  rate: Number(data.workInjuryFund.rate) || 1.20 },
        apprenticeshipTax: { ...data.apprenticeshipTax, rate: Number(data.apprenticeshipTax.rate) || 0.68 },
      };
      if (mode === 'create') {
        const created = await api.post('/tenants', payload);
        router.push(`/companies/${created.id}`);
      } else {
        await api.patch(`/tenants/${tenant!.id}`, payload);
        router.push('/companies');
      }
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'create' ? 'Nouvelle société' : `${data.code} — ${data.name}`}
          </h1>
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Identité juridique</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Code interne" required value={data.code} onChange={(e) => setField('code', e.target.value)} placeholder="003-DBS-1234" />
            <Select label="Type" value={data.type} onChange={(e) => setField('type', e.target.value)}>
              <option value="SIEGE">Siège</option>
              <option value="ETS">Établissement</option>
            </Select>
            <Input className="md:col-span-2" label="Nom de la société" required value={data.name} onChange={(e) => setField('name', e.target.value)} />
            <Input label="SIREN (9 chiffres)" value={data.siren || ''} onChange={(e) => setField('siren', e.target.value)} pattern="[0-9]{9}" />
            <Input label="SIRET (14 chiffres)" value={data.siret || ''} onChange={(e) => setField('siret', e.target.value)} pattern="[0-9]{14}" />
            <Input label="Code APE/NAF" value={data.apeCode || ''} onChange={(e) => setField('apeCode', e.target.value)} placeholder="8559A" />
            <Input label="N° URSSAF" value={data.urssafCode || ''} onChange={(e) => setField('urssafCode', e.target.value)} />
            <Input className="md:col-span-2" label="Adresse complète" value={data.address || ''} onChange={(e) => setField('address', e.target.value)} />
            <Input label="Représentant légal" value={data.repName || ''} onChange={(e) => setField('repName', e.target.value)} />
            <Input label="Fonction du représentant" value={data.repRole || ''} onChange={(e) => setField('repRole', e.target.value)} placeholder="Président, Gérant…" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Convention collective applicable</CardTitle></CardHeader>
        <CardBody>
          <Select
            label="Convention (IDCC)"
            required
            value={data.conventionCode || ''}
            onChange={(e) => setField('conventionCode', e.target.value)}
            hint="La convention détermine automatiquement période d'essai, congés conventionnels, préavis et minima salariaux."
          >
            <option value="">— Sélectionner —</option>
            {conventions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} (IDCC {c.code.replace('IDCC_', '')})
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visite médicale / Santé au travail</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom de l'organisme (SST)" value={data.medicalProvider?.name || ''} onChange={(e) => setField('medicalProvider.name', e.target.value)} placeholder="Ex. ACMS, ASTE…" />
            <Input label="Téléphone" value={data.medicalProvider?.phone || ''} onChange={(e) => setField('medicalProvider.phone', e.target.value)} />
            <Input className="md:col-span-2" label="Adresse" value={data.medicalProvider?.address || ''} onChange={(e) => setField('medicalProvider.address', e.target.value)} />
            <Input label="Email de contact" type="email" value={data.medicalProvider?.email || ''} onChange={(e) => setField('medicalProvider.email', e.target.value)} />
            <Input label="Médecin référent" value={data.medicalProvider?.doctor || ''} onChange={(e) => setField('medicalProvider.doctor', e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mutuelle santé (obligatoire)</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom de la mutuelle" value={data.healthInsurance?.name || ''} onChange={(e) => setField('healthInsurance.name', e.target.value)} placeholder="Harmonie Mutuelle, AG2R…" />
            <Input label="N° de contrat" value={data.healthInsurance?.contractNumber || ''} onChange={(e) => setField('healthInsurance.contractNumber', e.target.value)} />
            <Input label="Téléphone" value={data.healthInsurance?.phone || ''} onChange={(e) => setField('healthInsurance.phone', e.target.value)} />
            <Input type="number" min={50} max={100} label="Part employeur (%)" value={data.healthInsurance?.shareEmployer ?? 50} onChange={(e) => setField('healthInsurance.shareEmployer', e.target.value)} hint="Minimum légal : 50%" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prévoyance</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom de l'organisme" value={data.providentInsurance?.name || ''} onChange={(e) => setField('providentInsurance.name', e.target.value)} />
            <Input label="N° de contrat" value={data.providentInsurance?.contractNumber || ''} onChange={(e) => setField('providentInsurance.contractNumber', e.target.value)} />
            <Input className="md:col-span-2" label="Téléphone" value={data.providentInsurance?.phone || ''} onChange={(e) => setField('providentInsurance.phone', e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Caisse de retraite complémentaire</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom de la caisse" value={data.pensionFund?.name || ''} onChange={(e) => setField('pensionFund.name', e.target.value)} placeholder="AG2R LA MONDIALE, Malakoff Humanis…" />
            <Input label="Code adhérent" value={data.pensionFund?.code || ''} onChange={(e) => setField('pensionFund.code', e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Autres obligations sociales</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Caisse AT-MP" value={data.workInjuryFund?.name || ''} onChange={(e) => setField('workInjuryFund.name', e.target.value)} />
            <Input type="number" step={0.01} label="Taux AT-MP (%)" value={data.workInjuryFund?.rate ?? 1.20} onChange={(e) => setField('workInjuryFund.rate', e.target.value)} />
            <Input label="Collecteur taxe apprentissage" value={data.apprenticeshipTax?.collector || ''} onChange={(e) => setField('apprenticeshipTax.collector', e.target.value)} />
            <Input type="number" step={0.01} label="Taux taxe apprentissage (%)" value={data.apprenticeshipTax?.rate ?? 0.68} onChange={(e) => setField('apprenticeshipTax.rate', e.target.value)} />
            <Input label="Représentant CSE" value={data.cseRepresentative || ''} onChange={(e) => setField('cseRepresentative', e.target.value)} />
            <Input label="Référent sécurité" value={data.safetyOfficer || ''} onChange={(e) => setField('safetyOfficer', e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2 pb-8">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Annuler</button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
