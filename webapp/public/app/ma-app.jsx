/* ============ App shell ============ */
/* BUILD: 20260620-pricing2 */
const { useState: uS, useEffect: uE, useRef: uR } = React;
const DESKTOP = !!window.DESKTOP_MODE;
const THEME_KEY = 'hbx_theme_v1';
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

/* Convert server chat messages to local format */
function serverMsgsToLocal(msgs) {
  return (msgs || []).map(function(m) {
    return { role: m.role === 'assistant' ? 'bot' : 'user', text: m.content || '' };
  });
}

function App() {
  const { Star } = window.MiraCore;
  const [tab, setTab] = uS(() => localStorage.getItem(TAB_KEY) || 'agent');
  const [user, setUser] = uS(null);
  const [topup, setTopup] = uS(false);
  const [theme, setTheme] = uS(getInitialTheme);

  // Desktop-only routing state (ignored on mobile)
  const [dtab, setDtab] = uS(deskTabFromLocation);
  const [genInit, setGenInit] = uS({ mode:'photo', prompt:'', tpl:null, modelCode:null, aspectId:null, qualityField:null, qualityValue:null, batchCount:1 });
  const [genKey, setGenKey] = uS(0);
  const [settingsOpen, setSettingsOpen] = uS(false);
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
    if (!DESKTOP || !window.history) return;
    var onPop = function() { setDtab(deskTabFromLocation()); };
    window.addEventListener('popstate', onPop);
    return function() { window.removeEventListener('popstate', onPop); };
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
    window.HubicxApi.me().then(function(u) { setUser(u); setAuthChecked(true);
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

  // Telegram BackButton: show only on real inner screens, not on main tab switches
  var bbHandlerRef = uR(null);
  uE(() => {
    if (DESKTOP) return;
    var tg = window.Telegram && window.Telegram.WebApp;
    var bb = tg && tg.BackButton;
    if (!bb) return;
    if (bbHandlerRef.current) { try { bb.offClick(bbHandlerRef.current); } catch(e) {} }
    var handler = null;
    if (createOpen || activeChat) {
      handler = function() { setCreateOpen(false); setActiveChat(null); };
    } else if (templatesOpen) {
      handler = function() { setTemplatesOpen(false); };
    }
    if (handler) { bb.show(); bb.onClick(handler); bbHandlerRef.current = handler; }
    else { bb.hide(); bbHandlerRef.current = null; }
  }, [createOpen, activeChat, templatesOpen]);

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
    window.HubicxApi.agentCreateChat(mode, text).then(function(data) {
      var c = data.chat;
      var serverMsgs = serverMsgsToLocal(c.messages);
      setChats(cs => [{ id: c.id, title: c.title || 'Новый чат', agent_mode: c.agent_mode || mode, msgs: serverMsgs, loaded: true }, ...cs]);
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
  if (isMiniAppHost && !hasAuth) {
    return <div className={DESKTOP ? 'dk-auth' : 'phone'} style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:24,textAlign:'center'}}>
      <div className={DESKTOP ? 'dk-auth-card' : 'card'} style={{maxWidth:420}}>
        <div style={{fontSize:28,fontWeight:900,marginBottom:10}}>Откройте Hubicx в Telegram</div>
        <div className="muted" style={{fontSize:15,lineHeight:1.45}}>Этот адрес предназначен только для Telegram Mini App. Откройте приложение кнопкой в боте.</div>
        <button className={DESKTOP ? 'dk-btn-main' : 'btn primary'} style={{marginTop:18,width:'100%'}} onClick={() => { window.location.href = 'https://t.me/hubicx_bot'; }}>Открыть бота</button>
      </div>
    </div>;
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
    body = <ProfileScreen tokens={tokens} onTopup={() => setTopup(true)} onTab={goTab} theme={theme} onToggleTheme={toggleTheme}/>;
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
    else dbody = <DeskProfile tokens={tokens} user={user} onTopup={() => setTopup(true)} onSettings={() => setSettingsOpen(true)}/>;

    return <React.Fragment>
      <DeskShell tab={dtab} onTab={goDtab} onProfile={() => goDtab('profile')}
        tokens={tokens} user={user} onTopup={() => setTopup(true)}
        title={meta[0]} subtitle={meta[1]} chatsBadge={chats.length || null}
        theme={theme} onToggleTheme={toggleTheme} searchQuery={deskSearch} onSearchQuery={setDeskSearch}>
        {dbody}
      </DeskShell>
      {topup && <DeskTopup tokens={tokens} onClose={() => setTopup(false)}/>}
      {settingsOpen && <div className="dk-modal-ov" onClick={() => setSettingsOpen(false)}>
        <div className="dk-settings" onClick={e => e.stopPropagation()}>
          <div className="dk-settings-top">
            <span>Настройки профиля</span>
            <button className="dk-settings-x" onClick={() => setSettingsOpen(false)}>✕</button>
          </div>
          <div className="dk-settings-body">
            <ProfileScreen tokens={tokens} onTopup={() => { setSettingsOpen(false); setTopup(true); }} onTab={() => setSettingsOpen(false)} theme={theme} onToggleTheme={toggleTheme}/>
          </div>
        </div>
      </div>}
    </React.Fragment>;
  }

  return <div className="phone">
    {mainContent}
    {topup && <Topup tokens={tokens} onClose={() => setTopup(false)}/>}
  </div>;
}

function Topup({ tokens, onClose }) {
  const { Star } = window.MiraCore;
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
  const [customAmount, setCustomAmount] = uS('');
  const [customError, setCustomError] = uS('');
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

  const chosen = packs[sel] || packs[0];
  const handleCustomChange = (v) => {
    const num = parseInt(v, 10);
    setCustomAmount(v);
    if (!v || isNaN(num)) { setCustomError(''); return; }
    if (num < 99) { setCustomError('Минимум 99 ₽'); return; }
    setCustomError('');
  };
  const customNum = parseInt(customAmount, 10);
  const customValid = customAmount && !isNaN(customNum) && customNum >= 99;

  const handlePay = () => {
    if (paying || !window.HubicxApi) return;
    setPayError('');
    setPaying(true);
    var payload;
    if (customValid) {
      payload = { amount_rub: customNum, credits: customNum };
    } else if (chosen) {
      payload = { amount_rub: chosen.price_rub, credits: chosen.total_tokens || chosen.tokens, package_code: chosen.code };
    } else {
      setPaying(false);
      return;
    }
    window.HubicxApi.createPayment(payload).then(function(data) {
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
        <div className="sheet-title">Пополнить токены</div>
        <div className="muted" style={{ fontSize:13.5, marginBottom:14 }}>Текущий баланс: {tokens} ★</div>

        {bonus && <div className="bonus-card-v2" style={{ margin:'4px 0 18px' }}>
          <div className="bonus-head-v2">
            <div>
              <div className="bonus-title">{bonus.title || '50 токенов сразу + бонусы за задания после проверки'}</div>
              <div className="bonus-note">{bonus.note || 'Бонусные токены доступны для базовых моделей.'}</div>
            </div>
          </div>
          <div className="bonus-list-v2">
            {(bonus.tasks || []).map(function(t) {
              var claimed = !!t.claimed;
              var manual = t.kind === 'manual_claim' && t.claimable !== false;
              var url = t.action_url || '';
              var status = t.status_label || (manual ? 'Доступно' : (t.kind === 'automatic' ? 'Авто' : 'Скоро'));
              return <div className={'bonus-task-v2' + (claimed ? ' done' : '')} key={t.code}>
                <div className="bonus-copy-v2"><span>{t.title}</span><small>{t.description || ''}</small></div>
                <div className="bonus-act-v2">
                  <b>+{t.tokens || t.credits || 0} ★</b>
                  {claimed ? <em>Готово</em>
                    : manual ? <button onClick={() => claimBonus(t.code)}>Забрать</button>
                    : url ? <a href={url} target="_blank" rel="noopener noreferrer">{t.action_label || 'Открыть'}</a>
                    : <em>{status}</em>}
                </div>
              </div>;
            })}
          </div>
        </div>}

        {subs && subs.length > 0 && <React.Fragment>
          <div className="label-sec topup-label" style={{ marginBottom:8 }}>Подписки</div>
          <div className="sub-list">
            {subs.map(function(p) { return <div className="sub-card" key={p.code}>
              <div><b>{p.title}</b>{p.badge && <span>{p.badge}</span>}</div>
              <p>{p.tokens_per_month} токенов / месяц</p>
              <strong>{p.price_rub} ₽/мес</strong>
            </div>; })}
          </div>
        </React.Fragment>}

        <div className="label-sec topup-label" style={{ marginBottom:8 }}>Готовые пакеты</div>
        <div className="topup-packs" style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {packs.map((p, i) => (
            <div key={i} className="opt topup-opt" onClick={() => { setSel(i); setCustomAmount(''); setCustomError(''); }}
              style={{ border:'1px solid ' + (sel === i && !customValid ? 'var(--ink)' : 'var(--line)'),
                borderRadius:14, padding:'13px 14px', background: (sel === i && !customValid) ? '#f8f7f2' : 'transparent' }}>
              <Star s={20} c="#c9c7f4"/>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:800, fontSize:16 }}>{p.total_tokens || p.tokens} токенов</span>
                {p.bonus_tokens > 0 && <span style={{ fontSize:12, fontWeight:800, color:'#7a9c92', marginLeft:6 }}>+{p.bonus_tokens} бонус</span>}
                <div className="muted" style={{ fontSize:11, marginTop:2 }}>
                  {p.effective_price_per_token != null ? p.effective_price_per_token + ' ₽ за токен' : p.price_rub + ' ₽'}
                </div>
              </div>
              <span style={{ fontWeight:800, fontSize:15, whiteSpace:'nowrap' }}>{p.price_rub} ₽</span>
            </div>
          ))}
        </div>

        <div className="label-sec topup-label" style={{ marginTop:16, marginBottom:8 }}>Своя сумма</div>
        <div className="topup-custom" style={{ display:'flex', alignItems:'center', gap:10, background:'#f8f7f2', borderRadius:12,
          padding:'10px 14px', border:'1px solid ' + (customValid ? 'var(--ink)' : 'var(--line)') }}>
          <input type="number" placeholder="Введите сумму от 99 ₽" value={customAmount}
            onChange={e => handleCustomChange(e.target.value)}
            style={{ flex:1, background:'transparent', border:'none', color:'var(--ink)', fontSize:15,
              fontWeight:600, outline:'none', fontFamily:'inherit', MozAppearance:'textfield' }} min="99"/>
          <span style={{ fontWeight:700, fontSize:14.5, color:'var(--muted)' }}>₽</span>
        </div>
        {customError && <div style={{ fontSize:12, marginTop:5, color:'#c0473e', fontWeight:600 }}>{customError}</div>}
        {customValid && <div style={{ marginTop:8, padding:'10px 14px', background:'#f0efe8', borderRadius:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13.5 }}>
            <span className="muted">{customNum} ₽</span>
            <span style={{ fontWeight:800 }}>{customNum} токенов</span>
          </div>
          <div className="muted" style={{ fontSize:11.5, marginTop:3 }}>Бонус: 0 · 1 ₽ = 1 токен</div>
        </div>}

        {payError && <div style={{ fontSize:12.5, marginTop:10, color:'#c0473e', fontWeight:600 }}>{payError}</div>}
        {!paymentsEnabled && <div className="muted" style={{ fontSize:12.5, marginTop:14 }}>Оплата скоро будет доступна</div>}
        <button className="sheet-cta topup-cta" onClick={handlePay}
          disabled={!paymentsEnabled || paying || (!chosen && !customValid) || !!customError}
          style={{ opacity: (!paymentsEnabled || paying) ? .55 : 1,
                   cursor: (!paymentsEnabled || paying) ? 'not-allowed' : 'pointer' }}>
          {paying ? 'Создаём платёж…'
            : paymentsEnabled ? `Оплатить · ${ctaPrice} ₽`
            : `Скоро будет доступно · ${ctaPrice} ₽`}
        </button>
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
