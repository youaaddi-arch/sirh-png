/* App shell + layout + routing */
window.App = (function () {
  const NAV = [
    { section: 'Mon espace' },
    { key: 'myspace',      href: '#/mon-espace',    label: 'Accueil',         icon: 'dashboard', roles: '*' },

    { section: 'Pilotage' },
    { key: 'dashboard',    href: '#/',              label: 'Tableau de bord', icon: 'dashboard', roles: ['admin','rh','manager','paie'] },
    { key: 'reports',      href: '#/rapports',      label: 'Rapports',        icon: 'chart',     roles: ['admin','rh','manager'] },
    { key: 'planning',     href: '#/planning',      label: 'Planning équipe', icon: 'leave',     roles: ['admin','rh','manager','paie'] },

    { section: 'Collaborateurs' },
    { key: 'employees',    href: '#/collaborateurs', label: 'Collaborateurs', icon: 'users',     roles: ['admin','rh','manager','paie'] },
    { key: 'orgchart',     href: '#/organigramme',   label: 'Organigramme',   icon: 'sitemap',   roles: '*' },
    { key: 'onboarding',   href: '#/onboarding',     label: 'Onboarding',     icon: 'onboard',   roles: ['admin','rh'] },

    { section: 'Temps & absences' },
    { key: 'leave',        href: '#/conges',        label: 'Congés',          icon: 'leave',     roles: '*' },
    { key: 'time',         href: '#/temps',         label: 'Temps',           icon: 'clock',     roles: '*' },

    { section: 'Argent' },
    { key: 'expenses',     href: '#/frais',         label: 'Notes de frais',  icon: 'money',     roles: '*' },
    { key: 'payroll',      href: '#/paie',          label: 'Bulletins de paie', icon: 'money',   roles: ['admin','rh','paie'] },
    { key: 'payroll_vars', href: '#/variables-paie',label: 'Variables de paie', icon: 'chart',   roles: ['admin','rh','paie'] },

    { section: 'Performance' },
    { key: 'reviews',      href: '#/entretiens',    label: 'Entretiens',      icon: 'star',      roles: '*' },
    { key: 'training',     href: '#/formation',     label: 'Formation',       icon: 'book',      roles: '*' },

    { section: 'Talents' },
    { key: 'recruitment',  href: '#/recrutement',   label: 'Recrutement',     icon: 'briefcase', roles: ['admin','rh','manager'] },
    { key: 'documents',    href: '#/documents',     label: 'Documents',       icon: 'document',  roles: '*' },
    { key: 'letters',      href: '#/courriers',     label: 'Courriers RH',    icon: 'mail',      roles: ['admin','rh','manager'] },

    { section: 'Référentiel' },
    { key: 'companies',    href: '#/societes',      label: 'Sociétés',        icon: 'building',  roles: ['admin','rh'] },
    { key: 'settings',     href: '#/parametres',    label: 'Paramètres',      icon: 'cog',       roles: ['admin'] },
  ];

  let activeKey = 'dashboard';

  function start() {
    Router.add(/^\/$/,                         () => {
      const me = Store.currentUser();
      if (me && me.role === 'employe') { Router.navigate('/mon-espace'); return; }
      renderApp('dashboard', DashboardView.render);
    });
    Router.add(/^\/login$/,                    () => AuthView.render());
    Router.add(/^\/mon-espace$/,               () => renderApp('myspace',    MySpaceView.render));
    Router.add(/^\/collaborateurs$/,           (r) => renderApp('employees', (h) => EmployeesView.render(h, r)));
    Router.add(/^\/collaborateurs\/([^\/]+)$/, (r) => renderApp('employees', (h) => EmployeesView.render(h, r)));
    Router.add(/^\/conges$/,                   (r) => renderApp('leave',     (h) => LeaveView.render(h, r)));
    Router.add(/^\/temps$/,                    () => renderApp('time',       TimeView.render));
    Router.add(/^\/frais$/,                    () => renderApp('expenses',   ExpensesView.render));
    Router.add(/^\/entretiens$/,               () => renderApp('reviews',    ReviewsView.render));
    Router.add(/^\/formation$/,                () => renderApp('training',   TrainingView.render));
    Router.add(/^\/recrutement$/,              () => renderApp('recruitment',RecruitmentView.render));
    Router.add(/^\/documents$/,                () => renderApp('documents',  DocumentsView.render));
    Router.add(/^\/organigramme$/,             () => renderApp('orgchart',   OrgChartView.render));
    Router.add(/^\/rapports$/,                 () => renderApp('reports',    ReportsView.render));
    Router.add(/^\/societes$/,                 () => renderApp('companies',  CompaniesView.render));
    Router.add(/^\/paie$/,                     () => renderApp('payroll',    PayrollView.render));
    Router.add(/^\/variables-paie$/,           () => renderApp('payroll_vars', PayrollVarsView.render));
    Router.add(/^\/planning$/,                 () => renderApp('planning',   PlanningView.render));
    Router.add(/^\/courriers$/,                () => renderApp('letters',    LettersView.render));
    Router.add(/^\/onboarding$/,               () => renderApp('onboarding', OnboardingView.render));
    Router.add(/^\/parametres$/,               () => renderApp('settings',   SettingsView.render));
    // Fallback handled in router

    Router.start();
  }

  function renderApp(key, viewRender) {
    const me = Store.currentUser();
    if (!me) { AuthView.render(); return; }
    activeKey = key;

    document.getElementById('app').innerHTML = `
      <div class="flex min-h-screen bg-slate-100">
        ${renderSidebar(me)}
        <div class="flex-1 min-w-0 flex flex-col">
          ${renderHeader(me)}
          <main id="main-content" class="flex-1 p-6 overflow-x-hidden"></main>
        </div>
      </div>
    `;
    bindShell();
    viewRender(document.getElementById('main-content'));
  }

  function renderSidebar(me) {
    return `
      <aside class="sidebar bg-brand-950 text-slate-200 hidden md:flex flex-col" id="sidebar">
        <div class="p-4 border-b border-brand-900">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-white text-brand-700 flex items-center justify-center font-bold">PN</div>
            <div>
              <div class="font-semibold text-white">${U.escapeHtml(Store.settings().companyName)}</div>
              <div class="text-[11px] text-brand-200">SIRH multi-entités</div>
            </div>
          </div>
        </div>
        <nav class="p-3 space-y-1 flex-1 overflow-y-auto">
          ${NAV.map(item => {
            if (item.section) return `<div class="nav-section">${U.escapeHtml(item.section)}</div>`;
            if (item.roles !== '*' && !item.roles.includes(me.role)) return '';
            const active = item.key === activeKey ? 'active' : '';
            return `<a href="${item.href}" class="nav-item ${active}">${U.icons[item.icon]}<span>${U.escapeHtml(item.label)}</span></a>`;
          }).join('')}
        </nav>
        <div class="p-3 border-t border-brand-900">
          <div class="text-[11px] text-brand-300 text-center">v1.0 • © ${new Date().getFullYear()}</div>
        </div>
      </aside>
    `;
  }

  function renderHeader(me) {
    const notifications = Store.where('notifications', n => n.userId === me.id);
    const unread = notifications.filter(n => !n.read).length;
    const breadcrumbs = currentBreadcrumb();

    return `
      <header class="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4">
        <button class="btn-icon md:hidden" id="menu-toggle">${U.icons.menu}</button>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-slate-500">${breadcrumbs}</div>
        </div>
        <div class="relative max-w-md flex-1 hidden lg:block">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${U.icons.search}</span>
          <input id="global-search" type="text" class="input pl-10 bg-slate-50 border-slate-200" placeholder="Rechercher un collaborateur, un congé…"/>
        </div>
        <div class="relative">
          <button id="bell-btn" class="btn-icon relative">
            ${U.icons.bell}
            ${unread > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">${unread}</span>` : ''}
          </button>
          <div id="bell-panel" class="hidden absolute right-0 mt-2 w-80 card overflow-hidden z-50">
            <div class="p-3 border-b border-slate-200 flex items-center justify-between">
              <span class="font-semibold">Notifications</span>
              <button class="text-xs text-brand-600 hover:underline" id="mark-all-read">Tout marquer lu</button>
            </div>
            <div class="max-h-96 overflow-y-auto">
              ${notifications.length === 0 ? '<div class="p-4 text-sm text-slate-500">Aucune notification</div>' :
                notifications.slice(0, 10).map(n => `
                  <a href="${n.link}" class="block p-3 border-b border-slate-100 hover:bg-slate-50 ${n.read?'':'bg-brand-50/40'}">
                    <div class="text-sm font-medium">${U.escapeHtml(n.title)}</div>
                    <div class="text-xs text-slate-500">${U.escapeHtml(n.body)}</div>
                    <div class="text-[11px] text-slate-400 mt-1">${U.fmtDate(n.date)}</div>
                  </a>
                `).join('')}
            </div>
          </div>
        </div>
        <div class="relative">
          <button id="user-btn" class="flex items-center gap-2 hover:bg-slate-100 rounded-lg pl-1 pr-2 py-1">
            ${U.avatar(`${me.firstName} ${me.lastName}`, 32)}
            <div class="text-left hidden md:block">
              <div class="text-sm font-medium">${U.escapeHtml(me.firstName)} ${U.escapeHtml(me.lastName)}</div>
              <div class="text-xs text-slate-500">${roleLabel(me.role)}</div>
            </div>
            ${U.icons.chevronD}
          </button>
          <div id="user-menu" class="hidden absolute right-0 mt-2 w-56 card overflow-hidden z-50">
            <a href="#/collaborateurs/${me.id}" class="block px-4 py-2 text-sm hover:bg-slate-50">Mon profil</a>
            <a href="#/parametres" class="block px-4 py-2 text-sm hover:bg-slate-50">Paramètres</a>
            <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-red-600">Se déconnecter</button>
          </div>
        </div>
      </header>
    `;
  }

  function bindShell() {
    document.getElementById('bell-btn').onclick = (e) => {
      e.stopPropagation();
      document.getElementById('bell-panel').classList.toggle('hidden');
      document.getElementById('user-menu')?.classList.add('hidden');
    };
    document.getElementById('user-btn').onclick = (e) => {
      e.stopPropagation();
      document.getElementById('user-menu').classList.toggle('hidden');
      document.getElementById('bell-panel')?.classList.add('hidden');
    };
    document.body.addEventListener('click', () => {
      document.getElementById('bell-panel')?.classList.add('hidden');
      document.getElementById('user-menu')?.classList.add('hidden');
    });

    document.getElementById('mark-all-read')?.addEventListener('click', () => {
      Store.get('notifications').forEach(n => { if (n.userId === Store.currentUser().id) Store.update('notifications', n.id, { read: true }); });
      Router.navigate(location.hash.replace('#','') || '/');
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      Store.logout();
      U.toast('Déconnexion réussie', 'success');
      Router.navigate('/login');
    });

    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('hidden');
    });

    const gs = document.getElementById('global-search');
    if (gs) {
      gs.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = gs.value.trim();
          if (q) Router.navigate(`/collaborateurs?q=${encodeURIComponent(q)}`);
        }
      });
    }
  }

  function currentBreadcrumb() {
    const map = {
      dashboard: 'Tableau de bord',
      employees: 'Collaborateurs',
      leave: 'Congés',
      time: 'Temps',
      expenses: 'Notes de frais',
      reviews: 'Entretiens',
      training: 'Formation',
      recruitment: 'Recrutement',
      documents: 'Documents',
      orgchart: 'Organigramme',
      reports: 'Rapports',
      companies: 'Sociétés',
      payroll: 'Paie',
      onboarding: 'Onboarding',
      settings: 'Paramètres',
    };
    return map[activeKey] || '';
  }

  function refreshHeader() {
    const me = Store.currentUser();
    const headerEl = document.querySelector('header');
    if (headerEl) headerEl.outerHTML = renderHeader(me);
    bindShell();
  }

  function roleLabel(r) { return ({ admin: 'Administrateur', rh: 'RH', manager: 'Manager', paie: 'Paie', employe: 'Collaborateur' })[r] || r; }

  return { start, refreshHeader };
})();

window.addEventListener('DOMContentLoaded', () => {
  App.start();
});
