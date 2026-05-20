/* Tiny hash router */
window.Router = (function () {
  const routes = [];
  let currentRoute = null;

  function add(pattern, handler, opts = {}) {
    routes.push({ pattern, handler, opts });
  }

  function navigate(hash) {
    if (!hash.startsWith('#')) hash = '#' + hash;
    if (location.hash === hash) handle();
    else location.hash = hash;
  }

  function handle() {
    const hash = (location.hash || '#/').replace(/^#/, '');
    const [path, queryStr] = hash.split('?');
    const params = {};
    if (queryStr) {
      for (const kv of queryStr.split('&')) {
        const [k, v] = kv.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      }
    }
    for (const r of routes) {
      const m = path.match(r.pattern);
      if (m) {
        currentRoute = { path, params, args: m.slice(1), opts: r.opts };
        r.handler({ path, params, args: m.slice(1) });
        return;
      }
    }
    if (routes.length) {
      currentRoute = { path: '/', params: {}, args: [] };
      routes[0].handler({ path: '/', params: {}, args: [] });
    }
  }

  function start() {
    window.addEventListener('hashchange', handle);
    handle();
  }

  const current = () => currentRoute;

  return { add, navigate, start, current };
})();
