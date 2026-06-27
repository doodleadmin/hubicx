/* ============ App shell ============ */
/* BUILD: 20260620-pricing2 */
const { useState: uS, useEffect: uE, useRef: uR } = React;
const DESKTOP = !!window.DESKTOP_MODE;
const THEME_KEY = 'hbx_theme_v1';
document.documentElement.classList.toggle('desktop', DESKTOP);
function getInitialTheme() {
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch(e) {}
  return 'light';
}

function DesktopWrap({ tab, onTab, tokens, onTopup, children }) {
  const { Ic, Star } = window.MiraCore;
  const navItems = [
    { id: 'agent', label: 'Агент',     icon: 'chat'  },
    { id: 'gen',   label: 'Генерация', icon: 'image' },
    { id: 'profile', label: 'Профиль', icon: 'user'  },
  ];
  return <div className="pc-outer">
    <div className="pc-win">
      <div className="pc-titlebar">
        <div className="pc-lights"><i/><i/><i/></div>
        <div className="pc-wtitle">Hubicx</div>
      </div>
      <div className="pc-body">
        <div className="pc-side">
          <div className="pc-brand">
            <div className="pc-logo">✦</div>
            <div className="pc-word">Hubicx</div>
          </div>
          <div className="pc-navs">
            {navItems.map(function(n) {
              return <div key={n.id} className={'pc-nav' + (tab === n.id ? ' on' : '')} onClick={() => onTab(n.id)}>
                <span className="pc-ni"><Ic n={n.icon} s={18}/></span>
                {n.label}
              </div>;
            })}
          </div>
          <div className="pc-bal">
            <div className="pc-bal-lbl">Баланс</div>
            <div className="pc-bal-num"><Star s={16} c="#c9c7f4"/> {tokens}</div>
            <button className="pc-topup" onClick={onTopup}>Пополнить</button>
          </div>
        </div>
        <div className="pc-main">{children}</div>
      </div>
    </div>
  </div>;
}
const TAB_KEY = 'mira_tab_v1';

const DESK_TAB_TO_PATH = {
  home: '/app',
  gen: '/generation',
  tpl: '/templates',
  chat: '/chat',
  history: '/history',
  fav: '/favorites',
  profile: '/profile',
};
const DESK_PATH_TO_TAB = {
  '/': 'home',
  '/app': 'home',
  '/generation': 'gen',
  '/templates': 'tpl',
  '/chat': 'chat',
  '/history': 'history',
  '/favorites': 'fav',
  '/profile': 'profile',
};
function normalizeDeskPath(pathname) {
  var p = pathname || '/';
  p = p.replace(/\/app\/desktop\.html$/i, '/app').replace(/\/app\/index\.html$/i, '/app');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}
function deskTabFromLocation() {
  if (!DESKTOP || !window.location) return 'home';
  var p = normalizeDeskPath(window.location.pathname);
  return DESK_PATH_TO_TAB[p] || 'home';
}
function deskPathForTab(tab) {
  return DESK_TAB_TO_PATH[tab] || '/app';
}

const ONBOARD_KEY = 'hbx_onboarding_v1';
const ONBOARD_FINISHED_AT_KEY = 'hbx_onboarding_finished_at_v1';
function isOnboardingDone() {
  try { return localStorage.getItem(ONBOARD_KEY) === 'done'; } catch(e) { return true; }
}
function finishOnboarding() {
  try {
    localStorage.setItem(ONBOARD_KEY, 'done');
    localStorage.setItem(ONBOARD_FINISHED_AT_KEY, String(Date.now()));
  } catch(e) {}
}
function tgHaptic(kind) {
  try {
    var tg = window.Telegram && window.Telegram.WebApp;
    var h = tg && tg.HapticFeedback;
    if (!h) return;
    if (kind === 'success' && h.notificationOccurred) h.notificationOccurred('success');
    else if (kind === 'selection' && h.selectionChanged) h.selectionChanged();
    else if (h.impactOccurred) h.impactOccurred(kind || 'light');
  } catch(e) {}
}

