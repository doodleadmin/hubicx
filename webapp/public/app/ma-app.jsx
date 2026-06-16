/* ============ App shell ============ */
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
  const [tabHistory, setTabHistory] = uS([]); // stack for BackButton navigation
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
    window.HubicxApi.me().then(function(u) { setUser(u); setAuthChecked(true); })
      .catch(function(e) {
        // Stale/invalid desktop token → drop it so the auth screen shows
        if (e && (e.code === 'token_expired' || e.code === 'invalid_token' || e.status === 401) && !window.HubicxApi.isTelegram()) {
          window.HubicxApi.logout();
        }
        setAuthChecked(true);
      });
  }, []);

  // Telegram BackButton: show on sub-screens and tab history, hide on main tabs
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
    } else if (tabHistory.length > 0) {
      handler = goBackTab;
    }
    if (handler) { bb.show(); bb.onClick(handler); bbHandlerRef.current = handler; }
    else { bb.hide(); bbHandlerRef.current = null; }
  }, [createOpen, activeChat, tabHistory]);

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

  uE(() => { localStorage.setItem(TAB_KEY, tab); }, [tab]);

  const openCreate = (m, p = null) => { setMode(m); setPreset(p); setCreateOpen(true); };
  const goTab = (t) => {
    if (t !== tab) { setTabHistory(h => [...h, tab]); }
    setCreateOpen(false); setActiveChat(null); setTab(t);
  };
  const goBackTab = () => {
    setTabHistory(h => {
      if (h.length === 0) return h;
      var prev = h[h.length - 1];
      setTimeout(() => setTab(prev), 0);
      return h.slice(0, -1);
    });
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
      doStream(c.id, text);
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
    body = <CreateScreen tokens={tokens} mode={mode} setMode={setMode} preset={preset}
      onBack={() => setCreateOpen(false)} onMinimize={() => goTab('gen')} refreshBalance={refreshBalance}/>;
  } else if (tab === 'agent') {
    body = <AgentScreen tokens={tokens} onBuyPro={() => setTopup(true)}
      onCreatePhoto={() => openCreate('photo')} onCreateVideo={() => openCreate('video')}
      onTopup={() => setTopup(true)} onTab={goTab}
      onStartChat={startChat} chats={chats}
      onOpenChat={openChat} onDeleteChat={deleteChat}
      onTemplate={(t) => openCreate(t && t.type === 'video' ? 'video' : 'photo', t)}/>;
  } else if (tab === 'gen') {
    body = <GenerationScreen tokens={tokens} onTopup={() => setTopup(true)}
      onCreatePhoto={() => openCreate('photo')} onCreateVideo={() => openCreate('video')}
      onTemplate={(t) => openCreate('photo', t)} onTab={goTab}/>;
  } else {
    body = <ProfileScreen tokens={tokens} onTopup={() => setTopup(true)} onTab={goTab} theme={theme} onToggleTheme={toggleTheme}/>;
  }

  const mainContent = <React.Fragment>
    {body}
    {curChat && <ChatScreen chat={curChat} onBack={() => setActiveChat(null)} onSend={sendInChat}/>}
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
    { code:'start',  title:'160 токенов',  tokens:160,  price_rub:149,  bonus_tokens:11,  total_tokens:160,  effective_price_per_token:0.93 },
    { code:'basic',  title:'450 токенов',  tokens:450,  price_rub:399,  bonus_tokens:51,  total_tokens:450,  effective_price_per_token:0.89 },
    { code:'pro',    title:'1000 токенов', tokens:1000, price_rub:849,  bonus_tokens:151, total_tokens:1000, effective_price_per_token:0.85 },
    { code:'max',    title:'2200 токенов', tokens:2200, price_rub:1690, bonus_tokens:510, total_tokens:2200, effective_price_per_token:0.77 },
    { code:'ultra',  title:'4200 токенов', tokens:4200, price_rub:2990, bonus_tokens:1210,total_tokens:4200, effective_price_per_token:0.71 },
  ];
  const [packs, setPacks] = uS(null); // null = loading; set by API or fallback on error
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
        if (data && data.payments_enabled) setPaymentsEnabled(true);
      }).catch(() => { if (alive) setPacks(fallbackPacks); });
    } else {
      setPacks(fallbackPacks);
    }
    return () => { alive = false; };
  }, []);

  if (packs === null) {
    return <div className="sheet-ov" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:'36px 20px' }}>
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

  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Пополнить токены</div>
        <div className="muted" style={{ fontSize:13.5, marginBottom:14 }}>Текущий баланс: {tokens} ★</div>

        <div className="label-sec" style={{ marginBottom:8 }}>Готовые пакеты</div>
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {packs.map((p, i) => (
            <div key={i} className="opt" onClick={() => { setSel(i); setCustomAmount(''); setCustomError(''); }}
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

        <div className="label-sec" style={{ marginTop:16, marginBottom:8 }}>Своя сумма</div>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f8f7f2', borderRadius:12,
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
      </div>
      <button className="sheet-cta" onClick={handlePay}
        disabled={!paymentsEnabled || paying || (!chosen && !customValid) || !!customError}
        style={{ opacity: (!paymentsEnabled || paying) ? .55 : 1,
                 cursor: (!paymentsEnabled || paying) ? 'not-allowed' : 'pointer' }}>
        {paying ? 'Создаём платёж…'
          : paymentsEnabled ? `Оплатить · ${ctaPrice} ₽`
          : `Скоро будет доступно · ${ctaPrice} ₽`}
      </button>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

// Hide loading screen
try { if (typeof window.wjHideLoader === 'function') window.wjHideLoader(); } catch(e) {}
