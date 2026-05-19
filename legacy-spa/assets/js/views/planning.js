/* Team Planning — vue calendrier équipe avec statut journalier */
window.PlanningView = (function () {
  let view = 'month'; // month | week
  let cursor = new Date(); cursor.setDate(1);
  let filter = { companyId: '', departmentId: '', managerId: '' };

  const STATUSES = {
    present:    { label: 'Présent',     color: '#10b981', short: 'P'  },
    teletravail:{ label: 'Télétravail', color: '#06b6d4', short: 'TT' },
    conge:      { label: 'Congé',       color: '#2447df', short: 'CP' },
    rtt:        { label: 'RTT',         color: '#8b5cf6', short: 'R'  },
    maladie:    { label: 'Maladie',     color: '#ef4444', short: 'M'  },
    formation:  { label: 'Formation',   color: '#f59e0b', short: 'F'  },
    absent:     { label: 'Absent',      color: '#94a3b8', short: '—'  },
  };

  function render(host) {
    const me = Store.currentUser();
    const visible = Store.visibleEmployeeIds();
    let employees = Store.get('employees').filter(e => visible.has(e.id) && e.status === 'actif');
    if (filter.companyId)    employees = employees.filter(e => e.companyId === filter.companyId);
    if (filter.departmentId) employees = employees.filter(e => e.departmentId === filter.departmentId);
    if (filter.managerId)    employees = employees.filter(e => e.managerId === filter.managerId);

    const days = buildDays(cursor, view);
    const isoDays = days.map(d => d.toISOString().slice(0, 10));
    const leaves = Store.get('leaves').filter(l => l.status === 'approuve');
    const presences = Store.get('presences');
    const trainings = Store.get('trainingEnrollments').filter(t => t.status === 'valide' || t.status === 'inscrit');

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Planning d'équipe</h1>
            <p class="text-slate-500 text-sm">Visualisation journalière de votre équipe — présences, télétravail, congés, formations.</p>
          </div>
          <div class="flex gap-2 items-center">
            <div class="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-white">
              <button data-v="month" class="px-3 py-2 text-sm ${view==='month'?'bg-brand-600 text-white':'text-slate-600'}">Mois</button>
              <button data-v="week" class="px-3 py-2 text-sm ${view==='week'?'bg-brand-600 text-white':'text-slate-600'}">Semaine</button>
            </div>
            <button class="btn-icon" data-prev>${U.icons.chevronL}</button>
            <span class="font-semibold capitalize min-w-[160px] text-center">${formatPeriod(cursor, view)}</span>
            <button class="btn-icon" data-next>${U.icons.chevronR}</button>
            <button class="btn btn-secondary" data-today>Aujourd'hui</button>
            <button class="btn btn-primary" data-set-status>${U.icons.plus} Saisir un statut</button>
          </div>
        </div>

        <!-- Filters -->
        <div class="card p-4 grid md:grid-cols-3 gap-3">
          <div>
            <label class="label">Société</label>
            <select id="p-co" class="select">
              <option value="">Toutes</option>
              ${Store.get('companies').map(c => `<option value="${c.id}" ${filter.companyId===c.id?'selected':''}>${U.escapeHtml(c.code+' — '+c.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="label">Département</label>
            <select id="p-dep" class="select">
              <option value="">Tous</option>
              ${Store.get('departments').map(d => `<option value="${d.id}" ${filter.departmentId===d.id?'selected':''}>${U.escapeHtml(d.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="label">Manager</label>
            <select id="p-mgr" class="select">
              <option value="">Tous</option>
              ${Store.get('employees').filter(x => Store.get('employees').some(y => y.managerId === x.id)).map(m => `<option value="${m.id}" ${filter.managerId===m.id?'selected':''}>${U.escapeHtml(m.firstName+' '+m.lastName)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Legend -->
        <div class="card p-3 flex flex-wrap gap-3 text-xs">
          ${Object.entries(STATUSES).map(([k, s]) => `
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-3 h-3 rounded" style="background:${s.color}"></span>
              <span>${s.label}</span>
            </div>
          `).join('')}
        </div>

        <!-- Grid -->
        <div class="card overflow-auto">
          <table class="text-xs" style="border-collapse:separate;border-spacing:0;min-width:100%">
            <thead>
              <tr class="bg-slate-50">
                <th class="sticky left-0 bg-slate-50 px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-r border-slate-200 min-w-[200px]">Collaborateur</th>
                ${days.map(d => {
                  const dow = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.','');
                  const isWE = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = d.toISOString().slice(0,10) === U.today();
                  return `<th class="px-1 py-2 text-center border-b border-slate-200 ${isWE?'bg-slate-100':''} ${isToday?'bg-brand-100 text-brand-700':''}" style="min-width:34px">
                    <div class="text-[9px] uppercase">${dow}</div>
                    <div class="font-bold">${d.getDate()}</div>
                  </th>`;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${employees.length === 0 ? `<tr><td colspan="${days.length+1}" class="text-center py-10 text-slate-400">Aucun collaborateur visible.</td></tr>` :
                employees.map(e => `
                  <tr>
                    <td class="sticky left-0 bg-white px-3 py-2 border-b border-r border-slate-200">
                      <div class="flex items-center gap-2">
                        ${U.avatar(`${e.firstName} ${e.lastName}`, 28)}
                        <div>
                          <a href="#/collaborateurs/${e.id}" class="font-medium text-slate-900 hover:text-brand-700 text-xs">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</a>
                          <div class="text-[10px] text-slate-500">${U.escapeHtml(e.jobTitle)}</div>
                        </div>
                      </div>
                    </td>
                    ${isoDays.map(iso => {
                      const d = new Date(iso); const isWE = d.getDay()===0||d.getDay()===6;
                      if (isWE) return `<td class="border-b border-slate-200 bg-slate-100"></td>`;
                      const status = computeStatus(e.id, iso, leaves, presences, trainings);
                      const s = STATUSES[status];
                      return `<td class="border-b border-slate-200 text-center cursor-pointer hover:opacity-75" data-cell data-emp="${e.id}" data-date="${iso}" style="background:${s.color}20" title="${s.label}">
                        <span class="text-[10px] font-semibold" style="color:${s.color}">${s.short}</span>
                      </td>`;
                    }).join('')}
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Stats -->
        <div class="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${Object.entries(STATUSES).map(([k, s]) => {
            const count = countStatus(k, employees, isoDays, leaves, presences, trainings);
            return `<div class="card p-3"><div class="text-xs text-slate-500">${s.label}</div><div class="text-2xl font-bold" style="color:${s.color}">${count}</div><div class="text-[10px] text-slate-400">jours sur la période</div></div>`;
          }).join('')}
        </div>
      </div>
    `;
    bind();
  }

  function bind() {
    document.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { view = b.dataset.v; render(document.getElementById('main-content')); });
    document.querySelector('[data-prev]').onclick = () => { shift(-1); };
    document.querySelector('[data-next]').onclick = () => { shift(1); };
    document.querySelector('[data-today]').onclick = () => { cursor = new Date(); if (view==='month') cursor.setDate(1); render(document.getElementById('main-content')); };
    document.getElementById('p-co').onchange  = (e) => { filter.companyId = e.target.value; render(document.getElementById('main-content')); };
    document.getElementById('p-dep').onchange = (e) => { filter.departmentId = e.target.value; render(document.getElementById('main-content')); };
    document.getElementById('p-mgr').onchange = (e) => { filter.managerId = e.target.value; render(document.getElementById('main-content')); };
    document.querySelectorAll('[data-cell]').forEach(td => td.onclick = () => openStatusEditor(td.dataset.emp, td.dataset.date));
    document.querySelector('[data-set-status]').onclick = () => openStatusEditor(null, U.today());
  }

  function shift(n) {
    if (view === 'month') { cursor.setMonth(cursor.getMonth() + n); cursor.setDate(1); }
    else cursor.setDate(cursor.getDate() + n * 7);
    render(document.getElementById('main-content'));
  }

  function buildDays(cursor, view) {
    const days = [];
    if (view === 'month') {
      const y = cursor.getFullYear(), m = cursor.getMonth();
      const last = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) days.push(new Date(y, m, d));
    } else {
      const start = new Date(cursor);
      const dow = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - dow);
      for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
    }
    return days;
  }

  function formatPeriod(cursor, view) {
    if (view === 'month') return cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const days = buildDays(cursor, view);
    return `${U.fmtDate(days[0])} → ${U.fmtDate(days[6])}`;
  }

  function computeStatus(empId, iso, leaves, presences, trainings) {
    // Check leave
    const leave = leaves.find(l => l.employeeId === empId && iso >= l.startDate && iso <= l.endDate);
    if (leave) {
      const t = Store.find('leaveTypes', leave.typeId);
      if (t && t.code === 'RTT') return 'rtt';
      if (t && (t.code === 'MAL' || t.code === 'MAT' || t.code === 'PAT')) return 'maladie';
      return 'conge';
    }
    // Check training
    const tr = trainings.find(en => en.employeeId === empId && (() => {
      const tt = Store.find('trainings', en.trainingId);
      return tt && iso >= tt.startDate && iso <= tt.endDate;
    })());
    if (tr) return 'formation';
    // Check explicit presence
    const p = presences.find(x => x.employeeId === empId && x.date === iso);
    if (p) return p.status;
    return 'present';
  }

  function countStatus(key, employees, isoDays, leaves, presences, trainings) {
    let n = 0;
    for (const e of employees) for (const iso of isoDays) {
      const d = new Date(iso); if (d.getDay()===0||d.getDay()===6) continue;
      if (computeStatus(e.id, iso, leaves, presences, trainings) === key) n++;
    }
    return n;
  }

  function openStatusEditor(empId, date) {
    const visible = [...Store.visibleEmployeeIds()];
    const employees = Store.get('employees').filter(e => visible.includes(e.id));
    U.modal({
      title: 'Définir un statut journalier',
      body: `
        <form id="ps-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              ${employees.map(e => `<option value="${e.id}" ${empId===e.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Date</label><input type="date" class="input" name="date" value="${date}" required/></div>
          <div><label class="label">Statut</label>
            <select class="select" name="status">
              ${Object.entries(STATUSES).filter(([k]) => !['conge','rtt','maladie','formation'].includes(k)).map(([k,s]) => `<option value="${k}">${s.label}</option>`).join('')}
            </select>
          </div>
          <div class="md:col-span-2 text-xs text-slate-500">
            Note : les statuts Congé, RTT, Maladie, Formation sont calculés automatiquement depuis les modules concernés.
          </div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#ps-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          const existing = Store.where('presences', p => p.employeeId === d.employeeId && p.date === d.date)[0];
          if (existing) Store.update('presences', existing.id, { status: d.status });
          else Store.insert('presences', { id: U.uid('pr'), ...d });
          U.toast('Statut enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
