/* Expense reports */
window.ExpensesView = (function () {
  let filters = { status: '', category: '' };

  const CATEGORIES = ['Repas', 'Transport', 'Hébergement', 'Fournitures', 'Logiciels', 'Téléphonie', 'Formation', 'Autre'];

  function render(host) {
    const expenses = Store.get('expenses').slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const filtered = expenses.filter(e =>
      (!filters.status   || e.status === filters.status) &&
      (!filters.category || e.category === filters.category)
    );

    const totals = {
      all:        expenses.reduce((s, e) => s + e.amount, 0),
      pending:    expenses.filter(e => e.status === 'en_attente').reduce((s, e) => s + e.amount, 0),
      approved:   expenses.filter(e => e.status === 'approuve').reduce((s, e) => s + e.amount, 0),
      reimbursed: expenses.filter(e => e.status === 'rembourse').reduce((s, e) => s + e.amount, 0),
    };

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Notes de frais</h1>
            <p class="text-slate-500 text-sm">Soumission, validation et remboursement des frais professionnels.</p>
          </div>
          <button class="btn btn-primary" data-new>${U.icons.plus} Nouvelle note</button>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${stat('Total', U.fmtEur(totals.all), 'bg-brand-50 text-brand-700')}
          ${stat('En attente', U.fmtEur(totals.pending), 'bg-amber-50 text-amber-700')}
          ${stat('Approuvé', U.fmtEur(totals.approved), 'bg-emerald-50 text-emerald-700')}
          ${stat('Remboursé', U.fmtEur(totals.reimbursed), 'bg-purple-50 text-purple-700')}
        </div>

        <div class="card p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label class="label">Statut</label>
            <select id="ex-status" class="select min-w-[160px]">
              <option value="">Tous</option>
              <option value="en_attente" ${filters.status==='en_attente'?'selected':''}>En attente</option>
              <option value="approuve" ${filters.status==='approuve'?'selected':''}>Approuvé</option>
              <option value="rembourse" ${filters.status==='rembourse'?'selected':''}>Remboursé</option>
              <option value="refuse" ${filters.status==='refuse'?'selected':''}>Refusé</option>
            </select>
          </div>
          <div>
            <label class="label">Catégorie</label>
            <select id="ex-cat" class="select min-w-[160px]">
              <option value="">Toutes</option>
              ${CATEGORIES.map(c => `<option value="${c}" ${filters.category===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="card overflow-hidden">
          <table class="table">
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Projet</th>
                <th class="text-right">Montant</th>
                <th>Reçu</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? '<tr><td colspan="8" class="text-center py-10 text-slate-400">Aucune note de frais</td></tr>' :
                filtered.map(e => {
                  const emp = Store.employee(e.employeeId);
                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                          <a href="#/collaborateurs/${emp.id}" class="font-medium hover:text-brand-700">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</a>
                        </div>
                      </td>
                      <td class="text-sm">${U.fmtDate(e.date)}</td>
                      <td><span class="badge badge-gray">${U.escapeHtml(e.category)}</span></td>
                      <td class="text-sm">${U.escapeHtml(e.project||'—')}</td>
                      <td class="text-right font-semibold">${U.fmtEur(e.amount)}</td>
                      <td>${e.receipt ? '📎' : '—'}</td>
                      <td>${statusBadge(e.status)}</td>
                      <td>
                        <div class="flex gap-1 justify-end">
                          ${e.status==='en_attente' ? `
                            <button class="btn-icon text-emerald-600" data-approve="${e.id}" title="Approuver">${U.icons.check}</button>
                            <button class="btn-icon text-red-600"     data-reject="${e.id}"  title="Refuser">${U.icons.x}</button>
                          ` : ''}
                          ${e.status==='approuve' ? `<button class="btn btn-sm btn-success" data-pay="${e.id}">Rembourser</button>` : ''}
                          <button class="btn-icon" data-edit="${e.id}">${U.icons.edit}</button>
                          <button class="btn-icon text-red-600" data-del="${e.id}">${U.icons.trash}</button>
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
    bind();
  }

  function stat(label, value, classes) {
    return `<div class="card p-4 ${classes}"><div class="text-xs uppercase font-semibold">${label}</div><div class="mt-1 text-2xl font-bold">${value}</div></div>`;
  }
  function statusBadge(s) {
    const m = { en_attente: 'badge-amber', approuve: 'badge-green', refuse: 'badge-red', rembourse: 'badge-purple' };
    const l = { en_attente: 'En attente', approuve: 'Approuvé', refuse: 'Refusé', rembourse: 'Remboursé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
  }

  function bind() {
    document.getElementById('ex-status').onchange = (e) => { filters.status = e.target.value; render(document.getElementById('main-content')); };
    document.getElementById('ex-cat').onchange    = (e) => { filters.category = e.target.value; render(document.getElementById('main-content')); };
    document.querySelector('[data-new]').onclick = () => openForm();

    document.querySelectorAll('[data-approve]').forEach(b => b.onclick = () => { Store.update('expenses', b.dataset.approve, { status: 'approuve', approvedBy: Store.currentUser().id }); U.toast('Note approuvée', 'success'); render(document.getElementById('main-content')); });
    document.querySelectorAll('[data-reject]').forEach(b => b.onclick = () => { Store.update('expenses', b.dataset.reject, { status: 'refuse' }); U.toast('Note refusée', 'warn'); render(document.getElementById('main-content')); });
    document.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => { Store.update('expenses', b.dataset.pay, { status: 'rembourse' }); U.toast('Note remboursée', 'success'); render(document.getElementById('main-content')); });
    document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openForm(b.dataset.edit));
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette note ?', { danger: true });
      if (!ok) return;
      Store.remove('expenses', b.dataset.del);
      U.toast('Note supprimée', 'success');
      render(document.getElementById('main-content'));
    });
  }

  function openForm(id) {
    const me = Store.currentUser();
    const employees = Store.get('employees');
    const e = id ? { ...Store.find('expenses', id) } : {
      employeeId: me.id, date: U.today(),
      category: 'Repas', amount: 0, currency: 'EUR',
      project: '', notes: '', receipt: false, status: 'en_attente',
    };
    U.modal({
      title: id ? 'Modifier la note' : 'Nouvelle note de frais',
      body: `
        <form id="ex-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              ${employees.map(em => `<option value="${em.id}" ${e.employeeId===em.id?'selected':''}>${U.escapeHtml(em.firstName+' '+em.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Date</label><input type="date" class="input" name="date" value="${e.date}" required/></div>
          <div><label class="label">Catégorie</label><select class="select" name="category">
            ${CATEGORIES.map(c => `<option value="${c}" ${e.category===c?'selected':''}>${c}</option>`).join('')}
          </select></div>
          <div><label class="label">Montant (€)</label><input type="number" step="0.01" class="input" name="amount" value="${e.amount}" required/></div>
          <div><label class="label">Statut</label><select class="select" name="status">
            <option value="en_attente" ${e.status==='en_attente'?'selected':''}>En attente</option>
            <option value="approuve" ${e.status==='approuve'?'selected':''}>Approuvé</option>
            <option value="rembourse" ${e.status==='rembourse'?'selected':''}>Remboursé</option>
            <option value="refuse" ${e.status==='refuse'?'selected':''}>Refusé</option>
          </select></div>
          <div class="md:col-span-2"><label class="label">Projet / Mission</label><input class="input" name="project" value="${U.escapeHtml(e.project||'')}"/></div>
          <div class="md:col-span-2"><label class="label">Notes</label><textarea class="textarea" name="notes" rows="2">${U.escapeHtml(e.notes||'')}</textarea></div>
          <div class="md:col-span-2"><label class="flex items-center gap-2 text-sm"><input type="checkbox" name="receipt" ${e.receipt?'checked':''}/> Justificatif joint</label></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#ex-form');
          if (!f.reportValidity()) return;
          const fd = new FormData(f);
          const d = Object.fromEntries(fd.entries());
          d.amount = parseFloat(d.amount) || 0;
          d.receipt = fd.get('receipt') === 'on';
          if (id) Store.update('expenses', id, d);
          else Store.insert('expenses', { id: U.uid('ex'), ...d });
          U.toast('Note enregistrée', 'success');
          close();
          render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
