(function() {
  window.__APP_BUILD__ = '20260623-bonus1';

  var host = String((window.location && window.location.hostname) || '').toLowerCase();
  var isWebappHost = host === 'webapp.hubicx.ru';
  var isAppHost = host === 'hubicx.ru';
  var tg = window.Telegram && window.Telegram.WebApp;

  window.HUBICX_APP_CONTEXT = isWebappHost ? 'telegram' : (isAppHost ? 'browser' : 'auto');

  if (tg) {
    window.HUBICX_TG_SHELL = isWebappHost;
    if (isWebappHost) {
      var platform = String(tg.platform || '').toLowerCase();
      var tgDesktop = ['tdesktop', 'macos'].indexOf(platform) !== -1;
      if (tgDesktop) window.DESKTOP_MODE = true;
    }

    function px(v) { return (Number(v) || 0) + 'px'; }

    function postEvent(name, data) {
      try {
        if (window.Telegram && window.Telegram.WebView && typeof window.Telegram.WebView.postEvent === 'function') {
          window.Telegram.WebView.postEvent(name, false, data || {});
        }
      } catch (e) {}
    }

    function markFullscreen() {
      var on = !!tg.isFullscreen;
      document.documentElement.classList.toggle('hbx-tg-fullscreen', on);
      document.body.classList.toggle('tg-fullscreen', on);
      document.body.classList.toggle('hbx-tg-fullscreen', on);
    }

    function syncViewport() {
      try {
        var h = tg.viewportHeight || tg.viewportStableHeight || window.innerHeight;
        var sh = tg.viewportStableHeight || h;
        if (h) document.documentElement.style.setProperty('--hbx-tg-vh', h + 'px');
        if (sh) document.documentElement.style.setProperty('--hbx-tg-stable-vh', sh + 'px');
        if (h) document.documentElement.style.setProperty('--app-height', h + 'px');
        var sa = tg.safeAreaInset || {};
        var csa = tg.contentSafeAreaInset || {};
        document.documentElement.style.setProperty('--hbx-tg-safe-top', px(Math.max(sa.top || 0, csa.top || 0)));
        document.documentElement.style.setProperty('--hbx-tg-safe-bottom', px(Math.max(sa.bottom || 0, csa.bottom || 0)));
        document.documentElement.style.setProperty('--hbx-tg-safe-left', px(Math.max(sa.left || 0, csa.left || 0)));
        document.documentElement.style.setProperty('--hbx-tg-safe-right', px(Math.max(sa.right || 0, csa.right || 0)));
        markFullscreen();
      } catch (e) {}
    }

    if (isWebappHost) {
      try {
        var r = tg.ready();
        var expand = function() {
          try { if (typeof tg.expand === 'function') tg.expand(); } catch (e) {}
          try { if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes(); } catch (e) {}
        };
        if (r && typeof r.then === 'function') r.then(expand);
        else expand();
      } catch (e) {
        try { if (typeof tg.expand === 'function') tg.expand(); } catch (e2) {}
        try { if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes(); } catch (e3) {}
      }
    }

    function requestFs(source) {
      var versionOk = tg.isVersionAtLeast ? tg.isVersionAtLeast('8.0') : false;
      var hasMethod = typeof tg.requestFullscreen === 'function';
      var alreadyFs = !!tg.isFullscreen;

      window.__HUBICX_TG_DEBUG__ = Object.assign({}, window.__HUBICX_TG_DEBUG__ || {}, {
        lastFullscreenAttempt: {
          source: source,
          version: tg.version,
          platform: tg.platform,
          isVersionAtLeast80: versionOk,
          hasRequestFullscreen: hasMethod,
          isFullscreen: alreadyFs,
          isExpanded: !!tg.isExpanded,
          viewportHeight: tg.viewportHeight,
          viewportStableHeight: tg.viewportStableHeight
        }
      });

      if (!alreadyFs) {
        if (versionOk && hasMethod) {
          try { tg.requestFullscreen(); } catch (e) {}
        } else {
          postEvent('web_app_request_fullscreen');
        }
      }
      syncViewport();
    }

    try { if (isWebappHost && typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#111318'); } catch (e) {}
    try { if (isWebappHost && typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#111318'); } catch (e) {}
    try { if (isWebappHost && typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor('#111318'); } catch (e) {}
    try {
      if (typeof tg.onEvent === 'function') {
        tg.onEvent('viewportChanged', syncViewport);
        tg.onEvent('safeAreaChanged', syncViewport);
        tg.onEvent('contentSafeAreaChanged', syncViewport);
        tg.onEvent('fullscreenChanged', syncViewport);
        tg.onEvent('fullscreenFailed', function(event) {
          window.__HUBICX_TG_DEBUG__ = Object.assign({}, window.__HUBICX_TG_DEBUG__ || {}, { fullscreenFailed: event || true });
          syncViewport();
        });
        tg.onEvent('activated', function() { requestFs('activated'); });
      }
    } catch (e) {}

    if (isWebappHost) document.body.classList.add('tg-fs');
    syncViewport();

    if (isWebappHost) {
      var fsOnUserAction = function() {
        if (tg && !tg.isFullscreen) requestFs('user-action');
      };
      document.body.addEventListener('pointerdown', fsOnUserAction, { passive: true });
      document.body.addEventListener('click', fsOnUserAction);
      window.addEventListener('load', function() { requestFs('window-load'); }, { once: true });
    }
  }

  if (isAppHost && window.matchMedia && window.matchMedia('(min-width: 900px)').matches) {
    window.DESKTOP_MODE = true;
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
