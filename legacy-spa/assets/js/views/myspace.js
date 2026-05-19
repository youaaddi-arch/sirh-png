/* My Space — Espace libre-service collaborateur */
window.MySpaceView = (function () {
  function render(host) {
    const me = Store.currentUser();
    if (!me) return;
    const co = Store.company(me.companyId);
    const dep = Store.department(me.departmentId);
    const mgr = me.managerId ? Store.employee(me.managerId) : null;
    const balances = Store.where('leaveBalances', b => b.employeeId === me.id);
    const myLeaves = Store.where('leaves', l => l.employeeId === me.id).sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));
    const myExpenses = Store.where('expenses', e => e.employeeId === me.id).sort((a,b) => (b.date||'').localeCompare(a.date||''));
    const myPayslips = Store.where('payslips', p => p.employeeId === me.id).sort((a,b) => b.month.localeCompare(a.month));
    const myDocs = Store.where('documents', d => d.employeeId === me.id);
    const myTrainings = Store.where('trainingEnrollments', e => e.employeeId === me.id);
    const myReviews = Store.where('reviews', r => r.employeeId === me.id);
    const team = Store.where('employees', e => e.managerId === me.id);

    // Today's timesheet
    const today = U.today();
    const todayTs = Store.where('timesheets', t => t.employeeId === me.id && t.date === today)[0];

    host.innerHTML = `
      <div class="space-y-6">
        <div class="card p-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div class="flex items-center gap-4 flex-wrap">
            ${U.avatar(`${me.firstName} ${me.lastName}`, 64)}
            <div class="flex-1 min-w-[200px]">
              <h1 class="text-2xl font-bold">Bonjour ${U.escapeHtml(me.firstName)} 👋</h1>
              <p class="text-brand-100">${U.escapeHtml(me.jobTitle)} • ${co ? U.escapeHtml(co.code+' — '+co.name) : ''}</p>
              ${mgr ? `<p class="text-sm text-brand-100 mt-1">Manager : ${U.escapeHtml(mgr.firstName)} ${U.escapeHtml(mgr.lastName)}</p>` : ''}
            </div>
            <div class="flex gap-2">
              ${todayTs && todayTs.endTime
                ? `<div class="bg-white/20 rounded px-3 py-2 text-sm">Pointage du jour : ${todayTs.startTime} → ${todayTs.endTime}</div>`
                : todayTs
                  ? `<button class="btn bg-white text-brand-700 hover:bg-slate-100" data-clock-out>Pointer sortie (entré à ${todayTs.startTime})</button>`
                  : `<button class="btn bg-white text-brand-700 hover:bg-slate-100" data-clock-in>${U.icons.clock} Pointer arrivée</button>`
              }
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${actionCard('Poser un congé', 'leave', 'bg-brand-50 text-brand-700', '#/conges?new=1')}
          ${actionCard('Note de frais', 'money', 'bg-emerald-50 text-emerald-700', '#/frais?new=1')}
          ${actionCard('Mes documents', 'document', 'bg-purple-50 text-purple-700', '#/documents?mine=1')}
          ${actionCard('Formation', 'book', 'bg-amber-50 text-amber-700', '#/formation')}
        </div>

        <!-- Soldes de congés -->
        <div class="card">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-semibold">Mes soldes de congés</h2>
            <a href="#/conges?mine=1" class="text-sm text-brand-600 hover:underline">Voir l'historique →</a>
          </div>
          <div class="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${balances.length === 0 ? '<p class="text-slate-500 text-sm col-span-4">Aucun solde.</p>' :
              balances.map(b => {
                const t = Store.find('leaveTypes', b.typeId);
                const remain = (b.acquired||0) - (b.taken||0) - (b.pending||0);
                return `
                  <div class="border rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-sm">${U.escapeHtml(t?.name||'')}</span>
                      <span class="w-3 h-3 rounded-full" style="background:${t?.color}"></span>
                    </div>
                    <div class="text-2xl font-bold">${remain.toFixed(1)}<span class="text-sm font-normal text-slate-500">/${b.acquired}j</span></div>
                    <div class="progress mt-2"><div class="progress-bar" style="width:${Math.min(100,(b.taken/(b.acquired||1)*100)).toFixed(0)}%;background:${t?.color}"></div></div>
                    <div class="text-[11px] text-slate-500 mt-1">Pris : ${b.taken}j</div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Mes demandes en cours -->
          <div class="card">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 class="font-semibold">Mes demandes de congés</h2>
              <a href="#/conges?new=1" class="btn btn-sm btn-primary">${U.icons.plus} Nouvelle</a>
            </div>
            <div class="p-5 space-y-2">
              ${myLeaves.length === 0 ? '<p class="text-slate-500 text-sm">Aucune demande.</p>' :
                myLeaves.slice(0, 5).map(l => {
                  const t = Store.find('leaveTypes', l.typeId);
                  return `
                    <div class="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                      <div>
                        <span class="badge" style="background:${t?.color}20;color:${t?.color}">${U.escapeHtml(t?.code||'')}</span>
                        <span class="ml-2">${U.fmtDate(l.startDate)} → ${U.fmtDate(l.endDate)} (${l.days}j)</span>
                      </div>
                      ${leaveStatus(l.status)}
                    </div>
                  `;
                }).join('')}
            </div>
          </div>

          <!-- Mes derniers bulletins -->
          <div class="card">
            <div class="p-5 border-b border-slate-100"><h2 class="font-semibold">Mes bulletins de paie</h2></div>
            <div class="p-5 space-y-2">
              ${myPayslips.length === 0 ? '<p class="text-slate-500 text-sm">Aucun bulletin.</p>' :
                myPayslips.slice(0, 5).map(p => `
                  <div class="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                    <div>
                      <span class="font-medium">${p.month}</span>
                      <span class="text-slate-500 ml-2">Net : ${U.fmtEur(p.net)}</span>
                    </div>
                    <button class="btn-icon">${U.icons.download}</button>
                  </div>
                `).join('')}
            </div>
          </div>

          <!-- Mes notes de frais -->
          <div class="card">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 class="font-semibold">Mes notes de frais</h2>
              <a href="#/frais?new=1" class="btn btn-sm btn-primary">${U.icons.plus} Nouvelle</a>
            </div>
            <div class="p-5 space-y-2">
              ${myExpenses.length === 0 ? '<p class="text-slate-500 text-sm">Aucune note.</p>' :
                myExpenses.slice(0, 5).map(e => `
                  <div class="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                    <div>
                      <span class="badge badge-gray">${U.escapeHtml(e.category)}</span>
                      <span class="ml-2">${U.fmtDate(e.date)}</span>
                      <span class="font-semibold ml-2">${U.fmtEur(e.amount)}</span>
                    </div>
                    ${expStatus(e.status)}
                  </div>
                `).join('')}
            </div>
          </div>

          <!-- Mes formations -->
          <div class="card">
            <div class="p-5 border-b border-slate-100"><h2 class="font-semibold">Mes formations</h2></div>
            <div class="p-5 space-y-2">
              ${myTrainings.length === 0 ? '<p class="text-slate-500 text-sm">Aucune formation.</p>' :
                myTrainings.slice(0, 5).map(en => {
                  const tr = Store.find('trainings', en.trainingId);
                  return `
                    <div class="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                      <div>
                        <span class="font-medium">${U.escapeHtml(tr?.title||'')}</span>
                        <span class="text-slate-500 ml-2">${U.fmtDate(tr?.startDate||en.requestedAt)}</span>
                      </div>
                      <span class="badge badge-blue">${U.escapeHtml(en.status)}</span>
                    </div>
                  `;
                }).join('')}
            </div>
          </div>
        </div>

        ${team.length > 0 ? `
          <div class="card">
            <div class="p-5 border-b border-slate-100">
              <h2 class="font-semibold">Mon équipe (${team.length})</h2>
            </div>
            <div class="p-5 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              ${team.map(t => `
                <a href="#/collaborateurs/${t.id}" class="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                  ${U.avatar(`${t.firstName} ${t.lastName}`, 36)}
                  <div>
                    <div class="font-medium text-sm">${U.escapeHtml(t.firstName)} ${U.escapeHtml(t.lastName)}</div>
                    <div class="text-xs text-slate-500">${U.escapeHtml(t.jobTitle)}</div>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    bind();
  }

  function bind() {
    document.querySelector('[data-clock-in]')?.addEventListener('click', () => {
      const now = new Date();
      const start = now.toTimeString().slice(0, 5);
      Store.insert('timesheets', {
        id: U.uid('ts'), employeeId: Store.currentUser().id, date: U.today(),
        startTime: start, endTime: '', breakMinutes: 0, hours: 0,
        project: '', notes: '', status: 'en_attente',
      });
      U.toast(`Pointage à ${start}`, 'success');
      render(document.getElementById('main-content'));
    });
    document.querySelector('[data-clock-out]')?.addEventListener('click', () => {
      const me = Store.currentUser();
      const t = Store.where('timesheets', x => x.employeeId === me.id && x.date === U.today())[0];
      if (!t) return;
      const end = new Date().toTimeString().slice(0, 5);
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const mins = (eh*60+em) - (sh*60+sm) - (t.breakMinutes||0);
      Store.update('timesheets', t.id, { endTime: end, hours: Math.max(0, mins/60).toFixed(2) });
      U.toast(`Sortie pointée à ${end}`, 'success');
      render(document.getElementById('main-content'));
    });
  }

  function actionCard(label, icon, classes, href) {
    return `
      <a href="${href}" class="card card-hover p-4 flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg ${classes} flex items-center justify-center">${U.icons[icon]}</div>
        <div class="font-medium text-slate-700">${U.escapeHtml(label)}</div>
      </a>
    `;
  }

  function leaveStatus(s) {
    const m = { en_attente: 'badge-amber', approuve: 'badge-green', refuse: 'badge-red', annule: 'badge-gray' };
    const l = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé', annule: 'Annulé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
  }
  function expStatus(s) {
    const m = { en_attente: 'badge-amber', approuve: 'badge-green', refuse: 'badge-red', rembourse: 'badge-purple' };
    const l = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé', rembourse: 'Remboursé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
  }

  return { render };
})();
