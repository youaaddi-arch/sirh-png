/* Settings */
window.SettingsView = (function () {
  let tab = 'general';

  function render(host) {
    host.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Paramètres</h1>
          <p class="text-slate-500 text-sm">Configuration du SIRH.</p>
        </div>

        <div class="card">
          <div class="flex border-b border-slate-200 px-2 overflow-x-auto">
            ${['general','types_conges','departements','data'].map(t => `
              <button class="px-4 py-3 text-sm font-medium border-b-2 ${tab===t?'border-brand-600 text-brand-700':'border-transparent text-slate-600'}" data-tab="${t}">${tabLabel(t)}</button>
            `).join('')}
          </div>
          <div class="p-5">${renderTab()}</div>
        </div>
      </div>
    `;
    bind();
  }

  function tabLabel(t) {
    return ({ general: 'Général', types_conges: 'Types de congés', departements: 'Départements', data: 'Données' })[t];
  }

  function renderTab() {
    if (tab === 'general') {
      const s = Store.settings();
      return `
        <form id="gen-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Nom du groupe</label><input class="input" name="companyName" value="${U.escapeHtml(s.companyName)}"/></div>
          <div class="md:col-span-2"><label class="label">Slogan</label><input class="input" name="slogan" value="${U.escapeHtml(s.slogan||'')}"/></div>
          <div><label class="label">Devise</label><input class="input" name="defaultCurrency" value="${U.escapeHtml(s.defaultCurrency)}"/></div>
          <div><label class="label">Fuseau horaire</label><input class="input" name="timezone" value="${U.escapeHtml(s.timezone)}"/></div>
          <div><label class="label">Jours travaillés / semaine</label><input type="number" class="input" name="workDaysPerWeek" value="${s.workDaysPerWeek}"/></div>
          <div><label class="label">Heures / jour</label><input type="number" step="0.1" class="input" name="hoursPerDay" value="${s.hoursPerDay}"/></div>
          <div><label class="label">Congés payés annuels (j)</label><input type="number" class="input" name="annualCP" value="${s.annualCP}"/></div>
          <div><label class="label">RTT annuels (j)</label><input type="number" class="input" name="annualRTT" value="${s.annualRTT}"/></div>
          <div class="md:col-span-2 flex justify-end gap-2">
            <button type="button" class="btn btn-primary" data-save-gen>Enregistrer</button>
          </div>
        </form>
      `;
    }
    if (tab === 'types_conges') {
      const types = Store.get('leaveTypes');
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Code</th><th>Nom</th><th>Couleur</th><th>Jours annuels</th><th>Rémunéré</th><th></th></tr></thead>
            <tbody>
              ${types.map(t => `
                <tr>
                  <td><span class="badge" style="background:${t.color}20;color:${t.color}">${U.escapeHtml(t.code)}</span></td>
                  <td>${U.escapeHtml(t.name)}</td>
                  <td><span class="inline-block w-6 h-6 rounded" style="background:${t.color}"></span></td>
                  <td>${t.annualDays}</td>
                  <td>${t.paid ? '✅' : '❌'}</td>
                  <td><div class="flex gap-1 justify-end">
                    <button class="btn-icon" data-edit-lt="${t.id}">${U.icons.edit}</button>
                    <button class="btn-icon text-red-600" data-del-lt="${t.id}">${U.icons.trash}</button>
                  </div></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary mt-3" data-new-lt>${U.icons.plus} Nouveau type</button>
      `;
    }
    if (tab === 'departements') {
      const list = Store.get('departments');
      return `
        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Département</th><th>Parent</th><th>Effectif</th><th></th></tr></thead>
            <tbody>
              ${list.map(d => {
                const parent = list.find(x => x.id === d.parentId);
                const n = Store.where('employees', e => e.departmentId === d.id).length;
                return `
                  <tr>
                    <td class="font-medium">${U.escapeHtml(d.name)}</td>
                    <td class="text-sm">${parent ? U.escapeHtml(parent.name) : '—'}</td>
                    <td>${n}</td>
                    <td><div class="flex gap-1 justify-end">
                      <button class="btn-icon" data-edit-dep="${d.id}">${U.icons.edit}</button>
                      <button class="btn-icon text-red-600" data-del-dep="${d.id}">${U.icons.trash}</button>
                    </div></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary mt-3" data-new-dep>${U.icons.plus} Nouveau département</button>
      `;
    }
    if (tab === 'data') {
      return `
        <div class="space-y-4">
          <div class="card p-4">
            <h3 class="font-semibold mb-2">Exporter les données</h3>
            <p class="text-sm text-slate-500 mb-3">Téléchargez l'intégralité de la base au format JSON.</p>
            <button class="btn btn-primary" data-export-all>${U.icons.download} Télécharger le JSON</button>
          </div>
          <div class="card p-4">
            <h3 class="font-semibold mb-2">Importer des données</h3>
            <p class="text-sm text-slate-500 mb-3">Restaurez un export JSON précédent.</p>
            <input type="file" id="import-file" accept="application/json" class="input"/>
            <button class="btn btn-primary mt-2" data-import>${U.icons.upload} Importer</button>
          </div>
          <div class="card p-4 border-red-200">
            <h3 class="font-semibold mb-2 text-red-700">Réinitialiser</h3>
            <p class="text-sm text-slate-500 mb-3">Remet la base aux données d'origine. Cette action est irréversible.</p>
            <button class="btn btn-danger" data-reset>${U.icons.trash} Tout réinitialiser</button>
          </div>
        </div>
      `;
    }
  }

  function bind() {
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(document.getElementById('main-content')); });
    document.querySelector('[data-save-gen]')?.addEventListener('click', () => {
      const f = document.getElementById('gen-form');
      const fd = new FormData(f);
      const d = Object.fromEntries(fd.entries());
      d.workDaysPerWeek = +d.workDaysPerWeek;
      d.hoursPerDay = +d.hoursPerDay;
      d.annualCP = +d.annualCP;
      d.annualRTT = +d.annualRTT;
      Store.updateSettings(d);
      U.toast('Paramètres enregistrés','success');
      App.refreshHeader();
    });
    document.querySelector('[data-new-lt]')?.addEventListener('click', () => editLeaveType());
    document.querySelectorAll('[data-edit-lt]').forEach(b => b.onclick = () => editLeaveType(b.dataset.editLt));
    document.querySelectorAll('[data-del-lt]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce type ?', { danger: true });
      if (!ok) return; Store.remove('leaveTypes', b.dataset.delLt); U.toast('Type supprimé','success'); render(document.getElementById('main-content'));
    });

    document.querySelector('[data-new-dep]')?.addEventListener('click', () => editDepartment());
    document.querySelectorAll('[data-edit-dep]').forEach(b => b.onclick = () => editDepartment(b.dataset.editDep));
    document.querySelectorAll('[data-del-dep]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce département ?', { danger: true });
      if (!ok) return; Store.remove('departments', b.dataset.delDep); U.toast('Département supprimé','success'); render(document.getElementById('main-content'));
    });

    document.querySelectorAll('[data-export-all]').forEach(b => b.onclick = () => {
      U.downloadFile('sirh-export.json', Store.exportAll(), 'application/json');
      U.toast('Export téléchargé', 'success');
    });
    document.querySelector('[data-import]')?.addEventListener('click', () => {
      const f = document.getElementById('import-file').files[0];
      if (!f) { U.toast('Sélectionnez un fichier', 'warn'); return; }
      const r = new FileReader();
      r.onload = () => {
        if (Store.importAll(r.result)) { U.toast('Import réussi', 'success'); location.reload(); }
        else U.toast('Fichier invalide', 'error');
      };
      r.readAsText(f);
    });
    document.querySelector('[data-reset]')?.addEventListener('click', async () => {
      const ok = await U.confirm('Réinitialiser toutes les données ? Action irréversible.', { danger: true, confirmText: 'Réinitialiser' });
      if (!ok) return;
      Store.reset(); location.reload();
    });
  }

  function editLeaveType(id) {
    const t = id ? { ...Store.find('leaveTypes', id) } : { code:'', name:'', color:'#2447df', annualDays:0, paid:true };
    U.modal({
      title: id ? 'Modifier le type' : 'Nouveau type de congé',
      body: `
        <form id="lt-form" class="grid md:grid-cols-2 gap-4">
          <div><label class="label">Code</label><input class="input" name="code" value="${U.escapeHtml(t.code)}" required/></div>
          <div><label class="label">Nom</label><input class="input" name="name" value="${U.escapeHtml(t.name)}" required/></div>
          <div><label class="label">Couleur</label><input type="color" class="input h-10" name="color" value="${t.color}"/></div>
          <div><label class="label">Jours annuels</label><input type="number" class="input" name="annualDays" value="${t.annualDays}"/></div>
          <div class="md:col-span-2"><label class="flex items-center gap-2 text-sm"><input type="checkbox" name="paid" ${t.paid?'checked':''}/> Rémunéré</label></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#lt-form');
          if (!f.reportValidity()) return;
          const fd = new FormData(f);
          const d = Object.fromEntries(fd.entries());
          d.annualDays = +d.annualDays;
          d.paid = fd.get('paid') === 'on';
          if (id) Store.update('leaveTypes', id, d);
          else Store.insert('leaveTypes', { id: U.uid('lt'), ...d });
          U.toast('Type enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  function editDepartment(id) {
    const list = Store.get('departments');
    const d = id ? { ...Store.find('departments', id) } : { name: '', parentId: '' };
    U.modal({
      title: id ? 'Modifier le département' : 'Nouveau département',
      body: `
        <form id="dep-form" class="grid gap-4">
          <div><label class="label">Nom</label><input class="input" name="name" value="${U.escapeHtml(d.name)}" required/></div>
          <div><label class="label">Département parent</label>
            <select class="select" name="parentId">
              <option value="">—</option>
              ${list.filter(x => x.id !== id).map(x => `<option value="${x.id}" ${d.parentId===x.id?'selected':''}>${U.escapeHtml(x.name)}</option>`).join('')}
            </select>
          </div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#dep-form');
          if (!f.reportValidity()) return;
          const data = Object.fromEntries(new FormData(f).entries());
          if (id) Store.update('departments', id, data);
          else Store.insert('departments', { id: U.uid('dep'), ...data });
          U.toast('Département enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
