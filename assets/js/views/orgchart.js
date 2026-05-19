/* Org chart */
window.OrgChartView = (function () {
  function render(host) {
    const employees = Store.get('employees');
    const roots = employees.filter(e => !e.managerId);

    host.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Organigramme</h1>
          <p class="text-slate-500 text-sm">Vue hiérarchique du groupe Paris Nord.</p>
        </div>

        <div class="card p-6 overflow-auto">
          <div class="org-tree">
            ${roots.map(r => renderNode(r, employees)).join('')}
          </div>
        </div>

        <div class="card p-6">
          <h2 class="font-semibold mb-3">Effectif par département</h2>
          ${renderDepStats()}
        </div>
      </div>
    `;
  }

  function renderNode(e, all) {
    const children = all.filter(c => c.managerId === e.id);
    return `
      <ul>
        <li>
          <a href="#/collaborateurs/${e.id}" class="org-node">
            ${U.avatar(`${e.firstName} ${e.lastName}`, 28)}
            <div class="text-left">
              <div class="font-medium text-sm">${U.escapeHtml(e.firstName)} ${U.escapeHtml(e.lastName)}</div>
              <div class="text-xs text-slate-500">${U.escapeHtml(e.jobTitle)}</div>
            </div>
          </a>
          ${children.length ? children.map(c => renderNode(c, all)).join('') : ''}
        </li>
      </ul>
    `;
  }

  function renderDepStats() {
    const employees = Store.get('employees');
    const departments = Store.get('departments');
    const counts = {};
    employees.forEach(e => { counts[e.departmentId] = (counts[e.departmentId] || 0) + 1; });
    const max = Math.max(...Object.values(counts), 1);
    return `
      <div class="space-y-2 text-sm">
        ${departments.map(d => {
          const n = counts[d.id] || 0;
          return `
            <div>
              <div class="flex justify-between mb-1">
                <span class="font-medium">${U.escapeHtml(d.name)}</span>
                <span class="text-slate-500">${n}</span>
              </div>
              <div class="progress"><div class="progress-bar" style="width:${(n/max*100).toFixed(0)}%"></div></div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return { render };
})();
