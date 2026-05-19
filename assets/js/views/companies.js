/* Companies / entities */
window.CompaniesView = (function () {
  let filters = { search: '', type: '' };

  function render(host) {
    const companies = Store.get('companies');
    const employees = Store.get('employees');
    const filtered = companies.filter(c => {
      if (filters.type && c.type !== filters.type) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return [c.code, c.name, c.siret, c.siren, c.address, c.rep].some(v => (v||'').toLowerCase().includes(q));
      }
      return true;
    });

    const grouped = {};
    filtered.forEach(c => { (grouped[c.code] = grouped[c.code] || []).push(c); });

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Sociétés & établissements</h1>
            <p class="text-slate-500 text-sm">${filtered.length} entité(s) sur ${companies.length}, ${new Set(companies.map(c=>c.code)).size} sociétés</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" data-export>${U.icons.download} Exporter CSV</button>
            <button class="btn btn-primary" data-new>${U.icons.plus} Nouvelle entité</button>
          </div>
        </div>

        <div class="card p-4 flex flex-wrap gap-3 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="label">Recherche</label>
            <input id="c-search" class="input" placeholder="Code, nom, SIRET, dirigeant…" value="${U.escapeHtml(filters.search)}"/>
          </div>
          <div>
            <label class="label">Type</label>
            <select id="c-type" class="select min-w-[160px]">
              <option value="">Tous</option>
              <option value="SIEGE" ${filters.type==='SIEGE'?'selected':''}>Siège</option>
              <option value="ETS"   ${filters.type==='ETS'  ?'selected':''}>Établissement</option>
            </select>
          </div>
        </div>

        <div class="space-y-3">
          ${Object.entries(grouped).map(([code, list]) => {
            const emps = employees.filter(e => list.some(l => l.id === e.companyId));
            return `
              <div class="card overflow-hidden">
                <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">${U.escapeHtml(code.slice(0,3))}</span>
                    <div>
                      <div class="font-semibold">${U.escapeHtml(code)} — ${U.escapeHtml(list[0].name)}</div>
                      <div class="text-xs text-slate-500">SIREN ${U.escapeHtml(list[0].siren||'—')} • ${list.length} entité(s) • ${emps.length} collaborateur(s)</div>
                    </div>
                  </div>
                </div>
                <table class="table">
                  <thead><tr><th>Type</th><th>Nom</th><th>SIRET</th><th>Représentant</th><th>Adresse</th><th></th></tr></thead>
                  <tbody>
                    ${list.map(c => `
                      <tr>
                        <td><span class="badge ${c.type==='SIEGE'?'badge-purple':'badge-blue'}">${U.escapeHtml(c.type||'')}</span></td>
                        <td class="text-sm">${U.escapeHtml(c.name)}</td>
                        <td class="text-sm font-mono">${U.escapeHtml(c.siret||'—')}</td>
                        <td class="text-sm">${U.escapeHtml(c.rep||'—')}</td>
                        <td class="text-sm text-slate-600">${U.escapeHtml(c.address||'—')}</td>
                        <td><div class="flex gap-1 justify-end">
                          <button class="btn-icon" data-edit="${c.id}">${U.icons.edit}</button>
                          <button class="btn-icon text-red-600" data-del="${c.id}">${U.icons.trash}</button>
                        </div></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    bind();
  }

  function bind() {
    const search = document.getElementById('c-search');
    search.addEventListener('input', U.debounce(() => { filters.search = search.value; render(document.getElementById('main-content')); }, 200));
    document.getElementById('c-type').onchange = (e) => { filters.type = e.target.value; render(document.getElementById('main-content')); };
    document.querySelector('[data-new]').onclick = () => openForm();
    document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openForm(b.dataset.edit));
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer cette entité ?', { danger: true });
      if (!ok) return; Store.remove('companies', b.dataset.del); U.toast('Entité supprimée','success'); render(document.getElementById('main-content'));
    });
    document.querySelector('[data-export]').onclick = () => {
      const rows = Store.get('companies').map(c => [c.code, c.name, c.type, c.siren, c.siret, c.rep, c.address]);
      U.downloadFile('societes.csv', U.csvFromRows(['Code','Nom','Type','SIREN','SIRET','Représentant','Adresse'], rows), 'text/csv;charset=utf-8');
      U.toast('Export CSV téléchargé', 'success');
    };
  }

  function openForm(id) {
    const c = id ? { ...Store.find('companies', id) } : { code:'', name:'', type:'SIEGE', siren:'', siret:'', rep:'', address:'', active:true, conventionCode:'IDCC_3249', medicalProvider:{}, healthInsurance:{}, providentInsurance:{}, pensionFund:{}, workInjuryFund:{}, apprenticeshipTax:{} };
    c.medicalProvider = c.medicalProvider || {};
    c.healthInsurance = c.healthInsurance || {};
    c.providentInsurance = c.providentInsurance || {};
    c.pensionFund = c.pensionFund || {};
    c.workInjuryFund = c.workInjuryFund || {};
    c.apprenticeshipTax = c.apprenticeshipTax || {};
    const conventions = (window.CONVENTIONS || []);
    U.modal({
      title: id ? 'Modifier l\'entité' : 'Nouvelle entité',
      size: 'max-w-4xl',
      body: `
        <form id="co-form" class="space-y-5">
          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Identité</legend>
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="label">Code</label><input class="input" name="code" value="${U.escapeHtml(c.code)}" required/></div>
              <div><label class="label">Type</label><select class="select" name="type">
                <option value="SIEGE" ${c.type==='SIEGE'?'selected':''}>Siège</option>
                <option value="ETS" ${c.type==='ETS'?'selected':''}>Établissement</option>
              </select></div>
              <div class="md:col-span-2"><label class="label">Nom</label><input class="input" name="name" value="${U.escapeHtml(c.name)}" required/></div>
              <div><label class="label">SIREN</label><input class="input" name="siren" value="${U.escapeHtml(c.siren||'')}"/></div>
              <div><label class="label">SIRET</label><input class="input" name="siret" value="${U.escapeHtml(c.siret||'')}"/></div>
              <div class="md:col-span-2"><label class="label">Représentant légal</label><input class="input" name="rep" value="${U.escapeHtml(c.rep||'')}"/></div>
              <div class="md:col-span-2"><label class="label">Adresse</label><input class="input" name="address" value="${U.escapeHtml(c.address||'')}"/></div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Convention collective applicable</legend>
            <div>
              <select class="select" name="conventionCode" required>
                ${conventions.map(cv => `<option value="${cv.code}" ${c.conventionCode===cv.code?'selected':''}>${U.escapeHtml(cv.name)} (IDCC ${cv.code.replace('IDCC_','')})</option>`).join('')}
              </select>
              <p class="text-xs text-slate-500 mt-1">La convention détermine automatiquement la période d'essai, les congés conventionnels, le préavis, les minima salariaux.</p>
            </div>
          </fieldset>

          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Visite médicale / Santé au travail</legend>
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="label">Nom de l'organisme (SST)</label><input class="input" name="medical_name" value="${U.escapeHtml(c.medicalProvider.name||'')}" placeholder="Ex. ACMS, ASTE…"/></div>
              <div><label class="label">Téléphone</label><input class="input" name="medical_phone" value="${U.escapeHtml(c.medicalProvider.phone||'')}"/></div>
              <div class="md:col-span-2"><label class="label">Adresse</label><input class="input" name="medical_address" value="${U.escapeHtml(c.medicalProvider.address||'')}"/></div>
              <div class="md:col-span-2"><label class="label">Email de contact</label><input type="email" class="input" name="medical_email" value="${U.escapeHtml(c.medicalProvider.email||'')}"/></div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Mutuelle santé (obligatoire)</legend>
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="label">Nom de la mutuelle</label><input class="input" name="health_name" value="${U.escapeHtml(c.healthInsurance.name||'')}" placeholder="Ex. Harmonie Mutuelle, AG2R…"/></div>
              <div><label class="label">N° de contrat</label><input class="input" name="health_contract" value="${U.escapeHtml(c.healthInsurance.contractNumber||'')}"/></div>
              <div><label class="label">Téléphone</label><input class="input" name="health_phone" value="${U.escapeHtml(c.healthInsurance.phone||'')}"/></div>
              <div><label class="label">Part employeur (%)</label><input type="number" min="50" max="100" class="input" name="health_share" value="${c.healthInsurance.shareEmployer||50}"/></div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Prévoyance</legend>
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="label">Nom de l'organisme</label><input class="input" name="provident_name" value="${U.escapeHtml(c.providentInsurance.name||'')}"/></div>
              <div><label class="label">N° de contrat</label><input class="input" name="provident_contract" value="${U.escapeHtml(c.providentInsurance.contractNumber||'')}"/></div>
              <div class="md:col-span-2"><label class="label">Téléphone</label><input class="input" name="provident_phone" value="${U.escapeHtml(c.providentInsurance.phone||'')}"/></div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Caisse de retraite complémentaire</legend>
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="label">Nom de la caisse</label><input class="input" name="pension_name" value="${U.escapeHtml(c.pensionFund.name||'AG2R LA MONDIALE')}"/></div>
              <div><label class="label">Code adhérent</label><input class="input" name="pension_code" value="${U.escapeHtml(c.pensionFund.code||'')}"/></div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="font-semibold text-sm uppercase text-slate-600 mb-3">Autres organismes</legend>
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="label">CPAM / AT-MP — Caisse</label><input class="input" name="workinjury_name" value="${U.escapeHtml(c.workInjuryFund.name||'CPAM')}"/></div>
              <div><label class="label">Taux AT-MP (%)</label><input type="number" step="0.01" class="input" name="workinjury_rate" value="${c.workInjuryFund.rate||1.20}"/></div>
              <div><label class="label">Taxe apprentissage — collecteur</label><input class="input" name="apprenticeship_collector" value="${U.escapeHtml(c.apprenticeshipTax.collector||'')}"/></div>
              <div><label class="label">Représentant CSE</label><input class="input" name="cseRepresentative" value="${U.escapeHtml(c.cseRepresentative||'')}"/></div>
              <div class="md:col-span-2"><label class="label">Référent sécurité</label><input class="input" name="safetyOfficer" value="${U.escapeHtml(c.safetyOfficer||'')}"/></div>
            </div>
          </fieldset>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#co-form');
          if (!f.reportValidity()) return;
          const raw = Object.fromEntries(new FormData(f).entries());
          // Regroup nested fields
          const d = {
            code: raw.code, name: raw.name, type: raw.type,
            siren: raw.siren, siret: raw.siret, rep: raw.rep, address: raw.address,
            conventionCode: raw.conventionCode,
            medicalProvider: { name: raw.medical_name, address: raw.medical_address, phone: raw.medical_phone, email: raw.medical_email },
            healthInsurance: { name: raw.health_name, contractNumber: raw.health_contract, phone: raw.health_phone, shareEmployer: +raw.health_share || 50 },
            providentInsurance: { name: raw.provident_name, contractNumber: raw.provident_contract, phone: raw.provident_phone },
            pensionFund: { name: raw.pension_name, code: raw.pension_code },
            workInjuryFund: { name: raw.workinjury_name, rate: +raw.workinjury_rate || 1.20 },
            apprenticeshipTax: { collector: raw.apprenticeship_collector, rate: 0.68 },
            cseRepresentative: raw.cseRepresentative,
            safetyOfficer: raw.safetyOfficer,
          };
          if (id) Store.update('companies', id, d);
          else Store.insert('companies', { id: U.uid('co'), active:true, ...d });
          U.toast('Entité enregistrée','success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  return { render };
})();
