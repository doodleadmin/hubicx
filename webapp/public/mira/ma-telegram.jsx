/* ============ Hubicx Telegram Mini App adapter ============ */
(function () {
  const DARK = "#05070D";

  function getTg() {
    return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  }

  function applyViewportVars(tg) {
    const root = document.documentElement;
    root.style.setProperty("--safe-top", "env(safe-area-inset-top, 0px)");
    root.style.setProperty("--safe-right", "env(safe-area-inset-right, 0px)");
    root.style.setProperty("--safe-bottom", "env(safe-area-inset-bottom, 0px)");
    root.style.setProperty("--safe-left", "env(safe-area-inset-left, 0px)");
    if (tg && tg.viewportHeight) {
      root.style.setProperty("--tg-viewport-height", tg.viewportHeight + "px");
    }
    if (tg && tg.viewportStableHeight) {
      root.style.setProperty("--tg-viewport-stable-height", tg.viewportStableHeight + "px");
    }
  }

  function initTelegram() {
    const tg = getTg();
    applyViewportVars(tg);

    if (!tg) {
      document.documentElement.classList.add("preview-mode", "mira-preview-mode");
      window.HubicxTelegram = { tg: null, available: false, initData: "", isPreview: true };
      return window.HubicxTelegram;
    }

    document.documentElement.classList.add("telegram-ready");

    try { tg.ready(); } catch (e) { console.warn("[Hubicx] Telegram ready failed", e); }
    try { tg.expand(); } catch (e) { console.warn("[Hubicx] Telegram expand failed", e); }

    try {
      tg.setHeaderColor && tg.setHeaderColor(DARK);
      tg.setBackgroundColor && tg.setBackgroundColor(DARK);
      tg.setBottomBarColor && tg.setBottomBarColor(DARK);
    } catch (e) {
      console.warn("[Hubicx] Telegram colors failed", e);
    }

    function requestFs() {
      try {
        if (typeof tg.requestFullscreen === "function" && !tg.isFullscreen) {
          tg.requestFullscreen();
        }
      } catch (e) {
        console.warn("[Hubicx] fullscreen request failed", e);
      }
    }

    requestFs();
    setTimeout(requestFs, 300);
    setTimeout(requestFs, 1000);

    try {
      tg.onEvent && tg.onEvent("fullscreenChanged", function () {
        console.log("[Hubicx] fullscreenChanged", tg.isFullscreen);
      });

      tg.onEvent && tg.onEvent("fullscreenFailed", function (event) {
        console.warn("[Hubicx] fullscreenFailed", event);
      });

      tg.onEvent && tg.onEvent("viewportChanged", function () {
        applyViewportVars(tg);
      });
    } catch (e) {
      console.warn("[Hubicx] Telegram event binding failed", e);
    }

    window.HubicxTelegram = { tg: tg, available: true, initData: tg.initData || "", isPreview: !(tg.initData) };
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
