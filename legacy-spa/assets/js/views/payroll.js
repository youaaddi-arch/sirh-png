/* Payroll / payslips */
window.PayrollView = (function () {
  let month = new Date().toISOString().slice(0, 7);

  function render(host) {
    const employees = Store.get('employees');
    const months = [...new Set(Store.get('payslips').map(p => p.month))].sort().reverse();
    if (!months.includes(month) && months.length) month = months[0];

    const list = Store.where('payslips', p => p.month === month);
    const totals = list.reduce((acc, p) => ({
      gross: acc.gross + p.gross,
      net: acc.net + p.net,
      charges: acc.charges + p.socialCharges,
      cost: acc.cost + p.employerCost,
    }), { gross: 0, net: 0, charges: 0, cost: 0 });

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Paie</h1>
            <p class="text-slate-500 text-sm">Bulletins, masse salariale et déclarations.</p>
          </div>
          <div class="flex gap-2">
            <select id="ps-month" class="select">
              ${months.map(m => `<option value="${m}" ${m===month?'selected':''}>${m}</option>`).join('')}
            </select>
            <button class="btn btn-secondary" data-export>${U.icons.download} Exporter CSV</button>
            <button class="btn btn-primary" data-generate>${U.icons.plus} Générer la paie</button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${kpi('Bulletins', list.length, 'text-brand-700')}
          ${kpi('Brut total', U.fmtEur(totals.gross), 'text-emerald-700')}
          ${kpi('Charges sociales', U.fmtEur(totals.charges), 'text-amber-700')}
          ${kpi('Coût employeur', U.fmtEur(totals.cost), 'text-purple-700')}
        </div>

        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr><th>Collaborateur</th><th>Société</th><th class="text-right">Brut</th><th class="text-right">Charges</th><th class="text-right">Net</th><th class="text-right">Coût employeur</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="8" class="text-center py-10 text-slate-400">Aucun bulletin</td></tr>' :
                list.map(p => {
                  const emp = Store.employee(p.employeeId);
                  if (!emp) return '';
                  const co = Store.company(emp.companyId);
                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          ${U.avatar(`${emp.firstName} ${emp.lastName}`, 32)}
                          <a href="#/collaborateurs/${emp.id}" class="font-medium">${U.escapeHtml(emp.firstName)} ${U.escapeHtml(emp.lastName)}</a>
                        </div>
                      </td>
                      <td>${co ? `<span class="badge badge-blue">${U.escapeHtml(co.code)}</span>` : '—'}</td>
                      <td class="text-right">${U.fmtEur(p.gross)}</td>
                      <td class="text-right text-slate-600">${U.fmtEur(p.socialCharges)}</td>
                      <td class="text-right font-semibold text-emerald-700">${U.fmtEur(p.net)}</td>
                      <td class="text-right text-slate-600">${U.fmtEur(p.employerCost)}</td>
                      <td><span class="badge badge-green">${U.escapeHtml(p.status)}</span></td>
                      <td><button class="btn-icon">${U.icons.download}</button></td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
            ${list.length ? `
            <tfoot>
              <tr class="bg-slate-50 font-semibold">
                <td colspan="2">Total ${month}</td>
                <td class="text-right">${U.fmtEur(totals.gross)}</td>
                <td class="text-right">${U.fmtEur(totals.charges)}</td>
                <td class="text-right">${U.fmtEur(totals.net)}</td>
                <td class="text-right">${U.fmtEur(totals.cost)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>` : ''}
          </table>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold mb-3">Déclarations sociales</h2>
          <div class="grid md:grid-cols-3 gap-4">
            ${decl('DSN', 'Déclaration Sociale Nominative', 'Mensuelle', 'À transmettre avant le 5')}
            ${decl('URSSAF', 'Cotisations sociales', 'Mensuelle', 'En cours')}
            ${decl('DOETH', 'Travailleurs handicapés', 'Annuelle', 'À jour')}
          </div>
        </div>
      </div>
    `;
    document.getElementById('ps-month').onchange = (e) => { month = e.target.value; render(document.getElementById('main-content')); };
    document.querySelector('[data-export]').onclick = () => {
      const rows = list.map(p => {
        const e = Store.employee(p.employeeId);
        return [e?.matricule, `${e?.firstName} ${e?.lastName}`, p.month, p.gross, p.socialCharges, p.net, p.employerCost];
      });
      U.downloadFile(`paie-${month}.csv`, U.csvFromRows(['Matricule','Nom','Mois','Brut','Charges','Net','Coût employeur'], rows), 'text/csv;charset=utf-8');
      U.toast('Export téléchargé', 'success');
    };
    document.querySelector('[data-generate]').onclick = () => {
      const next = nextMonth(month);
      const employees = Store.get('employees');
      employees.forEach(e => {
        if (!Store.where('payslips', p => p.employeeId === e.id && p.month === next).length) {
          Store.insert('payslips', {
            id: U.uid('ps'), employeeId: e.id, month: next,
            gross: e.salary, net: Math.round(e.salary * 0.78),
            socialCharges: Math.round(e.salary * 0.22),
            employerCost: Math.round(e.salary * 1.42),
            status: 'edite',
          });
        }
      });
      U.toast(`Paie ${next} générée`, 'success');
      month = next;
      render(document.getElementById('main-content'));
    };
  }

  function nextMonth(m) {
    const [y, mo] = m.split('-').map(Number);
    const d = new Date(y, mo, 1);
    return d.toISOString().slice(0, 7);
  }

  function kpi(label, value, color) {
    return `<div class="card p-4"><div class="text-xs uppercase text-slate-500 font-semibold">${label}</div><div class="mt-1 text-2xl font-bold ${color}">${value}</div></div>`;
  }

  function decl(code, title, freq, status) {
    return `
      <div class="border border-slate-200 rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="badge badge-blue">${code}</span>
          <span class="text-xs text-slate-500">${freq}</span>
        </div>
        <div class="font-medium text-sm">${title}</div>
        <div class="text-xs text-slate-500 mt-1">${status}</div>
      </div>
    `;
  }

  return { render };
})();
