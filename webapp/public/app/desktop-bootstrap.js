(function() {
  window.__APP_BUILD__ = '20260623-bonus1';
  window.DESKTOP_MODE = true;

  var host = String((window.location && window.location.hostname) || '').toLowerCase();
  window.HUBICX_APP_CONTEXT = host === 'webapp.hubicx.ru' ? 'telegram' : 'browser';

  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    try { tg.ready(); } catch (e) {}
    try { if (typeof tg.requestFullscreen === 'function') tg.requestFullscreen(); } catch (e) {}
  }

  var q = new URLSearchParams(window.location.search);
  var ref = q.get('ref');
  if (ref) {
    try { localStorage.setItem('hbx_ref_code', ref); } catch(e) {}
    try { localStorage.setItem('hbx_ref_ts', Date.now()); } catch(e) {}
    try {
      fetch('https://api.hubicx.ru/api/referral/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_code: ref, source_url: location.href })
      }).catch(function(){});
    } catch(e) {}
  }
})();