function DesktopOnboarding({ onTab, onTopup }) {
  const [open, setOpen] = uS(() => DESKTOP && !isOnboardingDone());
  const [step, setStep] = uS(0);
  const [rect, setRect] = uS(null);
  const steps = [
    { tab:'home', selector:'[data-onb="desk-home-hero"]', title:'Добро пожаловать в Hubicx', text:'Это ваше рабочее пространство: здесь можно быстро создать фото, видео или начать чат с AI.' },
    { tab:'home', selector:'[data-onb="desk-create"]', title:'Главная строка создания', text:'Опишите идею, выберите модель, формат и количество результатов. Enter или кнопка «Создать» запускают генерацию.' },
    { tab:'home', selector:'[data-onb="desk-actions"]', title:'Быстрые действия', text:'Переходите к фото, видео, чату, шаблонам и истории в один клик.' },
    { tab:'tpl', selector:'[data-onb="desk-nav-tpl"]', title:'Шаблоны', text:'Готовые сценарии помогают быстро получить стильный результат. Фото-шаблоны доступны даже без подписки через базовую модель.' },
    { tab:'chat', selector:'[data-onb="desk-nav-chat"]', title:'Чат с AI', text:'Чат помогает придумывать промпты, тексты и идеи. Настройки общения находятся внутри самого чата.' },
    { tab:'profile', selector:'[data-onb="desk-profile"]', title:'Профиль и бонусы', text:'В профиле — баланс, бонусные задания, последние работы и настройки аккаунта.' },
    { tab:'home', selector:'[data-onb="desk-topup"]', title:'Баланс и пополнение', text:'Бонусные токены доступны для базовых фото-моделей. Видео и тяжёлые модели оплачиваются обычными токенами.' },
  ];
  const cur = steps[step] || steps[0];
  const close = function() { finishOnboarding(); setOpen(false); };
  const next = function() { if (step >= steps.length - 1) close(); else setStep(step + 1); };

  uE(function() {
    if (!open || !cur) return;
    if (cur.tab && onTab) onTab(cur.tab, { replace:true });
  }, [open, step]);

  uE(function() {
    if (!open || !cur) return;
    var alive = true;
    var update = function() {
      var el = document.querySelector(cur.selector);
      if (!alive) return;
      if (!el) { setRect(null); return; }
      var r = el.getBoundingClientRect();
      setRect({ left:r.left, top:r.top, width:r.width, height:r.height });
    };
    var t = setTimeout(update, 90);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return function() { alive = false; clearTimeout(t); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open, step]);

  if (!open) return null;
  var pad = 10;
  var box = rect ? {
    left: Math.max(8, rect.left - pad),
    top: Math.max(8, rect.top - pad),
    width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
    height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
  } : null;
  var cardLeft = box ? Math.min(Math.max(260, box.left + box.width + 18), window.innerWidth - 390) : null;
  var cardTop = box ? Math.min(Math.max(24, box.top), window.innerHeight - 260) : null;

  return <div className="onb onb-desktop">
    <div className="onb-dim"></div>
    {box && <div className="onb-spot" style={{ left:box.left, top:box.top, width:box.width, height:box.height }}></div>}
    <div className="onb-card" style={box ? { left:cardLeft, top:cardTop } : null}>
      <div className="onb-kicker">Старт · {step + 1}/{steps.length}</div>
      <h3>{cur.title}</h3>
      <p>{cur.text}</p>
      <div className="onb-dots">{steps.map(function(_, i) { return <i key={i} className={i === step ? 'on' : ''}></i>; })}</div>
      <div className="onb-actions">
        <button className="onb-ghost" onClick={close}>Пропустить</button>
        {step > 0 && <button className="onb-ghost" onClick={() => setStep(step - 1)}>Назад</button>}
        <button className="onb-primary" onClick={next}>{step >= steps.length - 1 ? 'Готово' : 'Далее'}</button>
      </div>
    </div>
  </div>;
}

function MobileOnboarding({ onCreate, onTemplates, onChat, onProfile, onTab }) {
  const [open, setOpen] = uS(() => !DESKTOP && !isOnboardingDone());
  const [step, setStep] = uS(0);
  const [rect, setRect] = uS(null);
  const [stepDir, setStepDir] = uS(0); // -1=back, 1=forward, 0=init
  var prevTabRef = uR(null);
  var animKeyRef = uR(0);
  var pendingTabRef = uR(null);

  const steps = [
    { tab:'agent', selector:'[data-onb="mob-hero"]', icon:'✨', title:'Hubicx готов к работе', text:'Это главная: отсюда запускаются фото, видео, чат и шаблоны.' },
    { tab:'agent', selector:'[data-onb="mob-actions"]', icon:'⚡', title:'Быстрые действия', text:'Нажмите нужную карточку, чтобы сразу создать фото, оживить изображение или открыть чат.' },
    { tab:'agent', selector:'[data-onb="mob-templates"]', icon:'🖼️', title:'Шаблоны', text:'Готовые стили помогают получить результат быстрее. Фото-шаблоны доступны без подписки через базовую модель.', action:'Открыть все', fn:onTemplates },
    { tab:'gen', selector:'[data-onb="mob-create-card"]', icon:'🎨', title:'Генерация', text:'Экран создания: фото и видео-генерации, подборки шаблонов с фильтрами.' },
    { tab:'profile', selector:'[data-onb="mob-profile-card"]', icon:'👤', title:'Профиль и баланс', text:'Здесь ваш баланс токенов, история генераций, профиль и настройки аккаунта.', action:'Профиль', fn:onProfile },
    { tab:'profile', selector:'[data-onb="mob-bonuses"]', icon:'🎁', title:'Бонусные токены', text:'За простые задания можно получить до 120 бонусных токенов. Подпишитесь на канал — получите ещё 70.' },
  ];

  var cur = steps[step] || steps[0];
  var close = function() { finishOnboarding(); setOpen(false); };
  var next = function() {
    tgHaptic(step >= steps.length - 1 ? 'success' : 'light');
    if (step >= steps.length - 1) close();
    else { setStepDir(1); animKeyRef.current += 1; setStep(step + 1); }
  };
  var prev = function() {
    tgHaptic('selection');
    if (step > 0) { setStepDir(-1); animKeyRef.current += 1; setStep(step - 1); }
  };

  function getScrollParent(el) {
    var node = el && el.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      var st = window.getComputedStyle(node);
      if (/(auto|scroll)/.test(st.overflowY || '')) return node;
      node = node.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function scrollTargetIntoSafeArea(el) {
    if (!el) return;
    var sheet = document.querySelector('.mob-onb-sheet');
    var sheetRect = sheet ? sheet.getBoundingClientRect() : null;
    var rootStyle = window.getComputedStyle(document.documentElement);
    var tgTop = parseFloat(rootStyle.getPropertyValue('--hbx-tg-safe-top')) || 0;
    var safeTop = Math.max(96, tgTop + 78);
    var safeBottom = Math.max(safeTop + 140, (sheetRect ? sheetRect.top : window.innerHeight * 0.56) - 18);
    var r = el.getBoundingClientRect();
    var visibleH = Math.max(140, safeBottom - safeTop);
    var targetTop = r.height > visibleH ? safeTop : safeTop + (visibleH - r.height) / 2;
    var delta = r.top - targetTop;
    if (Math.abs(delta) < 8 && r.bottom <= safeBottom && r.top >= safeTop) return;
    var scroller = getScrollParent(el);
    try {
      scroller.scrollBy({ top: delta, behavior: 'smooth' });
    } catch(e) {
      scroller.scrollTop += delta;
    }
  }

  // Tab switching - deferred to avoid re-render fighting with step state
  uE(function() {
    if (!open || !cur) return;
    var tab = cur.tab;
    if (!tab || !onTab) return;
    // Only switch if tab differs from previous to avoid redundant calls
    if (tab === prevTabRef.current) return;
    prevTabRef.current = tab;
    pendingTabRef.current = tab;
    onTab(tab);
  }, [open, step]);

  // Spotlight positioning
  uE(function() {
    if (!open || !cur) return;
    var alive = true;
    var timers = [];
    var selector = cur.selector;
    var update = function() {
      var el = document.querySelector(selector);
      if (!alive) return;
      if (!el) { setRect(null); return; }
      scrollTargetIntoSafeArea(el);
      // Longer delay for tab-switch renders
      var delay = (cur.tab !== (steps[Math.max(0,step-1)]||{}).tab) ? 350 : 120;
      setTimeout(function() {
        if (!alive) return;
        var r = el.getBoundingClientRect();
        setRect({ left:r.left, top:r.top, width:r.width, height:r.height });
      }, delay);
    };
    setRect(null);
    var schedule = function(ms) { timers.push(setTimeout(update, ms)); };
    schedule(60);
    schedule(240);
    schedule(560);
    schedule(920);
    window.addEventListener('resize', update);
    return function() {
      alive = false;
      timers.forEach(function(t) { clearTimeout(t); });
      window.removeEventListener('resize', update);
    };
  }, [open, step]);

  if (!open) return null;
  var pad = 8;
  var box = rect ? {
    left: Math.max(8, rect.left - pad),
    top: Math.max(8, rect.top - pad),
    width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
    height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
  } : null;
  var sheetClass = 'mob-onb-sheet' + (stepDir < 0 ? ' is-back' : (stepDir > 0 ? ' is-next' : ' is-init'));
  return <div className="mob-onb">
    <div className="mob-onb-dim"></div>
    {box && <div className="onb-spot mob-onb-spot" style={{ left:box.left, top:box.top, width:box.width, height:box.height }}></div>}
    <div className={sheetClass}>
      <button className="mob-onb-x" onClick={close}>×</button>
      <div className="mob-onb-content" key={'c' + animKeyRef.current}>
        <div className="mob-onb-ic">{cur.icon}</div>
        <div className="mob-onb-k">Первый запуск · {step + 1}/{steps.length}</div>
        <h3>{cur.title}</h3>
        <p>{cur.text}</p>
        <div className="mob-onb-dots">{steps.map(function(_, i) { return <i key={i} className={i === step ? 'on' : ''}></i>; })}</div>
        <div className="mob-onb-actions">
          {cur.fn && <button className="mob-onb-ghost" onClick={() => { tgHaptic('selection'); close(); cur.fn(); }}>{cur.action}</button>}
          {step > 0 && <button className="mob-onb-ghost" onClick={prev}>Назад</button>}
          <button className="mob-onb-primary" onClick={next}>{step >= steps.length - 1 ? 'Понятно' : 'Далее'}</button>
        </div>
      </div>
    </div>
  </div>;
}

/* Convert server chat messages to local format */
function serverMsgsToLocal(msgs) {
  return (msgs || []).map(function(m) {
    return { role: m.role === 'assistant' ? 'bot' : 'user', text: m.content || '' };
  });
}

function chatTitleFromText(text) {
  var words = String(text || '').trim().split(/\s+/).filter(Boolean);
  var title = words.slice(0, 8).join(' ');
  if (title.length > 60) title = title.slice(0, 60).replace(/\s+\S*$/, '') + '…';
  return title || 'Новый чат';
}

function AccessBlockedScreen({ reason }) {
  var text = reason || 'Доступ к сервису ограничен администратором.';
  return <div className={DESKTOP ? 'dk-auth hbx-blocked-page' : 'phone hbx-blocked-page'}>
    <div className="hbx-blocked-card">
      <div className="hbx-blocked-mark">!</div>
      <div className="hbx-blocked-k">Доступ ограничен</div>
      <h1>Аккаунт заблокирован</h1>
      <p>{text}</p>
      <div className="hbx-blocked-note">Если вы считаете, что это ошибка, напишите в поддержку: support@hubicx.ru</div>
    </div>
  </div>;
}

function App() {
  const { Star } = window.MiraCore;
  const [tab, setTab] = uS(() => localStorage.getItem(TAB_KEY) || 'agent');
  const [user, setUser] = uS(null);
  const [topup, setTopup] = uS(false);
  const [paymentResult, setPaymentResult] = uS(null); // 'success' / 'fail' / null
  const [theme, setTheme] = uS(getInitialTheme);
  const [accessBlock, setAccessBlock] = uS(null);

  // Desktop-only routing state (ignored on mobile)
  const [dtab, setDtab] = uS(deskTabFromLocation);
  const [genInit, setGenInit] = uS({ mode:'photo', prompt:'', tpl:null, modelCode:null, aspectId:null, qualityField:null, qualityValue:null, batchCount:1 });
  const [genKey, setGenKey] = uS(0);
  const [deskSearch, setDeskSearch] = uS('');

  // Desktop auth gate: true once we know whether the user is logged in
  const [authChecked, setAuthChecked] = uS(false);

  uE(() => {
    var dark = theme === 'dark';
    document.documentElement.classList.toggle('theme-dark', dark);
    document.body.classList.toggle('theme-dark', dark);
    try { localStorage.setItem(THEME_KEY, theme); } catch(e) {}
    window.HubicxTheme = { theme: theme, setTheme: setTheme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
  }, [theme]);

  uE(() => {
    var handler = function(e) {
      var detail = e && e.detail ? e.detail : {};
      setAccessBlock({ reason: detail.reason || 'Доступ к сервису ограничен администратором.' });
      if (window.HubicxApi && !window.HubicxApi.isTelegram()) window.HubicxApi.logout();
    };
    window.addEventListener('hubicx:user-banned', handler);
    return function() { window.removeEventListener('hubicx:user-banned', handler); };
  }, []);

  uE(() => {
    if (!DESKTOP || !window.history) return;
    var onPop = function() { setDtab(deskTabFromLocation()); };
    window.addEventListener('popstate', onPop);
    return function() { window.removeEventListener('popstate', onPop); };
  }, []);

  // Handle T-Bank return: ?paid=success → show result + refresh balance + clean URL
  uE(() => {
    try {
      var q = new URL(window.location).searchParams;
      var paid = q.get('paid');
      if (paid === 'success' || paid === 'fail') {
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        setPaymentResult(paid);
        if (paid === 'success') {
          refreshBalance();
          setTimeout(function() { refreshBalance(); }, 3000);
        }
      }
    } catch(e) {}
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const goDtab = (nextTab, opts) => {
    var tabId = nextTab || 'home';
    setDtab(tabId);
    if (!DESKTOP || !window.history) return;
    var target = deskPathForTab(tabId);
    var current = normalizeDeskPath(window.location.pathname);
    if (target !== current) {
      var method = opts && opts.replace ? 'replaceState' : 'pushState';
      window.history[method]({ hubicxTab: tabId }, '', target + (window.location.search || ''));
    }
  };

  // Load user balance on mount
  uE(() => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) { setAuthChecked(true); return; }
    window.HubicxApi.me().then(function(u) { setAccessBlock(null); setUser(u); setAuthChecked(true);
      // Track referral if user came from partner link
      try {
        var refCode = localStorage.getItem('hbx_ref_code');
        if (refCode && u && !u.referred_by_partner_id) {
          window.HubicxApi.trackRef(refCode).then(function() {
            try { localStorage.removeItem('hbx_ref_code'); } catch(e) {}
          }).catch(function() {});
        }
      } catch(e) {}
    })
      .catch(function(e) {
        if (e && e.code === 'user_banned') {
          setAccessBlock({ reason: e.message || 'Доступ к сервису ограничен администратором.' });
          if (!window.HubicxApi.isTelegram()) window.HubicxApi.logout();
        }
        // Stale/invalid desktop token → drop it so the auth screen shows
        if (e && (e.code === 'token_expired' || e.code === 'invalid_token' || e.status === 401) && !window.HubicxApi.isTelegram()) {
          window.HubicxApi.logout();
        }
        setAuthChecked(true);
      });
  }, []);

  // Apply saved server language before the profile screen is opened.
  uE(() => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !window.HubicxApi.profile) return;
    window.HubicxApi.profile().then(function(p) {
      if (p && p.language_code && window.HubicxI18n) window.HubicxI18n.setLang(p.language_code);
    }).catch(function() {});
  }, []);

  const onDeskAuthed = (u) => {
    if (u) setUser(u);
    // Reload chats list for the freshly authenticated account
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.agentChats().then(function(data) {
        if (data && Array.isArray(data.chats)) {
          setChats(data.chats.map(function(c) { return { id: c.id, title: c.title || 'Чат', agent_mode: c.agent_mode || 'general', msgs: [], loaded: false }; }));
        }
      }).catch(function() {});
    }
  };

  const tokens = user ? user.balance_credits : '…';
  const refreshBalance = () => {
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.me().then(function(u) { setUser(u); }).catch(function() {});
    }
  };

  // chats: {id: number, title, agent_mode, msgs: [{role:'user'|'bot', text, streaming?}], loaded}
  const [chats, setChats] = uS([]);
  const [activeChat, setActiveChat] = uS(null);
  const streamCtrl = uR(null); // AbortController for current SSE stream

  // Load chat list on mount
  uE(() => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.agentChats().then(function(data) {
      if (data && Array.isArray(data.chats)) {
        setChats(data.chats.map(function(c) {
          return { id: c.id, title: c.title || 'Чат', agent_mode: c.agent_mode || 'general', msgs: [], loaded: false };
        }));
      }
    }).catch(function() {});
  }, []);

  // create sub-screen
  const [createOpen, setCreateOpen] = uS(false);
  const [mode, setMode] = uS('photo');
  const [preset, setPreset] = uS(null);
  const [createModelCode, setCreateModelCode] = uS(null);
  const [createKey, setCreateKey] = uS(0);
  const [templatesOpen, setTemplatesOpen] = uS(false);

  // Telegram BackButton: show it only inside nested Mini App screens.
  var bbHandlerRef = uR(null);
  uE(() => {
    if (DESKTOP) return;
    var tg = window.Telegram && window.Telegram.WebApp;
    var bb = tg && tg.BackButton;
    if (!bb) return;
    if (bbHandlerRef.current) {
      try { bb.offClick(bbHandlerRef.current); } catch(e) {}
      bbHandlerRef.current = null;
    }
    var withHaptic = function(fn) {
      return function() { tgHaptic('selection'); fn(); };
    };
    var handler = null;
    if (paymentResult) {
      handler = withHaptic(function() { setPaymentResult(null); });
    } else if (topup) {
      handler = withHaptic(function() { setTopup(false); });
    } else if (activeChat) {
      handler = withHaptic(function() { setActiveChat(null); });
    } else if (createOpen) {
      handler = withHaptic(function() { setCreateOpen(false); });
    } else if (templatesOpen) {
      handler = withHaptic(function() { setTemplatesOpen(false); });
    }
    if (handler) {
      try { bb.show(); bb.onClick(handler); } catch(e) {}
      bbHandlerRef.current = handler;
    } else {
      try { bb.hide(); } catch(e) {}
    }
    return function() {
      if (handler) {
        try { bb.offClick(handler); } catch(e) {}
      }
      if (bbHandlerRef.current === handler) bbHandlerRef.current = null;
    };
  }, [paymentResult, topup, createOpen, activeChat, templatesOpen]);

  uE(() => { localStorage.setItem(TAB_KEY, tab); }, [tab]);

  const openCreate = (m, p = null, opts = null) => { setMode(m); setPreset(p); setCreateModelCode(opts && opts.modelCode ? opts.modelCode : null); setTemplatesOpen(false); setCreateKey(function(k) { return k + 1; }); setCreateOpen(true); };
  const openTemplates = () => { setCreateOpen(false); setActiveChat(null); setTemplatesOpen(true); };
  const goTab = (t) => {
    if (t === 'templates') { openTemplates(); return; }
    setCreateOpen(false); setActiveChat(null); setTemplatesOpen(false); setTab(t);
  };

  // Append streaming text chunk to last bot message
  const appendBotChunk = (chatId, chunk) => {
    setChats(cs => cs.map(c => {
      if (c.id !== chatId) return c;
      var msgs = c.msgs.slice();
      var last = msgs[msgs.length - 1];
      if (last && last.streaming) {
        msgs[msgs.length - 1] = { ...last, text: last.text + chunk };
      }
      return { ...c, msgs: msgs };
    }));
  };

  // Mark last bot message as done
  const finishBotMsg = (chatId) => {
    setChats(cs => cs.map(c => {
      if (c.id !== chatId) return c;
      var msgs = c.msgs.map(function(m, i) {
        return (i === c.msgs.length - 1 && m.streaming) ? { role: m.role, text: m.text } : m;
      });
      return { ...c, msgs: msgs };
    }));
    refreshBalance();
  };

  // Replace last bot message with error
  const errorBotMsg = (chatId, errText) => {
    setChats(cs => cs.map(c => {
      if (c.id !== chatId) return c;
      var msgs = c.msgs.map(function(m, i) {
        return (i === c.msgs.length - 1 && m.streaming)
          ? { role: 'bot', text: errText || 'Ошибка — попробуйте ещё раз', isError: true }
          : m;
      });
      return { ...c, msgs: msgs };
    }));
  };

  // Start SSE stream for a chat turn
  const doStream = (chatId, content) => {
    if (streamCtrl.current) streamCtrl.current.abort();
    // Add streaming placeholder
    setChats(cs => cs.map(c => c.id === chatId
      ? { ...c, msgs: [...c.msgs, { role: 'bot', text: '', streaming: true }] }
      : c
    ));
    streamCtrl.current = window.HubicxApi.agentStreamMessage(
      chatId, content,
      function(chunk) { appendBotChunk(chatId, chunk); },
      function() { finishBotMsg(chatId); },
      function(err) { errorBotMsg(chatId, err); }
    );
  };

  // Start a new chat
  const startChat = (text, agentMode) => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    var mode = agentMode || 'general';
    window.HubicxApi.agentCreateChat(mode, null).then(function(data) {
      var c = data.chat;
      var firstMsg = text ? [{ role: 'user', text: text }] : [];
      setChats(cs => [{ id: c.id, title: chatTitleFromText(text), agent_mode: c.agent_mode || mode, msgs: firstMsg, loaded: true }, ...cs]);
      setActiveChat(c.id);
      if (text) doStream(c.id, text);
    }).catch(function(err) {
      alert((err && err.message) || 'Не удалось создать чат');
    });
  };

  const setChatAgent = (chatId, mode) => {
    if (!chatId) return;
    var nextMode = mode || 'general';
    setChats(cs => cs.map(c => c.id === chatId ? { ...c, agent_mode: nextMode } : c));
    if (window.HubicxApi && window.HubicxApi.hasAuth() && window.HubicxApi.agentUpdateChat) {
      window.HubicxApi.agentUpdateChat(chatId, { agent_mode: nextMode }).then(function(data) {
        if (data && data.chat) {
          setChats(cs => cs.map(c => c.id === chatId ? { ...c, agent_mode: data.chat.agent_mode || nextMode } : c));
        }
      }).catch(function() {});
    }
  };

  // Send message in existing chat
  const sendInChat = (text) => {
    if (!activeChat) return;
    var chat = chats.find(c => c.id === activeChat);
    var mode = (chat && chat.agent_mode) || 'general';
    setChats(cs => cs.map(c => c.id === activeChat
      ? { ...c, msgs: [...c.msgs, { role: 'user', text: text }] }
      : c
    ));
    if (window.HubicxApi && window.HubicxApi.agentUpdateChat) {
      window.HubicxApi.agentUpdateChat(activeChat, { agent_mode: mode })
        .catch(function() {})
        .then(function() { doStream(activeChat, text); });
    } else {
      doStream(activeChat, text);
    }
  };

  // Delete (archive) chat
  const deleteChat = (id) => {
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.agentArchiveChat(id).catch(function() {});
    }
    setChats(cs => cs.filter(c => c.id !== id));
    if (activeChat === id) setActiveChat(null);
  };

  // Open existing chat — load messages if not loaded yet
  const openChat = (id) => {
    setActiveChat(id);
    setChats(cs => {
      var chat = cs.find(c => c.id === id);
      if (chat && !chat.loaded && window.HubicxApi && window.HubicxApi.hasAuth()) {
        window.HubicxApi.agentGetChat(id).then(function(data) {
          var serverMsgs = serverMsgsToLocal(data.chat.messages);
          setChats(cs2 => cs2.map(c => c.id === id
            ? { ...c, msgs: serverMsgs, loaded: true, title: data.chat.title || c.title, agent_mode: data.chat.agent_mode || c.agent_mode || 'general' }
            : c
          ));
        }).catch(function() {});
      }
      return cs;
    });
  };

  const curChat = chats.find(c => c.id === activeChat);

  const hasAuth = window.HubicxApi && window.HubicxApi.hasAuth();
  const tg = window.Telegram && window.Telegram.WebApp;
  const isMiniAppHost = !!(window.HubicxApi && window.HubicxApi.isMiniAppHost && window.HubicxApi.isMiniAppHost());
  const isTelegramShell = !!(isMiniAppHost && (window.HUBICX_TG_SHELL || (tg && (
    tg.initData ||
    (tg.initDataUnsafe && tg.initDataUnsafe.user) ||
    (tg.platform && tg.platform !== 'unknown')
  ))));
  uE(() => {
    if (DESKTOP && authChecked && hasAuth && normalizeDeskPath(window.location.pathname) === '/') {
      goDtab('home', { replace: true });
    }
  }, [authChecked, hasAuth]);
  if (!authChecked) {
    return <div className={DESKTOP ? 'dk-auth' : 'phone'} style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div className="gen-spinner"></div>
    </div>;
  }
  if (accessBlock) {
    return <AccessBlockedScreen reason={accessBlock.reason}/>;
  }
  if (isMiniAppHost && !hasAuth) {
    return <MiniAppReturnPage result={paymentResult}/>;
  }
  if (!hasAuth && !isTelegramShell) {
    return window.HBX && window.HBX.LandingPage
      ? <window.HBX.LandingPage onAuthed={onDeskAuthed}/>
      : <div className="dk-auth"><div className="gen-spinner"></div></div>;
  }

  let body;
  if (createOpen) {
    body = <CreateScreen key={createKey + ':' + mode + ':' + (preset && (preset.code || preset.t) || '') + ':' + (createModelCode || '')}
      tokens={tokens} mode={mode} setMode={setMode} preset={preset} initModelCode={createModelCode}
      onBack={() => setCreateOpen(false)} onMinimize={() => goTab('gen')} refreshBalance={refreshBalance}/>;
  } else if (templatesOpen) {
    body = <TemplatesScreen onBack={() => setTemplatesOpen(false)}
      onTemplate={(t) => openCreate(t && t.type === 'video' ? 'video' : 'photo', t)}/>;
  } else if (tab === 'agent') {
    body = <AgentScreen tokens={tokens} onBuyPro={() => setTopup(true)}
      onCreatePhoto={() => openCreate('photo')} onCreateVideo={() => openCreate('video')}
      onTopup={() => setTopup(true)} onTab={goTab} onTemplates={openTemplates}
      onStartChat={startChat} chats={chats}
      onOpenChat={openChat} onDeleteChat={deleteChat}
      onTemplate={(t) => openCreate(t && t.type === 'video' ? 'video' : 'photo', t)}/>;
  } else if (tab === 'gen') {
    body = <GenerationScreen tokens={tokens} onTopup={() => setTopup(true)}
      onCreatePhoto={() => openCreate('photo')} onCreateVideo={(modelCode) => openCreate('video', null, modelCode ? { modelCode:modelCode } : null)}
      onTemplate={(t) => openCreate(t && t.type === 'video' ? 'video' : 'photo', t)} onTab={goTab}/>;
  } else {
    body = <ProfileScreen tokens={tokens} onTopup={() => setTopup(true)} onTab={goTab} theme={theme} onToggleTheme={toggleTheme} user={user} onUserUpdate={setUser}/>;
  }

  const mainContent = <React.Fragment>
    {body}
    {curChat && <ChatScreen chat={curChat} onBack={() => setActiveChat(null)} onSend={sendInChat} onSetAgent={setChatAgent}/>}
  </React.Fragment>;

  if (DESKTOP) {
    const TITLES = {
      home:    ['Главная',   'Создавайте фото, видео и общайтесь с AI'],
      gen:     ['Генерация', 'Соберите кадр и нажмите «Сгенерировать»'],
      tpl:     ['Шаблоны',   'Готовые стили для фото и видео'],
      chat:    ['Чат с AI',  'Идеи, тексты и помощь в один клик'],
      history: ['История',   'Все ваши генерации'],
      fav:     ['Избранное', 'Сохранённые работы'],
      profile: ['Профиль',   'Ваш аккаунт, баланс и подписка'],
    };
    const meta = TITLES[dtab] || TITLES.home;

    const goGen = (m, p, opts) => {
      setGenInit({ mode: m, prompt: p || '', tpl: null,
        modelCode: (opts && opts.modelCode) || null,
        aspectId: (opts && opts.aspectId) || null,
        qualityField: (opts && opts.qualityField) || null,
        qualityValue: (opts && opts.qualityValue) || null,
        batchCount: (opts && opts.batchCount) || 1 });
      setGenKey(k => k + 1); goDtab('gen');
    };
    const onTemplate = (tpl) => {
      if (!tpl) { goDtab('tpl'); return; }
      setGenInit({ mode: tpl.type === 'video' ? 'video' : 'photo', prompt: '', tpl: tpl, modelCode: null, aspectId: null, qualityField:null, qualityValue:null, batchCount:1 });
      setGenKey(k => k + 1); goDtab('gen');
    };
    const dStartChat = (text, agentMode) => { startChat(text, agentMode); goDtab('chat'); };

    let dbody;
    if (dtab === 'home') dbody = <DeskHome tokens={tokens} onGen={goGen} onStartChat={dStartChat} onTemplate={onTemplate} onHistory={() => goDtab('history')}/>;
    else if (dtab === 'gen') dbody = <DeskGen key={genKey} tokens={tokens} initMode={genInit.mode} initPrompt={genInit.prompt} initTpl={genInit.tpl} initModelCode={genInit.modelCode} initAspectId={genInit.aspectId} initQualityField={genInit.qualityField} initQualityValue={genInit.qualityValue} initBatchCount={genInit.batchCount} refreshBalance={refreshBalance} searchQuery={deskSearch}/>;
    else if (dtab === 'tpl') dbody = <DeskTemplates onTemplate={onTemplate} searchQuery={deskSearch}/>;
    else if (dtab === 'chat') dbody = <DeskChat chats={chats} activeChat={activeChat} onOpenChat={openChat} onStartChat={dStartChat} onSend={sendInChat} onDeleteChat={deleteChat} onSetAgent={setChatAgent}/>;
    else if (dtab === 'history') dbody = <DeskHistory/>;
    else if (dtab === 'fav') dbody = <DeskFavorites/>;
    else dbody = <DeskProfile tokens={tokens} user={user} onTopup={() => setTopup(true)} onUserUpdate={setUser}/>;

    return <React.Fragment>
      <DeskShell tab={dtab} onTab={goDtab} onProfile={() => goDtab('profile')}
        tokens={tokens} user={user} onTopup={() => setTopup(true)}
        title={meta[0]} subtitle={meta[1]} chatsBadge={chats.length || null}
        theme={theme} onToggleTheme={toggleTheme} searchQuery={deskSearch} onSearchQuery={setDeskSearch}>
        {dbody}
      </DeskShell>
      {topup && <DeskTopup tokens={tokens} onClose={() => setTopup(false)}/>}
      <DesktopOnboarding onTab={goDtab} onTopup={() => setTopup(true)}/>
      {paymentResult && <PaymentResultModal result={paymentResult} onClose={() => setPaymentResult(null)}/>}
    </React.Fragment>;
  }

  return <div className="phone">
    {mainContent}
    {topup && <Topup tokens={tokens} onClose={() => setTopup(false)}/>} 
    {paymentResult && <PaymentResultModal result={paymentResult} onClose={() => setPaymentResult(null)}/>}
    <MobileOnboarding key="mob-onb" onCreate={() => openCreate('photo')} onTemplates={openTemplates} onChat={() => startChat('Привет!')} onProfile={() => goTab('profile')} onTab={goTab}/>
  </div>;
}

