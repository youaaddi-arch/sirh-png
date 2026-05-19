/* Leaves view */
window.LeaveView = (function () {
  let viewMode = 'list'; // list | calendar
  let filters = { status: '', type: '', mine: false };

  function render(host, { params } = { params: {} }) {
    if (params && params.mine) filters.mine = true;
    if (params && params.new) {
      setTimeout(() => openForm(), 50);
    }
    renderShell(host);
  }

  function renderShell(host) {
    const me = Store.currentUser();
    const visible = Store.visibleEmployeeIds();
    const leaves = Store.get('leaves').filter(l => visible.has(l.employeeId));
    const types = Store.get('leaveTypes');

    let list = leaves;
    if (filters.mine) list = list.filter(l => l.employeeId === me.id);
    if (filters.status) list = list.filter(l => l.status === filters.status);
    if (filters.type)   list = list.filter(l => l.typeId === filters.type);
    list = list.sort((a, b) => b.createdAt?.localeCompare?.(a.createdAt||'') || 0);

    const balances = Store.where('leaveBalances', b => b.employeeId === me.id);

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Congés & absences</h1>
            <p class="text-slate-500 text-sm">Gestion des demandes, soldes et planning d'absences.</p>
          </div>
          <div class="flex gap-2">
            <div class="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-white">
              <button data-vm="list" class="px-3 py-2 text-sm ${viewMode==='list'?'bg-brand-600 text-white':'text-slate-600'}">Liste</button>
              <button data-vm="calendar" class="px-3 py-2 text-sm ${viewMode==='calendar'?'bg-brand-600 text-white':'text-slate-600'}">Calendrier</button>
            </div>
            <button class="btn btn-primary" data-new>${U.icons.plus} Nouvelle demande</button>
          </div>
        </div>

        <!-- Balances -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${balances.map(b => {
            const t = types.find(x => x.id === b.typeId);
            const remain = (b.acquired||0) - (b.taken||0) - (b.pending||0);
            return `
              <div class="card p-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-slate-700">${U.escapeHtml(t?.name||'')}</span>
                  <span class="w-3 h-3 rounded-full" style="background:${t?.color||'#999'}"></span>
                </div>
                <div class="mt-2 text-2xl font-bold">${remain.toFixed(1)}<span class="text-sm font-normal text-slate-500"> / ${b.acquired}j</span></div>
                <div class="progress mt-2"><div class="progress-bar" style="width: ${Math.min(100,(b.taken/(b.acquired||1)*100)).toFixed(0)}%; background:${t?.color||'#2447df'}"></div></div>
                <div class="text-xs text-slate-500 mt-1">Pris : ${b.taken}j • En attente : ${b.pending||0}j</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Filters -->
        <div class="card p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label class="label">Statut</label>
            <select id="lv-status" class="select min-w-[160px]">
              <option value="">Tous</option>
              <option value="en_attente" ${filters.status==='en_attente'?'selected':''}>En attente</option>
              <option value="approuve" ${filters.status==='approuve'?'selected':''}>Approuvé</option>
              <option value="refuse" ${filters.status==='refuse'?'selected':''}>Refusé</option>
              <option value="annule" ${filters.status==='annule'?'selected':''}>Annulé</option>
            </select>
          </div>
          <div>
            <label class="label">Type</label>
            <select id="lv-type" class="select min-w-[160px]">
              <option value="">Tous</option>
              ${types.map(t => `<option value="${t.id}" ${filters.type===t.id?'selected':''}>${U.escapeHtml(t.name)}</option>`).join('')}
            </select>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700 ml-auto">
            <input type="checkbox" id="lv-mine" ${filters.mine?'checked':''}/> Mes demandes uniquement
          </label>
        </div>

        <div id="leave-body">${viewMode === 'calendar' ? renderCalendar() : renderList(list)}</div>
      </div>
    `;
    bind();
  }

  function renderList(list) {
    return `
      <div class="card overflow-hidden">
        <table class="table">
          <thead>
            <tr>
              <th>Collaborateur</th>
              <th>Type</th>
              <th>Période</th>
              <th>Durée</th>
              <th>Motif</th>
              <th>Statut</th>
              <th>Soumis le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? '<tr><td colspan="8" class="text-center py-10 text-slate-400">Aucune demande</td></tr>' :
              list.map(l => {
                const emp = Store.employee(l.employeeId);
                const t = Store.find('leaveTypes', l.typeId);
                return `
                  <tr>
                    <td>
                      <div class="flex items-center gap-2">
                        ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                        <a href="#/collaborateurs/${emp.id}" class="font-medium hover:text-brand-700">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</a>
                      </div>
                    </td>
                    <td><span class="badge" style="background:${t.color}20;color:${t.color}">${U.escapeHtml(t.code)}</span> ${U.escapeHtml(t.name)}</td>
                    <td class="text-sm">${U.fmtDate(l.startDate)} → ${U.fmtDate(l.endDate)}</td>
                    <td class="font-medium">${l.days}j</td>
                    <td class="text-sm text-slate-600">${U.escapeHtml(l.reason||'—')}</td>
                    <td>${statusBadge(l.status)}</td>
                    <td class="text-sm text-slate-500">${U.fmtDate(l.createdAt)}</td>
                    <td>
                      <div class="flex gap-1 justify-end">
                        ${l.status === 'en_attente' ? `
                          <button class="btn-icon text-emerald-600" data-approve="${l.id}" title="Approuver">${U.icons.check}</button>
                          <button class="btn-icon text-red-600" data-reject="${l.id}" title="Refuser">${U.icons.x}</button>
                        ` : ''}
                        <button class="btn-icon text-red-600" data-del="${l.id}" title="Supprimer">${U.icons.trash}</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const firstWeekday = (first.getDay() + 6) % 7; // Monday first
    const days = last.getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7) cells.push(null);

    const leaves = Store.get('leaves').filter(l => l.status === 'approuve');

    const cellHtml = cells.map((d, i) => {
      if (!d) return '<div class="cal-cell dim"></div>';
      const iso = d.toISOString().slice(0, 10);
      const isToday = iso === U.today();
      const todays = leaves.filter(l => iso >= l.startDate && iso <= l.endDate);
      return `
        <div class="cal-cell ${isToday?'today':''}">
          <div class="flex justify-between items-center"><span class="day-num">${d.getDate()}</span></div>
          <div class="mt-1 space-y-0.5">
            ${todays.slice(0, 3).map(l => {
              const emp = Store.employee(l.employeeId);
              const t = Store.find('leaveTypes', l.typeId);
              return `<div class="truncate text-[10px] px-1 py-0.5 rounded" style="background:${t.color}20;color:${t.color};" title="${U.escapeHtml(emp.firstName+' '+emp.lastName+' — '+t.name)}">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName[0])}.</div>`;
            }).join('')}
            ${todays.length > 3 ? `<div class="text-[10px] text-slate-500">+${todays.length - 3} autres</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return `
      <div class="card p-4">
        <div class="text-lg font-semibold mb-3 capitalize">${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
        <div class="cal-grid">
          ${weekdays.map(w => `<div class="cal-cell text-center font-bold text-slate-500 text-[11px]" style="min-height:auto;padding:6px">${w}</div>`).join('')}
          ${cellHtml}
        </div>
      </div>
    `;
  }

  function bind() {
    document.querySelectorAll('[data-vm]').forEach(b => b.onclick = () => { viewMode = b.dataset.vm; renderShell(document.getElementById('main-content')); });
    document.querySelector('[data-new]').onclick = () => openForm();
    document.getElementById('lv-status').onchange = (e) => { filters.status = e.target.value; renderShell(document.getElementById('main-content')); };
    document.getElementById('lv-type').onchange   = (e) => { filters.type   = e.target.value; renderShell(document.getElementById('main-content')); };
    document.getElementById('lv-mine').onchange   = (e) => { filters.mine   = e.target.checked; renderShell(document.getElementById('main-content')); };
    document.querySelectorAll('[data-approve]').forEach(b => b.onclick = () => {
      const l = Store.find('leaves', b.dataset.approve);
      Store.update('leaves', b.dataset.approve, { status: 'approuve', approvedBy: Store.currentUser().id });
      Store.insert('notifications', {
        id: U.uid('nt'), userId: l.employeeId, type: 'leave',
        title: 'Congé approuvé',
        body: `Votre demande du ${U.fmtDate(l.startDate)} au ${U.fmtDate(l.endDate)} a été approuvée.`,
        date: new Date().toISOString(), read: false, link: '#/conges?mine=1',
      });
      U.toast('Demande approuvée', 'success');
      renderShell(document.getElementById('main-content'));
    });
    document.querySelectorAll('[data-reject]').forEach(b => b.onclick = async () => {
      const reason = prompt('Motif du refus (optionnel) :') || '';
      const l = Store.find('leaves', b.dataset.reject);
      Store.update('leaves', b.dataset.reject, { status: 'refuse', approvedBy: Store.currentUser().id, rejectReason: reason });
      Store.insert('notifications', {
        id: U.uid('nt'), userId: l.employeeId, type: 'leave',
        title: 'Congé refusé',
        body: `Votre demande du ${U.fmtDate(l.startDate)} au ${U.fmtDate(l.endDate)} a été refusée. ${reason}`,
        date: new Date().toISOString(), read: false, link: '#/conges?mine=1',
      });
      U.toast('Demande refusée', 'warn');
      renderShell(document.getElementById('main-content'));
    });
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette demande ?', { danger: true });
      if (!ok) return;
      Store.remove('leaves', b.dataset.del);
      U.toast('Demande supprimée', 'success');
      renderShell(document.getElementById('main-content'));
    });
  }

  function openForm() {
    const me = Store.currentUser();
    const visible = Store.visibleEmployeeIds();
    // Manager/RH/admin peuvent saisir pour autrui; employé seulement pour lui
    const canSelectOther = ['admin', 'rh', 'manager'].includes(me.role);
    const employees = canSelectOther ? Store.get('employees').filter(e => visible.has(e.id)) : [me];
    const types = Store.get('leaveTypes');
    U.modal({
      title: 'Nouvelle demande de congé',
      body: `
        <form id="lv-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required ${canSelectOther?'':'disabled'}>
              ${employees.map(e => `<option value="${e.id}" ${e.id===me.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Type</label>
            <select class="select" name="typeId" required>
              ${types.map(t => `<option value="${t.id}">${U.escapeHtml(t.name)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Statut initial</label>
            <select class="select" name="status">
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
            </select>
          </div>
          <div><label class="label">Date de début</label><input type="date" class="input" name="startDate" value="${U.today()}" required/></div>
          <div><label class="label">Date de fin</label><input type="date" class="input" name="endDate" value="${U.today()}" required/></div>
          <div class="md:col-span-2"><label class="label">Motif</label>
            <textarea class="textarea" name="reason" rows="2" placeholder="Ex. vacances été"></textarea>
          </div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Créer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#lv-form');
          if (!f.reportValidity()) return;
          const fd = new FormData(f);
          const d = Object.fromEntries(fd.entries());
          if (!d.employeeId) d.employeeId = me.id;
          d.days = U.businessDaysBetween(d.startDate, d.endDate);
          d.createdAt = new Date().toISOString();
          Store.insert('leaves', d);
          // Notify the manager
          const emp = Store.employee(d.employeeId);
          if (emp && emp.managerId && d.status === 'en_attente') {
            Store.insert('notifications', {
              id: U.uid('nt'), userId: emp.managerId, type: 'leave',
              title: 'Nouvelle demande de congé',
              body: `${emp.firstName} ${emp.lastName} demande ${d.days} jour(s)`,
              date: new Date().toISOString(), read: false, link: '#/conges',
            });
          }
          U.toast('Demande envoyée à votre responsable', 'success');
          close();
          renderShell(document.getElementById('main-content'));
        };
      }
    });
  }

  function statusBadge(s) {
    const m = { en_attente: 'badge-amber', approuve: 'badge-green', refuse: 'badge-red', annule: 'badge-gray' };
    const lbl = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé', annule: 'Annulé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${lbl[s]||s}</span>`;
  }

  return { render };
})();
