/* Variables de paie — Export mensuel pour la paie */
window.PayrollVarsView = (function () {
  let month = new Date().toISOString().slice(0, 7);
  let companyFilter = '';

  function render(host) {
    const employees = Store.get('employees').filter(e =>
      e.status === 'actif' && (!companyFilter || e.companyId === companyFilter)
    );
    const rows = employees.map(e => computeVariables(e, month));
    const totals = aggregate(rows);

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Variables de paie</h1>
            <p class="text-slate-500 text-sm">Export mensuel des variables à transmettre au gestionnaire de paie.</p>
          </div>
          <div class="flex gap-2 items-center">
            <input type="month" class="input" id="pv-month" value="${month}"/>
            <select class="select" id="pv-co">
              <option value="">Toutes les sociétés</option>
              ${Store.get('companies').map(c => `<option value="${c.id}" ${companyFilter===c.id?'selected':''}>${U.escapeHtml(c.code+' — '+c.name)}</option>`).join('')}
            </select>
            <button class="btn btn-secondary" data-export-csv>${U.icons.download} Export CSV</button>
            <button class="btn btn-success" data-export-silae>${U.icons.download} Export Silae</button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          ${kpi('Collaborateurs', rows.length, 'text-brand-700')}
          ${kpi('Heures travaillées', U.fmtNum(totals.workedHours, 1) + 'h', 'text-emerald-700')}
          ${kpi('Heures supp.', U.fmtNum(totals.overtime, 1) + 'h', 'text-amber-700')}
          ${kpi('Jours absences', U.fmtNum(totals.absenceDays, 1) + 'j', 'text-red-700')}
          ${kpi('Primes / Frais', U.fmtEur(totals.bonuses + totals.expenses), 'text-purple-700')}
        </div>

        <div class="card overflow-x-auto">
          <table class="table text-xs">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Collaborateur</th>
                <th>Société</th>
                <th class="text-right">Salaire brut</th>
                <th class="text-right">Jours travaillés</th>
                <th class="text-right">Heures travail.</th>
                <th class="text-right">H. supp.</th>
                <th class="text-right">CP</th>
                <th class="text-right">RTT</th>
                <th class="text-right">Maladie</th>
                <th class="text-right">Autres abs.</th>
                <th class="text-right">Tickets repas</th>
                <th class="text-right">Primes</th>
                <th class="text-right">Frais</th>
                <th class="text-right">Brut total</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length === 0 ? '<tr><td colspan="15" class="text-center py-10 text-slate-400">Aucun collaborateur</td></tr>' :
                rows.map(r => `
                  <tr>
                    <td class="font-mono">${U.escapeHtml(r.matricule)}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        ${U.avatar(`${r.firstName} ${r.lastName}`, 28)}
                        <a href="#/collaborateurs/${r.employeeId}" class="font-medium hover:text-brand-700">${U.escapeHtml(r.firstName)} ${U.escapeHtml(r.lastName)}</a>
                      </div>
                    </td>
                    <td>${r.companyCode ? `<span class="badge badge-blue">${U.escapeHtml(r.companyCode)}</span>` : '—'}</td>
                    <td class="text-right">${U.fmtEur(r.baseSalary)}</td>
                    <td class="text-right">${r.workedDays}</td>
                    <td class="text-right">${r.workedHours.toFixed(1)}</td>
                    <td class="text-right ${r.overtime>0?'text-amber-700 font-semibold':''}">${r.overtime.toFixed(1)}</td>
                    <td class="text-right ${r.cpDays>0?'text-brand-700':''}">${r.cpDays}</td>
                    <td class="text-right ${r.rttDays>0?'text-purple-700':''}">${r.rttDays}</td>
                    <td class="text-right ${r.sickDays>0?'text-red-700 font-semibold':''}">${r.sickDays}</td>
                    <td class="text-right">${r.otherAbsenceDays}</td>
                    <td class="text-right">${r.mealVouchersCount}</td>
                    <td class="text-right ${r.bonuses>0?'text-emerald-700':''}">${U.fmtEur(r.bonuses)}</td>
                    <td class="text-right">${U.fmtEur(r.expenses)}</td>
                    <td class="text-right font-semibold">${U.fmtEur(r.totalGross)}</td>
                  </tr>
                `).join('')}
            </tbody>
            ${rows.length ? `
              <tfoot>
                <tr class="bg-slate-50 font-semibold">
                  <td colspan="3">TOTAL ${month}</td>
                  <td class="text-right">${U.fmtEur(totals.baseSalary)}</td>
                  <td class="text-right">${totals.workedDays}</td>
                  <td class="text-right">${totals.workedHours.toFixed(1)}</td>
                  <td class="text-right">${totals.overtime.toFixed(1)}</td>
                  <td class="text-right">${totals.cpDays}</td>
                  <td class="text-right">${totals.rttDays}</td>
                  <td class="text-right">${totals.sickDays}</td>
                  <td class="text-right">${totals.otherAbsenceDays}</td>
                  <td class="text-right">${totals.mealVouchersCount}</td>
                  <td class="text-right">${U.fmtEur(totals.bonuses)}</td>
                  <td class="text-right">${U.fmtEur(totals.expenses)}</td>
                  <td class="text-right">${U.fmtEur(totals.totalGross)}</td>
                </tr>
              </tfoot>` : ''}
          </table>
        </div>

        <div class="card p-5">
          <h2 class="font-semibold mb-3">Primes et retenues du mois</h2>
          <div class="flex gap-2 mb-3">
            <button class="btn btn-primary btn-sm" data-add-prime>${U.icons.plus} Ajouter une prime</button>
          </div>
          ${renderPrimes()}
        </div>
      </div>
    `;
    bind(rows, totals);
  }

  function renderPrimes() {
    const list = Store.where('payrollVariables', p => p.month === month);
    if (list.length === 0) return '<p class="text-sm text-slate-500">Aucune prime ce mois-ci.</p>';
    return `
      <table class="table">
        <thead><tr><th>Collaborateur</th><th>Type</th><th>Libellé</th><th class="text-right">Montant</th><th></th></tr></thead>
        <tbody>
          ${list.map(p => {
            const e = Store.employee(p.employeeId);
            return `
              <tr>
                <td>${U.escapeHtml(e ? e.firstName+' '+e.lastName : '—')}</td>
                <td><span class="badge ${p.type==='prime'?'badge-green':'badge-red'}">${p.type==='prime'?'Prime':'Retenue'}</span></td>
                <td class="text-sm">${U.escapeHtml(p.label)}</td>
                <td class="text-right font-semibold ${p.type==='prime'?'text-emerald-700':'text-red-700'}">${p.type==='prime'?'+':'-'}${U.fmtEur(p.amount)}</td>
                <td><button class="btn-icon text-red-600" data-del-prime="${p.id}">${U.icons.trash}</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function bind(rows, totals) {
    document.getElementById('pv-month').onchange = (e) => { month = e.target.value; render(document.getElementById('main-content')); };
    document.getElementById('pv-co').onchange    = (e) => { companyFilter = e.target.value; render(document.getElementById('main-content')); };
    document.querySelector('[data-export-csv]').onclick = () => exportCsv(rows);
    document.querySelector('[data-export-silae]').onclick = () => exportSilae(rows);
    document.querySelector('[data-add-prime]')?.addEventListener('click', () => openPrime());
    document.querySelectorAll('[data-del-prime]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette prime ?', { danger: true });
      if (!ok) return; Store.remove('payrollVariables', b.dataset.delPrime);
      U.toast('Prime supprimée', 'success'); render(document.getElementById('main-content'));
    });
  }

  function openPrime() {
    const employees = Store.get('employees');
    U.modal({
      title: `Ajouter une prime / retenue — ${month}`,
      body: `
        <form id="pv-form" class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="label">Collaborateur</label>
            <select class="select" name="employeeId" required>
              ${employees.map(e => `<option value="${e.id}">${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Type</label><select class="select" name="type">
            <option value="prime">Prime</option>
            <option value="retenue">Retenue</option>
          </select></div>
          <div><label class="label">Montant (€)</label><input type="number" step="0.01" class="input" name="amount" required/></div>
          <div class="md:col-span-2"><label class="label">Libellé</label><input class="input" name="label" required placeholder="Ex. Prime exceptionnelle"/></div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#pv-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          d.amount = parseFloat(d.amount) || 0;
          d.month = month;
          Store.insert('payrollVariables', { id: U.uid('pv'), ...d });
          U.toast('Prime enregistrée', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  function computeVariables(e, month) {
    const [y, m] = month.split('-').map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd   = new Date(y, m, 0);
    const isoStart = monthStart.toISOString().slice(0, 10);
    const isoEnd   = monthEnd.toISOString().slice(0, 10);
    const businessDays = U.businessDaysBetween(isoStart, isoEnd);

    // Timesheets
    const sheets = Store.where('timesheets', t => t.employeeId === e.id && t.date >= isoStart && t.date <= isoEnd);
    const workedHours = sheets.reduce((s, t) => s + (t.hours||0), 0);
    const workedDays = sheets.length;
    const baseHours = (e.weeklyHours || 35) / 5 * workedDays;
    const overtime = Math.max(0, workedHours - baseHours);

    // Leaves on the month
    const leaves = Store.where('leaves', l => l.employeeId === e.id && l.status === 'approuve');
    let cpDays = 0, rttDays = 0, sickDays = 0, otherAbsenceDays = 0;
    leaves.forEach(l => {
      const t = Store.find('leaveTypes', l.typeId);
      if (!t) return;
      const days = countDaysInMonth(l.startDate, l.endDate, monthStart, monthEnd);
      if (t.code === 'CP') cpDays += days;
      else if (t.code === 'RTT') rttDays += days;
      else if (['MAL','MAT','PAT'].includes(t.code)) sickDays += days;
      else if (t.code !== 'TT') otherAbsenceDays += days;
    });

    // Meal vouchers
    const mealVouchersCount = e.mealVouchers ? Math.max(0, businessDays - cpDays - rttDays - sickDays - otherAbsenceDays) : 0;

    // Primes
    const primes = Store.where('payrollVariables', p => p.employeeId === e.id && p.month === month);
    const bonuses = primes.filter(p => p.type === 'prime').reduce((s, p) => s + p.amount, 0)
                  - primes.filter(p => p.type === 'retenue').reduce((s, p) => s + p.amount, 0);

    // Expenses for reimbursement (approved in the month)
    const exp = Store.where('expenses', x => x.employeeId === e.id && (x.status === 'approuve' || x.status === 'rembourse') && x.date >= isoStart && x.date <= isoEnd);
    const expenses = exp.reduce((s, x) => s + x.amount, 0);

    const co = Store.company(e.companyId);
    const totalGross = (e.salary || 0) + bonuses + overtime * ((e.salary||0) / (e.weeklyHours||35) / 4.33) * 1.25;

    return {
      employeeId: e.id, matricule: e.matricule,
      firstName: e.firstName, lastName: e.lastName,
      companyCode: co ? co.code : '', companyName: co ? co.name : '',
      baseSalary: e.salary || 0,
      workedDays, workedHours, overtime,
      cpDays, rttDays, sickDays, otherAbsenceDays,
      mealVouchersCount,
      bonuses, expenses,
      totalGross,
      iban: e.iban || '',
      siret: co?.siret || '',
    };
  }

  function countDaysInMonth(start, end, monthStart, monthEnd) {
    const s = new Date(Math.max(new Date(start).getTime(), monthStart.getTime()));
    const e = new Date(Math.min(new Date(end).getTime(),  monthEnd.getTime()));
    if (e < s) return 0;
    return U.businessDaysBetween(s.toISOString().slice(0,10), e.toISOString().slice(0,10));
  }

  function aggregate(rows) {
    return rows.reduce((acc, r) => ({
      baseSalary:       acc.baseSalary + r.baseSalary,
      workedDays:       acc.workedDays + r.workedDays,
      workedHours:      acc.workedHours + r.workedHours,
      overtime:         acc.overtime + r.overtime,
      cpDays:           acc.cpDays + r.cpDays,
      rttDays:          acc.rttDays + r.rttDays,
      sickDays:         acc.sickDays + r.sickDays,
      otherAbsenceDays: acc.otherAbsenceDays + r.otherAbsenceDays,
      mealVouchersCount:acc.mealVouchersCount + r.mealVouchersCount,
      bonuses:          acc.bonuses + r.bonuses,
      expenses:         acc.expenses + r.expenses,
      absenceDays:      acc.absenceDays + r.cpDays + r.rttDays + r.sickDays + r.otherAbsenceDays,
      totalGross:       acc.totalGross + r.totalGross,
    }), { baseSalary:0, workedDays:0, workedHours:0, overtime:0, cpDays:0, rttDays:0, sickDays:0, otherAbsenceDays:0, mealVouchersCount:0, bonuses:0, expenses:0, absenceDays:0, totalGross:0 });
  }

  function kpi(label, value, color) {
    return `<div class="card p-4"><div class="text-xs uppercase text-slate-500 font-semibold">${label}</div><div class="mt-1 text-2xl font-bold ${color}">${value}</div></div>`;
  }

  function exportCsv(rows) {
    const headers = ['Matricule','Prénom','Nom','Code société','Société','SIRET','IBAN','Salaire base','Jours travaillés','Heures travail.','Heures supp.','CP','RTT','Maladie','Autres absences','Tickets repas','Primes','Frais','Brut total'];
    const data = rows.map(r => [r.matricule, r.firstName, r.lastName, r.companyCode, r.companyName, r.siret, r.iban, r.baseSalary, r.workedDays, r.workedHours.toFixed(1), r.overtime.toFixed(1), r.cpDays, r.rttDays, r.sickDays, r.otherAbsenceDays, r.mealVouchersCount, r.bonuses.toFixed(2), r.expenses.toFixed(2), r.totalGross.toFixed(2)]);
    U.downloadFile(`variables-paie-${month}.csv`, U.csvFromRows(headers, data), 'text/csv;charset=utf-8');
    U.toast('CSV téléchargé', 'success');
  }

  function exportSilae(rows) {
    // Format minimal compatible Silae (matricule;rubrique;valeur)
    const lines = ['Matricule;Rubrique;Valeur'];
    rows.forEach(r => {
      lines.push(`${r.matricule};SALAIRE_BASE;${r.baseSalary.toFixed(2)}`);
      lines.push(`${r.matricule};HEURES_SUP;${r.overtime.toFixed(2)}`);
      lines.push(`${r.matricule};CP_PRIS;${r.cpDays}`);
      lines.push(`${r.matricule};RTT_PRIS;${r.rttDays}`);
      lines.push(`${r.matricule};MALADIE;${r.sickDays}`);
      lines.push(`${r.matricule};TICKETS_REPAS;${r.mealVouchersCount}`);
      if (r.bonuses)  lines.push(`${r.matricule};PRIME;${r.bonuses.toFixed(2)}`);
      if (r.expenses) lines.push(`${r.matricule};REMB_FRAIS;${r.expenses.toFixed(2)}`);
    });
    U.downloadFile(`silae-${month}.txt`, lines.join('\n'), 'text/plain;charset=utf-8');
    U.toast('Export Silae téléchargé', 'success');
  }

  return { render };
})();
