/* ============ Hubicx Telegram Mini App adapter ============ */
(function(){
  const DARK = '#05070D';

  function tg(){
    return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  }

  function applyCssVars(webapp){
    const root = document.documentElement;
    root.style.setProperty('--tg-safe-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--tg-safe-right', 'env(safe-area-inset-right, 0px)');
    root.style.setProperty('--tg-safe-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--tg-safe-left', 'env(safe-area-inset-left, 0px)');
    if(webapp && webapp.viewportHeight){
      root.style.setProperty('--tg-viewport-height', `${webapp.viewportHeight}px`);
    }
  }

  function init(){
    const webapp = tg();
    applyCssVars(webapp);
    if(!webapp){
      window.HubicxTelegram = { tg:null, available:false, initData:'', isPreview:true };
      document.documentElement.classList.add('mira-preview-mode');
      return window.HubicxTelegram;
    }

    try{ webapp.ready(); }catch(e){ console.warn('Telegram ready failed', e); }
    try{ webapp.expand(); }catch(e){ console.warn('Telegram expand failed', e); }
    try{ webapp.setHeaderColor(DARK); }catch(e){ console.warn('Telegram header color failed', e); }
    try{ webapp.setBackgroundColor(DARK); }catch(e){ console.warn('Telegram background color failed', e); }
    try{ if(webapp.setBottomBarColor) webapp.setBottomBarColor(DARK); }catch(e){ console.warn('Telegram bottom bar color failed', e); }
    try{ if(webapp.requestFullscreen) webapp.requestFullscreen(); }catch(e){ console.warn('Telegram fullscreen failed', e); }

    webapp.onEvent && webapp.onEvent('viewportChanged', ()=>applyCssVars(webapp));
    window.HubicxTelegram = { tg:webapp, available:true, initData:webapp.initData || '', isPreview:!(webapp.initData) };
    return window.HubicxTelegram;
  }

  window.HubicxTelegramAdapter = { init, get webapp(){ return tg(); }, get initData(){ return (tg() && tg().initData) || ''; } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