function MiniAppReturnPage({ result }) {
  var ok = result === 'success';
  var fail = result === 'fail';
  var isResult = ok || fail;
  var title = ok ? 'Оплата прошла' : fail ? 'Оплата не завершена' : 'Откройте Hubicx в Telegram';
  var text = ok
    ? 'Мы получили возврат от банка. Откройте Mini App в Telegram — баланс и тариф обновятся после банковского уведомления.'
    : fail
      ? 'Платёж не был подтверждён. Вернитесь в Mini App, чтобы выбрать тариф заново или попробовать другую карту.'
      : 'Этот адрес работает как Telegram Mini App. Откройте Hubicx через бота, чтобы войти в свой аккаунт.';
  var pill = ok ? 'Успешная оплата' : fail ? 'Платёж отменён' : 'Telegram Mini App';
  var openBot = function() { window.location.href = 'https://t.me/hubicx_bot'; };
  var openSite = function() { window.location.href = 'https://hubicx.ru'; };

  return <div className="tg-return-page">
    <div className="tg-return-bg"></div>
    <div className={'tg-return-card ' + (ok ? 'ok' : fail ? 'fail' : 'plain')}>
      <div className="tg-return-brand">
        <img src="/app/assets/logo.jpg" alt="Hubicx"/>
        <span>Hubicx</span>
      </div>
      <div className="tg-return-visual">
        <div className="tg-return-orbit"></div>
        <div className="tg-return-mark">{ok ? '✓' : fail ? '!' : '↗'}</div>
      </div>
      <div className="tg-return-pill">{pill}</div>
      <h1>{title}</h1>
      <p>{text}</p>
      {isResult && <div className="tg-return-note">
        <b>{ok ? 'Что дальше' : 'Подсказка'}</b>
        <span>{ok ? 'Если токены не появились сразу, откройте профиль через 20-60 секунд.' : 'Списание не происходит, если банк не подтвердил платёж.'}</span>
      </div>}
      <div className="tg-return-actions">
        <button className="tg-return-main" onClick={openBot}>Открыть Hubicx в Telegram</button>
        <button className="tg-return-secondary" onClick={openSite}>На сайт Hubicx</button>
      </div>
    </div>
  </div>;
}

