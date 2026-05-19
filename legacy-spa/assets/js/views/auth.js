/* Authentication view (login screen) */
window.AuthView = (function () {
  function render() {
    const accounts = [
      { role: 'Administrateur', email: 'emir.deniz@pn-groupe.fr',  pwd: 'admin' },
      { role: 'RH',              email: 'keziban.deniz@pn-groupe.fr', pwd: 'rh' },
      { role: 'Manager',         email: 'delphine.pavis@pn-groupe.fr', pwd: 'manager' },
      { role: 'Paie',            email: 'thomas.bernard@pn-groupe.fr', pwd: 'paie' },
      { role: 'Collaborateur',   email: 'sophie.martin@pn-groupe.fr',  pwd: 'employe' },
    ];
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-4">
        <div class="w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Left: branding -->
          <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white p-10 hidden md:flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-8">
                <div class="w-12 h-12 rounded-xl bg-white text-brand-700 flex items-center justify-center font-bold text-xl">PN</div>
                <div>
                  <div class="text-xl font-bold">Paris Nord Groupe</div>
                  <div class="text-brand-100 text-sm">SIRH multi-entités</div>
                </div>
              </div>
              <h2 class="text-3xl font-bold leading-tight mb-4">Bienvenue sur votre espace RH.</h2>
              <p class="text-brand-100 leading-relaxed">
                Une plateforme unifiée pour gérer les congés, le temps, les notes de frais,
                les entretiens, la formation, le recrutement et la paie de toutes les sociétés
                du groupe.
              </p>
              <div class="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Congés &amp; absences</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Temps de travail</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Notes de frais</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Entretiens</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Formation</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Recrutement</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Paie &amp; documents</div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Multi-entités</div>
              </div>
            </div>
            <div class="text-brand-200 text-xs">© ${new Date().getFullYear()} Paris Nord Groupe — Tous droits réservés.</div>
          </div>
          <!-- Right: form -->
          <div class="p-8 md:p-12">
            <div class="md:hidden flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold">PN</div>
              <div class="font-bold text-slate-800">Paris Nord Groupe</div>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 mb-1">Connexion</h1>
            <p class="text-slate-500 text-sm mb-6">Entrez vos identifiants pour accéder au SIRH.</p>
            <form id="login-form" class="space-y-4">
              <div>
                <label class="label">Adresse email</label>
                <input id="login-email" type="email" class="input" autocomplete="username" required value="emir.deniz@pn-groupe.fr" />
              </div>
              <div>
                <label class="label">Mot de passe</label>
                <input id="login-pwd" type="password" class="input" autocomplete="current-password" required value="admin" />
              </div>
              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" class="rounded border-slate-300"/>
                  Se souvenir de moi
                </label>
                <a href="#" class="text-brand-600 hover:underline">Mot de passe oublié&nbsp;?</a>
              </div>
              <button type="submit" class="btn btn-primary w-full justify-center py-2.5">Se connecter</button>
              <div id="login-error" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"></div>
            </form>
            <div class="mt-6 pt-6 border-t border-slate-200">
              <p class="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Comptes de démonstration</p>
              <div class="space-y-1 text-xs">
                ${accounts.map(a => `
                  <button class="w-full text-left flex justify-between items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-100"
                          data-quick data-email="${a.email}" data-pwd="${a.pwd}">
                    <span class="font-medium text-slate-700">${a.role}</span>
                    <span class="text-slate-400 font-mono">${a.email}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    bind();
  }

  function bind() {
    const form = document.getElementById('login-form');
    const err = document.getElementById('login-error');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pwd = document.getElementById('login-pwd').value;
      const user = Store.login(email, pwd);
      if (!user) {
        err.textContent = 'Identifiants incorrects.';
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      U.toast(`Bienvenue, ${user.firstName} !`, 'success');
      Router.navigate('/');
    });
    document.querySelectorAll('[data-quick]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('login-email').value = btn.dataset.email;
        document.getElementById('login-pwd').value = btn.dataset.pwd;
      });
    });
  }

  return { render };
})();
