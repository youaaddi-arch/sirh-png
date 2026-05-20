/* Workflow embauche — RH crée un dossier, envoie le lien, valide les pièces, génère le contrat */
window.HiringView = (function () {
  function render(host) {
    const list = Store.get('hireProcesses').slice().sort((a, b) => (b.createdAt||'').localeCompare(a.createdAt||''));

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Embauches en cours</h1>
            <p class="text-slate-500 text-sm">Processus de recrutement : pré-embauche, validation, contrat, accueil.</p>
          </div>
          <button class="btn btn-primary" data-new>${U.icons.plus} Démarrer une embauche</button>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          ${kpi('Total', list.length, 'text-brand-700')}
          ${kpi('Pré-embauche', list.filter(p => p.status === 'pre_embauche').length, 'text-amber-700')}
          ${kpi('Soumis', list.filter(p => p.status === 'soumis').length, 'text-blue-700')}
          ${kpi('Validés', list.filter(p => p.status === 'valide').length, 'text-emerald-700')}
          ${kpi('Embauchés', list.filter(p => p.status === 'embauche').length, 'text-purple-700')}
        </div>

        <div class="card overflow-hidden">
          <table class="table">
            <thead><tr>
              <th>Candidat</th><th>Poste</th><th>Société</th><th>Démarré le</th><th>Statut</th><th>Étape</th><th></th>
            </tr></thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="7" class="text-center py-10 text-slate-400">Aucune embauche en cours</td></tr>' :
                list.map(p => {
                  const co = Store.find('companies', p.companyId);
                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          ${U.avatar(`${p.firstName} ${p.lastName}`, 32)}
                          <div>
                            <div class="font-medium">${U.escapeHtml(p.firstName||'')} ${U.escapeHtml(p.lastName||'')}</div>
                            <div class="text-xs text-slate-500">${U.escapeHtml(p.email||'')}</div>
                          </div>
                        </div>
                      </td>
                      <td class="text-sm">${U.escapeHtml(p.jobTitle||'')}</td>
                      <td>${co ? `<span class="badge badge-blue">${U.escapeHtml(co.code)}</span>` : '—'}</td>
                      <td class="text-sm text-slate-500">${U.fmtDate(p.createdAt)}</td>
                      <td>${statusBadge(p.status)}</td>
                      <td class="text-xs">${stepLabel(p.status)}</td>
                      <td>
                        <div class="flex gap-1 justify-end">
                          <button class="btn-icon" data-view="${p.id}" title="Voir / gérer">${U.icons.eye}</button>
                          <button class="btn-icon" data-link="${p.id}" title="Copier le lien candidat">🔗</button>
                          <button class="btn-icon text-red-600" data-del="${p.id}">${U.icons.trash}</button>
                        </div>
                      </td>
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
    document.querySelector('[data-new]').onclick = () => openNew();
    document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openDetail(b.dataset.view));
    document.querySelectorAll('[data-link]').forEach(b => b.onclick = () => copyLink(b.dataset.link));
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce dossier d\'embauche ?', { danger: true });
      if (!ok) return; Store.remove('hireProcesses', b.dataset.del);
      U.toast('Dossier supprimé', 'success'); render(document.getElementById('main-content'));
    });
  }

  function openNew() {
    const companies = Store.get('companies');
    const employees = Store.get('employees');
    U.modal({
      title: 'Démarrer une embauche',
      size: 'max-w-3xl',
      body: `
        <form id="hire-form" class="grid md:grid-cols-2 gap-4">
          <div><label class="label">Prénom</label><input class="input" name="firstName" required/></div>
          <div><label class="label">Nom</label><input class="input" name="lastName" required/></div>
          <div class="md:col-span-2"><label class="label">Email du candidat (lien envoyé ici)</label><input type="email" class="input" name="email" required/></div>
          <div><label class="label">Société d'affectation</label>
            <select class="select" name="companyId" required>
              ${companies.map(c => `<option value="${c.id}">${U.escapeHtml(c.code+' — '+c.name)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Poste</label><input class="input" name="jobTitle" required/></div>
          <div><label class="label">Type de contrat</label>
            <select class="select" name="contractType">
              <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Alternance">Alternance</option><option value="Stage">Stage</option>
            </select>
          </div>
          <div><label class="label">Statut</label>
            <select class="select" name="status">
              <option value="Employé">Employé</option>
              <option value="Agent de maîtrise">Agent de maîtrise</option>
              <option value="Cadre">Cadre</option>
            </select>
          </div>
          <div><label class="label">Salaire brut mensuel (€)</label><input type="number" class="input" name="grossSalary" required/></div>
          <div><label class="label">Date de démarrage prévue</label><input type="date" class="input" name="startDate" value="${U.today()}" required/></div>
          <div><label class="label">Manager / responsable</label>
            <select class="select" name="managerId" required>
              <option value="">—</option>
              ${employees.map(e => `<option value="${e.id}">${U.escapeHtml(e.firstName+' '+e.lastName)} — ${U.escapeHtml(e.jobTitle)}</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Suivi par (RH)</label>
            <select class="select" name="assignedTo">
              ${employees.filter(e => e.role === 'rh' || e.role === 'admin').map(e => `<option value="${e.id}" ${e.id===Store.currentUser().id?'selected':''}>${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
            </select>
          </div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Créer et envoyer le lien</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#hire-form');
          if (!f.reportValidity()) return;
          const fd = new FormData(f);
          const d = Object.fromEntries(fd.entries());
          d.grossSalary = parseFloat(d.grossSalary) || 0;
          const id = U.uid('hp');
          const token = Math.random().toString(36).slice(2, 14);
          Store.insert('hireProcesses', {
            id, token,
            ...d,
            status: 'pre_embauche',
            createdAt: new Date().toISOString(),
            createdBy: Store.currentUser().id,
            draftData: {},
            history: [{ at: new Date().toISOString(), by: Store.currentUser().id, action: 'Dossier créé' }],
          });
          U.toast('Embauche créée — lien candidat généré', 'success');
          close();
          render(document.getElementById('main-content'));
          // Show link
          showLinkModal(id);
        };
      }
    });
  }

  function openDetail(id) {
    const p = Store.find('hireProcesses', id);
    if (!p) return;
    const co = Store.find('companies', p.companyId);
    const draft = p.draftData || {};
    const docs = draft.docs || [];
    const conv = window.Conventions.byCode(co?.conventionCode || 'IDCC_3249');
    const trialDays = window.Conventions.trialPeriodDays(co?.conventionCode || 'IDCC_3249', p.contractType, p.status);
    const cpAnnual = window.Conventions.annualLeaveDays(co?.conventionCode || 'IDCC_3249', 0);

    U.modal({
      title: `Dossier — ${p.firstName} ${p.lastName}`,
      size: 'max-w-4xl',
      body: `
        <div class="space-y-4">
          <div class="grid md:grid-cols-3 gap-3 text-sm">
            <div class="bg-slate-50 rounded p-3">
              <div class="text-xs uppercase text-slate-500 font-semibold">Statut</div>
              <div>${statusBadge(p.status)}</div>
            </div>
            <div class="bg-slate-50 rounded p-3">
              <div class="text-xs uppercase text-slate-500 font-semibold">Période d'essai (auto)</div>
              <div class="font-semibold">${trialDays} jours</div>
              <div class="text-xs text-slate-500">${conv?.name||''}</div>
            </div>
            <div class="bg-slate-50 rounded p-3">
              <div class="text-xs uppercase text-slate-500 font-semibold">Congés annuels (auto)</div>
              <div class="font-semibold">${cpAnnual} jours</div>
            </div>
          </div>

          <div class="card p-4">
            <h3 class="font-semibold mb-3">Pièces fournies par le candidat</h3>
            ${docs.length === 0 ? '<p class="text-sm text-slate-500">Le candidat n\'a encore rien soumis.</p>' :
              `<div class="grid md:grid-cols-2 gap-2">
                ${docs.map(d => `
                  <div class="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                    <div>📄 <strong>${docLabel(d.key)}</strong> — ${U.escapeHtml(d.filename)} <span class="text-xs text-slate-500">(${(d.size/1024).toFixed(0)} Ko)</span></div>
                    <button class="text-xs text-brand-600 hover:underline">Voir</button>
                  </div>
                `).join('')}
              </div>`
            }
          </div>

          <div class="card p-4">
            <h3 class="font-semibold mb-3">Saisie / Pré-saisie de la fiche</h3>
            <p class="text-xs text-slate-500 mb-3">Vous pouvez soit utiliser les infos remplies par le candidat (Pré-saisir depuis le dossier), soit saisir manuellement.</p>
            <div class="flex gap-2">
              <button class="btn btn-primary btn-sm" data-presaisir>Pré-saisir depuis le dossier candidat</button>
              <button class="btn btn-secondary btn-sm" data-saisie-manuelle>Saisie manuelle</button>
            </div>
            ${draft.firstName ? `
              <div class="mt-3 text-xs grid md:grid-cols-3 gap-1 text-slate-700">
                <div><strong>Identité :</strong> ${U.escapeHtml(draft.civility||'')} ${U.escapeHtml(draft.firstName)} ${U.escapeHtml(draft.lastName)}</div>
                <div><strong>Né(e) :</strong> ${U.fmtDate(draft.birthDate)} à ${U.escapeHtml(draft.birthPlace||'')}</div>
                <div><strong>Sécu :</strong> ${U.escapeHtml(draft.socialSecurity||'')}</div>
                <div><strong>Adresse :</strong> ${U.escapeHtml(draft.address||'')} ${U.escapeHtml(draft.postalCode||'')} ${U.escapeHtml(draft.city||'')}</div>
                <div><strong>IBAN :</strong> ${U.escapeHtml(draft.iban||'')}</div>
                <div><strong>Tél :</strong> ${U.escapeHtml(draft.phone||'')}</div>
              </div>
            ` : ''}
          </div>

          <div class="card p-4">
            <h3 class="font-semibold mb-3">Workflow</h3>
            <div class="space-y-2">
              ${workflowStep(p, 'pre_embauche', '1. Pré-embauche envoyée', `Lien partagé : <code class="text-xs">${preboardingUrl(p.token)}</code>`)}
              ${workflowStep(p, 'soumis', '2. Dossier candidat soumis', draft.firstName ? 'Le candidat a soumis ses infos et pièces.' : 'En attente.')}
              ${workflowStep(p, 'valide', '3. Pièces validées par RH', '')}
              ${workflowStep(p, 'contrat_genere', '4. Contrat généré', '')}
              ${workflowStep(p, 'contrat_signe', '5. Contrat signé (e-signature)', '')}
              ${workflowStep(p, 'embauche', '6. Salarié créé et accueilli', '')}
            </div>
            <div class="flex gap-2 mt-4 flex-wrap">
              ${p.status === 'soumis' ? `<button class="btn btn-primary btn-sm" data-action="valide">Valider les pièces</button>` : ''}
              ${p.status === 'valide' ? `<button class="btn btn-primary btn-sm" data-action="contrat_genere">Générer le contrat</button>` : ''}
              ${p.status === 'contrat_genere' ? `<button class="btn btn-primary btn-sm" data-action="contrat_signe">Marquer comme signé</button>` : ''}
              ${p.status === 'contrat_signe' ? `<button class="btn btn-success btn-sm" data-action="embauche">Créer le salarié et finaliser</button>` : ''}
            </div>
          </div>
        </div>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Fermer</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-presaisir]')?.addEventListener('click', () => {
          if (!draft.firstName) { U.toast('Aucune donnée candidate disponible', 'warn'); return; }
          U.toast('Données pré-remplies dans le formulaire de saisie', 'success');
        });
        root.querySelector('[data-saisie-manuelle]')?.addEventListener('click', () => {
          U.toast('Vous pouvez saisir manuellement depuis Collaborateurs > Nouveau', 'info');
        });
        root.querySelectorAll('[data-action]').forEach(b => b.onclick = () => advance(p, b.dataset.action, close));
      }
    });
  }

  function advance(p, newStatus, close) {
    const updates = { status: newStatus };
    updates.history = [...(p.history||[]), { at: new Date().toISOString(), by: Store.currentUser().id, action: stepLabel(newStatus) }];

    if (newStatus === 'contrat_genere') {
      // Generate contract letter
      const co = Store.find('companies', p.companyId);
      const trialDays = window.Conventions.trialPeriodDays(co?.conventionCode || 'IDCC_3249', p.contractType, p.status_classification || p.status);
      const cpAnnual = window.Conventions.annualLeaveDays(co?.conventionCode || 'IDCC_3249', 0);
      const draft = p.draftData || {};
      const conv = window.Conventions.byCode(co?.conventionCode || 'IDCC_3249');
      const content = `CONTRAT DE TRAVAIL ${p.contractType}

Entre les soussignés :
La société ${co?.name || ''}, ${co?.address || ''}
SIRET ${co?.siret || ''}, représentée par ${co?.rep || ''}
ci-après dénommée "l'Employeur",

Et :
${draft.civility||''} ${draft.firstName||p.firstName} ${(draft.lastName||p.lastName).toUpperCase()}
né(e) le ${U.fmtDate(draft.birthDate||'')} à ${draft.birthPlace||''}
demeurant ${draft.address||''} ${draft.postalCode||''} ${draft.city||''}
N° de Sécurité Sociale : ${draft.socialSecurity||''}
ci-après dénommé(e) "le Salarié",

Il a été convenu ce qui suit :

ARTICLE 1 — ENGAGEMENT
Le Salarié est engagé en qualité de ${p.jobTitle}, statut ${p.status}, à compter du ${U.fmtDateLong(p.startDate)}.

ARTICLE 2 — PÉRIODE D'ESSAI
Conformément à la convention collective ${conv?.name || ''} (IDCC ${conv?.code?.replace('IDCC_', '')||''}), la période d'essai est de ${trialDays} jours calendaires, soit jusqu'au ${U.fmtDateLong(addDays(p.startDate, trialDays).slice(0,10))}.
Elle pourra être renouvelée une fois, dans les conditions prévues par la convention.

ARTICLE 3 — RÉMUNÉRATION
La rémunération brute mensuelle s'élève à ${U.fmtEur(p.grossSalary||0)}, versée mensuellement.

ARTICLE 4 — DURÉE DU TRAVAIL
La durée hebdomadaire de travail est fixée à 35 heures.

ARTICLE 5 — CONGÉS PAYÉS
Le Salarié bénéficie de ${cpAnnual} jours ouvrés de congés payés annuels (selon convention collective).

ARTICLE 6 — CONVENTION COLLECTIVE
La convention collective applicable est : ${conv?.name || ''} (brochure JO n°${conv?.brochure||''}).

ARTICLE 7 — LIEU DE TRAVAIL
Le lieu de travail est : ${co?.address || ''}.

ARTICLE 8 — VISITE MÉDICALE
Le Salarié sera convoqué à une visite médicale d'embauche auprès de ${co?.medicalProvider?.name || '[organisme de santé au travail]'} dans un délai légal.

ARTICLE 9 — PROTECTION SOCIALE
Le Salarié sera affilié :
- à la mutuelle santé obligatoire ${co?.healthInsurance?.name || '[mutuelle]'} (prise en charge employeur ${co?.healthInsurance?.shareEmployer||50}%)
- à la prévoyance ${co?.providentInsurance?.name || '[prévoyance]'}
- à la caisse de retraite complémentaire ${co?.pensionFund?.name || ''}

Fait à ${(co?.address || '').split(' ').slice(-1)[0] || 'Saint-Denis'}, le ${U.fmtDateLong(new Date())}, en deux exemplaires.

Pour l'Employeur                       Pour le Salarié
(${co?.rep || ''})                     (${draft.firstName||p.firstName} ${(draft.lastName||p.lastName).toUpperCase()})`;

      Store.insert('letters', {
        id: U.uid('lt'),
        employeeId: 'pending-' + p.id,
        hireProcessId: p.id,
        type: 'contrat_travail',
        subject: `Contrat de travail — ${p.firstName} ${p.lastName}`,
        date: U.today(),
        createdBy: Store.currentUser().id,
        status: 'genere',
        content,
      });
      U.toast('Contrat généré (consultable dans Courriers RH)', 'success');
    }

    if (newStatus === 'embauche') {
      // Create the employee
      const draft = p.draftData || {};
      const empId = U.uid('emp');
      const matricule = `PNG-${String(Store.get('employees').length + 1).padStart(4, '0')}`;
      const password = Math.random().toString(36).slice(2, 10);
      Store.insert('employees', {
        id: empId, matricule,
        firstName: draft.firstName || p.firstName,
        lastName: draft.lastName || p.lastName,
        email: `${(draft.firstName||p.firstName).toLowerCase()}.${(draft.lastName||p.lastName).toLowerCase()}@pn-groupe.fr`,
        phone: draft.phone || '',
        role: 'employe',
        jobTitle: p.jobTitle,
        departmentId: 'dep_op',
        companyId: p.companyId,
        managerId: p.managerId,
        contractType: p.contractType,
        contractStart: p.startDate,
        status: 'actif',
        birthDate: draft.birthDate || '',
        birthPlace: draft.birthPlace || '',
        nationality: draft.nationality || 'Française',
        address: `${draft.address||''} ${draft.postalCode||''} ${draft.city||''}`.trim(),
        socialSecurity: draft.socialSecurity || '',
        familySituation: draft.familySituation || 'celibataire',
        numChildren: draft.numChildren || 0,
        emergencyName: draft.emergencyName || '',
        emergencyPhone: draft.emergencyPhone || '',
        rqth: draft.rqth || false,
        iban: draft.iban || '',
        bankBic: draft.bic || '',
        taxRate: draft.taxRate || 0,
        salary: p.grossSalary,
        weeklyHours: 35,
        classification: p.status,
        password,
        convention: window.Conventions.byCode((Store.find('companies', p.companyId))?.conventionCode || 'IDCC_3249')?.name || '',
      });

      // Create initial leave balances
      const co = Store.find('companies', p.companyId);
      const cpAnnual = window.Conventions.annualLeaveDays(co?.conventionCode || 'IDCC_3249', 0);
      Store.insert('leaveBalances', { id: U.uid('bal'), employeeId: empId, typeId: 'lt_cp', acquired: cpAnnual, taken: 0, pending: 0 });
      Store.insert('leaveBalances', { id: U.uid('bal'), employeeId: empId, typeId: 'lt_rt', acquired: 10, taken: 0, pending: 0 });

      // Onboarding tasks
      Store.insert('onboardings', {
        id: U.uid('ob'),
        employeeId: empId,
        startDate: p.startDate,
        status: 'en_cours',
        tasks: [
          { id: 't1', name: 'Contrat signé',                  done: true,  category: 'Administratif' },
          { id: 't2', name: 'DPAE déclarée',                  done: false, category: 'Administratif' },
          { id: 't3', name: 'Visite médicale d\'embauche',    done: false, category: 'Santé' },
          { id: 't4', name: 'Inscription mutuelle',           done: false, category: 'Santé' },
          { id: 't5', name: 'Création compte mail + matériel', done: false, category: 'IT' },
          { id: 't6', name: 'Badge d\'accès',                 done: false, category: 'IT' },
          { id: 't7', name: 'Livret d\'accueil remis',        done: false, category: 'Administratif' },
          { id: 't8', name: 'Formation sécurité au poste',    done: false, category: 'Formation' },
          { id: 't9', name: 'Entretien fin de période d\'essai', done: false, category: 'RH' },
        ],
      });

      // Notification with credentials
      Store.insert('notifications', {
        id: U.uid('nt'),
        userId: p.assignedTo || 'emp_002',
        type: 'hire',
        title: 'Embauche finalisée',
        body: `${draft.firstName||p.firstName} ${(draft.lastName||p.lastName)} créé — identifiants : email / ${password}`,
        date: new Date().toISOString(), read: false,
        link: `#/collaborateurs/${empId}`,
      });

      updates.employeeId = empId;
      U.toast(`Salarié créé — Mot de passe : ${password}`, 'success');
    }

    Store.update('hireProcesses', p.id, updates);
    if (close) close();
    render(document.getElementById('main-content'));
  }

  function copyLink(id) {
    const p = Store.find('hireProcesses', id);
    if (!p) return;
    showLinkModal(id);
  }

  function showLinkModal(id) {
    const p = Store.find('hireProcesses', id);
    const url = preboardingUrl(p.token);
    U.modal({
      title: 'Lien de pré-embauche',
      body: `
        <p class="text-sm text-slate-600 mb-3">Envoyez ce lien au candidat par email. Il pourra remplir ses infos et joindre ses pièces.</p>
        <div class="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs break-all" id="link-box">${U.escapeHtml(url)}</div>
        <div class="mt-3 text-sm text-slate-500">📧 Destinataire : <strong>${U.escapeHtml(p.email||'')}</strong></div>
      `,
      footer: `
        <button class="btn btn-secondary" data-close-modal>Fermer</button>
        <button class="btn btn-primary" data-copy>Copier le lien</button>
        <a href="${url}" target="_blank" class="btn btn-success">Ouvrir comme candidat ➜</a>
      `,
      onMount: (root, close) => {
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-copy]').onclick = () => {
          navigator.clipboard.writeText(url).then(() => U.toast('Lien copié', 'success'));
        };
      }
    });
  }

  function preboardingUrl(token) {
    return location.origin + location.pathname + '#/pre-embauche/' + token;
  }

  function statusBadge(s) {
    const m = {
      pre_embauche:     ['badge-amber', 'Lien envoyé'],
      soumis:           ['badge-blue',  'Soumis'],
      valide:           ['badge-purple','Validé'],
      contrat_genere:   ['badge-purple','Contrat généré'],
      contrat_signe:    ['badge-green', 'Contrat signé'],
      embauche:         ['badge-green', 'Embauché'],
    };
    const [cls, lbl] = m[s] || ['badge-gray', s];
    return `<span class="badge ${cls}">${lbl}</span>`;
  }
  function stepLabel(s) {
    return ({
      pre_embauche: 'En attente du candidat',
      soumis: 'À valider par RH',
      valide: 'Préparer le contrat',
      contrat_genere: 'En attente signature',
      contrat_signe: 'À finaliser',
      embauche: 'Terminé',
    })[s] || s;
  }
  function workflowStep(p, key, label, sub) {
    const order = ['pre_embauche', 'soumis', 'valide', 'contrat_genere', 'contrat_signe', 'embauche'];
    const done = order.indexOf(p.status) >= order.indexOf(key);
    const cur = p.status === key;
    return `
      <div class="flex items-start gap-3 p-2 rounded ${cur?'bg-brand-50':''}">
        <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done?'bg-emerald-500 text-white':'bg-slate-200 text-slate-500'}">${done?'✓':'•'}</div>
        <div class="flex-1">
          <div class="text-sm font-medium ${done?'text-slate-900':'text-slate-500'}">${label}</div>
          ${sub ? `<div class="text-xs text-slate-500">${sub}</div>` : ''}
        </div>
      </div>
    `;
  }
  function docLabel(key) {
    return ({
      cv: 'CV', id_card: 'Pièce d\'identité', vital_card: 'Carte vitale',
      rib: 'RIB', diploma: 'Diplôme', residence_proof: 'Justificatif domicile',
      mutuelle: 'Attestation mutuelle', photo: 'Photo',
    })[key] || key;
  }
  function kpi(label, value, color) {
    return `<div class="card p-4"><div class="text-xs uppercase text-slate-500 font-semibold">${label}</div><div class="mt-1 text-2xl font-bold ${color}">${value}</div></div>`;
  }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0,10); }

  return { render };
})();
