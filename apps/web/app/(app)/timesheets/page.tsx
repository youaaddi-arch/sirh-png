'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Clock, Save } from 'lucide-react';
import type { Timesheet } from '@/types/leave';

function weekStart(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
}
function fmtDate(d: Date) { return d.toISOString().slice(0, 10); }
function fmtDow(d: Date) { return d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''); }

export default function TimesheetsPage() {
  const [me, setMe] = useState<any>(null);
  const [weekStartDate, setWeekStartDate] = useState(weekStart());
  const [sheets, setSheets] = useState<Record<string, Timesheet>>({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('sirh.user') || '{}');
    setMe(u);
  }, []);

  function reload() {
    if (!me?.employee?.id) return;
    const end = new Date(weekStartDate); end.setDate(end.getDate() + 6);
    api.get<Timesheet[]>(`/timesheets?employeeId=${me.employee.id}&from=${fmtDate(weekStartDate)}&to=${fmtDate(end)}`)
      .then((list) => {
        const map: Record<string, Timesheet> = {};
        list.forEach((t) => { map[t.date.slice(0, 10)] = t; });
        setSheets(map);
      });
  }
  useEffect(reload, [me, weekStartDate]);

  async function saveDay(date: string, data: Partial<Timesheet>) {
    if (!me?.employee?.id) return;
    try {
      await api.post(`/timesheets/day/${me.employee.id}`, { date, ...data });
      reload();
    } catch (e: any) { alert(e.message); }
  }

  async function clock() {
    if (!me?.employee?.id) return;
    await api.post(`/timesheets/clock/${me.employee.id}`);
    reload();
  }

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStartDate); d.setDate(d.getDate() + i); return d; });
  const total = Object.values(sheets).reduce((s, t) => s + (t.hoursWorked || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon temps de travail</h1>
          <p className="text-slate-500 text-sm">Pointage et saisie hebdomadaire.</p>
        </div>
        <button onClick={clock} className="btn btn-primary"><Clock className="w-4 h-4" /> Pointer maintenant</button>
      </div>

      {/* Sélecteur de semaine */}
      <Card><CardBody className="!p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { const d = new Date(weekStartDate); d.setDate(d.getDate() - 7); setWeekStartDate(d); }} className="btn btn-secondary btn-sm">←</button>
          <span className="font-semibold">Semaine du {weekStartDate.toLocaleDateString('fr-FR')}</span>
          <button onClick={() => { const d = new Date(weekStartDate); d.setDate(d.getDate() + 7); setWeekStartDate(d); }} className="btn btn-secondary btn-sm">→</button>
          <button onClick={() => setWeekStartDate(weekStart())} className="btn btn-secondary btn-sm">Aujourd'hui</button>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Total semaine</div>
          <div className={`text-2xl font-bold ${total >= 35 ? 'text-emerald-600' : 'text-slate-900'}`}>{total.toFixed(1)}h <span className="text-sm font-normal text-slate-400">/ 35h</span></div>
        </div>
      </CardBody></Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-3 py-2">Jour</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-3 py-2">Début</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-3 py-2">Fin</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-3 py-2">Pause</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-3 py-2">Heures</th>
                <th className="text-left text-[11px] uppercase font-semibold text-slate-500 px-3 py-2">Projet</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const iso = fmtDate(d);
                const t = sheets[iso];
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <DayRow key={iso} date={d} timesheet={t} isWeekend={isWeekend} onSave={saveDay} />
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DayRow({ date, timesheet, isWeekend, onSave }: any) {
  const [s, setS] = useState({
    startTime: timesheet?.startTime || '',
    endTime: timesheet?.endTime || '',
    breakMinutes: timesheet?.breakMinutes || 60,
    project: timesheet?.project || '',
  });
  useEffect(() => {
    setS({
      startTime: timesheet?.startTime || '',
      endTime: timesheet?.endTime || '',
      breakMinutes: timesheet?.breakMinutes || 60,
      project: timesheet?.project || '',
    });
  }, [timesheet?.id]);

  function save() { onSave(date.toISOString().slice(0, 10), s); }

  return (
    <tr className={`border-t border-slate-100 ${isWeekend ? 'bg-slate-50' : ''}`}>
      <td className="px-3 py-2 font-medium">{fmtDow(date)} {date.getDate()}/{date.getMonth() + 1}</td>
      <td className="px-3 py-2"><input type="time" value={s.startTime} onChange={(e) => setS({ ...s, startTime: e.target.value })} className="input !py-1 w-24" disabled={isWeekend} /></td>
      <td className="px-3 py-2"><input type="time" value={s.endTime} onChange={(e) => setS({ ...s, endTime: e.target.value })} className="input !py-1 w-24" disabled={isWeekend} /></td>
      <td className="px-3 py-2"><input type="number" value={s.breakMinutes} onChange={(e) => setS({ ...s, breakMinutes: +e.target.value })} className="input !py-1 w-20" disabled={isWeekend} /></td>
      <td className="px-3 py-2 font-semibold">{timesheet?.hoursWorked?.toFixed(1) || '0'}h</td>
      <td className="px-3 py-2">
        <input value={s.project} onChange={(e) => setS({ ...s, project: e.target.value })} onBlur={save} className="input !py-1" disabled={isWeekend} placeholder={isWeekend ? 'Week-end' : 'Projet'} />
      </td>
    </tr>
  );
}
