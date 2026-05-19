/* Public pre-boarding form — accessed via shared link without login */
window.PreboardingView = (function () {
  function render(host, { args } = { args: [] }) {
    const token = args && args[0];
    const process = Store.where('hireProcesses', p => p.token === token)[0];

    if (!process) {
      host.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
          <div class="card p-8 max-w-md text-center">
            <h1 class="text-2xl font-bold text-red-600 mb-2">Lien invalide</h1>
            <p class="text-slate-600">Ce lien de pré-embauche n'existe pas ou a expiré. Contactez votre RH.</p>
          </div>
        </div>
      `;
      return;
    }

    if (process.status === 'soumis' || process.status === 'valide') {
      host.innerHTML = renderSuccess(process);
      return;
    }

    const co = Store.find('companies', process.companyId);
    const draft = process.draftData || {};

    host.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 py-8 px-4">
        <div class="max-w-3xl mx-auto">
          <!-- Header -->
          <div class="bg-white rounded-t-2xl p-6 shadow-lg">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-xl">PN</div>
              <div>
                <div class="text-sm text-slate-500">Paris Nord Groupe — Pré-embauche</div>
                <h1 class="text-2xl font-bold text-slate-900">Bienvenue${process.firstName ? ', ' + U.escapeHtml(process.firstName) : ''} !</h1>
                <p class="text-sm text-slate-600">Vous allez rejoindre <strong>${co ? U.escapeHtml(co.name) : ''}</strong> en tant que <strong>${U.escapeHtml(process.jobTitle||'')}</strong>.</p>
              </div>
            </div>
          </div>

          <!-- Stepper -->
          <div class="bg-slate-50 px-6 py-4 flex items-center justify-between text-xs border-x border-slate-200">
            ${['Identité','Coordonnées','Famille','Bancaire','Pièces','Confirmation'].map((s, i) => `
              <div class="flex items-center gap-2 ${i===0?'text-brand-700 font-semibold':'text-slate-400'}">
                <div class="w-7 h-7 rounded-full flex items-center justify-center ${i===0?'bg-brand-700 text-white':'bg-slate-200'} font-bold">${i+1}</div>
                <span class="hidden md:inline">${s}</span>
              </div>
              ${i < 5 ? '<div class="flex-1 h-px bg-slate-200 mx-2"></div>' : ''}
            `).join('')}
          </div>

          <!-- Form -->
          <form id="pre-form" class="bg-white rounded-b-2xl p-6 shadow-lg space-y-6">

            <fieldset>
              <legend class="text-lg font-bold mb-4">1. Identité</legend>
              <div class="grid md:grid-cols-2 gap-4">
                <div><label class="label">Civilité</label>
                  <select class="select" name="civility" required>
                    <option value="Mme" ${draft.civility==='Mme'?'selected':''}>Madame</option>
                    <option value="M." ${draft.civility==='M.'?'selected':''}>Monsieur</option>
                  </select>
                </div>
                <div><label class="label">Nationalité</label><input class="input" name="nationality" value="${U.escapeHtml(draft.nationality||'Française')}" required/></div>
                <div><label class="label">Prénom</label><input class="input" name="firstName" value="${U.escapeHtml(process.firstName||draft.firstName||'')}" required/></div>
                <div><label class="label">Nom</label><input class="input" name="lastName" value="${U.escapeHtml(process.lastName||draft.lastName||'')}" required/></div>
                <div><label class="label">Nom de jeune fille</label><input class="input" name="maidenName" value="${U.escapeHtml(draft.maidenName||'')}"/></div>
                <div><label class="label">Date de naissance</label><input type="date" class="input" name="birthDate" value="${draft.birthDate||''}" required/></div>
                <div><label class="label">Lieu de naissance (ville)</label><input class="input" name="birthPlace" value="${U.escapeHtml(draft.birthPlace||'')}" required/></div>
                <div><label class="label">Pays de naissance</label><input class="input" name="birthCountry" value="${U.escapeHtml(draft.birthCountry||'France')}" required/></div>
                <div class="md:col-span-2"><label class="label">N° de Sécurité Sociale (15 chiffres)</label>
                  <input class="input font-mono" name="socialSecurity" value="${U.escapeHtml(draft.socialSecurity||'')}" pattern="[12][0-9]{14}" placeholder="1 85 03 75 110 123 45" required/>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-lg font-bold mb-4">2. Coordonnées</legend>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="md:col-span-2"><label class="label">Adresse complète</label><input class="input" name="address" value="${U.escapeHtml(draft.address||'')}" required/></div>
                <div><label class="label">Code postal</label><input class="input" name="postalCode" value="${U.escapeHtml(draft.postalCode||'')}" required/></div>
                <div><label class="label">Ville</label><input class="input" name="city" value="${U.escapeHtml(draft.city||'')}" required/></div>
                <div><label class="label">Email personnel</label><input type="email" class="input" name="personalEmail" value="${U.escapeHtml(process.email||draft.personalEmail||'')}" required/></div>
                <div><label class="label">Téléphone</label><input type="tel" class="input" name="phone" value="${U.escapeHtml(draft.phone||'')}" required/></div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-lg font-bold mb-4">3. Situation familiale</legend>
              <div class="grid md:grid-cols-2 gap-4">
                <div><label class="label">Situation</label>
                  <select class="select" name="familySituation" required>
                    <option value="celibataire" ${draft.familySituation==='celibataire'?'selected':''}>Célibataire</option>
                    <option value="marie" ${draft.familySituation==='marie'?'selected':''}>Marié(e)</option>
                    <option value="pacs" ${draft.familySituation==='pacs'?'selected':''}>Pacsé(e)</option>
                    <option value="divorce" ${draft.familySituation==='divorce'?'selected':''}>Divorcé(e)</option>
                    <option value="veuf" ${draft.familySituation==='veuf'?'selected':''}>Veuf/Veuve</option>
                  </select>
                </div>
                <div><label class="label">Nombre d'enfants</label><input type="number" min="0" class="input" name="numChildren" value="${draft.numChildren||0}"/></div>
                <div><label class="label">Contact d'urgence (nom)</label><input class="input" name="emergencyName" value="${U.escapeHtml(draft.emergencyName||'')}" required/></div>
                <div><label class="label">Contact d'urgence (tél)</label><input class="input" name="emergencyPhone" value="${U.escapeHtml(draft.emergencyPhone||'')}" required/></div>
                <div>
                  <label class="flex items-center gap-2 mt-6">
                    <input type="checkbox" name="rqth" ${draft.rqth?'checked':''}/>
                    <span class="text-sm">Bénéficiaire de la RQTH</span>
                  </label>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-lg font-bold mb-4">4. Coordonnées bancaires</legend>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="md:col-span-2"><label class="label">IBAN</label><input class="input font-mono" name="iban" value="${U.escapeHtml(draft.iban||'')}" placeholder="FR76 ..." required/></div>
                <div><label class="label">BIC</label><input class="input font-mono" name="bic" value="${U.escapeHtml(draft.bic||'')}" placeholder="BNPAFRPP"/></div>
                <div><label class="label">Banque</label><input class="input" name="bankName" value="${U.escapeHtml(draft.bankName||'')}"/></div>
                <div><label class="label">Taux de prélèvement à la source (%)</label><input type="number" step="0.1" class="input" name="taxRate" value="${draft.taxRate||0}"/></div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-lg font-bold mb-4">5. Pièces justificatives</legend>
              <p class="text-sm text-slate-500 mb-4">Glissez vos documents (PDF, JPG, PNG, max 5 Mo chacun) :</p>
              <div class="grid md:grid-cols-2 gap-4">
                ${docField('cv', 'CV', draft)}
                ${docField('id_card', 'Pièce d\'identité (recto-verso)', draft)}
                ${docField('vital_card', 'Carte vitale', draft)}
                ${docField('rib', 'RIB', draft)}
                ${docField('diploma', 'Diplôme(s)', draft)}
                ${docField('residence_proof', 'Justificatif de domicile (- 3 mois)', draft)}
                ${docField('mutuelle', 'Attestation mutuelle actuelle (optionnel)', draft)}
                ${docField('photo', 'Photo d\'identité', draft)}
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-lg font-bold mb-4">6. Confirmation</legend>
              <div class="space-y-3 text-sm">
                <label class="flex items-start gap-2">
                  <input type="checkbox" name="certifyTruth" required class="mt-1"/>
                  <span>Je certifie sur l'honneur l'exactitude des informations communiquées et des pièces fournies.</span>
                </label>
                <label class="flex items-start gap-2">
                  <input type="checkbox" name="acceptRgpd" required class="mt-1"/>
                  <span>J'accepte le traitement de mes données personnelles conformément au RGPD et à la politique de confidentialité de Paris Nord Groupe.</span>
                </label>
              </div>
            </fieldset>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn btn-secondary" data-save-draft>Enregistrer le brouillon</button>
              <button type="submit" class="btn btn-primary flex-1">Soumettre mon dossier ➜</button>
            </div>
          </form>

          <div class="text-center mt-6 text-xs text-brand-200">© ${new Date().getFullYear()} Paris Nord Groupe — Vos données sont chiffrées et protégées (RGPD)</div>
        </div>
      </div>
    `;
    bind(process);
  }

  function docField(key, label, draft) {
    const doc = (draft.docs || []).find(d => d.key === key);
    return `
      <label class="border border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-brand-500 hover:bg-brand-50 block">
        <div class="text-xs uppercase font-semibold text-slate-500 mb-1">${U.escapeHtml(label)}</div>
        ${doc ? `<div class="text-sm text-emerald-700">✓ ${U.escapeHtml(doc.filename)}</div>` : '<div class="text-sm text-slate-400">Cliquer pour téléverser</div>'}
        <input type="file" class="hidden" data-doc-key="${key}" accept=".pdf,.jpg,.jpeg,.png"/>
      </label>
    `;
  }

  function bind(process) {
    document.querySelectorAll('[data-doc-key]').forEach(input => {
      input.onchange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { U.toast('Fichier trop volumineux (5 Mo max)', 'warn'); return; }
        const draft = process.draftData || {};
        draft.docs = (draft.docs || []).filter(d => d.key !== input.dataset.docKey);
        draft.docs.push({ key: input.dataset.docKey, filename: f.name, size: f.size, uploadedAt: new Date().toISOString() });
        Store.update('hireProcesses', process.id, { draftData: draft });
        const labelEl = input.closest('label').querySelector('div:nth-child(2)');
        labelEl.className = 'text-sm text-emerald-700';
        labelEl.textContent = '✓ ' + f.name;
        U.toast('Document téléversé', 'success');
      };
    });

    document.querySelector('[data-save-draft]').onclick = () => {
      const d = collectFormData();
      Store.update('hireProcesses', process.id, { draftData: { ...(process.draftData||{}), ...d } });
      U.toast('Brouillon enregistré', 'success');
    };

    document.getElementById('pre-form').onsubmit = (e) => {
      e.preventDefault();
      const d = collectFormData();
      const docs = (process.draftData?.docs) || [];
      const required = ['cv', 'id_card', 'vital_card', 'rib', 'residence_proof'];
      const missing = required.filter(k => !docs.find(x => x.key === k));
      if (missing.length) {
        U.toast(`Pièces manquantes : ${missing.join(', ')}`, 'warn');
        return;
      }
      Store.update('hireProcesses', process.id, {
        draftData: { ...(process.draftData||{}), ...d },
        status: 'soumis',
        submittedAt: new Date().toISOString(),
      });
      Store.insert('notifications', {
        id: U.uid('nt'),
        userId: process.assignedTo || 'emp_002',
        type: 'hire',
        title: 'Dossier de pré-embauche soumis',
        body: `${d.firstName} ${d.lastName} a soumis son dossier.`,
        date: new Date().toISOString(),
        read: false,
        link: '#/embauche',
      });
      render(document.getElementById('app'), { args: [process.token] });
    };
  }

  function collectFormData() {
    const f = document.getElementById('pre-form');
    const fd = new FormData(f);
    const d = Object.fromEntries(fd.entries());
    d.rqth = fd.get('rqth') === 'on';
    d.numChildren = parseInt(d.numChildren, 10) || 0;
    d.taxRate = parseFloat(d.taxRate) || 0;
    return d;
  }

  function renderSuccess(process) {
    return `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-4">
        <div class="card p-8 max-w-md text-center">
          <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mb-4">✓</div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Dossier soumis !</h1>
          <p class="text-slate-600 mb-4">Votre dossier de pré-embauche a bien été reçu. Le service RH va l'étudier et vous reviendra rapidement avec votre contrat de travail.</p>
          <div class="text-sm bg-slate-50 rounded p-3 text-left">
            <div><strong>Référence :</strong> ${process.id}</div>
            <div><strong>Soumis le :</strong> ${U.fmtDate(process.submittedAt)}</div>
          </div>
          <p class="text-xs text-slate-500 mt-6">Vous pouvez fermer cette page. Vous recevrez un email à ${U.escapeHtml(process.email||'')} pour la suite.</p>
        </div>
      </div>
    `;
  }

  return { render };
})();
