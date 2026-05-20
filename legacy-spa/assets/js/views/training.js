/* Training catalog & enrollments */
window.TrainingView = (function () {
  let tab = 'catalog';

  function render(host) {
    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Formation</h1>
            <p class="text-slate-500 text-sm">Catalogue, inscriptions et suivi des formations.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary" data-new>${U.icons.plus} Nouvelle formation</button>
          </div>
        </div>

        <div class="card">
          <div class="flex border-b border-slate-200 px-2">
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='catalog'?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="catalog">Catalogue</button>
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='enroll' ?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="enroll">Inscriptions</button>
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='plan'   ?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="plan">Plan de développement</button>
          </div>
          <div id="tr-body" class="p-5">${renderTab()}</div>
        </div>
      </div>
    `;
    bind();
  }

  function renderTab() {
    if (tab === 'catalog') {
      const list = Store.get('trainings');
      return `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${list.map(t => {
            const enrollments = Store.where('trainingEnrollments', e => e.trainingId === t.id).length;
            return `
              <div class="card p-4 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <span class="badge badge-blue">${U.escapeHtml(t.category)}</span>
                  ${t.certifying ? '<span class="badge badge-green">Certifiante</span>' : ''}
                </div>
                <h3 class="mt-2 font-semibold text-lg">${U.escapeHtml(t.title)}</h3>
                <p class="text-xs text-slate-500 mt-1">${U.escapeHtml(t.provider)}</p>
                <p class="text-sm text-slate-600 mt-2 line-clamp-2">${U.escapeHtml(t.description||'')}</p>
                <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div><div class="text-slate-500">Durée</div><div class="font-semibold">${t.duration}h</div></div>
                  <div><div class="text-slate-500">Coût</div><div class="font-semibold">${U.fmtEur(t.cost)}</div></div>
                  <div><div class="text-slate-500">Inscrits</div><div class="font-semibold">${enrollments}/${t.capacity}</div></div>
                </div>
                <div class="text-xs text-slate-500 mt-2">📅 ${U.fmtDate(t.startDate)} → ${U.fmtDate(t.endDate)}</div>
                <div class="mt-3 flex gap-2">
                  <button class="btn btn-primary btn-sm flex-1" data-enroll="${t.id}">S'inscrire</button>
                  <button class="btn-icon" data-edit="${t.id}">${U.icons.edit}</button>
                  <button class="btn-icon text-red-600" data-del="${t.id}">${U.icons.trash}</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    if (tab === 'enroll') {
      const list = Store.get('trainingEnrollments');
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Collaborateur</th><th>Formation</th><th>Date demande</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="5" class="text-center py-10 text-slate-400">Aucune inscription</td></tr>' :
                list.map(e => {
                  const emp = Store.employee(e.employeeId);
                  const tr = Store.find('trainings', e.trainingId);
                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                          <a href="#/collaborateurs/${emp.id}" class="font-medium">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</a>
                        </div>
                      </td>
                      <td class="text-sm">${U.escapeHtml(tr?.title||'')}</td>
                      <td class="text-sm">${U.fmtDate(e.requestedAt)}</td>
                      <td>${statusBadge(e.status)}</td>
                      <td>
                        <div class="flex gap-1 justify-end">
                          ${e.status==='en_attente' ? `
                            <button class="btn-icon text-emerald-600" data-validate="${e.id}">${U.icons.check}</button>
                            <button class="btn-icon text-red-600" data-reject="${e.id}">${U.icons.x}</button>
                          ` : ''}
                          <button class="btn-icon text-red-600" data-del-en="${e.id}">${U.icons.trash}</button>
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
    if (tab === 'plan') {
      const employees = Store.get('employees');
      const enrollments = Store.get('trainingEnrollments');
      return `
        <div class="space-y-3">
          ${employees.map(e => {
            const list = enrollments.filter(en => en.employeeId === e.id);
            if (list.length === 0) return '';
            return `
              <div class="card p-4">
                <div class="flex items-center gap-3 mb-3">
                  ${U.avatar(`${e.firstName} ${e.lastName}`, 36)}
                  <div>
                    <div class="font-semibold">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</div>
                    <div class="text-xs text-slate-500">${U.escapeHtml(e.jobTitle)}</div>
                  </div>
                </div>
                <div class="space-y-2">
                  ${list.map(en => {
                    const tr = Store.find('trainings', en.trainingId);
                    return `
                      <div class="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                        <div>📚 ${U.escapeHtml(tr?.title||'')}</div>
                        <div class="flex items-center gap-3">
                          <span class="text-xs text-slate-500">${U.fmtDate(tr?.startDate||en.requestedAt)}</span>
                          ${statusBadge(en.status)}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).filter(Boolean).join('') || '<div class="text-slate-500 text-sm">Aucun plan de formation.</div>'}
        </div>
      `;
    }
  }

  function statusBadge(s) {
    const m = { en_attente: 'badge-amber', inscrit: 'badge-blue', valide: 'badge-green', annule: 'badge-gray', refuse: 'badge-red' };
    const l = { en_attente: 'En attente', inscrit: 'Inscrit', valide: 'Validé', annule: 'Annulé', refuse: 'Refusé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
  }

  function bind() {
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(document.getElementById('main-content')); });
    document.querySelector('[data-new]').onclick = () => openForm();
    document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openForm(b.dataset.edit));
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette formation ?', { danger: true });
      if (!ok) return; Store.remove('trainings', b.dataset.del); U.toast('Supprimée','success'); render(document.getElementById('main-content'));
    });
    document.querySelectorAll('[data-enroll]').forEach(b => b.onclick = () => enroll(b.dataset.enroll));
    document.querySelectorAll('[data-validate]').forEach(b => b.onclick = () => { Store.update('trainingEnrollments', b.dataset.validate, { status: 'valide', approvedBy: Store.currentUser().id }); U.toast('Inscription validée','success'); render(document.getElementById('main-content')); });
    document.querySelectorAll('[data-reject]').forEach(b => b.onclick = () => { Store.update('trainingEnrollments', b.dataset.reject, { status: 'refuse' }); U.toast('Refusée','warn'); render(document.getElementById('main-content')); });
    document.querySelectorAll('[data-del-en]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette inscription ?', { danger: true });
      if (!ok) return; Store.remove('trainingEnrollments', b.dataset.delEn); U.toast('Inscription supprimée','success'); render(document.getElementById('main-content'));
    });
  }

  function enroll(trainingId) {
    const employees = Store.get('employees');
    U.modal({
      title: 'Inscription à la formation',
      body: `
        <form id="en-form" class="space-y-3">
          <div><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              ${employees.map(e => `<option value="${e.id}">${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Inscrire</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const empId = root.querySelector('[name="employeeId"]').value;
          Store.insert('trainingEnrollments', { id: U.uid('te'), employeeId: empId, trainingId, status: 'en_attente', requestedAt: U.today() });
          U.toast('Inscription enregistrée','success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  function openForm(id) {
    const t = id ? { ...Store.find('trainings', id) } : {
      title:'', provider:'', category:'Bureautique', duration:7,
      startDate: U.today(), endDate: U.today(), capacity: 12, cost: 0,
      certifying: false, description: '',
    };
    U.modal({
      title: id ? 'Modifier la formation' : 'Nouvelle formation',
      body: `
        <form id="tr-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Titre</label><input class="input" name="title" value="${U.escapeHtml(t.title)}" required/></div>
          <div><label class="label">Organisme</label><input class="input" name="provider" value="${U.escapeHtml(t.provider||'')}"/></div>
          <div><label class="label">Catégorie</label><select class="select" name="category">
            ${['Bureautique','Management','Langues','Juridique','Informatique','Pédagogie','Sécurité','Autre'].map(c => `<option value="${c}" ${t.category===c?'selected':''}>${c}</option>`).join('')}
          </select></div>
          <div><label class="label">Durée (heures)</label><input type="number" class="input" name="duration" value="${t.duration}"/></div>
          <div><label class="label">Coût (€)</label><input type="number" step="0.01" class="input" name="cost" value="${t.cost}"/></div>
          <div><label class="label">Date début</label><input type="date" class="input" name="startDate" value="${t.startDate}"/></div>
          <div><label class="label">Date fin</label><input type="date" class="input" name="endDate" value="${t.endDate}"/></div>
          <div><label class="label">Capacité</label><input type="number" class="input" name="capacity" value="${t.capacity}"/></div>
          <div><label class="flex items-center gap-2 text-sm mt-6"><input type="checkbox" name="certifying" ${t.certifying?'checked':''}/> Certifiante</label></div>
          <div class="md:col-span-2"><label class="label">Description</label><textarea class="textarea" rows="3" name="description">${U.escapeHtml(t.description||'')}</textarea></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#tr-form');
          if (!f.reportValidity()) return;
          const fd = new FormData(f);
          const d = Object.fromEntries(fd.entries());
          d.cost = parseFloat(d.cost) || 0;
          d.duration = parseInt(d.duration, 10) || 0;
          d.capacity = parseInt(d.capacity, 10) || 0;
          d.certifying = fd.get('certifying') === 'on';
          if (id) Store.update('trainings', id, d);
          else Store.insert('trainings', { id: U.uid('tr'), ...d });
          U.toast('Formation enregistrée', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
