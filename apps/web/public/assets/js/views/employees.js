/* Employees view (list + detail + form) */
window.EmployeesView = (function () {
  let filters = { search: '', department: '', company: '', contract: '', status: 'actif' };

  function render(host, { args, params } = { args: [], params: {} }) {
    const id = args && args[0];
    if (id) return renderDetail(host, id);
    return renderList(host, params);
  }

  function renderList(host, params = {}) {
    if (params.q) filters.search = params.q;
    const employees = Store.get('employees');
    const departments = Store.get('departments');
    const companies = Store.get('companies');

    const filtered = employees.filter(e => {
      if (filters.status && e.status !== filters.status) return false;
      if (filters.department && e.departmentId !== filters.department) return false;
      if (filters.company && e.companyId !== filters.company) return false;
      if (filters.contract && e.contractType !== filters.contract) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${e.firstName} ${e.lastName} ${e.email} ${e.matricule} ${e.jobTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Collaborateurs</h1>
            <p class="text-slate-500 text-sm">${filtered.length} sur ${employees.length} collaborateur(s)</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" data-export>${U.icons.download} Exporter CSV</button>
            <button class="btn btn-primary" data-new>${U.icons.plus} Nouveau collaborateur</button>
          </div>
        </div>

        <div class="card p-4">
          <div class="grid md:grid-cols-5 gap-3">
            <div class="md:col-span-2">
              <label class="label">Recherche</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${U.icons.search}</span>
                <input id="f-search" type="text" class="input pl-10" placeholder="Nom, email, matricule…" value="${U.escapeHtml(filters.search)}"/>
              </div>
            </div>
            <div>
              <label class="label">Société</label>
              <select id="f-company" class="select">
                <option value="">Toutes</option>
                ${companies.map(c => `<option value="${c.id}" ${filters.company===c.id?'selected':''}>${U.escapeHtml(c.code + ' — ' + c.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="label">Département</label>
              <select id="f-dep" class="select">
                <option value="">Tous</option>
                ${departments.map(d => `<option value="${d.id}" ${filters.department===d.id?'selected':''}>${U.escapeHtml(d.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="label">Contrat</label>
              <select id="f-contract" class="select">
                <option value="">Tous</option>
                <option value="CDI" ${filters.contract==='CDI'?'selected':''}>CDI</option>
                <option value="CDD" ${filters.contract==='CDD'?'selected':''}>CDD</option>
                <option value="Alternance" ${filters.contract==='Alternance'?'selected':''}>Alternance</option>
                <option value="Stage" ${filters.contract==='Stage'?'selected':''}>Stage</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card overflow-hidden">
          <table class="table">
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Poste</th>
                <th>Société</th>
                <th>Contrat</th>
                <th>Embauche</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `<tr><td colspan="7" class="text-center py-12 text-slate-400">Aucun collaborateur</td></tr>` :
                filtered.map(e => {
                  const co = companies.find(c => c.id === e.companyId);
                  const dep = departments.find(d => d.id === e.departmentId);
                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          ${U.avatar(`${e.firstName} ${e.lastName}`, 36)}
                          <div>
                            <a href="#/collaborateurs/${e.id}" class="font-medium text-slate-900 hover:text-brand-700">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</a>
                            <div class="text-xs text-slate-500">${U.escapeHtml(e.email)} • ${U.escapeHtml(e.matricule)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-sm">${U.escapeHtml(e.jobTitle)}</div>
                        <div class="text-xs text-slate-500">${dep ? U.escapeHtml(dep.name) : ''}</div>
                      </td>
                      <td class="text-sm">${co ? `<span class="badge badge-blue">${U.escapeHtml(co.code)}</span>` : '—'}</td>
                      <td><span class="badge badge-gray">${U.escapeHtml(e.contractType)}</span></td>
                      <td class="text-sm text-slate-600">${U.fmtDate(e.contractStart)}</td>
                      <td>${e.status === 'actif' ? '<span class="badge badge-green">Actif</span>' : '<span class="badge badge-gray">Inactif</span>'}</td>
                      <td>
                        <div class="flex gap-1 justify-end">
                          <a href="#/collaborateurs/${e.id}" class="btn-icon" title="Voir">${U.icons.eye}</a>
                          <button class="btn-icon" data-edit="${e.id}" title="Éditer">${U.icons.edit}</button>
                          <button class="btn-icon text-red-600" data-del="${e.id}" title="Supprimer">${U.icons.trash}</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    bindList();
  }

  function bindList() {
    const fSearch = document.getElementById('f-search');
    fSearch.addEventListener('input', U.debounce(() => {
      filters.search = fSearch.value;
      renderList(document.getElementById('main-content'));
    }, 200));
    document.getElementById('f-dep').onchange = (e) => { filters.department = e.target.value; renderList(document.getElementById('main-content')); };
    document.getElementById('f-company').onchange = (e) => { filters.company = e.target.value; renderList(document.getElementById('main-content')); };
    document.getElementById('f-contract').onchange = (e) => { filters.contract = e.target.value; renderList(document.getElementById('main-content')); };

    document.querySelector('[data-new]')?.addEventListener('click', () => openForm());
    document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openForm(b.dataset.edit));
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const id = b.dataset.del;
      const e = Store.find('employees', id);
      const ok = await U.confirm(`Supprimer ${e.firstName} ${e.lastName} ?`, { danger: true, confirmText: 'Supprimer' });
      if (ok) { Store.remove('employees', id); U.toast('Collaborateur supprimé', 'success'); renderList(document.getElementById('main-content')); }
    });
    document.querySelector('[data-export]')?.addEventListener('click', () => {
      const rows = Store.get('employees').map(e => {
        const co = Store.company(e.companyId);
        const dep = Store.department(e.departmentId);
        const mgr = e.managerId ? Store.employee(e.managerId) : null;
        return [e.matricule, e.firstName, e.lastName, e.email, e.phone, e.jobTitle, dep?.name||'', co?.code||'', co?.name||'', e.contractType, e.contractStart, e.contractEnd||'', e.status, mgr ? `${mgr.firstName} ${mgr.lastName}` : '', e.salary||''];
      });
      const csv = U.csvFromRows(
        ['Matricule','Prénom','Nom','Email','Téléphone','Poste','Département','Code société','Société','Contrat','Date embauche','Fin contrat','Statut','Manager','Salaire'],
        rows
      );
      U.downloadFile('collaborateurs.csv', csv, 'text/csv;charset=utf-8');
      U.toast('Export CSV généré', 'success');
    });
  }

  function openForm(id) {
    const isEdit = !!id;
    const emp = isEdit ? { ...Store.find('employees', id) } : {
      firstName: '', lastName: '', email: '', phone: '',
      matricule: `PNG-${String(Store.get('employees').length + 1).padStart(4, '0')}`,
      role: 'employe', jobTitle: '', departmentId: '', companyId: 'co_001', managerId: '',
      contractType: 'CDI', contractStart: U.today(), contractEnd: '', status: 'actif',
      birthDate: '', address: '', salary: 0,
      iban: '', socialSecurity: '', password: 'password',
    };
    const departments = Store.get('departments');
    const companies = Store.get('companies');
    const managers = Store.get('employees');

    U.modal({
      title: isEdit ? 'Modifier le collaborateur' : 'Nouveau collaborateur',
      size: 'max-w-3xl',
      body: `
        <form id="emp-form" class="grid md:grid-cols-2 gap-4">
          <div><label class="label">Matricule</label><input class="input" name="matricule" value="${U.escapeHtml(emp.matricule)}" required/></div>
          <div><label class="label">Statut</label><select class="select" name="status">
            <option value="actif" ${emp.status==='actif'?'selected':''}>Actif</option>
            <option value="inactif" ${emp.status==='inactif'?'selected':''}>Inactif</option>
            <option value="suspendu" ${emp.status==='suspendu'?'selected':''}>Suspendu</option>
          </select></div>
          <div><label class="label">Prénom</label><input class="input" name="firstName" value="${U.escapeHtml(emp.firstName)}" required/></div>
          <div><label class="label">Nom</label><input class="input" name="lastName" value="${U.escapeHtml(emp.lastName)}" required/></div>
          <div><label class="label">Email</label><input type="email" class="input" name="email" value="${U.escapeHtml(emp.email)}" required/></div>
          <div><label class="label">Téléphone</label><input class="input" name="phone" value="${U.escapeHtml(emp.phone||'')}"/></div>
          <div><label class="label">Date de naissance</label><input type="date" class="input" name="birthDate" value="${emp.birthDate||''}"/></div>
          <div class="md:col-span-2"><label class="label">Adresse</label><input class="input" name="address" value="${U.escapeHtml(emp.address||'')}"/></div>
          <div><label class="label">Poste</label><input class="input" name="jobTitle" value="${U.escapeHtml(emp.jobTitle)}" required/></div>
          <div><label class="label">Rôle</label><select class="select" name="role">
            <option value="admin" ${emp.role==='admin'?'selected':''}>Administrateur</option>
            <option value="rh" ${emp.role==='rh'?'selected':''}>RH</option>
            <option value="manager" ${emp.role==='manager'?'selected':''}>Manager</option>
            <option value="paie" ${emp.role==='paie'?'selected':''}>Paie</option>
            <option value="employe" ${emp.role==='employe'?'selected':''}>Collaborateur</option>
          </select></div>
          <div><label class="label">Département</label><select class="select" name="departmentId">
            <option value="">—</option>
            ${departments.map(d => `<option value="${d.id}" ${emp.departmentId===d.id?'selected':''}>${U.escapeHtml(d.name)}</option>`).join('')}
          </select></div>
          <div><label class="label">Société</label><select class="select" name="companyId">
            ${companies.map(c => `<option value="${c.id}" ${emp.companyId===c.id?'selected':''}>${U.escapeHtml(c.code+' — '+c.name)}</option>`).join('')}
          </select></div>
          <div><label class="label">Manager</label><select class="select" name="managerId">
            <option value="">—</option>
            ${managers.filter(m => m.id !== emp.id).map(m => `<option value="${m.id}" ${emp.managerId===m.id?'selected':''}>${U.escapeHtml(m.firstName+' '+m.lastName)}</option>`).join('')}
          </select></div>
          <div><label class="label">Type de contrat</label><select class="select" name="contractType">
            <option value="CDI" ${emp.contractType==='CDI'?'selected':''}>CDI</option>
            <option value="CDD" ${emp.contractType==='CDD'?'selected':''}>CDD</option>
            <option value="Alternance" ${emp.contractType==='Alternance'?'selected':''}>Alternance</option>
            <option value="Stage" ${emp.contractType==='Stage'?'selected':''}>Stage</option>
            <option value="Freelance" ${emp.contractType==='Freelance'?'selected':''}>Freelance</option>
          </select></div>
          <div><label class="label">Date d'embauche</label><input type="date" class="input" name="contractStart" value="${emp.contractStart||''}"/></div>
          <div><label class="label">Fin de contrat (si CDD)</label><input type="date" class="input" name="contractEnd" value="${emp.contractEnd||''}"/></div>
          <div><label class="label">Salaire brut mensuel (€)</label><input type="number" class="input" name="salary" value="${emp.salary||0}"/></div>
          <div><label class="label">IBAN</label><input class="input" name="iban" value="${U.escapeHtml(emp.iban||'')}"/></div>
          <div><label class="label">N° Sécurité Sociale</label><input class="input" name="socialSecurity" value="${U.escapeHtml(emp.socialSecurity||'')}"/></div>
          <div class="md:col-span-2"><label class="label">Mot de passe</label><input class="input" name="password" value="${U.escapeHtml(emp.password||'')}"/></div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" data-close-modal>Annuler</button>
        <button class="btn btn-primary" data-submit>${isEdit ? 'Enregistrer' : 'Créer'}</button>
      `,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#emp-form');
          if (!f.reportValidity()) return;
          const data = Object.fromEntries(new FormData(f).entries());
          data.salary = parseFloat(data.salary) || 0;
          if (isEdit) { Store.update('employees', id, data); U.toast('Collaborateur modifié', 'success'); }
          else { Store.insert('employees', { id: U.uid('emp'), ...data }); U.toast('Collaborateur créé', 'success'); }
          close();
          renderList(document.getElementById('main-content'));
        };
      }
    });
  }

  function renderDetail(host, id) {
    const e = Store.find('employees', id);
    if (!e) { host.innerHTML = '<div class="card p-6">Collaborateur introuvable.</div>'; return; }
    if (!Store.canSeeEmployee(id)) { host.innerHTML = '<div class="card p-6">Vous n\'avez pas accès à cette fiche.</div>'; return; }
    const co = Store.company(e.companyId);
    const dep = Store.department(e.departmentId);
    const mgr = e.managerId ? Store.employee(e.managerId) : null;
    const team = Store.where('employees', x => x.managerId === e.id);
    const leaves = Store.where('leaves', l => l.employeeId === e.id);
    const docs  = Store.where('documents', d => d.employeeId === e.id);
    const payslips = Store.where('payslips', p => p.employeeId === e.id).sort((a, b) => b.month.localeCompare(a.month));
    const balances = Store.where('leaveBalances', b => b.employeeId === e.id);
    const reviews = Store.where('reviews', r => r.employeeId === e.id);
    const contracts = Store.where('contracts', c => c.employeeId === e.id);
    const salaryHistory = Store.where('salaryHistory', s => s.employeeId === e.id).sort((a,b) => (b.effectiveDate||'').localeCompare(a.effectiveDate||''));
    const letters = Store.where('letters', l => l.employeeId === e.id).sort((a,b) => (b.date||'').localeCompare(a.date||''));

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <a href="#/collaborateurs" class="hover:text-brand-600">Collaborateurs</a>
            ${U.icons.chevronR}
            <span class="text-slate-900 font-medium">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" data-edit-emp>${U.icons.edit} Modifier</button>
            <a href="#/collaborateurs" class="btn btn-ghost">Retour</a>
          </div>
        </div>

        <!-- Identity card -->
        <div class="card p-6 flex items-center gap-6 flex-wrap">
          ${U.avatar(`${e.firstName} ${e.lastName}`, 80)}
          <div class="flex-1 min-w-[200px]">
            <h1 class="text-2xl font-bold text-slate-900">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</h1>
            <p class="text-slate-600">${U.escapeHtml(e.jobTitle)}</p>
            <div class="flex gap-2 mt-2 flex-wrap">
              <span class="badge badge-blue">${U.escapeHtml(e.contractType)}</span>
              <span class="badge badge-gray">${U.escapeHtml(e.matricule)}</span>
              ${e.status==='actif' ? '<span class="badge badge-green">Actif</span>' : '<span class="badge badge-gray">'+U.escapeHtml(e.status)+'</span>'}
              <span class="badge badge-purple">${U.escapeHtml(({admin:'Admin',rh:'RH',manager:'Manager',paie:'Paie',employe:'Collaborateur'})[e.role]||e.role)}</span>
            </div>
          </div>
          <div class="text-sm text-slate-600 space-y-1">
            <div class="flex items-center gap-2">${U.icons.mail} <a href="mailto:${e.email}" class="hover:underline">${U.escapeHtml(e.email)}</a></div>
            <div class="flex items-center gap-2">📞 ${U.escapeHtml(e.phone||'—')}</div>
            <div class="flex items-center gap-2">🏢 ${co ? U.escapeHtml(co.code+' — '+co.name) : '—'}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="card">
          <div class="flex border-b border-slate-200 px-2 overflow-x-auto">
            ${['Profil','Famille','Banque & Fiscal','Carrière','Contrats','Salaire','Congés','Temps','Documents','Paie','Courriers','Entretiens','Équipe'].map((t,i)=>
              `<button class="px-4 py-3 text-sm font-medium border-b-2 ${i===0?'border-brand-600 text-brand-700':'border-transparent text-slate-600 hover:text-slate-900'}" data-tab="${i}">${t}</button>`
            ).join('')}
          </div>
          <div id="tab-content" class="p-6">${renderTab(0, e, { co, dep, mgr, team, leaves, docs, payslips, balances, reviews, contracts, salaryHistory, letters })}</div>
        </div>
      </div>
    `;
    document.querySelectorAll('[data-tab]').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('[data-tab]').forEach(x => {
          x.className = 'px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-600 hover:text-slate-900';
        });
        b.className = 'px-4 py-3 text-sm font-medium border-b-2 border-brand-600 text-brand-700';
        document.getElementById('tab-content').innerHTML = renderTab(+b.dataset.tab, e, { co, dep, mgr, team, leaves, docs, payslips, balances, reviews, contracts, salaryHistory, letters });
      };
    });
    document.querySelector('[data-edit-emp]').onclick = () => openForm(e.id);
  }

  function renderTab(i, e, ctx) {
    const types = Store.get('leaveTypes');
    if (i === 0) {
      return `
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          ${kv('Email', e.email)}
          ${kv('Téléphone', e.phone)}
          ${kv('Date de naissance', e.birthDate ? U.fmtDateLong(e.birthDate) : '—')}
          ${kv('Lieu de naissance', e.birthPlace)}
          ${kv('Nationalité', e.nationality)}
          ${kv('Adresse', e.address)}
          ${kv('Société', ctx.co ? `${ctx.co.code} — ${ctx.co.name}` : '—')}
          ${kv('Département', ctx.dep ? ctx.dep.name : '—')}
          ${kv('Manager', ctx.mgr ? `${ctx.mgr.firstName} ${ctx.mgr.lastName}` : '—')}
          ${kv('N° sécurité sociale', e.socialSecurity || '—')}
          ${kv('RQTH', e.rqth ? 'Oui' : 'Non')}
        </div>
      `;
    }
    if (i === 1) {
      // Famille / Contact d'urgence
      return `
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          ${kv('Situation familiale', { celibataire: 'Célibataire', marie: 'Marié(e)', pacs: 'Pacsé(e)', divorce: 'Divorcé(e)', veuf: 'Veuf/Veuve' }[e.familySituation] || '—')}
          ${kv('Nombre d\'enfants', e.numChildren ?? 0)}
          ${kv('Contact d\'urgence', e.emergencyName)}
          ${kv('Téléphone urgence', e.emergencyPhone)}
        </div>
      `;
    }
    if (i === 2) {
      // Banque & Fiscal
      return `
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          ${kv('IBAN', e.iban || '—')}
          ${kv('BIC', e.bankBic || '—')}
          ${kv('Taux PAS (prélèvement à la source)', e.taxRate != null ? e.taxRate.toFixed(1) + ' %' : '—')}
          ${kv('Tickets restaurant', e.mealVouchers ? `Oui (${e.mealVoucherValue}€)` : 'Non')}
          ${kv('Prise en charge transport', (e.transportSubsidy || 0) + ' %')}
          ${kv('N° Sécurité sociale', e.socialSecurity || '—')}
        </div>
      `;
    }
    if (i === 3) {
      // Carrière
      return `
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          ${kv('Poste', e.jobTitle)}
          ${kv('Type de contrat', e.contractType)}
          ${kv('Date d\'embauche', U.fmtDateLong(e.contractStart))}
          ${kv('Fin de contrat', e.contractEnd ? U.fmtDateLong(e.contractEnd) : '—')}
          ${kv('Ancienneté', anciennete(e.contractStart))}
          ${kv('Convention collective', e.convention)}
          ${kv('Classification', e.classification)}
          ${kv('Coefficient', e.coefficient)}
          ${kv('Durée hebdomadaire', (e.weeklyHours || 35) + ' h')}
          ${kv('Salaire brut mensuel', U.fmtEur(e.salary||0))}
          ${kv('Coût total employeur (est.)', U.fmtEur((e.salary||0) * 1.42))}
        </div>
      `;
    }
    if (i === 4) {
      // Contrats
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Type</th><th>Poste</th><th>Période</th><th>Heures/sem</th><th>Salaire brut</th><th>Statut</th></tr></thead>
            <tbody>
              ${ctx.contracts.length === 0 ? '<tr><td colspan="6" class="text-center py-6 text-slate-500">Aucun contrat</td></tr>' :
                ctx.contracts.map(c => `
                  <tr>
                    <td><span class="badge badge-blue">${U.escapeHtml(c.type)}</span></td>
                    <td class="text-sm">${U.escapeHtml(c.position||'')}</td>
                    <td class="text-sm">${U.fmtDate(c.startDate)} → ${c.endDate ? U.fmtDate(c.endDate) : 'indéterminé'}</td>
                    <td>${c.weeklyHours||35}h</td>
                    <td>${U.fmtEur(c.grossSalary||0)}</td>
                    <td><span class="badge ${c.status==='actif'?'badge-green':'badge-gray'}">${c.status}</span></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    if (i === 5) {
      // Historique salaire
      const max = Math.max(...ctx.salaryHistory.map(s => s.grossSalary), 1);
      return `
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="card overflow-hidden">
            <table class="table">
              <thead><tr><th>Date effet</th><th>Salaire brut</th><th>Motif</th></tr></thead>
              <tbody>
                ${ctx.salaryHistory.length === 0 ? '<tr><td colspan="3" class="text-center py-6 text-slate-500">Aucun historique</td></tr>' :
                  ctx.salaryHistory.map(s => `
                    <tr>
                      <td class="text-sm">${U.fmtDate(s.effectiveDate)}</td>
                      <td class="font-semibold">${U.fmtEur(s.grossSalary)}</td>
                      <td class="text-sm text-slate-600">${U.escapeHtml(s.reason||'')}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
          <div class="card p-5">
            <h3 class="font-semibold mb-3">Évolution</h3>
            <div class="space-y-2">
              ${[...ctx.salaryHistory].reverse().map(s => `
                <div>
                  <div class="flex justify-between text-xs mb-1"><span>${U.fmtDate(s.effectiveDate)}</span><span class="font-semibold">${U.fmtEur(s.grossSalary)}</span></div>
                  <div class="progress"><div class="progress-bar" style="width:${(s.grossSalary/max*100).toFixed(0)}%"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
    if (i === 6) {
      return `
        <div class="space-y-4">
          <div class="grid md:grid-cols-3 gap-3">
            ${ctx.balances.map(b => {
              const t = types.find(x => x.id === b.typeId);
              const remain = (b.acquired||0) - (b.taken||0) - (b.pending||0);
              return `
                <div class="card p-4">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-slate-700">${U.escapeHtml(t?.name||'')}</span>
                    <span class="badge badge-blue">${U.escapeHtml(t?.code||'')}</span>
                  </div>
                  <div class="mt-3 text-3xl font-bold text-slate-900">${remain.toFixed(1)}</div>
                  <div class="text-xs text-slate-500">jours restants</div>
                  <div class="mt-2 text-xs text-slate-500">Acquis : ${b.acquired} • Pris : ${b.taken}</div>
                </div>
              `;
            }).join('') || '<div class="text-slate-500 text-sm">Aucun solde.</div>'}
          </div>
          <div class="card overflow-hidden">
            <table class="table">
              <thead><tr><th>Type</th><th>Période</th><th>Durée</th><th>Statut</th></tr></thead>
              <tbody>
                ${ctx.leaves.length === 0 ? '<tr><td colspan="4" class="text-center py-6 text-slate-500">Aucun congé</td></tr>' :
                  ctx.leaves.map(l => {
                    const t = types.find(x => x.id === l.typeId);
                    return `<tr>
                      <td>${U.escapeHtml(t?.name||'')}</td>
                      <td class="text-sm">${U.fmtDate(l.startDate)} → ${U.fmtDate(l.endDate)}</td>
                      <td>${l.days}j</td>
                      <td>${leaveStatus(l.status)}</td>
                    </tr>`;
                  }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    if (i === 7) {
      // Temps
      const sheets = Store.where('timesheets', t => t.employeeId === e.id).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 30);
      const totalH = sheets.reduce((s,t) => s + (t.hours||0), 0);
      return `
        <div class="mb-3 text-sm text-slate-600">30 derniers pointages — total : <span class="font-semibold">${totalH.toFixed(1)}h</span></div>
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Date</th><th>Début</th><th>Fin</th><th>Pause</th><th>Heures</th><th>Projet</th><th>Statut</th></tr></thead>
            <tbody>
              ${sheets.length === 0 ? '<tr><td colspan="7" class="text-center py-6 text-slate-500">Aucun pointage</td></tr>' :
                sheets.map(t => `
                  <tr>
                    <td class="text-sm">${U.fmtDate(t.date)}</td>
                    <td>${t.startTime||'—'}</td>
                    <td>${t.endTime||'—'}</td>
                    <td>${t.breakMinutes||0} min</td>
                    <td class="font-semibold">${t.hours}h</td>
                    <td class="text-sm">${U.escapeHtml(t.project||'')}</td>
                    <td>${t.status==='valide'?'<span class="badge badge-green">Validé</span>':'<span class="badge badge-amber">À valider</span>'}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    if (i === 8) {
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Document</th><th>Catégorie</th><th>Date</th><th>Taille</th><th></th></tr></thead>
            <tbody>
              ${ctx.docs.length === 0 ? '<tr><td colspan="5" class="text-center py-6 text-slate-500">Aucun document</td></tr>' :
                ctx.docs.map(d => `
                  <tr>
                    <td>📄 ${U.escapeHtml(d.name)}</td>
                    <td><span class="badge badge-gray">${U.escapeHtml(d.category)}</span></td>
                    <td class="text-sm">${U.fmtDate(d.uploadedAt)}</td>
                    <td class="text-sm">${(d.size/1024).toFixed(0)} Ko</td>
                    <td><button class="btn-icon">${U.icons.download}</button></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    if (i === 9) {
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Mois</th><th>Brut</th><th>Cotisations</th><th>Net</th><th>Coût employeur</th><th></th></tr></thead>
            <tbody>
              ${ctx.payslips.length === 0 ? '<tr><td colspan="6" class="text-center py-6 text-slate-500">Aucun bulletin</td></tr>' :
                ctx.payslips.map(p => `
                  <tr>
                    <td class="font-medium">${p.month}</td>
                    <td>${U.fmtEur(p.gross)}</td>
                    <td>${U.fmtEur(p.socialCharges)}</td>
                    <td class="font-semibold text-emerald-700">${U.fmtEur(p.net)}</td>
                    <td>${U.fmtEur(p.employerCost)}</td>
                    <td><button class="btn-icon">${U.icons.download}</button></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    if (i === 10) {
      // Courriers
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Date</th><th>Type</th><th>Objet</th><th>Statut</th></tr></thead>
            <tbody>
              ${ctx.letters.length === 0 ? '<tr><td colspan="4" class="text-center py-6 text-slate-500">Aucun courrier</td></tr>' :
                ctx.letters.map(l => `
                  <tr>
                    <td class="text-sm">${U.fmtDate(l.date)}</td>
                    <td><span class="badge badge-blue">${U.escapeHtml(l.type)}</span></td>
                    <td class="text-sm">${U.escapeHtml(l.subject)}</td>
                    <td><span class="badge ${l.status==='envoye'?'badge-green':'badge-amber'}">${l.status}</span></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        <div class="mt-3">
          <a href="#/courriers" class="text-sm text-brand-600 hover:underline">→ Générer un courrier dans le module Courriers RH</a>
        </div>
      `;
    }
    if (i === 11) {
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Type</th><th>Période</th><th>Date</th><th>Note</th><th>Statut</th></tr></thead>
            <tbody>
              ${ctx.reviews.length === 0 ? '<tr><td colspan="5" class="text-center py-6 text-slate-500">Aucun entretien</td></tr>' :
                ctx.reviews.map(r => `
                  <tr>
                    <td>${r.type}</td>
                    <td class="text-sm">${U.fmtDate(r.periodStart)} → ${U.fmtDate(r.periodEnd)}</td>
                    <td class="text-sm">${U.fmtDate(r.scheduledAt)}</td>
                    <td>${r.overallRating ? '⭐'.repeat(r.overallRating) : '—'}</td>
                    <td><span class="badge ${r.status==='realise'?'badge-green':'badge-amber'}">${r.status}</span></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    if (i === 12) {
      return `
        <div class="space-y-3">
          ${ctx.mgr ? `
            <div>
              <div class="text-xs uppercase text-slate-500 font-semibold mb-2">Manager</div>
              <a href="#/collaborateurs/${ctx.mgr.id}" class="card p-3 flex items-center gap-3 hover:bg-slate-50 inline-flex">
                ${U.avatar(`${ctx.mgr.firstName} ${ctx.mgr.lastName}`, 36)}
                <div>
                  <div class="font-medium">${U.escapeHtml(ctx.mgr.firstName)} ${U.escapeHtml(ctx.mgr.lastName)}</div>
                  <div class="text-xs text-slate-500">${U.escapeHtml(ctx.mgr.jobTitle)}</div>
                </div>
              </a>
            </div>` : ''}
          <div>
            <div class="text-xs uppercase text-slate-500 font-semibold mb-2 mt-3">Équipe directe (${ctx.team.length})</div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              ${ctx.team.length === 0 ? '<div class="text-slate-500 text-sm">Pas de collaborateur rattaché.</div>' :
                ctx.team.map(t => `
                  <a href="#/collaborateurs/${t.id}" class="card p-3 flex items-center gap-3 hover:bg-slate-50">
                    ${U.avatar(`${t.firstName} ${t.lastName}`, 36)}
                    <div>
                      <div class="font-medium text-sm">${U.escapeHtml(t.firstName)} ${U.escapeHtml(t.lastName)}</div>
                      <div class="text-xs text-slate-500">${U.escapeHtml(t.jobTitle)}</div>
                    </div>
                  </a>
                `).join('')}
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  function kv(k, v) {
    return `<div><div class="text-xs uppercase text-slate-500 font-semibold mb-1">${U.escapeHtml(k)}</div><div class="text-slate-900">${U.escapeHtml(v||'—')}</div></div>`;
  }
  function leaveStatus(s) {
    const m = { en_attente: 'badge-amber', approuve: 'badge-green', refuse: 'badge-red', annule: 'badge-gray' };
    const lbl = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé', annule: 'Annulé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${lbl[s]||s}</span>`;
  }
  function anciennete(date) {
    if (!date) return '—';
    const d = new Date(date), now = new Date();
    const years = now.getFullYear() - d.getFullYear();
    const months = now.getMonth() - d.getMonth();
    const total = years * 12 + months;
    return `${Math.floor(total / 12)} an(s) ${total % 12} mois`;
  }

  return { render };
})();
