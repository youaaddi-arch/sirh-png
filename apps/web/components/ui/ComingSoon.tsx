'use client';
import Link from 'next/link';
import { Card, CardBody } from './Card';
import { Construction, ArrowLeft } from 'lucide-react';

export function ComingSoon({ title, description, available }: { title: string; description?: string; available?: string[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="btn btn-secondary mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Retour au dashboard
      </Link>
      <Card>
        <CardBody className="text-center py-16">
          <Construction className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
          {description && <p className="text-slate-600 max-w-md mx-auto">{description}</p>}
          {available && available.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase font-semibold text-slate-500 mb-2">Modules disponibles équivalents :</p>
              <div className="flex flex-wrap justify-center gap-2">
                {available.map((h) => (
                  <Link key={h} href={h as any} className="badge badge-blue hover:bg-brand-200">{h}</Link>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-8">
            Cette page est disponible dans la version v1 SPA — module en cours de migration vers la v2.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