function PaymentResultModal({ result, onClose }) {
  var ok = result === 'success';
  return <div className="pay-result-ov" onClick={onClose}>
    <div className={'pay-result-card ' + (ok ? 'ok' : 'fail')} onClick={e => e.stopPropagation()}>
      <div className="pay-result-glow"></div>
      <div className="pay-result-mark"><span>{ok ? '✓' : '!'}</span></div>
      <div className="pay-result-k">{ok ? 'Оплата прошла' : 'Оплата не завершена'}</div>
      <h3>{ok ? 'Тариф почти у вас' : 'Платёж не подтвердился'}</h3>
      <p>{ok ? 'Банк подтвердил платёж. Мы обновим баланс и подписку автоматически, обычно это занимает несколько секунд.' : 'Если банк не подтвердил операцию, деньги не списываются. Вернитесь к тарифам и попробуйте ещё раз.'}</p>
      <div className="pay-result-note">
        <b>{ok ? 'Что дальше' : 'Подсказка'}</b>
        <span>{ok ? 'Можно продолжать генерацию — баланс подтянется сам.' : 'Лучше не закрывать Telegram до возврата из платёжной формы.'}</span>
      </div>
      <button className="pay-result-btn" onClick={onClose}>{ok ? 'Продолжить' : 'Вернуться'}</button>
    </div>
  </div>;
}

