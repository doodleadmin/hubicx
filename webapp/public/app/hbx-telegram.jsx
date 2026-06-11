/* ============ Hubicx Telegram Mini App adapter ============ */
(function () {
  const DARK = "#05070D";

  function setCssVar(name, value) {
    if (value === undefined || value === null) return;
    document.documentElement.style.setProperty(name, String(value));
  }

  function getTg() {
    return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  }

  function applyViewport(tg) {
    if (!tg) return;

    if (tg.viewportHeight) {
      setCssVar("--tg-viewport-height", tg.viewportHeight + "px");
      setCssVar("--app-height", tg.viewportHeight + "px");
    }

    if (tg.viewportStableHeight) {
      setCssVar("--tg-viewport-stable-height", tg.viewportStableHeight + "px");
    }

    const sa = tg.safeAreaInset || {};
    const csa = tg.contentSafeAreaInset || {};

    setCssVar("--hbx-safe-top", (sa.top || 0) + "px");
    setCssVar("--hbx-safe-bottom", (sa.bottom || 0) + "px");
    setCssVar("--hbx-safe-left", (sa.left || 0) + "px");
    setCssVar("--hbx-safe-right", (sa.right || 0) + "px");

    setCssVar("--hbx-content-safe-top", (csa.top || 0) + "px");
    setCssVar("--hbx-content-safe-bottom", (csa.bottom || 0) + "px");
    setCssVar("--hbx-content-safe-left", (csa.left || 0) + "px");
    setCssVar("--hbx-content-safe-right", (csa.right || 0) + "px");

    setCssVar("--safe-top", (sa.top || 0) + "px");
    setCssVar("--safe-bottom", (sa.bottom || 0) + "px");
    setCssVar("--safe-left", (sa.left || 0) + "px");
    setCssVar("--safe-right", (sa.right || 0) + "px");
  }

  function requestFullscreenSafe(tg, source) {
    if (!tg) return;

    const debug = {
      source,
      version: tg.version,
      platform: tg.platform,
      isVersionAtLeast80: tg.isVersionAtLeast ? tg.isVersionAtLeast("8.0") : false,
      hasRequestFullscreen: typeof tg.requestFullscreen === "function",
      isFullscreenBefore: tg.isFullscreen,
      viewportHeight: tg.viewportHeight,
      viewportStableHeight: tg.viewportStableHeight
    };

    console.log("[Hubicx TG fullscreen attempt]", debug);

    window.__HUBICX_TG_DEBUG__ = {
      ...(window.__HUBICX_TG_DEBUG__ || {}),
      lastAttempt: debug
    };

    try {
      if (!debug.isVersionAtLeast80) {
        console.warn("[Hubicx TG] Bot API/WebApp version < 8.0, fullscreen unavailable", debug);
        return;
      }

      if (typeof tg.requestFullscreen !== "function") {
        console.warn("[Hubicx TG] requestFullscreen is not a function", debug);
        return;
      }

      if (tg.isFullscreen) {
        console.log("[Hubicx TG] already fullscreen");
        return;
      }

      tg.requestFullscreen();

      setTimeout(function () {
        console.log("[Hubicx TG] after requestFullscreen", {
          isFullscreen: tg.isFullscreen,
          viewportHeight: tg.viewportHeight,
          viewportStableHeight: tg.viewportStableHeight
        });
        applyViewport(tg);
      }, 250);
    } catch (e) {
      console.warn("[Hubicx TG] requestFullscreen exception", e);
    }
  }

  function initTelegram() {
    const tg = getTg();

    if (!tg) {
      document.documentElement.classList.add("hbx-preview-mode", "preview-mode");
      window.HubicxTelegram = { tg: null, available: false, initData: "", isPreview: true };
      window.__HUBICX_TG_DEBUG__ = {
        hasTelegram: !!window.Telegram,
        hasWebApp: false
      };
      console.warn("[Hubicx TG] Telegram.WebApp not found, preview mode");
      return window.HubicxTelegram;
    }

    window.HubicxTelegram = { tg: tg, available: true, initData: tg.initData || "", isPreview: !(tg.initData) };
    document.documentElement.classList.add("hbx-telegram-mode", "telegram-ready");
    document.documentElement.classList.toggle("hbx-fullscreen", !!tg.isFullscreen);

    window.__HUBICX_TG_DEBUG__ = {
      hasTelegram: !!window.Telegram,
      hasWebApp: !!tg,
      version: tg.version,
      platform: tg.platform,
      isVersionAtLeast80: tg.isVersionAtLeast ? tg.isVersionAtLeast("8.0") : false,
      hasRequestFullscreen: typeof tg.requestFullscreen === "function",
      isFullscreenBefore: tg.isFullscreen,
      viewportHeight: tg.viewportHeight,
      viewportStableHeight: tg.viewportStableHeight
    };

    console.log("[Hubicx TG init]", window.__HUBICX_TG_DEBUG__);

    try { tg.ready(); } catch (e) { console.warn("[Hubicx TG] ready failed", e); }
    try { tg.expand(); } catch (e) { console.warn("[Hubicx TG] expand failed", e); }

    try {
      tg.setHeaderColor && tg.setHeaderColor(DARK);
      tg.setBackgroundColor && tg.setBackgroundColor(DARK);
      tg.setBottomBarColor && tg.setBottomBarColor(DARK);
    } catch (e) {
      console.warn("[Hubicx TG] colors failed", e);
    }

    applyViewport(tg);

    try {
      tg.onEvent && tg.onEvent("viewportChanged", function () {
        console.log("[Hubicx TG] viewportChanged", {
          viewportHeight: tg.viewportHeight,
          viewportStableHeight: tg.viewportStableHeight
        });
        applyViewport(tg);
      });

      tg.onEvent && tg.onEvent("safeAreaChanged", function () {
        console.log("[Hubicx TG] safeAreaChanged", tg.safeAreaInset);
        applyViewport(tg);
      });

      tg.onEvent && tg.onEvent("contentSafeAreaChanged", function () {
        console.log("[Hubicx TG] contentSafeAreaChanged", tg.contentSafeAreaInset);
        applyViewport(tg);
      });

      tg.onEvent && tg.onEvent("fullscreenChanged", function () {
        console.log("[Hubicx TG] fullscreenChanged", {
          isFullscreen: tg.isFullscreen,
          viewportHeight: tg.viewportHeight,
          viewportStableHeight: tg.viewportStableHeight
        });
        document.documentElement.classList.toggle("hbx-fullscreen", !!tg.isFullscreen);
        window.__HUBICX_TG_DEBUG__ = {
          ...(window.__HUBICX_TG_DEBUG__ || {}),
          fullscreenChanged: {
            isFullscreen: tg.isFullscreen,
            viewportHeight: tg.viewportHeight,
            viewportStableHeight: tg.viewportStableHeight
          }
        };
        applyViewport(tg);
      });

      tg.onEvent && tg.onEvent("fullscreenFailed", function (event) {
        console.warn("[Hubicx TG] fullscreenFailed", event);
        window.__HUBICX_TG_DEBUG__ = {
          ...(window.__HUBICX_TG_DEBUG__ || {}),
          fullscreenFailed: event
        };
      });
    } catch (e) {
      console.warn("[Hubicx TG] event binding failed", e);
    }

    requestFullscreenSafe(tg, "init");
    setTimeout(function () { requestFullscreenSafe(tg, "300ms"); }, 300);
    setTimeout(function () { requestFullscreenSafe(tg, "1000ms"); }, 1000);
    setTimeout(function () { requestFullscreenSafe(tg, "2000ms"); }, 2000);

    window.addEventListener("pointerdown", function oncePointer() {
      requestFullscreenSafe(tg, "first-pointer");
      window.removeEventListener("pointerdown", oncePointer);
    }, { once: true });

    return window.HubicxTelegram;
  }

  window.HubicxTelegramAdapter = {
    init: initTelegram,
    get webapp() { return getTg(); },
    get initData() { return (getTg() && getTg().initData) || ""; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTelegram, { once: true });
  } else {
    initTelegram();
  }
})();
