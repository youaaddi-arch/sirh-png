/* Performance reviews & goals */
window.ReviewsView = (function () {
  let tab = 'reviews';

  function render(host) {
    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Entretiens & objectifs</h1>
            <p class="text-slate-500 text-sm">Pilotage de la performance et du développement.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary" data-new>${U.icons.plus} Planifier un entretien</button>
            <button class="btn btn-secondary" data-new-goal>${U.icons.plus} Nouvel objectif</button>
          </div>
        </div>

        <div class="card">
          <div class="flex border-b border-slate-200 px-2">
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='reviews'?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="reviews">Entretiens</button>
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='goals'  ?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="goals">Objectifs</button>
          </div>
          <div id="rev-body" class="p-5">${tab === 'reviews' ? renderReviews() : renderGoals()}</div>
        </div>
      </div>
    `;
    bind();
  }

  function renderReviews() {
    const list = Store.get('reviews').slice().sort((a, b) => (a.scheduledAt||'').localeCompare(b.scheduledAt||''));
    return `
      <div class="overflow-hidden">
        <table class="table">
          <thead><tr><th>Collaborateur</th><th>Type</th><th>Période</th><th>Évaluateur</th><th>Date</th><th>Note</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            ${list.length === 0 ? '<tr><td colspan="8" class="text-center py-10 text-slate-400">Aucun entretien</td></tr>' :
              list.map(r => {
                const emp = Store.employee(r.employeeId);
                const rev = r.reviewerId ? Store.employee(r.reviewerId) : null;
                return `
                  <tr>
                    <td>
                      <div class="flex items-center gap-2">
                        ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                        <a href="#/collaborateurs/${emp.id}" class="font-medium hover:text-brand-700">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</a>
                      </div>
                    </td>
                    <td><span class="badge badge-blue">${typeLabel(r.type)}</span></td>
                    <td class="text-sm">${U.fmtDate(r.periodStart)} → ${U.fmtDate(r.periodEnd)}</td>
                    <td class="text-sm">${rev ? U.escapeHtml(rev.firstName+' '+rev.lastName) : '—'}</td>
                    <td class="text-sm">${U.fmtDate(r.scheduledAt)}</td>
                    <td>${r.overallRating ? '⭐'.repeat(r.overallRating) : '—'}</td>
                    <td>${statusBadge(r.status)}</td>
                    <td>
                      <div class="flex gap-1 justify-end">
                        <button class="btn-icon" data-edit-rev="${r.id}">${U.icons.edit}</button>
                        <button class="btn-icon text-red-600" data-del-rev="${r.id}">${U.icons.trash}</button>
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

  function renderGoals() {
    const list = Store.get('goals');
    return `
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${list.length === 0 ? '<p class="text-slate-500">Aucun objectif.</p>' :
          list.map(g => {
            const emp = Store.employee(g.employeeId);
            return `
              <div class="card p-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs uppercase text-slate-500 font-semibold">${U.escapeHtml(g.target||'')}</span>
                  <span class="badge ${g.status==='atteint'?'badge-green':'badge-amber'}">${g.status}</span>
                </div>
                <h3 class="mt-2 font-semibold text-slate-900">${U.escapeHtml(g.title)}</h3>
                <div class="mt-1 text-xs text-slate-500">${U.escapeHtml(emp?(emp.firstName+' '+emp.lastName):'')}</div>
                <div class="mt-3">
                  <div class="flex justify-between text-xs text-slate-500"><span>Progression</span><span>${g.progress}%</span></div>
                  <div class="progress mt-1"><div class="progress-bar" style="width:${g.progress}%"></div></div>
                </div>
                <div class="mt-3 flex justify-end gap-1">
                  <button class="btn-icon" data-edit-goal="${g.id}">${U.icons.edit}</button>
                  <button class="btn-icon text-red-600" data-del-goal="${g.id}">${U.icons.trash}</button>
                </div>
              </div>
            `;
          }).join('')}
      </div>
    `;
  }

  function statusBadge(s) {
    const m = { planifie: 'badge-amber', realise: 'badge-green', annule: 'badge-red' };
    const l = { planifie: 'Planifié', realise: 'Réalisé', annule: 'Annulé' };
    return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
  }
  function typeLabel(t) { return ({ annuel: 'Annuel', professionnel: 'Professionnel', periode_essai: 'Période d\'essai', '360': '360°' })[t] || t; }

  function bind() {
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(document.getElementById('main-content')); });
    document.querySelector('[data-new]').onclick = () => openReview();
    document.querySelector('[data-new-goal]').onclick = () => openGoal();

    document.querySelectorAll('[data-edit-rev]').forEach(b => b.onclick = () => openReview(b.dataset.editRev));
    document.querySelectorAll('[data-del-rev]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cet entretien ?', { danger: true });
      if (!ok) return; Store.remove('reviews', b.dataset.delRev); U.toast('Entretien supprimé','success'); render(document.getElementById('main-content'));
    });
    document.querySelectorAll('[data-edit-goal]').forEach(b => b.onclick = () => openGoal(b.dataset.editGoal));
    document.querySelectorAll('[data-del-goal]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cet objectif ?', { danger: true });
      if (!ok) return; Store.remove('goals', b.dataset.delGoal); U.toast('Objectif supprimé','success'); render(document.getElementById('main-content'));
    });
  }

  function openReview(id) {
    const employees = Store.get('employees');
    const r = id ? { ...Store.find('reviews', id) } : {
      employeeId: '', reviewerId: Store.currentUser().id, type: 'annuel',
      periodStart: `${new Date().getFullYear()}-01-01`, periodEnd: `${new Date().getFullYear()}-12-31`,
      status: 'planifie', scheduledAt: U.today(), overallRating: 0, comments: '',
    };
    U.modal({
      title: id ? 'Modifier l\'entretien' : 'Planifier un entretien',
      body: `
        <form id="rev-form" class="grid md:grid-cols-2 gap-4">
          <div><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              <option value="">—</option>
              ${employees.map(e => `<option value="${e.id}" ${r.employeeId===e.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Évaluateur</label>
            <select class="select" name="reviewerId">
              <option value="">—</option>
              ${employees.map(e => `<option value="${e.id}" ${r.reviewerId===e.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Type</label>
            <select class="select" name="type">
              <option value="annuel" ${r.type==='annuel'?'selected':''}>Annuel</option>
              <option value="professionnel" ${r.type==='professionnel'?'selected':''}>Professionnel</option>
              <option value="periode_essai" ${r.type==='periode_essai'?'selected':''}>Période d'essai</option>
              <option value="360" ${r.type==='360'?'selected':''}>360°</option>
            </select>
          </div>
          <div><label class="label">Statut</label>
            <select class="select" name="status">
              <option value="planifie" ${r.status==='planifie'?'selected':''}>Planifié</option>
              <option value="realise" ${r.status==='realise'?'selected':''}>Réalisé</option>
              <option value="annule" ${r.status==='annule'?'selected':''}>Annulé</option>
            </select>
          </div>
          <div><label class="label">Début période</label><input type="date" class="input" name="periodStart" value="${r.periodStart}"/></div>
          <div><label class="label">Fin période</label><input type="date" class="input" name="periodEnd" value="${r.periodEnd}"/></div>
          <div><label class="label">Date prévue</label><input type="date" class="input" name="scheduledAt" value="${r.scheduledAt}"/></div>
          <div><label class="label">Note globale (0-5)</label><input type="number" min="0" max="5" class="input" name="overallRating" value="${r.overallRating||0}"/></div>
          <div class="md:col-span-2"><label class="label">Commentaires</label><textarea class="textarea" rows="3" name="comments">${U.escapeHtml(r.comments||'')}</textarea></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#rev-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          d.overallRating = parseInt(d.overallRating, 10) || 0;
          if (id) Store.update('reviews', id, d);
          else Store.insert('reviews', { id: U.uid('rv'), ...d });
          U.toast('Entretien enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  function openGoal(id) {
    const employees = Store.get('employees');
    const g = id ? { ...Store.find('goals', id) } : { employeeId: '', title: '', target: '', progress: 0, status: 'en_cours' };
    U.modal({
      title: id ? 'Modifier l\'objectif' : 'Nouvel objectif',
      body: `
        <form id="gl-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              <option value="">—</option>
              ${employees.map(e => `<option value="${e.id}" ${g.employeeId===e.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div class="md:col-span-2"><label class="label">Titre</label><input class="input" name="title" value="${U.escapeHtml(g.title)}" required/></div>
          <div><label class="label">Échéance</label><input class="input" name="target" value="${U.escapeHtml(g.target||'')}"/></div>
          <div><label class="label">Statut</label>
            <select class="select" name="status">
              <option value="en_cours" ${g.status==='en_cours'?'selected':''}>En cours</option>
              <option value="atteint" ${g.status==='atteint'?'selected':''}>Atteint</option>
              <option value="abandonne" ${g.status==='abandonne'?'selected':''}>Abandonné</option>
            </select>
          </div>
          <div class="md:col-span-2"><label class="label">Progression (%)</label><input type="range" min="0" max="100" name="progress" value="${g.progress}" oninput="this.nextElementSibling.textContent=this.value+'%'"/><span class="text-sm">${g.progress}%</span></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#gl-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          d.progress = parseInt(d.progress, 10) || 0;
          if (id) Store.update('goals', id, d);
          else Store.insert('goals', { id: U.uid('gl'), ...d });
          U.toast('Objectif enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
