// Hubicx Partners API client
(function() {
  var API_HOST = 'https://api.hubicx.ru';
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
      return fetch(this._url(path), {
        method: opts.method || 'GET',
        headers: Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}),
        body: opts.body || undefined
      }).then(function(r) {
        if (!r.ok) {
          if (r.status === 401) { code = ''; throw new Error('AUTH_REQUIRED'); }
          return r.json().then(function(d) { throw new Error(d.detail || 'API error'); });
        }
        return r.json();
      });
    },

    // Partner endpoints
    me:         function()  { return this.request('/api/partners/me'); },
    dashboard:  function()  { return this.request('/api/partners/dashboard'); },
    links:      function()  { return this.request('/api/partners/links'); },
    stats:      function(p) { return this.request('/api/partners/stats?' + new URLSearchParams(p||{})); },
    commissions:function(p) { return this.request('/api/partners/commissions?' + new URLSearchParams(p||{})); },
    payouts:    function()  { return this.request('/api/partners/payouts'); }
  };
})();
