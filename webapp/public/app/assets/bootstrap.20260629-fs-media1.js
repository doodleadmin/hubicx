(function() {
  window.__APP_BUILD__ = '20260701-202242-gen-price-trace1';

  var host = String((window.location && window.location.hostname) || '').toLowerCase();
  var isWebappHost = host === 'webapp.hubicx.ru';
  var isAppHost = host === 'hubicx.ru';

  window.HUBICX_APP_CONTEXT = isWebappHost ? 'telegram' : (isAppHost ? 'browser' : 'auto');
  window.HUBICX_TG_SHELL = isWebappHost;

  var telegramReadyResolve;
  window.HubicxTelegramReady = window.HubicxTelegramReady || new Promise(function(resolve) {
    telegramReadyResolve = resolve;
  });

  function resolveTelegramReady(tg) {
    try {
      window.dispatchEvent(new CustomEvent('hubicx:telegram-ready', { detail: { hasInitData: !!(tg && tg.initData) } }));
    } catch (e) {}
    try { if (telegramReadyResolve) telegramReadyResolve(tg || null); } catch (e2) {}
  }

  function setupTelegram(tg) {
    if (!tg || window.__HUBICX_TG_BOOTSTRAPPED__) return;
    window.__HUBICX_TG_BOOTSTRAPPED__ = true;
    try { if (typeof tg.ready === 'function') tg.ready(); } catch (e) {}
    if (isWebappHost) {
      var platform = String(tg.platform || '').toLowerCase();
      var tgDesktop = ['tdesktop', 'macos'].indexOf(platform) !== -1;
      if (tgDesktop) window.DESKTOP_MODE = true;
    }
    var lastShellExpandAt = 0;

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
        var expand = function() { expandShell('ready'); };
        if (r && typeof r.then === 'function') r.then(expand);
        else expand();
      } catch (e) {
        expandShell('ready-catch');
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

    function expandShell(source) {
      var now = Date.now();
      if (now - lastShellExpandAt < 120) return;
      lastShellExpandAt = now;
      try { if (typeof tg.ready === 'function') tg.ready(); } catch (e) {}
      try { if (typeof tg.expand === 'function') tg.expand(); } catch (e2) {}
      try { if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes(); } catch (e3) {}
      try { postEvent('web_app_expand'); } catch (e4) {}
      requestFs(source || 'expand-shell');
    }

    try { if (isWebappHost && typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#111318'); } catch (e) {}
    try { if (isWebappHost && typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#111318'); } catch (e) {}
    try { if (isWebappHost && typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor('#111318'); } catch (e) {}
    try {
      if (typeof tg.onEvent === 'function') {
        tg.onEvent('viewportChanged', function() {
          syncViewport();
          if (isWebappHost && !tg.isFullscreen) expandShell('viewportChanged');
        });
        tg.onEvent('safeAreaChanged', syncViewport);
        tg.onEvent('contentSafeAreaChanged', syncViewport);
        tg.onEvent('fullscreenChanged', syncViewport);
        tg.onEvent('fullscreenFailed', function(event) {
          window.__HUBICX_TG_DEBUG__ = Object.assign({}, window.__HUBICX_TG_DEBUG__ || {}, { fullscreenFailed: event || true });
          syncViewport();
        });
        tg.onEvent('activated', function() { expandShell('activated'); });
      }
    } catch (e) {}

    if (isWebappHost) document.body.classList.add('tg-fs');
    syncViewport();

    if (isWebappHost) {
      [0, 80, 220, 500, 1000, 1800, 3000, 5000].forEach(function(delay) {
        setTimeout(function() { if (tg && !tg.isFullscreen) expandShell('startup-' + delay); }, delay);
      });
      var fsOnUserAction = function() {
        if (tg && !tg.isFullscreen) expandShell('user-action');
      };
      document.body.addEventListener('pointerdown', fsOnUserAction, { passive: true });
      document.body.addEventListener('click', fsOnUserAction);
      window.addEventListener('load', function() { expandShell('window-load'); }, { once: true });
    }
    resolveTelegramReady(tg);
  }

  function currentTelegram() {
    try { return window.Telegram && window.Telegram.WebApp; } catch (e) { return null; }
  }

  setupTelegram(currentTelegram());
  if (isWebappHost && !window.__HUBICX_TG_BOOTSTRAPPED__) {
    var started = Date.now();
    var timer = setInterval(function() {
      var tg = currentTelegram();
      if (tg) {
        clearInterval(timer);
        setupTelegram(tg);
      } else if (Date.now() - started > 6000) {
        clearInterval(timer);
        resolveTelegramReady(null);
      }
    }, 50);
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
