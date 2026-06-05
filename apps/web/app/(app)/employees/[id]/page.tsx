'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, User,
  FileText, PenSquare, BookOpen, Star, Clock, Briefcase, AlertCircle, Edit,
} from 'lucide-react';

const TABS = [
  { key: 'profil',     label: 'Profil',           icon: User },
  { key: 'contrat',    label: 'Contrat',          icon: FileText },
  { key: 'essai',      label: 'Période d\'essai', icon: AlertCircle },
  { key: 'banque',     label: 'Banque & Fiscal', icon: Briefcase },
  { key: 'planning',   label: 'Planning',         icon: Calendar },
  { key: 'documents',  label: 'Documents',        icon: FileText },
  { key: 'courriers',  label: 'Courriers',        icon: Mail },
  { key: 'conges',     label: 'Congés',           icon: Calendar },
  { key: 'paie',       label: 'Paie',             icon: FileText },
  { key: 'entretiens', label: 'Entretiens',       icon: Star },
  { key: 'formation',  label: 'Formation',        icon: BookOpen },
  { key: 'equipe',     label: 'Équipe',           icon: User },
];

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [emp, setEmp] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [tab, setTab] = useState('profil');

  useEffect(() => {
    api.get<any>(`/employees/${id}`).then((e) => {
      setEmp(e);
      if (e?.tenantId) api.get<any>(`/tenants/${e.tenantId}`).then(setTenant);
      if (e?.managerId) api.get<any>(`/employees/${e.managerId}`).then(setManager);
      api.get<any[]>(`/employees?managerId=${id}`).then(setTeam);
      api.get<any[]>(`/leaves?employeeId=${id}`).then(setLeaves);
      api.get<any[]>(`/leaves/balance/${id}`).then(setBalances).catch(() => {});
      api.get<any[]>(`/contracts?employeeId=${id}`).then(setContracts).catch(() => {});
      api.get<any[]>(`/letters?employeeId=${id}`).then(setLetters).catch(() => {});
      api.get<any[]>(`/reviews?employeeId=${id}`).then(setReviews).catch(() => {});
      api.get<any[]>(`/payroll/payslips?employeeId=${id}`).then(setPayslips).catch(() => {});
    });
  }, [id]);

  if (!emp) return <div className="text-slate-500">Chargement…</div>;
  const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

  // Calcul de la période d'essai
  const trialDays = emp.trialPeriodDays || (emp.contractType === 'CDI' ? (emp.classification === 'Cadre' ? 120 : emp.classification === 'Agent de maîtrise' ? 90 : 60) : 30);
  const trialEnd = emp.contractStart ? new Date(new Date(emp.contractStart).getTime() + trialDays * 86400000) : null;
  const renewalDays = emp.trialRenewalDays || trialDays;
  const noticeDays = emp.trialNoticeBeforeDays || 15;
  const noticeLimit = emp.contractStart ? new Date(new Date(emp.contractStart).getTime() + (trialDays - noticeDays) * 86400000) : null;
  const trialEndWithRenewal = emp.contractStart ? new Date(new Date(emp.contractStart).getTime() + (trialDays + renewalDays) * 86400000) : null;
  const trialIsActive = trialEnd && trialEnd > new Date();
  const noticeNeeded = noticeLimit && noticeLimit > new Date() && trialIsActive;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => router.back()} className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex gap-2">
          <button className="btn btn-secondary"><Edit className="w-4 h-4" /> Modifier</button>
        </div>
      </div>

      {/* Carte identité */}
      <Card>
        <CardBody className="flex items-center gap-6 flex-wrap">
          <span className="w-20 h-20 rounded-full bg-brand-600 text-white text-2xl font-bold flex items-center justify-center">{initials}</span>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold text-slate-900">
              {emp.civility ? emp.civility + ' ' : ''}{emp.firstName} {emp.lastName.toUpperCase()}
            </h1>
            {emp.usageName && <p className="text-slate-500 text-sm">(nom d'usage : {emp.usageName})</p>}
            <p className="text-slate-600">{emp.jobTitle}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="blue">{emp.contractType}</Badge>
              <Badge variant="gray">{emp.matricule}</Badge>
              {emp.status === 'actif' && <Badge variant="green">Actif</Badge>}
              <Badge variant="purple">{emp.classification}</Badge>
              {emp.rqth && <Badge variant="amber">RQTH</Badge>}
              {trialIsActive && <Badge variant="amber">Période d'essai</Badge>}
            </div>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {emp.email}</div>
            {emp.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {emp.phone}</div>}
            {tenant && <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {tenant.code} — {tenant.name}</div>}
          </div>
        </CardBody>
      </Card>

      {/* Alerte période d'essai */}
      {noticeNeeded && (
        <Card className="border-amber-300 bg-amber-50">
          <CardBody className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <strong>Période d'essai à surveiller.</strong> Date limite pour notifier un renouvellement :
              <strong> {noticeLimit?.toLocaleDateString('fr-FR')}</strong>.
              Fin de période d'essai initiale : <strong>{trialEnd?.toLocaleDateString('fr-FR')}</strong>.
            </div>
            <button className="btn btn-primary btn-sm">Générer lettre de renouvellement</button>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
                tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenu des tabs */}
      {tab === 'profil' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Identité</CardTitle></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <Row k="Civilité" v={emp.civility} />
              <Row k="Nom de naissance" v={emp.lastName} />
              <Row k="Nom d'usage" v={emp.usageName} />
              <Row k="Prénom" v={emp.firstName} />
              <Row k="Date de naissance" v={emp.birthDate && new Date(emp.birthDate).toLocaleDateString('fr-FR')} />
              <Row k="N° Sécurité Sociale" v={emp.socialSecurity} />
              <Row k="Pièce d'identité" v={emp.idType && `${emp.idType} — ${emp.idNumber}`} />
              <Row k="Date d'expiration" v={emp.idExpiryDate && new Date(emp.idExpiryDate).toLocaleDateString('fr-FR')} />
              <Row k="RQTH" v={emp.rqth ? 'Oui' : 'Non'} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Coordonnées</CardTitle></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <Row k="Email" v={emp.email} />
              <Row k="Téléphone" v={emp.phone} />
              <Row k="Adresse" v={emp.address} />
              <Row k="Code postal" v={emp.postalCode} />
              <Row k="Ville" v={emp.city} />
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'contrat' && (
        <Card>
          <CardHeader><CardTitle>Contrat actuel</CardTitle></CardHeader>
          <CardBody className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row k="Type de contrat" v={emp.contractType} />
            <Row k="Statut" v={emp.classification} />
            <Row k="Niveau hiérarchique" v={emp.hierarchyLevel} />
            <Row k="Date de début" v={emp.contractStart && new Date(emp.contractStart).toLocaleDateString('fr-FR')} />
            <Row k="Date de fin" v={emp.contractEnd && new Date(emp.contractEnd).toLocaleDateString('fr-FR')} />
            <Row k="Société d'affectation" v={tenant && `${tenant.code} — ${tenant.name}`} />
            <Row k="Manager (valideur des congés)" v={manager && `${manager.firstName} ${manager.lastName}`} />
            <Row k="Temps de travail" v={emp.workTime === 'temps_partiel' ? `Temps partiel ${emp.partTimePercent}%` : 'Temps complet'} />
            <Row k="Heures par semaine" v={`${emp.weeklyHours || 35}h`} />
            <Row k="Heures par mois" v={`${((emp.weeklyHours || 35) * 52 / 12).toFixed(2)}h`} />
            <Row k="Salaire brut mensuel" v={emp.grossSalary && emp.grossSalary.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} />
            <Row k="Convention collective" v={tenant?.conventionCode} />
          </CardBody>
        </Card>
      )}

      {tab === 'essai' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Période d'essai</CardTitle></CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row k="Date de début du contrat" v={emp.contractStart && new Date(emp.contractStart).toLocaleDateString('fr-FR')} />
              <Row k="Durée période d'essai initiale" v={`${trialDays} jours`} />
              <Row k="Date de fin de période d'essai" v={trialEnd?.toLocaleDateString('fr-FR')} />
              <Row k="Date limite pour notifier un renouvellement" v={noticeLimit?.toLocaleDateString('fr-FR')} />
              <Row k="Durée si renouvelée" v={`${trialDays + renewalDays} jours total`} />
              <Row k="Date fin si renouvelée" v={trialEndWithRenewal?.toLocaleDateString('fr-FR')} />
              <div className="pt-3 border-t border-slate-100 flex gap-2 flex-wrap">
                <button className="btn btn-primary btn-sm">Générer lettre de renouvellement</button>
                <button className="btn btn-secondary btn-sm">Valider la période d'essai</button>
                <button className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}>Rompre la période d'essai</button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'banque' && (
        <Card>
          <CardHeader><CardTitle>Banque & Fiscal</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row k="IBAN" v={emp.iban} />
            <Row k="BIC" v={emp.bic} />
            <Row k="Banque" v={emp.bankName} />
            <Row k="Taux PAS (%)" v={emp.taxRate} />
            <Row k="Situation familiale" v={emp.familySituation} />
            <Row k="Nombre d'enfants" v={emp.numChildren ?? 0} />
          </CardBody>
        </Card>
      )}

      {tab === 'planning' && (
        <Card>
          <CardHeader><CardTitle>Planning hebdomadaire type</CardTitle></CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                <th className="py-2">Jour</th><th>Début</th><th>Fin</th><th>Pause</th><th>Heures</th>
              </tr></thead>
              <tbody>
                {(['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']).map((d) => {
                  const sched = (emp.schedule || {})[d] || {};
                  let h = 0;
                  if (sched.start && sched.end) {
                    const [sh, sm] = sched.start.split(':').map(Number);
                    const [eh, em] = sched.end.split(':').map(Number);
                    h = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (sched.break || 0)) / 60);
                  }
                  return (
                    <tr key={d} className="border-b border-slate-100">
                      <td className="py-2 capitalize font-medium">{d}</td>
                      <td>{sched.start || '—'}</td>
                      <td>{sched.end || '—'}</td>
                      <td>{sched.break || 0} min</td>
                      <td className="font-semibold">{h.toFixed(1)}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === 'documents' && (
        <Card>
          <CardHeader><CardTitle>Documents & contrats</CardTitle></CardHeader>
          <CardBody>
            {contracts.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun contrat. Le contrat est généré automatiquement lors de la finalisation de l'embauche.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {contracts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div>
                      <strong>Contrat {c.type}</strong> — {c.position}
                      <div className="text-xs text-slate-500">Du {new Date(c.startDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <Link href={`/contracts/${c.id}` as any} className="text-brand-600 hover:underline text-xs">Voir →</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'courriers' && (
        <Card>
          <CardHeader><CardTitle>Courriers reçus / envoyés</CardTitle></CardHeader>
          <CardBody>
            {letters.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun courrier.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                  <th className="py-2">Date</th><th>Type</th><th>Sujet</th><th>Statut</th>
                </tr></thead>
                <tbody>
                  {letters.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100">
                      <td className="py-2 text-xs">{new Date(l.date).toLocaleDateString('fr-FR')}</td>
                      <td><Badge variant="blue">{l.type}</Badge></td>
                      <td>{l.subject}</td>
                      <td><Badge variant={l.status === 'envoye' ? 'green' : 'amber'}>{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'conges' && (
        <div className="space-y-4">
          {balances.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {balances.map((b) => {
                const remain = b.acquired - b.taken - b.pending;
                return (
                  <Card key={b.id}><CardBody className="!p-4">
                    <div className="text-xs uppercase text-slate-500 font-semibold">{b.type?.name}</div>
                    <div className="text-2xl font-bold mt-1">{remain.toFixed(1)}<span className="text-sm font-normal text-slate-500"> / {b.acquired}j</span></div>
                    <div className="text-xs text-slate-500 mt-1">Pris : {b.taken}j</div>
                  </CardBody></Card>
                );
              })}
            </div>
          )}
          <Card>
            <CardHeader><CardTitle>Demandes de congés</CardTitle></CardHeader>
            <CardBody>
              {leaves.length === 0 ? <p className="text-sm text-slate-500">Aucune demande.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                    <th className="py-2">Type</th><th>Période</th><th>Durée</th><th>Statut</th>
                  </tr></thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l.id} className="border-b border-slate-100">
                        <td className="py-2"><Badge variant="blue">{l.type?.code}</Badge></td>
                        <td className="text-xs">{new Date(l.startDate).toLocaleDateString('fr-FR')} → {new Date(l.endDate).toLocaleDateString('fr-FR')}</td>
                        <td>{l.days}j</td>
                        <td><Badge variant={l.status === 'approuve' ? 'green' : l.status === 'refuse' ? 'red' : 'amber'}>{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'paie' && (
        <Card>
          <CardHeader><CardTitle>Bulletins de paie</CardTitle></CardHeader>
          <CardBody>
            {payslips.length === 0 ? <p className="text-sm text-slate-500">Aucun bulletin.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                  <th className="py-2">Mois</th><th className="text-right">Brut</th><th className="text-right">Net</th><th className="text-right">Coût employeur</th>
                </tr></thead>
                <tbody>
                  {payslips.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-2 font-medium">{p.month}</td>
                      <td className="text-right">{p.gross.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="text-right font-semibold text-emerald-700">{p.net.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="text-right">{p.employerCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'entretiens' && (
        <Card>
          <CardHeader><CardTitle>Entretiens</CardTitle></CardHeader>
          <CardBody>
            {reviews.length === 0 ? <p className="text-sm text-slate-500">Aucun entretien planifié.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase font-semibold text-slate-500 border-b">
                  <th className="py-2">Type</th><th>Date</th><th>Évaluateur</th><th>Note</th><th>Statut</th>
                </tr></thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-2"><Badge variant="blue">{r.type}</Badge></td>
                      <td className="text-xs">{r.scheduledAt && new Date(r.scheduledAt).toLocaleDateString('fr-FR')}</td>
                      <td>{r.reviewer && `${r.reviewer.firstName} ${r.reviewer.lastName}`}</td>
                      <td>{r.overallRating ? '⭐'.repeat(r.overallRating) : '—'}</td>
                      <td><Badge variant={r.status === 'realise' || r.status === 'signe' ? 'green' : 'amber'}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'formation' && (
        <Card>
          <CardHeader><CardTitle>Formations</CardTitle></CardHeader>
          <CardBody className="text-sm text-slate-500">Module formation à venir.</CardBody>
        </Card>
      )}

      {tab === 'equipe' && team.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Équipe directe ({team.length})</CardTitle></CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.map((t) => (
                <Link key={t.id} href={`/employees/${t.id}` as any} className="flex items-center gap-3 p-2 border border-slate-200 rounded hover:bg-slate-50">
                  <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">{t.firstName[0]}{t.lastName[0]}</span>
                  <div>
                    <div className="font-medium text-sm">{t.firstName} {t.lastName}</div>
                    <div className="text-xs text-slate-500">{t.jobTitle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
      {tab === 'equipe' && team.length === 0 && (
        <Card><CardBody className="text-sm text-slate-500">Pas d'équipe directe.</CardBody></Card>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100">
      <dt className="text-xs uppercase text-slate-500 font-semibold">{k}</dt>
      <dd className="text-slate-900">{v || '—'}</dd>
    </div>
  );
}
