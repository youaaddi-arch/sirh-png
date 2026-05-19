/* HR Letters / Courriers — génération de courriers types */
window.LettersView = (function () {
  const TEMPLATES = {
    attestation_employeur: {
      label: 'Attestation employeur',
      build: (e, co, settings) => `
ATTESTATION EMPLOYEUR

Je soussigné(e), ${rep(co)}, agissant en qualité de représentant légal de la société
${co?.name || '—'} (SIRET ${co?.siret || '—'}), sise ${co?.address || '—'}, atteste que :

${e.firstName} ${e.lastName.toUpperCase()}, né(e) le ${U.fmtDate(e.birthDate||'')} ${e.birthPlace ? 'à ' + e.birthPlace : ''},
demeurant ${e.address || '—'},

est employé(e) au sein de notre société depuis le ${U.fmtDateLong(e.contractStart)},
en qualité de ${e.jobTitle}, dans le cadre d'un contrat ${e.contractType}.

Sa rémunération brute mensuelle s'élève à ${U.fmtEur(e.salary||0)}.

La présente attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

${rep(co)}
${co?.name || '—'}
`,
    },
    certificat_travail: {
      label: 'Certificat de travail',
      build: (e, co) => `
CERTIFICAT DE TRAVAIL

Nous soussignés ${co?.name || '—'}, SIRET ${co?.siret || '—'},
représentés par ${rep(co)},

certifions que ${e.firstName} ${e.lastName.toUpperCase()}, demeurant ${e.address || '—'},
a été employé(e) au sein de notre société du ${U.fmtDateLong(e.contractStart)}
${e.contractEnd ? 'au ' + U.fmtDateLong(e.contractEnd) : '— à ce jour'},
en qualité de ${e.jobTitle}, ${e.contractType}.

${e.contractEnd ? 'L\'intéressé(e) nous quitte libre de tout engagement.' : ''}

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

${rep(co)}
`,
    },
    promesse_embauche: {
      label: 'Promesse d\'embauche',
      build: (e, co) => `
PROMESSE D'EMBAUCHE

Madame, Monsieur ${e.lastName.toUpperCase()},

Suite à notre entretien, nous avons le plaisir de vous confirmer notre proposition d'embauche
au sein de notre société ${co?.name || '—'}.

- Poste : ${e.jobTitle}
- Type de contrat : ${e.contractType}
- Date de prise de poste prévue : ${U.fmtDateLong(e.contractStart)}
- Rémunération brute mensuelle : ${U.fmtEur(e.salary||0)}
- Durée hebdomadaire : ${e.weeklyHours || 35} heures
- Classification : ${e.classification || ''} - Coefficient ${e.coefficient || ''}
- Convention collective applicable : ${e.convention || 'Organismes de Formation'}

Nous vous remercions de bien vouloir nous retourner cette promesse signée
avec la mention "Lu et approuvé - Bon pour accord".

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

Pour la société,
${rep(co)}
`,
    },
    avertissement: {
      label: 'Avertissement disciplinaire',
      build: (e, co) => `
AVERTISSEMENT DISCIPLINAIRE

Madame / Monsieur ${e.lastName.toUpperCase()},

Nous avons à déplorer de votre part un comportement fautif qui nous conduit
à vous notifier, par la présente, un avertissement disciplinaire.

[À préciser : faits reprochés, dates, circonstances]

Cet avertissement constitue une sanction disciplinaire au sens du règlement
intérieur de l'entreprise.

Nous vous demandons de remédier immédiatement à cette situation. À défaut,
nous serons contraints de prendre des mesures plus sévères.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

${rep(co)}
${co?.name || '—'}
`,
    },
    felicitations: {
      label: 'Lettre de félicitations',
      build: (e, co) => `
Madame / Monsieur ${e.lastName.toUpperCase()},

Nous tenons à vous féliciter pour votre travail remarquable et votre engagement
au sein de notre société ${co?.name || '—'}.

[À préciser : motif des félicitations - performance, ancienneté, succès projet…]

Votre implication contribue grandement à la qualité et au succès de nos activités.
Nous sommes fiers de vous compter parmi nos collaborateurs.

Veuillez agréer, Madame / Monsieur, l'expression de notre considération distinguée.

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

${rep(co)}
`,
    },
    rupture_conventionnelle: {
      label: 'Rupture conventionnelle',
      build: (e, co) => `
CONVENTION DE RUPTURE CONVENTIONNELLE

Entre :
La société ${co?.name || '—'}, SIRET ${co?.siret || '—'},
représentée par ${rep(co)},
ci-après dénommée "l'Employeur",

Et :
${e.firstName} ${e.lastName.toUpperCase()}, né(e) le ${U.fmtDate(e.birthDate||'—')},
demeurant ${e.address || '—'}, employé(e) en qualité de ${e.jobTitle}
depuis le ${U.fmtDateLong(e.contractStart)},
ci-après dénommé(e) "le Salarié",

Il a été convenu d'une rupture conventionnelle du contrat de travail
conformément aux articles L.1237-11 et suivants du Code du travail.

[Conditions à compléter : date de rupture, indemnité, modalités…]

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}, en deux exemplaires.

Pour l'Employeur                    Pour le Salarié

${rep(co)}                          ${e.firstName} ${e.lastName.toUpperCase()}
`,
    },
    augmentation: {
      label: 'Notification d\'augmentation',
      build: (e, co) => `
NOTIFICATION D'AUGMENTATION DE SALAIRE

Madame / Monsieur ${e.lastName.toUpperCase()},

Nous avons le plaisir de vous informer qu'à compter du ${U.fmtDateLong(new Date())},
votre rémunération brute mensuelle est revalorisée et s'élèvera désormais
à ${U.fmtEur(e.salary||0)}.

Cette décision témoigne de la reconnaissance par la société de la qualité
de votre travail et de votre engagement au quotidien.

L'ensemble des autres conditions de votre contrat de travail demeure inchangé.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

${rep(co)}
${co?.name || '—'}
`,
    },
    refus_conge: {
      label: 'Refus de congé',
      build: (e, co) => `
Madame / Monsieur ${e.lastName.toUpperCase()},

Suite à votre demande de congé, nous sommes au regret de ne pouvoir y donner une suite favorable.

[À préciser : période demandée et motif du refus - nécessités de service,
nombre de salariés déjà absents, etc.]

Nous restons à votre disposition pour étudier ensemble une autre période
qui conviendrait mieux à l'organisation du service.

Veuillez agréer, Madame / Monsieur, l'expression de nos salutations distinguées.

Fait à ${city(co)}, le ${U.fmtDateLong(new Date())}.

${rep(co)}
`,
    },
  };

  function rep(co) { return co?.rep || 'le représentant légal'; }
  function city(co) { const m = (co?.address || '').match(/\d{5}\s+([A-Za-zÀ-ÿ\-\s]+)$/); return m ? m[1].trim() : 'Saint-Denis'; }

  function render(host) {
    const list = Store.get('letters').slice().sort((a,b) => (b.date||'').localeCompare(a.date||''));

    host.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Courriers RH</h1>
            <p class="text-slate-500 text-sm">Génération de courriers types : attestations, certificats, promesses, avertissements…</p>
          </div>
          <button class="btn btn-primary" data-new>${U.icons.plus} Nouveau courrier</button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          ${Object.entries(TEMPLATES).map(([k, t]) => `
            <button class="card card-hover p-4 text-left" data-quick="${k}">
              <div class="text-xs uppercase text-slate-500 font-semibold">Modèle</div>
              <div class="font-semibold text-slate-900 mt-1">${U.escapeHtml(t.label)}</div>
              <div class="text-xs text-brand-600 mt-2">→ Créer</div>
            </button>
          `).join('')}
        </div>

        <div class="card overflow-hidden">
          <div class="p-4 border-b border-slate-100"><h2 class="font-semibold">Historique des courriers</h2></div>
          <table class="table">
            <thead><tr><th>Date</th><th>Type</th><th>Destinataire</th><th>Objet</th><th>Émetteur</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="7" class="text-center py-10 text-slate-400">Aucun courrier</td></tr>' :
                list.map(l => {
                  const e = Store.employee(l.employeeId);
                  const c = Store.employee(l.createdBy);
                  const t = TEMPLATES[l.type];
                  return `
                    <tr>
                      <td class="text-sm">${U.fmtDate(l.date)}</td>
                      <td><span class="badge badge-blue">${U.escapeHtml(t?.label || l.type)}</span></td>
                      <td>
                        <div class="flex items-center gap-2">
                          ${U.avatar(`${e?.firstName} ${e?.lastName}`, 28)}
                          <a href="#/collaborateurs/${e?.id}" class="font-medium">${U.escapeHtml(e?.firstName||'')} ${U.escapeHtml(e?.lastName||'')}</a>
                        </div>
                      </td>
                      <td class="text-sm">${U.escapeHtml(l.subject)}</td>
                      <td class="text-sm">${c ? U.escapeHtml(c.firstName+' '+c.lastName) : '—'}</td>
                      <td><span class="badge ${l.status==='envoye'?'badge-green':'badge-amber'}">${l.status}</span></td>
                      <td>
                        <div class="flex gap-1 justify-end">
                          <button class="btn-icon" data-print="${l.id}" title="Imprimer">${U.icons.eye}</button>
                          <button class="btn-icon text-red-600" data-del="${l.id}">${U.icons.trash}</button>
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
    document.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => openForm(b.dataset.quick));
    document.querySelector('[data-new]').onclick = () => openForm();
    document.querySelectorAll('[data-print]').forEach(b => b.onclick = () => printLetter(b.dataset.print));
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const ok = await U.confirm('Supprimer ce courrier ?', { danger: true });
      if (!ok) return; Store.remove('letters', b.dataset.del); U.toast('Courrier supprimé', 'success'); render(document.getElementById('main-content'));
    });
  }

  function openForm(typeHint) {
    const employees = Store.get('employees');
    U.modal({
      title: 'Nouveau courrier',
      size: 'max-w-3xl',
      body: `
        <form id="lt-form" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div><label class="label">Collaborateur</label>
              <select class="select" name="employeeId" id="lt-emp" required>
                <option value="">—</option>
                ${employees.map(e => `<option value="${e.id}">${U.escapeHtml(e.firstName+' '+e.lastName)}</option>`).join('')}
              </select>
            </div>
            <div><label class="label">Type de courrier</label>
              <select class="select" name="type" id="lt-type">
                ${Object.entries(TEMPLATES).map(([k,t]) => `<option value="${k}" ${typeHint===k?'selected':''}>${t.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <div><label class="label">Objet</label><input class="input" name="subject" required/></div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="label !mb-0">Contenu du courrier</label>
              <button type="button" class="text-xs text-brand-600 hover:underline" id="lt-fill">Pré-remplir depuis le modèle</button>
            </div>
            <textarea class="textarea font-mono text-xs" rows="14" name="content" placeholder="Choisissez un collaborateur et un modèle, puis cliquez sur 'Pré-remplir'."></textarea>
          </div>
        </form>
      `,
      footer: `<button class="btn btn-secondary" data-close-modal>Annuler</button><button class="btn btn-primary" data-submit>Enregistrer</button>`,
      onMount: (root, close) => {
        const fillBtn = root.querySelector('#lt-fill');
        const fill = () => {
          const empId = root.querySelector('#lt-emp').value;
          const type = root.querySelector('#lt-type').value;
          if (!empId || !type) return U.toast('Sélectionnez un collaborateur et un modèle', 'warn');
          const e = Store.employee(empId);
          const co = Store.company(e.companyId);
          const template = TEMPLATES[type];
          root.querySelector('[name="content"]').value = template.build(e, co, Store.settings()).trim();
          root.querySelector('[name="subject"]').value = template.label;
        };
        fillBtn.onclick = fill;
        root.querySelector('#lt-emp').onchange = () => { if (root.querySelector('[name="content"]').value === '') fill(); };
        root.querySelector('#lt-type').onchange = () => fill();
        root.querySelector('[data-close-modal]').onclick = close;
        root.querySelector('[data-submit]').onclick = () => {
          const f = root.querySelector('#lt-form');
          if (!f.reportValidity()) return;
          const d = Object.fromEntries(new FormData(f).entries());
          Store.insert('letters', {
            id: U.uid('lt'), ...d,
            date: U.today(), createdBy: Store.currentUser().id, status: 'redige',
          });
          U.toast('Courrier enregistré', 'success');
          close(); render(document.getElementById('main-content'));
        };
      }
    });
  }

  function printLetter(id) {
    const l = Store.find('letters', id);
    if (!l) return;
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${U.escapeHtml(l.subject)}</title>
      <style>
        body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        h1 { font-size: 16pt; }
        pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 11pt; }
        .header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 24px; }
        @media print { body { padding: 20mm; } }
      </style></head><body>
      <div class="header"><div><strong>${U.escapeHtml(Store.settings().companyName)}</strong></div><div>${U.fmtDateLong(l.date)}</div></div>
      <pre>${U.escapeHtml(l.content)}</pre>
      <script>setTimeout(() => window.print(), 250);<\/script>
    </body></html>`);
    w.document.close();
  }

  return { render };
})();
