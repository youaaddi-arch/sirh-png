/* Recruitment: jobs + candidates pipeline */
window.RecruitmentView = (function () {
  let tab = 'jobs';

  function render(host) {
    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Recrutement</h1>
            <p class="text-slate-500 text-sm">Offres d'emploi et pipeline candidats.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" data-new-cand>${U.icons.plus} Candidat</button>
            <button class="btn btn-primary" data-new-job>${U.icons.plus} Nouvelle offre</button>
          </div>
        </div>

        <div class="card">
          <div class="flex border-b border-slate-200 px-2">
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='jobs'      ?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="jobs">Offres</button>
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='pipeline'  ?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="pipeline">Pipeline candidats</button>
            <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab==='candidates'?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="candidates">Tous les candidats</button>
          </div>
          <div class="p-5">${renderTab()}</div>
        </div>
      </div>
    `;
    bind();
  }

  function renderTab() {
    if (tab === 'jobs') {
      const jobs = Store.get('jobs');
      return `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${jobs.map(j => {
            const co = Store.company(j.companyId);
            const cands = Store.where('candidates', c => c.jobId === j.id);
            return `
              <div class="card p-4 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <span class="badge ${j.status==='ouvert'?'badge-green':'badge-gray'}">${j.status}</span>
                  <span class="text-xs text-slate-500">${U.fmtDate(j.postedAt)}</span>
                </div>
                <h3 class="font-semibold text-lg mt-2">${U.escapeHtml(j.title)}</h3>
                <div class="text-xs text-slate-500 mt-1">${U.escapeHtml(co?.code||'')} • ${U.escapeHtml(j.location||'')}</div>
                <div class="mt-2 flex gap-2 text-xs">
                  <span class="badge badge-gray">${U.escapeHtml(j.contract)}</span>
                  <span class="badge badge-blue">${U.escapeHtml(j.salary||'')}</span>
                </div>
                <p class="text-sm text-slate-600 mt-2 line-clamp-2">${U.escapeHtml(j.description||'')}</p>
                <div class="mt-3 flex justify-between items-center">
                  <span class="text-sm font-medium">${cands.length} candidat(s)</span>
                  <div class="flex gap-1">
                    <button class="btn-icon" data-edit-job="${j.id}">${U.icons.edit}</button>
                    <button class="btn-icon text-red-600" data-del-job="${j.id}">${U.icons.trash}</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    if (tab === 'pipeline') {
      const stages = [
        { key: 'nouveau',     label: 'Nouveau',      color: 'bg-slate-100' },
        { key: 'preselection', label: 'Présélection', color: 'bg-blue-100' },
        { key: 'entretien',   label: 'Entretien',    color: 'bg-amber-100' },
        { key: 'offre',       label: 'Offre',        color: 'bg-purple-100' },
        { key: 'embauche',    label: 'Embauché',     color: 'bg-emerald-100' },
        { key: 'refuse',      label: 'Refusé',       color: 'bg-red-100' },
      ];
      const cands = Store.get('candidates');
      return `
        <div class="flex gap-3 overflow-x-auto pb-2">
          ${stages.map(s => {
            const list = cands.filter(c => c.stage === s.key);
            return `
              <div class="kanban-col ${s.color}">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-sm">${s.label}</h3>
                  <span class="badge badge-gray">${list.length}</span>
                </div>
                ${list.map(c => {
                  const job = Store.find('jobs', c.jobId);
                  return `
                    <div class="kanban-card">
                      <div class="flex items-center gap-2 mb-2">
                        ${U.avatar(`${c.firstName} ${c.lastName}`, 32)}
                        <div>
                          <div class="font-medium text-sm">${U.escapeHtml(c.firstName)} ${U.escapeHtml(c.lastName)}</div>
                          <div class="text-xs text-slate-500">${U.escapeHtml(job?.title||'')}</div>
                        </div>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-500">${U.escapeHtml(c.source||'')}</span>
                        <span class="text-amber-500">${'⭐'.repeat(c.rating||0)}</span>
                      </div>
                      <div class="mt-2 flex gap-1">
                        <select class="select py-1 text-xs flex-1" data-move="${c.id}">
                          ${stages.map(st => `<option value="${st.key}" ${st.key===c.stage?'selected':''}>${st.label}</option>`).join('')}
                        </select>
                        <button class="btn-icon" data-edit-cand="${c.id}">${U.icons.edit}</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    if (tab === 'candidates') {
      const list = Store.get('candidates').slice().sort((a, b) => (b.addedAt||'').localeCompare(a.addedAt||''));
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Candidat</th><th>Poste</th><th>Source</th><th>Étape</th><th>Note</th><th>Ajouté le</th><th></th></tr></thead>
            <tbody>
              ${list.map(c => {
                const job = Store.find('jobs', c.jobId);
                return `
                  <tr>
                    <td>
                      <div class="flex items-center gap-2">
                        ${U.avatar(`${c.firstName} ${c.lastName}`, 32)}
                        <div>
                          <div class="font-medium">${U.escapeHtml(c.firstName)} ${U.escapeHtml(c.lastName)}</div>
                          <div class="text-xs text-slate-500">${U.escapeHtml(c.email)} • ${U.escapeHtml(c.phone||'')}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-sm">${U.escapeHtml(job?.title||'')}</td>
                    <td class="text-sm">${U.escapeHtml(c.source||'')}</td>
                    <td><span class="badge badge-blue">${U.escapeHtml(c.stage)}</span></td>
                    <td>${'⭐'.repeat(c.rating||0)}</td>
                    <td class="text-sm text-slate-500">${U.fmtDate(c.addedAt)}</td>
                    <td><div class="flex gap-1 justify-end">
                      <button class="btn-icon" data-edit-cand="${c.id}">${U.icons.edit}</button>
                      <button class="btn-icon text-red-600" data-del-cand="${c.id}">${U.icons.trash}</button>
                    </div></td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="7" class="text-center py-10 text-slate-400">Aucun candidat</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  function bind() {
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(document.getElementById('main-content')); });
    document.querySelector('[data-new-job]')?.addEventListener('click', () => openJob());
    document.querySelector('[data-new-cand]')?.addEventListener('click', () => openCand());

    document.querySelectorAll('[data-edit-job]').forEach(b => b.onclick = () => openJob(b.dataset.editJob));
    document.querySelectorAll('[data-del-job]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette offre ?', { danger: true });
      if (!ok) return; Store.remove('jobs', b.dataset.delJob); U.toast('Offre supprimée','success'); render(document.getElementById('main-content'));
    });

    document.querySelectorAll('[data-edit-cand]').forEach(b => b.onclick = () => openCand(b.dataset.editCand));
    document.querySelectorAll('[data-del-cand]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce candidat ?', { danger: true });
      if (!ok) return; Store.remove('candidates', b.dataset.delCand); U.toast('Candidat supprimé','success'); render(document.getElementById('main-content'));
    });
    document.querySelectorAll('[data-move]').forEach(s => s.onchange = (e) => {
      Store.update('candidates', s.dataset.move, { stage: e.target.value });
      U.toast('Étape mise à jour','success'); render(document.getElementById('main-content'));
    });
  }

  function openJob(id) {
    const j = id ? { ...Store.find('jobs', id) } : {
      title: '', departmentId: '', companyId: 'co_001', location: '',
      contract: 'CDI', salary: '', status: 'ouvert',
      postedAt: U.today(), description: '',
    };
    const departments = Store.get('departments');
    const companies = Store.get('companies');
    U.modal({
      title: id ? 'Modifier l\'offre' : 'Nouvelle offre',
      body: `
        <form id="jb-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Titre</label><input class="input" name="title" value="${U.escapeHtml(j.title)}" required/></div>
          <div><label class="label">Société</label><select class="select" name="companyId">
            ${companies.map(c => `<option value="${c.id}" ${j.companyId===c.id?'selected':''}>${U.escapeHtml(c.code+' — '+c.name)}</option>`).join('')}
          </select></div>
          <div><label class="label">Département</label><select class="select" name="departmentId">
            <option value="">—</option>
            ${departments.map(d => `<option value="${d.id}" ${j.departmentId===d.id?'selected':''}>${U.escapeHtml(d.name)}</option>`).join('')}
          </select></div>
          <div><label class="label">Lieu</label><input class="input" name="location" value="${U.escapeHtml(j.location||'')}"/></div>
          <div><label class="label">Contrat</label><select class="select" name="contract">
            <option value="CDI" ${j.contract==='CDI'?'selected':''}>CDI</option>
            <option value="CDD" ${j.contract==='CDD'?'selected':''}>CDD</option>
            <option value="Alternance" ${j.contract==='Alternance'?'selected':''}>Alternance</option>
            <option value="Stage" ${j.contract==='Stage'?'selected':''}>Stage</option>
          </select></div>
          <div><label class="label">Salaire</label><input class="input" name="salary" value="${U.escapeHtml(j.salary||'')}" placeholder="30-40k€"/></div>
          <div><label class="label">Statut</label><select class="select" name="status">
            <option value="ouvert" ${j.status==='ouvert'?'selected':''}>Ouvert</option>
            <option value="pourvu" ${j.status==='pourvu'?'selected':''}>Pourvu</option>
            <option value="ferme" ${j.status==='ferme'?'selected':''}>Fermé</option>
          </select></div>
          <div class="md:col-span-2"><label class="label">Description</label><textarea class="textarea" rows="4" name="description">${U.escapeHtml(j.description||'')}</textarea></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#jb-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          if (id) Store.update('jobs', id, d);
          else Store.insert('jobs', { id: U.uid('jb'), postedAt: U.today(), ...d });
          U.toast('Offre enregistrée', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  function openCand(id) {
    const c = id ? { ...Store.find('candidates', id) } : {
      firstName:'', lastName:'', email:'', phone:'', jobId:'',
      stage: 'nouveau', source: '', rating: 0, addedAt: U.today(),
    };
    const jobs = Store.get('jobs');
    U.modal({
      title: id ? 'Modifier le candidat' : 'Nouveau candidat',
      body: `
        <form id="cd-form" class="grid md:grid-cols-2 gap-4">
          <div><label class="label">Prénom</label><input class="input" name="firstName" value="${U.escapeHtml(c.firstName)}" required/></div>
          <div><label class="label">Nom</label><input class="input" name="lastName" value="${U.escapeHtml(c.lastName)}" required/></div>
          <div><label class="label">Email</label><input type="email" class="input" name="email" value="${U.escapeHtml(c.email)}" required/></div>
          <div><label class="label">Téléphone</label><input class="input" name="phone" value="${U.escapeHtml(c.phone||'')}"/></div>
          <div><label class="label">Poste</label><select class="select" name="jobId">
            <option value="">—</option>
            ${jobs.map(j => `<option value="${j.id}" ${c.jobId===j.id?'selected':''}>${U.escapeHtml(j.title)}</option>`).join('')}
          </select></div>
          <div><label class="label">Source</label><input class="input" name="source" value="${U.escapeHtml(c.source||'')}" placeholder="LinkedIn / Indeed…"/></div>
          <div><label class="label">Étape</label><select class="select" name="stage">
            ${['nouveau','preselection','entretien','offre','embauche','refuse'].map(s => `<option value="${s}" ${c.stage===s?'selected':''}>${s}</option>`).join('')}
          </select></div>
          <div><label class="label">Note (0-5)</label><input type="number" min="0" max="5" class="input" name="rating" value="${c.rating||0}"/></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#cd-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          d.rating = parseInt(d.rating, 10) || 0;
          if (id) Store.update('candidates', id, d);
          else Store.insert('candidates', { id: U.uid('ca'), addedAt: U.today(), ...d });
          U.toast('Candidat enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
