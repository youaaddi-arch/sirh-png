'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Upload, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const REQUIRED_DOCS = [
  { key: 'cv', label: 'CV', required: true },
  { key: 'id_card', label: 'Pièce d\'identité (recto-verso)', required: true },
  { key: 'vital_card', label: 'Carte vitale', required: true },
  { key: 'rib', label: 'RIB', required: true },
  { key: 'residence_proof', label: 'Justificatif de domicile (- 3 mois)', required: true },
  { key: 'diploma', label: 'Diplôme(s)', required: false },
  { key: 'photo', label: 'Photo d\'identité', required: false },
  { key: 'mutuelle', label: 'Attestation mutuelle actuelle', required: false },
];

export default function PreboardingPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [draft, setDraft] = useState<any>({});
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`${API}/preboarding/${token}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Lien invalide ou expiré');
        return r.json();
      })
      .then((d) => {
        setData(d);
        setDraft(d.draftData || {});
        if (d.status !== 'pre_embauche') setDone(true);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  async function saveDraft() {
    try {
      await fetch(`${API}/preboarding/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } catch {}
  }

  async function uploadDoc(key: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/preboarding/${token}/documents/${key}`, { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Upload échoué');
    }
    return res.json();
  }

  async function submit() {
    setSubmitting(true); setError('');
    try {
      await saveDraft();
      const res = await fetch(`${API}/preboarding/${token}/submit`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Soumission échouée');
      }
      setDone(true);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="card p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Lien invalide</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-500">Chargement…</div>;

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-4">
        <div className="card p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Dossier soumis ✅</h1>
          <p className="text-slate-600 mb-4">
            Votre dossier de pré-embauche a bien été reçu. Le service RH va l'étudier et
            vous reviendra rapidement avec votre contrat de travail.
          </p>
          <p className="text-xs text-slate-500">
            Vous pouvez fermer cette page. Vous recevrez un email à {data.email}.
          </p>
        </div>
      </div>
    );
  }

  const steps = ['Identité', 'Coordonnées', 'Famille', 'Bancaire', 'Pièces', 'Confirmation'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-t-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-xl">PN</div>
            <div>
              <div className="text-sm text-slate-500">Paris Nord Groupe — Pré-embauche</div>
              <h1 className="text-2xl font-bold text-slate-900">Bienvenue {data.firstName} !</h1>
              <p className="text-sm text-slate-600">
                Vous allez rejoindre <strong>{data.tenant?.name}</strong> en tant que <strong>{data.jobTitle}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between text-xs border-x border-slate-200">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${i + 1 <= step ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden md:inline ${i + 1 === step ? 'font-semibold text-brand-700' : 'text-slate-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-b-2xl p-6 shadow-lg space-y-6">
          {step === 1 && <Step1 draft={draft} setDraft={setDraft} />}
          {step === 2 && <Step2 draft={draft} setDraft={setDraft} />}
          {step === 3 && <Step3 draft={draft} setDraft={setDraft} />}
          {step === 4 && <Step4 draft={draft} setDraft={setDraft} />}
          {step === 5 && <Step5 token={token} docs={data.documents || []} uploadDoc={uploadDoc} refresh={() => fetch(`${API}/preboarding/${token}`).then(r => r.json()).then(setData)} />}
          {step === 6 && <Step6 draft={draft} documents={data.documents || []} />}

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

          <div className="flex justify-between gap-2 pt-2 border-t border-slate-100">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="btn btn-secondary">← Précédent</button>}
            <div className="flex gap-2 ml-auto">
              {step < 6 ? (
                <button onClick={async () => { await saveDraft(); setStep(step + 1); }} className="btn btn-primary">
                  Continuer →
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Soumission…' : 'Soumettre mon dossier ✓'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="text-center mt-6 text-xs text-brand-200">
          © {new Date().getFullYear()} Paris Nord Groupe — Vos données sont protégées (RGPD)
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <input {...props} className="input" />
    </div>
  );
}
function FieldSelect({ label, children, ...props }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <select {...props} className="input">{children}</select>
    </div>
  );
}

function Step1({ draft, setDraft }: any) {
  return (
    <fieldset>
      <legend className="text-lg font-bold mb-4">1. Identité</legend>
      <div className="grid md:grid-cols-2 gap-4">
        <FieldSelect label="Civilité" required value={draft.civility || ''} onChange={(e: any) => setDraft({ ...draft, civility: e.target.value })}>
          <option value="">—</option>
          <option value="Mme">Madame</option>
          <option value="M.">Monsieur</option>
        </FieldSelect>
        <Field label="Nationalité" value={draft.nationality || 'Française'} onChange={(e: any) => setDraft({ ...draft, nationality: e.target.value })} />
        <Field label="Prénom" required value={draft.firstName || ''} onChange={(e: any) => setDraft({ ...draft, firstName: e.target.value })} />
        <Field label="Nom" required value={draft.lastName || ''} onChange={(e: any) => setDraft({ ...draft, lastName: e.target.value })} />
        <Field label="Nom de jeune fille" value={draft.maidenName || ''} onChange={(e: any) => setDraft({ ...draft, maidenName: e.target.value })} />
        <Field type="date" label="Date de naissance" required value={draft.birthDate || ''} onChange={(e: any) => setDraft({ ...draft, birthDate: e.target.value })} />
        <Field label="Lieu de naissance" required value={draft.birthPlace || ''} onChange={(e: any) => setDraft({ ...draft, birthPlace: e.target.value })} />
        <Field label="Pays de naissance" value={draft.birthCountry || 'France'} onChange={(e: any) => setDraft({ ...draft, birthCountry: e.target.value })} />
        <div className="md:col-span-2">
          <label className="label">N° de Sécurité Sociale (15 chiffres)</label>
          <input className="input font-mono" pattern="[12][0-9]{14}" placeholder="1 85 03 75 110 123 45"
                 value={draft.socialSecurity || ''} onChange={(e) => setDraft({ ...draft, socialSecurity: e.target.value })} />
        </div>
      </div>
    </fieldset>
  );
}

function Step2({ draft, setDraft }: any) {
  return (
    <fieldset>
      <legend className="text-lg font-bold mb-4">2. Coordonnées</legend>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><Field label="Adresse" required value={draft.address || ''} onChange={(e: any) => setDraft({ ...draft, address: e.target.value })} /></div>
        <Field label="Code postal" required value={draft.postalCode || ''} onChange={(e: any) => setDraft({ ...draft, postalCode: e.target.value })} />
        <Field label="Ville" required value={draft.city || ''} onChange={(e: any) => setDraft({ ...draft, city: e.target.value })} />
        <Field type="tel" label="Téléphone" required value={draft.phone || ''} onChange={(e: any) => setDraft({ ...draft, phone: e.target.value })} />
        <Field type="email" label="Email personnel" required value={draft.personalEmail || ''} onChange={(e: any) => setDraft({ ...draft, personalEmail: e.target.value })} />
      </div>
    </fieldset>
  );
}

function Step3({ draft, setDraft }: any) {
  return (
    <fieldset>
      <legend className="text-lg font-bold mb-4">3. Situation familiale</legend>
      <div className="grid md:grid-cols-2 gap-4">
        <FieldSelect label="Situation" required value={draft.familySituation || ''} onChange={(e: any) => setDraft({ ...draft, familySituation: e.target.value })}>
          <option value="">—</option>
          <option value="celibataire">Célibataire</option>
          <option value="marie">Marié(e)</option>
          <option value="pacs">Pacsé(e)</option>
          <option value="divorce">Divorcé(e)</option>
          <option value="veuf">Veuf/Veuve</option>
        </FieldSelect>
        <Field type="number" min={0} label="Nombre d'enfants" value={draft.numChildren ?? 0} onChange={(e: any) => setDraft({ ...draft, numChildren: +e.target.value })} />
        <Field label="Contact d'urgence (nom)" required value={draft.emergencyName || ''} onChange={(e: any) => setDraft({ ...draft, emergencyName: e.target.value })} />
        <Field label="Contact d'urgence (téléphone)" required value={draft.emergencyPhone || ''} onChange={(e: any) => setDraft({ ...draft, emergencyPhone: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!draft.rqth} onChange={(e) => setDraft({ ...draft, rqth: e.target.checked })} /> Bénéficiaire de la RQTH
        </label>
      </div>
    </fieldset>
  );
}

function Step4({ draft, setDraft }: any) {
  return (
    <fieldset>
      <legend className="text-lg font-bold mb-4">4. Coordonnées bancaires</legend>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><Field label="IBAN" required value={draft.iban || ''} onChange={(e: any) => setDraft({ ...draft, iban: e.target.value })} placeholder="FR76 …" /></div>
        <Field label="BIC" value={draft.bic || ''} onChange={(e: any) => setDraft({ ...draft, bic: e.target.value })} />
        <Field label="Banque" value={draft.bankName || ''} onChange={(e: any) => setDraft({ ...draft, bankName: e.target.value })} />
        <Field type="number" step={0.1} label="Taux PAS (%)" value={draft.taxRate ?? 0} onChange={(e: any) => setDraft({ ...draft, taxRate: +e.target.value })} />
      </div>
    </fieldset>
  );
}

function Step5({ token, docs, uploadDoc, refresh }: any) {
  const [uploading, setUploading] = useState<string>('');

  async function handle(key: string, file: File | null) {
    if (!file) return;
    setUploading(key);
    try {
      await uploadDoc(key, file);
      await refresh();
    } catch (e: any) {
      alert(e.message);
    } finally { setUploading(''); }
  }

  return (
    <fieldset>
      <legend className="text-lg font-bold mb-4">5. Pièces justificatives</legend>
      <p className="text-sm text-slate-500 mb-4">PDF, JPG ou PNG — 5 Mo max. Les pièces marquées * sont obligatoires.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {REQUIRED_DOCS.map((d) => {
          const existing = docs.find((x: any) => x.key === d.key);
          return (
            <label key={d.key} className="border border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-brand-500 hover:bg-brand-50 block">
              <div className="text-xs uppercase font-semibold text-slate-500 mb-1">{d.label}{d.required && ' *'}</div>
              {uploading === d.key ? (
                <div className="text-sm text-slate-500">Téléversement…</div>
              ) : existing ? (
                <div className="text-sm text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> {existing.filename} <span className="text-xs text-slate-500">({Math.round(existing.size / 1024)} Ko)</span>
                </div>
              ) : (
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Cliquer pour téléverser
                </div>
              )}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                     onChange={(e) => handle(d.key, e.target.files?.[0] || null)} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Step6({ draft, documents }: any) {
  return (
    <fieldset>
      <legend className="text-lg font-bold mb-4">6. Confirmation</legend>
      <p className="text-sm text-slate-600 mb-4">Vérifiez vos informations avant soumission :</p>
      <div className="bg-slate-50 rounded p-4 text-sm space-y-1">
        <div><strong>Nom :</strong> {draft.civility} {draft.firstName} {draft.lastName}</div>
        <div><strong>Né(e) le :</strong> {draft.birthDate} à {draft.birthPlace}</div>
        <div><strong>Adresse :</strong> {draft.address}, {draft.postalCode} {draft.city}</div>
        <div><strong>Pièces fournies :</strong> {documents.length}</div>
      </div>
      <label className="flex items-start gap-2 text-sm mt-4">
        <input type="checkbox" required className="mt-1" />
        <span>Je certifie sur l'honneur l'exactitude des informations et des pièces fournies, et j'accepte le traitement RGPD de mes données.</span>
      </label>
    </fieldset>
  );
}
