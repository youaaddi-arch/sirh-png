/* Persistent store wrapping localStorage */
window.Store = (function () {
  const KEY = 'sirh-png:v1';
  const SESSION_KEY = 'sirh-png:session';

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) {}
    // Seed
    state = JSON.parse(JSON.stringify(window.SEED));
    persist();
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error('Persist failed', e); }
  }

  function reset() {
    state = JSON.parse(JSON.stringify(window.SEED));
    persist();
  }

  // Generic getters
  const get = (collection) => state[collection] || [];
  const set = (collection, value) => { state[collection] = value; persist(); };

  function find(collection, id) {
    return (state[collection] || []).find(x => x.id === id);
  }
  function insert(collection, obj) {
    if (!obj.id) obj.id = U.uid(collection.slice(0, 3));
    state[collection] = [...(state[collection] || []), obj];
    persist();
    return obj;
  }
  function update(collection, id, patch) {
    const list = state[collection] || [];
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...patch };
    state[collection] = list;
    persist();
    return list[idx];
  }
  function remove(collection, id) {
    state[collection] = (state[collection] || []).filter(x => x.id !== id);
    persist();
  }
  function where(collection, predicate) {
    return (state[collection] || []).filter(predicate);
  }

  // Settings
  const settings = () => state.settings;
  function updateSettings(patch) {
    state.settings = { ...state.settings, ...patch };
    persist();
  }

  // Auth
  function login(email, password) {
    const emp = (state.employees || []).find(e =>
      (e.email || '').toLowerCase() === (email || '').toLowerCase() &&
      e.password === password
    );
    if (!emp) return null;
    const session = { userId: emp.id, loggedAt: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return emp;
  }
  function logout() { sessionStorage.removeItem(SESSION_KEY); }
  function currentUser() {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      if (!s) return null;
      const { userId } = JSON.parse(s);
      return (state.employees || []).find(e => e.id === userId) || null;
    } catch (e) { return null; }
  }

  // Helpers
  const employee = (id) => find('employees', id);
  const employeeName = (id) => {
    const e = employee(id);
    return e ? `${e.firstName} ${e.lastName}` : '—';
  };
  const company = (id) => find('companies', id);
  const department = (id) => find('departments', id);

  const exportAll = () => JSON.stringify(state, null, 2);
  const importAll = (json) => {
    try {
      const parsed = JSON.parse(json);
      state = parsed; persist();
      return true;
    } catch (e) { return false; }
  };

  // Initialise
  load();

  return {
    get, set, find, insert, update, remove, where,
    settings, updateSettings,
    login, logout, currentUser,
    employee, employeeName, company, department,
    exportAll, importAll, reset,
  };
})();