function Topup({ tokens, onClose }) {
  const { Star, Ic } = window.MiraCore;
  const fallbackPacks = [
    { code:'topup_300',   title:'300 токенов',    tokens:300,   price_rub:249,  bonus_tokens:0, total_tokens:300,   effective_price_per_token:0.83 },
    { code:'topup_1000',  title:'1 000 токенов',  tokens:1000,  price_rub:790,  bonus_tokens:0, total_tokens:1000,  effective_price_per_token:0.79 },
    { code:'topup_3000',  title:'3 000 токенов',  tokens:3000,  price_rub:1990, bonus_tokens:0, total_tokens:3000,  effective_price_per_token:0.66 },
    { code:'topup_10000', title:'10 000 токенов', tokens:10000, price_rub:5990, bonus_tokens:0, total_tokens:10000, effective_price_per_token:0.60 },
  ];
  const fallbackSubs = [
    { code:'templates_mini', title:'Шаблоны Mini', price_rub:790, period:'month', tokens_per_month:800, badge:'Старт', features:['Базовые шаблоны','Фото-шаблоны'] },
    { code:'templates_plus', title:'Шаблоны Plus', price_rub:2590, period:'month', tokens_per_month:3500, badge:'Для контента', features:['Все шаблоны','Видео-шаблоны'] },
    { code:'creator', title:'Creator', price_rub:1490, period:'month', tokens_per_month:1800, badge:'Личный', features:['Фото и видео','Базовые модели'] },
    { code:'creator_pro', title:'Creator Pro', price_rub:3990, period:'month', tokens_per_month:6500, badge:'Популярный', features:['Все основные модели','Премиум-шаблоны'] },
    { code:'studio', title:'Studio', price_rub:9900, period:'month', tokens_per_month:18000, badge:'Для бизнеса', features:['Большой объём токенов','Студийные сценарии'] },
  ];
  const fallbackBonus = { title:'50 токенов сразу + бонусы за задания после проверки', total_tokens:120, note:'Бонусные токены доступны для базовых фото-моделей и простых сценариев.', tasks:[
    { code:'signup', title:'Бонус за регистрацию', tokens:50, kind:'automatic', claimed:true },
    { code:'social_subscribe', title:'Подписаться на наш канал', description:'Откройте Telegram-канал. Автопроверка появится после подключения канала к боту.', tokens:70, kind:'external_check', action_url:'https://t.me/hubicx_bot', action_label:'Открыть канал', status_label:'Проверка скоро' },
  ] };
  const [packs, setPacks] = uS(null); // null = loading; set by API or fallback on error
  const [subs, setSubs] = uS(fallbackSubs);
  const [bonus, setBonus] = uS(fallbackBonus);
  const [paymentsEnabled, setPaymentsEnabled] = uS(false);
  const [sel, setSel] = uS(1);
  const [subSel, setSubSel] = uS(0);
  const [customOpen, setCustomOpen] = uS(false);
  const [customAmount, setCustomAmount] = uS('');
  const [customError, setCustomError] = uS('');
  const [fullOpen, setFullOpen] = uS(false);
  const [packsOpen, setPacksOpen] = uS(false);
  const [paying, setPaying] = uS(false);
  const [payError, setPayError] = uS('');

  uE(() => {
    let alive = true;
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.pricing().then(data => {
        if (!alive) return;
        if (data && Array.isArray(data.token_packages) && data.token_packages.length)
          setPacks(data.token_packages);
        else
          setPacks(fallbackPacks);
        if (data && Array.isArray(data.subscription_plans) && data.subscription_plans.length) setSubs(data.subscription_plans);
        if (data && data.bonus_program) setBonus(data.bonus_program);
        if (data && data.payments_enabled) setPaymentsEnabled(true);
      }).catch(() => { if (alive) setPacks(fallbackPacks); });
    } else {
      setPacks(fallbackPacks);
    }
    return () => { alive = false; };
  }, []);

  if (packs === null) {
    return <div className="sheet-ov" onClick={onClose}>
      <div className="sheet topup-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-card topup-card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:'36px 20px' }}>
          <div className="gen-spinner"></div>
          <div className="muted" style={{ fontSize:14 }}>Загружаем пакеты…</div>
        </div>
      </div>
    </div>;
  }

  const templateSubs = (subs || []).filter(p => String(p.code || '').indexOf('templates_') === 0);
  const fullSubs = (subs || []).filter(p => String(p.code || '').indexOf('templates_') !== 0);
  const visibleSubs = templateSubs.concat(fullSubs);
  const selectedSub = subSel === null ? null : (visibleSubs[subSel] || visibleSubs[0] || null);
  const customNum = parseInt(customAmount, 10);
  const customValid = customAmount && !isNaN(customNum) && customNum >= 99;
  const chosen = customValid ? null : (selectedSub || packs[sel] || packs[0]);
  const handleCustomChange = (v) => {
    const num = parseInt(v, 10);
    setCustomAmount(v);
    if (!v || isNaN(num)) { setCustomError(''); return; }
    if (num < 99) { setCustomError('Минимум 99 ₽'); return; }
    setCustomError('');
  };
  const handlePay = () => {
    if (paying || !window.HubicxApi) return;
    setPayError('');
    setPaying(true);
    var payload;
    if (customValid) {
      payload = { amount_rub: customNum, credits: customNum };
    } else if (selectedSub) {
      payload = { amount_rub: selectedSub.price_rub, credits: selectedSub.tokens_per_month, package_code: selectedSub.code };
    } else if (chosen) {
      payload = { amount_rub: chosen.price_rub, credits: chosen.total_tokens || chosen.tokens, package_code: chosen.code };
    } else {
      setPaying(false);
      return;
    }
    var payReturnUrl = DESKTOP ? 'https://hubicx.ru' : (window.location && window.location.origin ? window.location.origin : 'https://webapp.hubicx.ru');
    window.HubicxApi.createPayment(Object.assign({}, payload, { return_url: payReturnUrl })).then(function(data) {
      setPaying(false);
      if (data.payment_url) {
        var tg = window.Telegram && window.Telegram.WebApp;
        if (tg && tg.openLink) {
          tg.openLink(data.payment_url);
        } else {
          window.open(data.payment_url, '_blank');
        }
        onClose();
      } else {
        setPayError(data.message || 'Не удалось создать платёж');
      }
    }).catch(function(err) {
      setPaying(false);
      setPayError((err && err.message) || 'Ошибка при создании платежа');
    });
  };

  const ctaPrice = customValid ? customNum : (chosen ? chosen.price_rub : '');
  const claimBonus = (code) => {
    if (!window.HubicxApi || !window.HubicxApi.claimBonus) return;
    window.HubicxApi.claimBonus(code).then(function() {
      return window.HubicxApi.bonuses ? window.HubicxApi.bonuses() : null;
    }).then(function(data) { if (data) setBonus(data); }).catch(function(err) {
      setPayError((err && err.message) || 'Не удалось начислить бонус');
    });
  };

  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet topup-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card topup-card">
        <div className="sheet-grab"></div>
        <button className="topup-close" onClick={onClose} aria-label="Закрыть"><Ic n="close" s={17}/></button>
        <div className="topup-head">
          <div>
            <div className="sheet-title">Тарифы Hubicx</div>
            <div className="topup-sub">Сначала доступ к шаблонам</div>
          </div>
          <div className="topup-balance"><Star s={14} c="#c9c7f4"/> {tokens}</div>
        </div>

        <div className="topup-body">
          {bonus && <div className="topup-bonus-lite">
            <div className="topup-bonus-ic">🎁</div>
            <div>
              <b>{bonus.title || '50 токенов сразу + бонусы'}</b>
              <span>{bonus.note || 'Бонусы доступны для базовых фото-моделей.'}</span>
            </div>
            {bonus.total_tokens ? <strong>+{bonus.total_tokens} ★</strong> : null}
          </div>}

          {templateSubs.length > 0 && <React.Fragment>
            <div className="topup-section-title">
              <span>Для шаблонов</span>
              <em>рекомендуем</em>
            </div>
            <div className="topup-template-list">
              {templateSubs.map(function(p, i) { return <button className={'topup-plan template' + (selectedSub && selectedSub.code === p.code && !customValid ? ' on' : '')} key={p.code} onClick={() => { setSubSel(i); setCustomAmount(''); setCustomError(''); }}>
                <span className="topup-plan-radio"></span>
                <span className="topup-plan-main">
                  <b>{p.title}</b>
                  <small>Шаблоны + {p.tokens_per_month} токенов / месяц</small>
                </span>
                <span className="topup-plan-side">
                  {p.badge && <em>{p.badge}</em>}
                  <strong>{p.price_rub} ₽</strong>
                </span>
              </button>; })}
            </div>
          </React.Fragment>}

          {fullSubs.length > 0 && <div className="topup-fold-block">
            <button className={'topup-fold' + (fullOpen ? ' open' : '')} onClick={() => setFullOpen(!fullOpen)}>
              <span>Тарифы для генераций</span>
              <b>{fullSubs.length} тарифа</b>
              <i>{fullOpen ? '−' : '+'}</i>
            </button>
            {fullOpen && <div className="sub-list compact">
              {fullSubs.map(function(p, i) {
                var realIndex = templateSubs.length + i;
                return <div className={'sub-card pay-choice' + (selectedSub && selectedSub.code === p.code && !customValid ? ' on' : '')} key={p.code} onClick={() => { setSubSel(realIndex); setCustomAmount(''); setCustomError(''); }}>
                  <div><b>{p.title}</b>{p.badge && <span>{p.badge}</span>}</div>
                  <p>Все сценарии + {p.tokens_per_month} токенов / месяц</p>
                  <strong>{p.price_rub} ₽/мес</strong>
                </div>;
              })}
            </div>}
          </div>}

          <div className="topup-fold-block">
            <button className={'topup-fold' + (packsOpen ? ' open' : '')} onClick={() => setPacksOpen(!packsOpen)}>
              <span>Разовые токены</span>
              <b>без подписки</b>
              <i>{packsOpen ? '−' : '+'}</i>
            </button>
            {packsOpen && <React.Fragment>
              <div className="topup-packs">
                {packs.map((p, i) => (
                  <div key={i} className={'opt topup-opt' + (subSel === null && sel === i && !customValid ? ' on' : '')} onClick={() => { setSubSel(null); setSel(i); setCustomAmount(''); setCustomError(''); }}>
                    <Star s={18} c="#c9c7f4"/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span>{p.total_tokens || p.tokens} токенов</span>
                      <div className="muted">
                        {p.effective_price_per_token != null ? p.effective_price_per_token + ' ₽ за токен' : p.price_rub + ' ₽'}
                      </div>
                    </div>
                    <strong>{p.price_rub} ₽</strong>
                  </div>
                ))}
              </div>
              <button className="topup-more" onClick={() => setCustomOpen(!customOpen)}>{customOpen ? 'Скрыть свою сумму' : 'Ввести свою сумму'}</button>
              {customOpen && <React.Fragment>
                <div className="topup-custom">
                  <input type="number" placeholder="Сумма от 99 ₽" value={customAmount}
                    onChange={e => handleCustomChange(e.target.value)}
                    min="99"/>
                  <span>₽</span>
                </div>
                {customError && <div className="topup-error">{customError}</div>}
                {customValid && <div className="topup-custom-preview">
                  <span>{customNum} ₽</span>
                  <b>{customNum} токенов</b>
                </div>}
              </React.Fragment>}
            </React.Fragment>}
          </div>
        </div>

        <div className="topup-footer">
          {payError && <div className="topup-error">{payError}</div>}
          {!paymentsEnabled && <div className="muted" style={{ fontSize:12.5, marginBottom:8 }}>Оплата скоро будет доступна</div>}
          <button className="sheet-cta topup-cta" onClick={handlePay}
            disabled={!paymentsEnabled || paying || (!chosen && !customValid) || !!customError}
            style={{ opacity: (!paymentsEnabled || paying) ? .55 : 1,
                     cursor: (!paymentsEnabled || paying) ? 'not-allowed' : 'pointer' }}>
            {paying ? 'Создаём платёж…'
              : paymentsEnabled ? `Оплатить · ${ctaPrice} ₽`
              : `Скоро будет доступно · ${ctaPrice} ₽`}
          </button>
          <div className="topup-footer-note">
            {selectedSub ? 'Подписка продлевается повторной покупкой.' : 'Разовые токены не сгорают.'}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

