'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Briefcase } from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [emp, setEmp] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>(`/employees/${id}`).then(async (e) => {
      setEmp(e);
      if (e?.tenantId) api.get<any>(`/tenants/${e.tenantId}`).then(setTenant);
      if (e?.managerId) api.get<any>(`/employees/${e.managerId}`).then(setManager);
      api.get<any[]>(`/employees?managerId=${id}`).then(setTeam);
    });
  }, [id]);

  if (!emp) return <div className="text-slate-500">Chargement…</div>;
  const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="btn btn-secondary">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <Card>
        <CardBody className="flex items-center gap-6 flex-wrap">
          <span className="w-20 h-20 rounded-full bg-brand-600 text-white text-2xl font-bold flex items-center justify-center">{initials}</span>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold text-slate-900">{emp.firstName} {emp.lastName}</h1>
            <p className="text-slate-600">{emp.jobTitle}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="blue">{emp.contractType}</Badge>
              <Badge variant="gray">{emp.matricule}</Badge>
              {emp.status === 'actif' && <Badge variant="green">Actif</Badge>}
              <Badge variant="purple">{emp.classification}</Badge>
            </div>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {emp.email}</div>
            {emp.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {emp.phone}</div>}
            {tenant && <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {tenant.code} — {tenant.name}</div>}
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Informations professionnelles</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row k="Type de contrat" v={emp.contractType} />
            <Row k="Date d'embauche" v={emp.contractStart && new Date(emp.contractStart).toLocaleDateString('fr-FR')} />
            <Row k="Heures hebdomadaires" v={`${emp.weeklyHours || 35}h`} />
            <Row k="Salaire brut mensuel" v={emp.grossSalary && emp.grossSalary.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} />
            <Row k="Classification" v={emp.classification} />
            <Row k="Manager" v={manager ? `${manager.firstName} ${manager.lastName}` : '—'} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row k="Email" v={emp.email} />
            <Row k="Téléphone" v={emp.phone} />
            <Row k="Date de naissance" v={emp.birthDate && new Date(emp.birthDate).toLocaleDateString('fr-FR')} />
            <Row k="Situation familiale" v={emp.familySituation} />
            <Row k="Nombre d'enfants" v={emp.numChildren ?? 0} />
          </CardBody>
        </Card>
      </div>

      {team.length > 0 && (
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
