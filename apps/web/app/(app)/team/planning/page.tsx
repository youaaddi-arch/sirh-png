'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Employee {
  id: string; firstName: string; lastName: string; jobTitle: string;
}
interface Leave {
  id: string; employeeId: string; startDate: string; endDate: string;
  type: { code: string; color: string; name: string };
}
interface Holiday { date: string; name: string; }

export default function PlanningPage() {
  const [me, setMe] = useState<any>(null);
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [data, setData] = useState<{ employees: Employee[]; leaves: Leave[]; holidays: Holiday[] }>({ employees: [], leaves: [], holidays: [] });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
  }, []);

  useEffect(() => {
    if (!me) return;
    const params = new URLSearchParams();
    const from = new Date(cursor); from.setDate(1);
    const to = new Date(cursor); to.setMonth(to.getMonth() + 1); to.setDate(0);
    params.set('from', from.toISOString().slice(0, 10));
    params.set('to', to.toISOString().slice(0, 10));
    if (me.role === 'manager' && me.employee?.id) params.set('managerId', me.employee.id);
    if ((me.role === 'rh' || me.role === 'admin') && me.tenantId) params.set('tenantId', me.tenantId);
    api.get(`/team/planning?${params}`).then(setData);
  }, [me, cursor]);

  function shiftMonth(n: number) {
    const d = new Date(cursor); d.setMonth(d.getMonth() + n); d.setDate(1); setCursor(d);
  }

  // Construire les jours du mois
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));

  // Index leaves par employee
  function getCellInfo(empId: string, date: Date) {
    const iso = date.toISOString().slice(0, 10);
    const leave = data.leaves.find((l) => l.employeeId === empId && iso >= l.startDate.slice(0, 10) && iso <= l.endDate.slice(0, 10));
    return leave;
  }

  const holidaySet = new Set(data.holidays.map((h) => h.date));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planning équipe</h1>
          <p className="text-slate-500 text-sm">Vue mensuelle des absences de votre équipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="btn btn-secondary"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-semibold min-w-[160px] text-center capitalize">
            {cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => shiftMonth(1)} className="btn btn-secondary"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setCursor(() => { const d = new Date(); d.setDate(1); return d; })} className="btn btn-secondary">Aujourd'hui</button>
        </div>
      </div>

      {/* Légende */}
      <Card><CardBody className="!p-3 flex gap-3 flex-wrap text-xs">
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 bg-slate-100 rounded" /> Présent</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 bg-slate-300 rounded" /> Week-end</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 bg-pink-200 rounded" /> Jour férié</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 bg-brand-100 rounded" /> Aujourd'hui</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 bg-amber-200 rounded" /> Absence approuvée</span>
      </CardBody></Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: '100%' }}>
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 bg-slate-50 px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-r border-slate-200 min-w-[200px]">Collaborateur</th>
                {days.map((d) => {
                  const dow = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
                  const isWE = d.getDay() === 0 || d.getDay() === 6;
                  const iso = d.toISOString().slice(0, 10);
                  const isToday = iso === today;
                  return (
                    <th key={iso} className={`px-1 py-2 text-center border-b border-slate-200 ${isWE ? 'bg-slate-100' : ''} ${isToday ? 'bg-brand-100 text-brand-700' : ''}`} style={{ minWidth: 36 }}>
                      <div className="text-[9px] uppercase">{dow}</div>
                      <div className="font-bold">{d.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.employees.length === 0 ? (
                <tr><td colSpan={days.length + 1} className="text-center py-10 text-slate-400">Aucun membre dans votre équipe</td></tr>
              ) : data.employees.map((e) => (
                <tr key={e.id}>
                  <td className="sticky left-0 bg-white px-3 py-2 border-b border-r border-slate-200">
                    <div className="font-medium text-slate-900 text-xs">{e.firstName} {e.lastName}</div>
                    <div className="text-[10px] text-slate-500">{e.jobTitle}</div>
                  </td>
                  {days.map((d) => {
                    const iso = d.toISOString().slice(0, 10);
                    const isWE = d.getDay() === 0 || d.getDay() === 6;
                    const isHoliday = holidaySet.has(iso);
                    const leave = getCellInfo(e.id, d);
                    let bg = '';
                    if (isWE) bg = 'bg-slate-100';
                    else if (isHoliday) bg = 'bg-pink-100';
                    return (
                      <td key={iso} className={`border-b border-slate-200 text-center ${bg}`} style={{ background: leave ? leave.type.color + '40' : undefined }}>
                        {leave ? (
                          <span className="text-[9px] font-semibold" style={{ color: leave.type.color }} title={leave.type.name}>
                            {leave.type.code}
                          </span>
                        ) : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
