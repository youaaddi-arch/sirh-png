'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { ArrowLeft, Save, Printer } from 'lucide-react';

export default function NewLetterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialType = params.get('type') || '';

  const [templates, setTemplates] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [type, setType] = useState(initialType);
  const [tenantId, setTenantId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [subject, setSubject] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/letters/templates').then(setTemplates),
      api.get<any[]>('/tenants').then((t) => { setTenants(t); if (t[0]) setTenantId(t[0].id); }),
      api.get<any[]>('/employees').then(setEmployees),
    ]);
  }, []);

  async function generate() {
    if (!type || !tenantId || !employeeId) return;
    setSaving(true); setError('');
    try {
      const c = await api.post('/letters', { type, tenantId, employeeId });
      setSubject(c.subject);
      setContentMd(c.contentMd);
      setPreviewMode(true);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  function print() { window.print(); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn-secondary"><ArrowLeft className="w-4 h-4" /> Retour</button>
          <h1 className="text-2xl font-bold text-slate-900">Nouveau courrier RH</h1>
        </div>
        {previewMode && (
          <div className="flex gap-2">
            <button onClick={print} className="btn btn-secondary"><Printer className="w-4 h-4" /> Imprimer</button>
            <button onClick={() => router.push('/letters')} className="btn btn-primary"><Save className="w-4 h-4" /> Terminé</button>
          </div>
        )}
      </div>

      {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm no-print">{error}</div>}

      <Card className="no-print">
        <CardHeader><CardTitle>Paramètres</CardTitle></CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-3 gap-4">
            <Select label="Modèle" required value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {templates.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Select>
            <Select label="Société" required value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
            </Select>
            <Select label="Destinataire (salarié)" required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.jobTitle}</option>)}
            </Select>
          </div>
          <div className="mt-4">
            <button onClick={generate} disabled={!type || !tenantId || !employeeId || saving} className="btn btn-primary">
              {saving ? 'Génération…' : 'Générer le courrier'}
            </button>
          </div>
        </CardBody>
      </Card>

      {previewMode && (
        <Card>
          <CardHeader className="no-print"><CardTitle>Aperçu — {subject}</CardTitle></CardHeader>
          <CardBody>
            <pre className="whitespace-pre-wrap font-serif text-[13px] leading-relaxed">{contentMd}</pre>
          </CardBody>
        </Card>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          aside, header { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
