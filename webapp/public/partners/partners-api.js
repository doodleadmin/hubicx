// Hubicx Partners API client
(function() {
  var API_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://api.hubicx.ru';
  var code = new URLSearchParams(window.location.search).get('code') || '';

  window.PartnersApi = {
    getCode: function() { return code; },
    setCode: function(c) { code = c; },
    _url: function(path) {
      var sep = path.indexOf('?') === -1 ? '?' : '&';
      return API_HOST + path + (code ? sep + 'code=' + encodeURIComponent(code) : '');
    },
    request: function(path, opts) {
      opts = opts || {};
      var controller = new AbortController();
      var timeout = setTimeout(function() { controller.abort(); }, 15000);
      var retries = 0;
      var maxRetries = (opts.method || 'GET') === 'GET' ? 2 : 0;
      var self = this;

      function doFetch() {
        return fetch(self._url(path), {
          method: opts.method || 'GET',
          headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}),
          body: opts.body || undefined,
          signal: controller.signal,
          cache: 'no-store'
        }).then(function(r) {
          clearTimeout(timeout);
          if (!r.ok) {
            if (r.status === 401) { code = ''; throw new Error('AUTH_REQUIRED'); }
            return r.json().then(function(d) { throw new Error(d.detail || 'API error'); });
          }
          return r.json();
        }).catch(function(err) {
          if (err.name === 'AbortError') throw new Error('TIMEOUT');
          if (retries < maxRetries) {
            retries++;
            controller = new AbortController();
            timeout = setTimeout(function() { controller.abort(); }, 15000);
            return doFetch();
          }
          throw err;
        });
      }
      return doFetch();

    // Partner endpoints
    me:         function()  { return this.request('/api/partners/me'); },
    dashboard:  function()  { return this.request('/api/partners/dashboard'); },
    links:      function()  { return this.request('/api/partners/links'); },
    stats:      function(p) { return this.request('/api/partners/stats?' + new URLSearchParams(p||{})); },
    commissions:function(p) { return this.request('/api/partners/commissions?' + new URLSearchParams(p||{})); },
    payouts:    function()  { return this.request('/api/partners/payouts'); }
  };
})();
