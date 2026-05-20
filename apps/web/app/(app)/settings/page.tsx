'use client';
import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Trash2, RefreshCw, Database } from 'lucide-react';
import { api } from '@/lib/api';
import { resetMock } from '@/lib/mock/api';

export default function SettingsPage() {
  const [message, setMessage] = useState('');

  function clearAll() {
    if (!confirm('Effacer TOUTES les données (sociétés, salariés, congés, paie, ...) et repartir des données initiales ?')) return;
    resetMock();
    setMessage('Données réinitialisées. Rechargement…');
    setTimeout(() => window.location.reload(), 1000);
  }

  async function clearEmployees() {
    if (!confirm('Supprimer tous les salariés de démo (sauf admin) et toutes leurs données associées (congés, frais, paie) ?')) return;
    await api.post('/admin/clear-employees');
    setMessage('Salariés de démo supprimés. Rechargement…');
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 text-sm">Gestion des données du SIRH.</p>
      </div>

      {message && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded p-3">{message}</div>}

      <Card>
        <CardHeader><CardTitle>Données de démonstration</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-1">Vider les dossiers de salariés fictifs</h3>
            <p className="text-sm text-slate-600 mb-3">
              Supprime tous les salariés (sauf l'admin) et leurs données associées : congés, frais, pointages, bulletins de paie.
              La structure (sociétés, conventions) est conservée.
            </p>
            <button onClick={clearEmployees} className="btn btn-secondary">
              <Trash2 className="w-4 h-4" /> Supprimer les salariés de démo
            </button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-red-200">
        <CardHeader><CardTitle>Réinitialisation complète</CardTitle></CardHeader>
        <CardBody>
          <p className="text-sm text-slate-600 mb-3">
            Efface <strong>TOUTES</strong> les données et repart sur les données initiales. Action irréversible.
          </p>
          <button onClick={clearAll} className="btn" style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw className="w-4 h-4" /> Réinitialiser tout
          </button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mode de fonctionnement</CardTitle></CardHeader>
        <CardBody className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-600" />
            <strong>Mode démo localStorage</strong>
          </div>
          <p className="text-slate-600">
            Les données sont stockées localement dans votre navigateur. Elles persistent entre les sessions
            mais ne sont pas partagées avec d'autres utilisateurs.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
