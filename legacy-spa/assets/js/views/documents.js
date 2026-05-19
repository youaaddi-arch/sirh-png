/* Documents library */
window.DocumentsView = (function () {
  let filters = { employee: '', category: '' };

  function render(host) {
    const docs = Store.get('documents');
    const filtered = docs.filter(d =>
      (!filters.employee || d.employeeId === filters.employee) &&
      (!filters.category || d.category === filters.category)
    );

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Documents RH</h1>
            <p class="text-slate-500 text-sm">Coffre-fort numérique : contrats, bulletins, justificatifs.</p>
          </div>
          <button class="btn btn-primary" data-new>${U.icons.upload} Ajouter un document</button>
        </div>

        <div class="card p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label class="label">Collaborateur</label>
            <select id="d-emp" class="select min-w-[220px]">
              <option value="">Tous</option>
              ${Store.get('employees').map(e => `<option value="${e.id}" ${filters.employee===e.id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="label">Catégorie</label>
            <select id="d-cat" class="select min-w-[180px]">
              <option value="">Toutes</option>
              ${['Contractuel','Paie','Justificatifs','Formation','Médical','Autre'].map(c => `<option value="${c}" ${filters.category===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Document</th><th>Collaborateur</th><th>Catégorie</th><th>Type</th><th>Date</th><th>Taille</th><th></th></tr></thead>
            <tbody>
              ${filtered.length === 0 ? '<tr><td colspan="7" class="text-center py-10 text-slate-400">Aucun document</td></tr>' :
                filtered.map(d => {
                  const emp = Store.employee(d.employeeId);
                  return `
                    <tr>
                      <td>📄 <span class="font-medium">${U.escapeHtml(d.name)}</span></td>
                      <td>
                        <div class="flex items-center gap-2">
                          ${U.avatar(`${emp.firstName} ${emp.lastName}`, 28)}
                          <a href="#/collaborateurs/${emp.id}" class="text-sm hover:text-brand-700">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</a>
                        </div>
                      </td>
                      <td><span class="badge badge-gray">${U.escapeHtml(d.category)}</span></td>
                      <td class="text-sm">${U.escapeHtml(d.type)}</td>
                      <td class="text-sm">${U.fmtDate(d.uploadedAt)}</td>
                      <td class="text-sm">${(d.size/1024).toFixed(0)} Ko</td>
                      <td><div class="flex gap-1 justify-end">
                        <button class="btn-icon" title="Télécharger">${U.icons.download}</button>
                        <button class="btn-icon text-red-600" data-del="${d.id}">${U.icons.trash}</button>
                      </div></td>
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

  function bind() {
    document.getElementById('d-emp').onchange = (e) => { filters.employee = e.target.value; render(document.getElementById('main-content')); };
    document.getElementById('d-cat').onchange = (e) => { filters.category = e.target.value; render(document.getElementById('main-content')); };
    document.querySelector('[data-new]').onclick = () => openForm();
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce document ?', { danger: true });
      if (!ok) return; Store.remove('documents', b.dataset.del); U.toast('Document supprimé','success'); render(document.getElementById('main-content'));
    });
  }

  function openForm() {
    const employees = Store.get('employees');
    U.modal({
      title: 'Ajouter un document',
      body: `
        <form id="dc-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              ${employees.map(e => `<option value="${e.id}">${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div class="md:col-span-2"><label class="label">Nom du fichier</label><input class="input" name="name" placeholder="Ex. Contrat de travail.pdf" required/></div>
          <div><label class="label">Type</label><input class="input" name="type" placeholder="contrat / paie / diplome…" required/></div>
          <div><label class="label">Catégorie</label><select class="select" name="category">
            ${['Contractuel','Paie','Justificatifs','Formation','Médical','Autre'].map(c => `<option value="${c}">${c}</option>`).join('')}
          </select></div>
          <div class="md:col-span-2"><label class="label">Fichier</label><input type="file" class="input" name="file" id="dc-file"/></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Téléverser</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#dc-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          const file = root.querySelector('#dc-file').files[0];
          d.size = file ? file.size : 100000;
          d.uploadedAt = U.today();
          delete d.file;
          Store.insert('documents', { id: U.uid('dc'), ...d });
          U.toast('Document ajouté', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
