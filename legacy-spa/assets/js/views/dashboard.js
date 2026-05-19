/* Dashboard */
window.DashboardView = (function () {
  function render(host) {
    const me = Store.currentUser();
    const employees = Store.get('employees');
    const companies = Store.get('companies');
    const leaves = Store.get('leaves');
    const pendingLeaves = leaves.filter(l => l.status === 'en_attente');
    const expenses = Store.get('expenses');
    const pendingExpenses = expenses.filter(e => e.status === 'en_attente');
    const jobs = Store.get('jobs').filter(j => j.status === 'ouvert');
    const candidates = Store.get('candidates');
    const trainings = Store.get('trainings');
    const reviews = Store.get('reviews').filter(r => r.status === 'planifie');
    const holidays = Store.get('holidays');

    // Stats per department
    const depCount = {};
    employees.forEach(e => { depCount[e.departmentId] = (depCount[e.departmentId] || 0) + 1; });

    // Upcoming leaves (next 30 days)
    const upcoming = leaves
      .filter(l => l.status === 'approuve' && new Date(l.startDate) >= new Date() && new Date(l.startDate) <= new Date(Date.now() + 30 * 86400000))
      .slice(0, 5);

    // Birthdays this month
    const month = new Date().getMonth();
    const birthdays = employees
      .filter(e => e.birthDate)
      .filter(e => new Date(e.birthDate).getMonth() === month)
      .slice(0, 5);

    // Contracts ending
    const contractEnding = employees.filter(e => e.contractEnd && new Date(e.contractEnd) > new Date() && new Date(e.contractEnd) < new Date(Date.now() + 90 * 86400000));

    host.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Bonjour, ${U.escapeHtml(me.firstName)} 👋</h1>
            <p class="text-slate-500 text-sm">Voici un aperçu de votre activité RH aujourd'hui — ${U.fmtDateLong(new Date())}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-secondary" data-action="export-data">${U.icons.download} Exporter</button>
            <button class="btn btn-primary" data-quick-action="leave">${U.icons.plus} Demander un congé</button>
          </div>
        </div>

        <!-- KPI cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${kpi('Effectif total', employees.length, 'users', 'bg-brand-100 text-brand-700', '+5% vs N-1')}
          ${kpi('Entités du groupe', companies.length, 'building', 'bg-purple-100 text-purple-700', `${new Set(companies.map(c=>c.code)).size} sociétés`)}
          ${kpi('Congés à valider', pendingLeaves.length, 'leave', 'bg-amber-100 text-amber-700', 'En attente')}
          ${kpi('Notes de frais', pendingExpenses.length, 'money', 'bg-emerald-100 text-emerald-700', U.fmtEur(pendingExpenses.reduce((s,e)=>s+e.amount,0)))}
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${kpi('Postes ouverts', jobs.length, 'briefcase', 'bg-pink-100 text-pink-700', `${candidates.length} candidat(s)`)}
          ${kpi('Entretiens à venir', reviews.length, 'star', 'bg-indigo-100 text-indigo-700', 'Planifiés')}
          ${kpi('Formations', trainings.length, 'book', 'bg-cyan-100 text-cyan-700', 'Au catalogue')}
          ${kpi('CDD à échéance', contractEnding.length, 'document', 'bg-red-100 text-red-700', '< 90j')}
        </div>

        <!-- Two-column area -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Pending approvals -->
          <div class="card lg:col-span-2">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 class="font-semibold text-slate-900">À valider</h2>
              <a href="#/conges" class="text-sm text-brand-600 hover:underline">Tout voir →</a>
            </div>
            <div class="p-5 space-y-3">
              ${pendingLeaves.length === 0 ? `<p class="text-sm text-slate-500">Aucune demande en attente.</p>` :
                pendingLeaves.slice(0, 5).map(l => {
                  const emp = Store.employee(l.employeeId);
                  const type = Store.find('leaveTypes', l.typeId);
                  return `
                    <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100">
                      <div class="flex items-center gap-3">
                        ${U.avatar(`${emp.firstName} ${emp.lastName}`, 36)}
                        <div>
                          <div class="text-sm font-medium text-slate-900">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</div>
                          <div class="text-xs text-slate-500">${type.name} • ${U.fmtDate(l.startDate)} → ${U.fmtDate(l.endDate)} (${l.days}j)</div>
                        </div>
                      </div>
                      <div class="flex gap-1">
                        <button class="btn-icon text-emerald-600" data-approve-leave="${l.id}" title="Approuver">${U.icons.check}</button>
                        <button class="btn-icon text-red-600" data-reject-leave="${l.id}" title="Refuser">${U.icons.x}</button>
                      </div>
                    </div>
                  `;
                }).join('')}
            </div>
          </div>

          <!-- Birthdays -->
          <div class="card">
            <div class="p-5 border-b border-slate-100">
              <h2 class="font-semibold text-slate-900">🎂 Anniversaires du mois</h2>
            </div>
            <div class="p-5 space-y-3">
              ${birthdays.length === 0 ? `<p class="text-sm text-slate-500">Pas d'anniversaire ce mois-ci.</p>` :
                birthdays.map(e => `
                  <div class="flex items-center gap-3">
                    ${U.avatar(`${e.firstName} ${e.lastName}`, 36)}
                    <div>
                      <div class="text-sm font-medium">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</div>
                      <div class="text-xs text-slate-500">${U.fmtDate(e.birthDate)}</div>
                    </div>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Effectif par société -->
          <div class="card lg:col-span-2">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 class="font-semibold text-slate-900">Effectif par société</h2>
              <a href="#/societes" class="text-sm text-brand-600 hover:underline">Voir →</a>
            </div>
            <div class="p-5">
              ${renderCompanyChart()}
            </div>
          </div>

          <!-- Upcoming -->
          <div class="card">
            <div class="p-5 border-b border-slate-100">
              <h2 class="font-semibold text-slate-900">📅 Absents à venir</h2>
            </div>
            <div class="p-5 space-y-3">
              ${upcoming.length === 0 ? `<p class="text-sm text-slate-500">Personne absent dans les 30 jours.</p>` :
                upcoming.map(l => {
                  const emp = Store.employee(l.employeeId);
                  const type = Store.find('leaveTypes', l.typeId);
                  return `
                    <div class="flex items-center gap-3">
                      ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                      <div class="flex-1">
                        <div class="text-sm font-medium">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</div>
                        <div class="text-xs text-slate-500">${type.name} • ${U.fmtDate(l.startDate)}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          ${quickLink('Mon profil', `#/collaborateurs/${me.id}`, 'users', 'bg-brand-50')}
          ${quickLink('Mes congés', '#/conges?mine=1', 'leave', 'bg-emerald-50')}
          ${quickLink('Pointer', '#/temps', 'clock', 'bg-amber-50')}
          ${quickLink('Note de frais', '#/frais', 'money', 'bg-pink-50')}
          ${quickLink('Catalogue formation', '#/formation', 'book', 'bg-cyan-50')}
          ${quickLink('Documents', '#/documents', 'document', 'bg-purple-50')}
        </div>

        <!-- Holidays / Reviews -->
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="card">
            <div class="p-5 border-b border-slate-100"><h2 class="font-semibold">📌 Jours fériés ${new Date().getFullYear()}</h2></div>
            <div class="p-5 grid grid-cols-2 gap-2 text-sm">
              ${holidays.map(h => `
                <div class="flex justify-between p-2 bg-slate-50 rounded">
                  <span>${U.escapeHtml(h.name)}</span>
                  <span class="text-slate-500">${U.fmtDate(h.date)}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="card">
            <div class="p-5 border-b border-slate-100"><h2 class="font-semibold">⭐ Prochains entretiens</h2></div>
            <div class="p-5 space-y-3 text-sm">
              ${reviews.length === 0 ? '<p class="text-slate-500">Aucun entretien planifié.</p>' : reviews.slice(0, 6).map(r => {
                const emp = Store.employee(r.employeeId);
                const rev = Store.employee(r.reviewerId);
                return `
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                      <div>
                        <div class="font-medium">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</div>
                        <div class="text-xs text-slate-500">${typeLabel(r.type)} • Évaluateur : ${rev ? U.escapeHtml(rev.firstName+' '+rev.lastName) : '—'}</div>
                      </div>
                    </div>
                    <div class="text-xs text-slate-500">${U.fmtDate(r.scheduledAt)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    bind();
  }

  function bind() {
    document.querySelectorAll('[data-approve-leave]').forEach(b => {
      b.onclick = () => {
        Store.update('leaves', b.dataset.approveLeave, { status: 'approuve', approvedBy: Store.currentUser().id });
        U.toast('Congé approuvé', 'success');
        DashboardView.render(document.getElementById('main-content'));
      };
    });
    document.querySelectorAll('[data-reject-leave]').forEach(b => {
      b.onclick = () => {
        Store.update('leaves', b.dataset.rejectLeave, { status: 'refuse', approvedBy: Store.currentUser().id });
        U.toast('Congé refusé', 'warn');
        DashboardView.render(document.getElementById('main-content'));
      };
    });
    document.querySelector('[data-quick-action="leave"]')?.addEventListener('click', () => {
      Router.navigate('/conges?new=1');
    });
    document.querySelector('[data-action="export-data"]')?.addEventListener('click', () => {
      U.downloadFile('sirh-png-export.json', Store.exportAll(), 'application/json');
      U.toast('Export téléchargé', 'success');
    });
  }

  function kpi(label, value, icon, classes, sub) {
    return `
      <div class="stat-card">
        <div class="stat-icon ${classes}">${U.icons[icon]}</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs uppercase tracking-wider text-slate-500 font-semibold">${U.escapeHtml(label)}</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">${value}</div>
          <div class="text-xs text-slate-500 mt-1">${U.escapeHtml(sub || '')}</div>
        </div>
      </div>
    `;
  }

  function quickLink(label, href, icon, bg) {
    return `
      <a href="${href}" class="card card-hover p-4 flex flex-col items-center text-center gap-2">
        <div class="w-10 h-10 rounded-full ${bg} flex items-center justify-center text-brand-700">${U.icons[icon]}</div>
        <div class="text-sm font-medium text-slate-700">${U.escapeHtml(label)}</div>
      </a>
    `;
  }

  function renderCompanyChart() {
    const employees = Store.get('employees');
    const companies = Store.get('companies');
    // Group employees by company code prefix (3-digit "001-...")
    const counts = {};
    employees.forEach(e => {
      const c = companies.find(x => x.id === e.companyId);
      if (!c) return;
      counts[c.code] = (counts[c.code] || 0) + 1;
    });
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const max = rows.length ? rows[0][1] : 1;
    return `
      <div class="space-y-2 text-sm">
        ${rows.map(([code, n]) => {
          const co = companies.find(c => c.code === code);
          return `
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium text-slate-700">${U.escapeHtml(code)} — ${U.escapeHtml(co ? co.name : '')}</span>
                <span class="text-slate-500">${n}</span>
              </div>
              <div class="progress"><div class="progress-bar" style="width: ${(n/max*100).toFixed(0)}%"></div></div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function typeLabel(t) {
    return ({
      annuel: 'Entretien annuel',
      professionnel: 'Entretien professionnel',
      periode_essai: 'Période d\'essai',
    })[t] || t;
  }

  return { render };
})();
