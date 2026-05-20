/* Reports & analytics */
window.ReportsView = (function () {
  function render(host) {
    const employees = Store.get('employees');
    const leaves = Store.get('leaves');
    const expenses = Store.get('expenses');
    const payslips = Store.get('payslips');
    const companies = Store.get('companies');

    // Headcount evolution (12 last months)
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
      months.push(d.toISOString().slice(0, 7));
    }
    const headcount = months.map(m => employees.filter(e => e.contractStart <= m + '-31').length);

    // Average tenure
    const tenures = employees.map(e => {
      const start = new Date(e.contractStart);
      return (Date.now() - start.getTime()) / (365.25 * 86400000);
    });
    const avgTenure = tenures.reduce((s, x) => s + x, 0) / Math.max(1, tenures.length);

    // Gender / age distribution — not collected, just stats
    const cdiCount = employees.filter(e => e.contractType === 'CDI').length;
    const cddCount = employees.filter(e => e.contractType === 'CDD').length;
    const altCount = employees.filter(e => e.contractType === 'Alternance').length;
    const stgCount = employees.filter(e => e.contractType === 'Stage').length;

    const totalMass = employees.reduce((s, e) => s + (e.salary || 0), 0);
    const employerCost = totalMass * 1.42;

    // Expenses by category
    const byCat = {};
    expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });

    // Leaves by type
    const byType = {};
    leaves.filter(l => l.status === 'approuve').forEach(l => {
      const t = Store.find('leaveTypes', l.typeId);
      byType[t?.code || 'AUTRE'] = (byType[t?.code || 'AUTRE'] || 0) + l.days;
    });

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Rapports & analytics RH</h1>
            <p class="text-slate-500 text-sm">Indicateurs clés du groupe.</p>
          </div>
          <button class="btn btn-secondary" data-export>${U.icons.download} Exporter PDF</button>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${kpi('Effectif', employees.length, 'text-brand-700')}
          ${kpi('CDI', cdiCount, 'text-emerald-700')}
          ${kpi('Ancienneté moyenne', avgTenure.toFixed(1)+' ans', 'text-amber-700')}
          ${kpi('Masse salariale (brut/mois)', U.fmtEur(totalMass), 'text-purple-700')}
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Headcount -->
          <div class="card p-5">
            <h2 class="font-semibold mb-3">Évolution effectif (12 mois)</h2>
            ${barsChart(months, headcount)}
          </div>

          <!-- Type de contrats -->
          <div class="card p-5">
            <h2 class="font-semibold mb-3">Répartition par type de contrat</h2>
            ${pieLegend([
              { label: 'CDI', value: cdiCount, color: '#2447df' },
              { label: 'CDD', value: cddCount, color: '#f59e0b' },
              { label: 'Alternance', value: altCount, color: '#10b981' },
              { label: 'Stage', value: stgCount, color: '#ec4899' },
            ])}
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="card p-5">
            <h2 class="font-semibold mb-3">Notes de frais par catégorie</h2>
            ${barsList(byCat, (v) => U.fmtEur(v))}
          </div>
          <div class="card p-5">
            <h2 class="font-semibold mb-3">Congés pris par type (en jours)</h2>
            ${barsList(byType, (v) => `${v} j`)}
          </div>
        </div>

        <!-- Effectif par société -->
        <div class="card p-5">
          <h2 class="font-semibold mb-3">Effectif par société</h2>
          ${renderCompanyTable()}
        </div>

        <!-- Coût employeur -->
        <div class="card p-5">
          <h2 class="font-semibold mb-3">Coût salarial estimé</h2>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div><div class="text-slate-500">Masse salariale brute / mois</div><div class="text-xl font-bold mt-1">${U.fmtEur(totalMass)}</div></div>
            <div><div class="text-slate-500">Coût total employeur / mois</div><div class="text-xl font-bold mt-1">${U.fmtEur(employerCost)}</div></div>
            <div><div class="text-slate-500">Coût total employeur / an</div><div class="text-xl font-bold mt-1">${U.fmtEur(employerCost*12)}</div></div>
          </div>
        </div>
      </div>
    `;
    bind();
  }

  function bind() {
    document.querySelector('[data-export]')?.addEventListener('click', () => {
      window.print();
    });
  }

  function kpi(label, value, color) {
    return `<div class="card p-4"><div class="text-xs uppercase text-slate-500 font-semibold">${label}</div><div class="mt-1 text-2xl font-bold ${color}">${value}</div></div>`;
  }

  function barsChart(labels, data) {
    const max = Math.max(...data, 1);
    return `
      <div class="flex items-end gap-1 h-32">
        ${data.map((v, i) => `
          <div class="flex-1 flex flex-col items-center justify-end" title="${labels[i]} : ${v}">
            <div class="w-full bg-brand-500 rounded-t" style="height:${(v/max*100).toFixed(0)}%"></div>
          </div>
        `).join('')}
      </div>
      <div class="flex gap-1 mt-2 text-[10px] text-slate-500">
        ${labels.map(l => `<div class="flex-1 text-center">${l.slice(5)}</div>`).join('')}
      </div>
    `;
  }

  function pieLegend(items) {
    const total = items.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    const stops = items.map(it => {
      const start = (acc / total) * 360;
      acc += it.value;
      const end = (acc / total) * 360;
      return `${it.color} ${start}deg ${end}deg`;
    }).join(',');
    return `
      <div class="flex items-center gap-6">
        <div class="w-32 h-32 rounded-full" style="background: conic-gradient(${stops})"></div>
        <div class="flex-1 space-y-2 text-sm">
          ${items.map(it => `
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm" style="background:${it.color}"></span>
                <span>${U.escapeHtml(it.label)}</span>
              </div>
              <span class="font-semibold">${it.value} (${((it.value/total)*100).toFixed(0)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function barsList(obj, fmt) {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map(e => e[1]), 1);
    return `
      <div class="space-y-2 text-sm">
        ${entries.length === 0 ? '<p class="text-slate-500">Pas de données.</p>' : entries.map(([k, v]) => `
          <div>
            <div class="flex justify-between mb-1"><span>${U.escapeHtml(k)}</span><span class="font-semibold">${fmt(v)}</span></div>
            <div class="progress"><div class="progress-bar" style="width:${(v/max*100).toFixed(0)}%"></div></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderCompanyTable() {
    const employees = Store.get('employees');
    const companies = Store.get('companies');
    const stats = {};
    employees.forEach(e => {
      const c = companies.find(x => x.id === e.companyId);
      if (!c) return;
      const k = c.code;
      stats[k] = stats[k] || { code: c.code, name: c.name, count: 0, mass: 0 };
      stats[k].count++; stats[k].mass += e.salary || 0;
    });
    const rows = Object.values(stats).sort((a, b) => b.count - a.count);
    return `
      <div class="overflow-x-auto">
        <table class="table">
          <thead><tr><th>Code</th><th>Société</th><th class="text-right">Effectif</th><th class="text-right">Masse / mois</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><span class="badge badge-blue">${U.escapeHtml(r.code)}</span></td>
                <td class="text-sm">${U.escapeHtml(r.name)}</td>
                <td class="text-right font-semibold">${r.count}</td>
                <td class="text-right">${U.fmtEur(r.mass)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return { render };
})();
