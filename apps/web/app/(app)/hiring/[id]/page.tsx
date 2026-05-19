'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Mail, CheckCircle2, Circle, FileText } from 'lucide-react';
import type { HireProcess, HireStatus } from '@/types/hiring';

const FLOW: HireStatus[] = ['pre_embauche', 'soumis', 'valide', 'contrat_genere', 'contrat_signe', 'embauche'];
const STEP_LABEL: Record<HireStatus, string> = {
  pre_embauche: '1. Lien candidat envoyé',
  soumis: '2. Dossier soumis par le candidat',
  valide: '3. Pièces validées par RH',
  contrat_genere: '4. Contrat généré',
  contrat_signe: '5. Contrat signé',
  embauche: '6. Salarié créé',
  annule: 'Annulé',
};
const DOC_LABEL: Record<string, string> = {
  cv: 'CV', id_card: 'Pièce d\'identité', vital_card: 'Carte vitale',
  rib: 'RIB', diploma: 'Diplôme', residence_proof: 'Justificatif domicile',
  mutuelle: 'Mutuelle actuelle', photo: 'Photo',
};

export default function HireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<HireProcess | null>(null);
  const [error, setError] = useState('');

  function load() {
    api.get<HireProcess>(`/hire-processes/${id}`).then(setP).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function advance(status: HireStatus, reason?: string) {
    try {
      await api.patch(`/hire-processes/${id}/advance`, { status, reason });
      load();
    } catch (e: any) { alert(e.message); }
  }

  async function generateContract() {
    try {
      const c = await api.post('/contracts/generate-from-hire', { hireProcessId: id });
      await api.patch(`/hire-processes/${id}/advance`, { status: 'contrat_genere' });
      router.push(`/contracts/${c.id}`);
    } catch (e: any) { alert('Erreur génération : ' + e.message); }
  }

  function copyLink() {
    if (!p) return;
    const url = `${window.location.origin}/preboarding/${p.token}`;
    navigator.clipboard.writeText(url).then(() => alert(`Lien copié :\n${url}`));
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!p) return <div className="text-slate-500">Chargement…</div>;

  const currentIndex = FLOW.indexOf(p.status);
  const draft = p.draftData || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
          <h1 className="text-2xl font-bold text-slate-900">{p.firstName} {p.lastName}</h1>
          <Badge variant={p.status === 'embauche' ? 'green' : 'amber'}>{STEP_LABEL[p.status]}</Badge>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLink} className="btn btn-secondary"><Mail className="w-4 h-4" /> Copier le lien candidat</button>
        </div>
      </div>

      {/* Workflow */}
      <Card>
        <CardHeader><CardTitle>Workflow d'embauche</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          {FLOW.map((step, i) => {
            const done = i < currentIndex;
            const cur = i === currentIndex;
            return (
              <div key={step} className={`flex items-start gap-3 p-3 rounded-lg ${cur ? 'bg-brand-50 border border-brand-200' : ''}`}>
                {done ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <Circle className={`w-5 h-5 ${cur ? 'text-brand-600' : 'text-slate-300'} flex-shrink-0`} />}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${done || cur ? 'text-slate-900' : 'text-slate-500'}`}>{STEP_LABEL[step]}</div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {p.status === 'soumis' && (
              <button onClick={() => advance('valide')} className="btn btn-primary">Valider les pièces ✓</button>
            )}
            {p.status === 'valide' && (
              <button onClick={generateContract} className="btn btn-primary">
                ✨ Générer le contrat avec IA Claude
              </button>
            )}
            {p.status === 'contrat_genere' && (
              <button onClick={() => advance('contrat_signe')} className="btn btn-primary">Marquer comme signé</button>
            )}
            {p.status === 'contrat_signe' && (
              <button onClick={() => advance('embauche')} className="btn btn-primary">Créer le salarié et finaliser</button>
            )}
            {p.status !== 'embauche' && p.status !== 'annule' && (
              <button onClick={() => { const r = prompt('Motif d\'annulation ?') || ''; advance('annule', r); }} className="btn btn-secondary text-red-600">
                Annuler le dossier
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pièces */}
        <Card>
          <CardHeader><CardTitle>Pièces fournies</CardTitle></CardHeader>
          <CardBody>
            {!p.documents || p.documents.length === 0 ? (
              <p className="text-sm text-slate-500">Le candidat n'a pas encore téléversé de pièces.</p>
            ) : (
              <ul className="space-y-2">
                {p.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <strong>{DOC_LABEL[d.key] || d.key}</strong>
                      <span className="text-slate-600">— {d.filename}</span>
                      <span className="text-xs text-slate-400">({Math.round(d.size / 1024)} Ko)</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Données saisies */}
        <Card>
          <CardHeader><CardTitle>Données saisies par le candidat</CardTitle></CardHeader>
          <CardBody>
            {Object.keys(draft).length === 0 ? (
              <p className="text-sm text-slate-500">Le candidat n'a encore rien rempli.</p>
            ) : (
              <dl className="text-sm space-y-1.5">
                {draft.civility && <Row k="Civilité" v={draft.civility} />}
                {draft.firstName && <Row k="Prénom" v={draft.firstName} />}
                {draft.lastName && <Row k="Nom" v={draft.lastName} />}
                {draft.birthDate && <Row k="Date de naissance" v={new Date(draft.birthDate).toLocaleDateString('fr-FR')} />}
                {draft.birthPlace && <Row k="Lieu de naissance" v={draft.birthPlace} />}
                {draft.nationality && <Row k="Nationalité" v={draft.nationality} />}
                {draft.socialSecurity && <Row k="N° Sécu" v={draft.socialSecurity} />}
                {draft.address && <Row k="Adresse" v={`${draft.address || ''} ${draft.postalCode || ''} ${draft.city || ''}`} />}
                {draft.phone && <Row k="Téléphone" v={draft.phone} />}
                {draft.iban && <Row k="IBAN" v={draft.iban} />}
                {draft.familySituation && <Row k="Situation familiale" v={draft.familySituation} />}
                {draft.numChildren !== undefined && <Row k="Enfants" v={String(draft.numChildren)} />}
                {draft.emergencyName && <Row k="Contact urgence" v={`${draft.emergencyName} — ${draft.emergencyPhone || ''}`} />}
              </dl>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Historique */}
      <Card>
        <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
        <CardBody>
          {(!p.history || p.history.length === 0) ? (
            <p className="text-sm text-slate-500">Aucune entrée.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {p.history.slice().reverse().map((h, i) => (
                <li key={i} className="flex items-start gap-3 border-l-2 border-brand-300 pl-3">
                  <span className="text-xs text-slate-400 min-w-[120px]">{new Date(h.at).toLocaleString('fr-FR')}</span>
                  <span>{h.action}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
      <dt className="text-xs uppercase text-slate-500 font-semibold">{k}</dt>
      <dd className="text-slate-900">{v}</dd>
    </div>
  );
}
