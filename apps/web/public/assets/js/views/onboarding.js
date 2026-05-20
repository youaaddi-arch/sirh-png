/* Onboarding workflows */
window.OnboardingView = (function () {
  function render(host) {
    const list = Store.get('onboardings');

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Onboarding</h1>
            <p class="text-slate-500 text-sm">Parcours d'intégration des nouveaux collaborateurs.</p>
          </div>
          <button class="btn btn-primary" data-new>${U.icons.plus} Démarrer un onboarding</button>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          ${list.length === 0 ? '<div class="card p-6 text-slate-500">Aucun onboarding en cours.</div>' :
            list.map(o => {
              const emp = Store.employee(o.employeeId);
              const done = o.tasks.filter(t => t.done).length;
              const total = o.tasks.length;
              const pct = total ? Math.round(done / total * 100) : 0;
              return `
                <div class="card p-5">
                  <div class="flex items-center gap-3 mb-4">
                    ${U.avatar(`${emp.firstName} ${emp.lastName}`, 48)}
                    <div class="flex-1">
                      <div class="font-semibold text-lg">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</div>
                      <div class="text-xs text-slate-500">${U.escapeHtml(emp.jobTitle)} • Démarré le ${U.fmtDate(o.startDate)}</div>
                    </div>
                    <span class="badge ${o.status==='termine'?'badge-green':'badge-amber'}">${o.status}</span>
                  </div>
                  <div class="mb-3">
                    <div class="flex justify-between text-xs text-slate-500 mb-1">
                      <span>${done} / ${total} tâches complétées</span>
                      <span class="font-semibold">${pct}%</span>
                    </div>
                    <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
                  </div>
                  <div class="space-y-1">
                    ${o.tasks.map(t => `
                      <label class="flex items-center gap-3 py-2 px-3 rounded ${t.done?'bg-emerald-50':'hover:bg-slate-50'} cursor-pointer">
                        <input type="checkbox" data-task data-ob="${o.id}" data-t="${t.id}" ${t.done?'checked':''}/>
                        <div class="flex-1">
                          <div class="text-sm ${t.done?'line-through text-slate-500':'text-slate-900'}">${U.escapeHtml(t.name)}</div>
                        </div>
                        <span class="badge badge-gray">${U.escapeHtml(t.category)}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>
    `;
    bind();
  }

  function bind() {
    document.querySelector('[data-new]').onclick = () => start();
    document.querySelectorAll('[data-task]').forEach(cb => cb.onchange = (e) => {
      const ob = Store.find('onboardings', cb.dataset.ob);
      const t = ob.tasks.find(x => x.id === cb.dataset.t);
      t.done = e.target.checked;
      const allDone = ob.tasks.every(x => x.done);
      Store.update('onboardings', ob.id, { tasks: ob.tasks, status: allDone ? 'termine' : 'en_cours' });
      render(document.getElementById('main-content'));
    });
  }

  function start() {
    const employees = Store.get('employees');
    U.modal({
      title: 'Démarrer un onboarding',
      body: `
        <form id="ob-form" class="grid gap-4">
          <div><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              ${employees.map(e => `<option value="${e.id}">${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Date de démarrage</label><input type="date" class="input" name="startDate" value="${U.today()}" required/></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Démarrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#ob-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          const tasks = [
            { id: 't1', name: 'Contrat signé',          done: false, category: 'Administratif' },
            { id: 't2', name: 'DPAE',                   done: false, category: 'Administratif' },
            { id: 't3', name: 'Visite médicale',        done: false, category: 'Santé' },
            { id: 't4', name: 'Mail et matériel',       done: false, category: 'IT' },
            { id: 't5', name: 'Badge d\'accès',         done: false, category: 'IT' },
            { id: 't6', name: 'Livret d\'accueil',      done: false, category: 'Administratif' },
            { id: 't7', name: 'Formation sécurité',     done: false, category: 'Formation' },
            { id: 't8', name: 'Bilan période d\'essai', done: false, category: 'RH' },
          ];
          Store.insert('onboardings', { id: U.uid('ob'), ...d, status: 'en_cours', tasks });
          U.toast('Onboarding démarré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
