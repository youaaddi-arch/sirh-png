'use client';
import { useEffect, useState } from 'react';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { api } from '@/lib/api';

export default function NewCompanyPage() {
  const [organisationId, setOrganisationId] = useState<string>('');

  useEffect(() => {
    // Récupère l'organisation par défaut depuis la première société existante
    api.get<any[]>('/tenants')
      .then((list) => {
        if (list[0]) setOrganisationId(list[0].organisationId);
      });
  }, []);

  if (!organisationId) return <div className="text-slate-500">Chargement…</div>;
  return <CompanyForm mode="create" organisationId={organisationId} />;
}