// Hide loading screen after first UI paint + first visible covers are either loaded or timed out.
// This keeps the animated loader visible on mobile/desktop while heavy template covers start loading,
// but never blocks the app for too long on a slow connection.
(function() {
  var started = Date.now();
  var minMs = 1750;
  var maxMs = 3800;

  function finish() {
    var left = Math.max(0, minMs - (Date.now() - started));
    setTimeout(function() {
      try { if (typeof window.wjHideLoader === 'function') window.wjHideLoader(); } catch(e) {}
    }, left);
  }

  function criticalImages() {
    try {
      var vh = window.innerHeight || 800;
      return Array.prototype.slice.call(document.querySelectorAll('#root img'))
        .filter(function(img) {
          var r = img.getBoundingClientRect();
          return r.width > 20 && r.height > 20 && r.top < vh * 1.8;
        })
        .slice(0, 8);
    } catch (e) { return []; }
  }

  function waitImages() {
    var imgs = criticalImages();
    var pending = imgs.filter(function(img) { return !img.complete || img.naturalWidth === 0; });
    if (!pending.length) return finish();
    var done = false;
    var remaining = pending.length;
    var timer = setTimeout(end, maxMs);
    function end() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      finish();
    }
    pending.forEach(function(img) {
      var one = function() { remaining -= 1; if (remaining <= 0) end(); };
      img.addEventListener('load', one, { once:true });
      img.addEventListener('error', one, { once:true });
    });
  }

  requestAnimationFrame(function() { requestAnimationFrame(waitImages); });
})();
