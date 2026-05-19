/* Time tracking */
window.TimeView = (function () {
  let filters = { employeeId: '', week: weekStart(new Date()) };

  function weekStart(d) {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7; // Monday=0
    x.setDate(x.getDate() - day);
    return x.toISOString().slice(0, 10);
  }
  function weekDays(startIso) {
    const start = new Date(startIso);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      return d;
    });
  }

  function render(host) {
    const me = Store.currentUser();
    if (!filters.employeeId) filters.employeeId = me.id;

    const employees = Store.get('employees');
    const days = weekDays(filters.week);
    const isoDays = days.map(d => d.toISOString().slice(0, 10));
    const timesheets = Store.where('timesheets', t => t.employeeId === filters.employeeId && isoDays.includes(t.date));

    const totalHours = timesheets.reduce((s, t) => s + (t.hours || 0), 0);
    const target = 5 * (Store.settings().hoursPerDay || 7.5);

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Temps de travail</h1>
            <p class="text-slate-500 text-sm">Saisie des temps, validation et suivi des heures.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" data-clock>${U.icons.clock} Pointer maintenant</button>
            <button class="btn btn-primary" data-new>${U.icons.plus} Saisir un temps</button>
          </div>
        </div>

        <div class="card p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label class="label">Collaborateur</label>
            <select id="ts-emp" class="select min-w-[220px]">
              ${employees.map(e => `<option value="${e.id}" ${filters.employeeId===e.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="label">Semaine</label>
            <div class="flex items-center gap-1">
              <button class="btn-icon" data-prev>${U.icons.chevronL}</button>
              <input id="ts-week" type="date" class="input" value="${filters.week}"/>
              <button class="btn-icon" data-next>${U.icons.chevronR}</button>
            </div>
          </div>
          <div class="ml-auto text-right">
            <div class="text-sm text-slate-500">Total semaine</div>
            <div class="text-2xl font-bold ${totalHours >= target ? 'text-emerald-600':'text-slate-900'}">${totalHours.toFixed(1)}h <span class="text-sm font-normal text-slate-400">/ ${target}h</span></div>
          </div>
        </div>

        <div class="card overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Pause</th>
                <th>Heures</th>
                <th>Projet</th>
                <th>Notes</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${days.map(d => {
                const iso = d.toISOString().slice(0, 10);
                const t = timesheets.find(x => x.date === iso);
                const dow = d.toLocaleDateString('fr-FR', { weekday: 'short' });
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                if (!t) {
                  return `<tr class="${isWeekend?'bg-slate-50':''}">
                    <td class="font-medium">${dow.replace('.','')} ${U.fmtDate(d)}</td>
                    <td colspan="6" class="text-slate-400 text-sm">${isWeekend?'Week-end':'Pas de pointage'}</td>
                    <td>${isWeekend?'<span class="badge badge-gray">WE</span>':'<span class="badge badge-amber">Manquant</span>'}</td>
                    <td><button class="btn-icon" data-add-day="${iso}">${U.icons.plus}</button></td>
                  </tr>`;
                }
                return `
                  <tr>
                    <td class="font-medium">${dow.replace('.','')} ${U.fmtDate(d)}</td>
                    <td>${t.startTime}</td>
                    <td>${t.endTime}</td>
                    <td>${t.breakMinutes||0} min</td>
                    <td class="font-semibold">${t.hours}h</td>
                    <td class="text-sm">${U.escapeHtml(t.project||'—')}</td>
                    <td class="text-sm text-slate-500">${U.escapeHtml(t.notes||'')}</td>
                    <td>${t.status==='valide'?'<span class="badge badge-green">Validé</span>':'<span class="badge badge-amber">À valider</span>'}</td>
                    <td>
                      <div class="flex gap-1">
                        <button class="btn-icon" data-edit-ts="${t.id}">${U.icons.edit}</button>
                        <button class="btn-icon text-red-600" data-del-ts="${t.id}">${U.icons.trash}</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="grid lg:grid-cols-3 gap-4">
          ${kpiCard('Heures supplémentaires', '0h', 'text-emerald-600')}
          ${kpiCard('Heures à valider', timesheets.filter(t=>t.status!=='valide').reduce((s,t)=>s+t.hours,0).toFixed(1)+'h', 'text-amber-600')}
          ${kpiCard('Total mois', monthHours().toFixed(1)+'h', 'text-brand-700')}
        </div>
      </div>
    `;
    bind();
  }

  function monthHours() {
    const me = Store.currentUser();
    const month = new Date().toISOString().slice(0, 7);
    return Store.where('timesheets', t => t.employeeId === filters.employeeId && t.date.startsWith(month)).reduce((s, t) => s + t.hours, 0);
  }

  function kpiCard(label, value, color) {
    return `<div class="card p-4"><div class="text-sm text-slate-500">${label}</div><div class="mt-1 text-2xl font-bold ${color}">${value}</div></div>`;
  }

  function bind() {
    document.getElementById('ts-emp').onchange = (e) => { filters.employeeId = e.target.value; render(document.getElementById('main-content')); };
    document.getElementById('ts-week').onchange = (e) => { filters.week = weekStart(e.target.value); render(document.getElementById('main-content')); };
    document.querySelector('[data-prev]').onclick = () => { const d = new Date(filters.week); d.setDate(d.getDate()-7); filters.week = weekStart(d); render(document.getElementById('main-content')); };
    document.querySelector('[data-next]').onclick = () => { const d = new Date(filters.week); d.setDate(d.getDate()+7); filters.week = weekStart(d); render(document.getElementById('main-content')); };
    document.querySelector('[data-new]').onclick = () => openForm();
    document.querySelector('[data-clock]').onclick = () => clockNow();

    document.querySelectorAll('[data-add-day]').forEach(b => b.onclick = () => openForm(null, b.dataset.addDay));
    document.querySelectorAll('[data-edit-ts]').forEach(b => b.onclick = () => openForm(b.dataset.editTs));
    document.querySelectorAll('[data-del-ts]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce pointage ?', { danger: true });
      if (!ok) return;
      Store.remove('timesheets', b.dataset.delTs);
      U.toast('Pointage supprimé', 'success');
      render(document.getElementById('main-content'));
    });
  }

  function clockNow() {
    const me = Store.currentUser();
    const now = new Date();
    const iso = U.today();
    const existing = Store.where('timesheets', t => t.employeeId === me.id && t.date === iso)[0];
    if (existing) {
      const end = now.toTimeString().slice(0, 5);
      const start = existing.startTime;
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm) - (existing.breakMinutes || 0);
      Store.update('timesheets', existing.id, { endTime: end, hours: Math.max(0, mins / 60).toFixed(2) });
      U.toast(`Sortie pointée à ${end}`, 'success');
    } else {
      const start = now.toTimeString().slice(0, 5);
      Store.insert('timesheets', {
        id: U.uid('ts'), employeeId: me.id, date: iso,
        startTime: start, endTime: '', breakMinutes: 0, hours: 0,
        project: '', notes: '', status: 'en_attente',
      });
      U.toast(`Entrée pointée à ${start}`, 'success');
    }
    render(document.getElementById('main-content'));
  }

  function openForm(id, dateHint) {
    const me = Store.currentUser();
    const t = id ? { ...Store.find('timesheets', id) } : {
      employeeId: filters.employeeId || me.id,
      date: dateHint || U.today(),
      startTime: '09:00', endTime: '17:30', breakMinutes: 60, hours: 7.5,
      project: '', notes: '', status: 'en_attente',
    };
    U.modal({
      title: id ? 'Modifier le pointage' : 'Saisir un temps',
      body: `
        <form id="ts-form" class="grid md:grid-cols-2 gap-4">
          <div><label class="label">Date</label><input type="date" class="input" name="date" value="${t.date}" required/></div>
          <div><label class="label">Statut</label><select class="select" name="status">
            <option value="en_attente" ${t.status==='en_attente'?'selected':''}>En attente</option>
            <option value="valide" ${t.status==='valide'?'selected':''}>Validé</option>
          </select></div>
          <div><label class="label">Début</label><input type="time" class="input" name="startTime" value="${t.startTime}" required/></div>
          <div><label class="label">Fin</label><input type="time" class="input" name="endTime" value="${t.endTime}" required/></div>
          <div><label class="label">Pause (min)</label><input type="number" class="input" name="breakMinutes" value="${t.breakMinutes||0}"/></div>
          <div><label class="label">Projet</label><input class="input" name="project" value="${U.escapeHtml(t.project||'')}"/></div>
          <div class="md:col-span-2"><label class="label">Notes</label><textarea class="textarea" name="notes" rows="2">${U.escapeHtml(t.notes||'')}</textarea></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#ts-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          const [sh, sm] = d.startTime.split(':').map(Number);
          const [eh, em] = d.endTime.split(':').map(Number);
          d.breakMinutes = +d.breakMinutes || 0;
          d.hours = +(((eh*60+em) - (sh*60+sm) - d.breakMinutes) / 60).toFixed(2);
          if (id) Store.update('timesheets', id, d);
          else { d.employeeId = filters.employeeId || me.id; Store.insert('timesheets', d); }
          U.toast('Pointage enregistré', 'success');
          close();
          render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
