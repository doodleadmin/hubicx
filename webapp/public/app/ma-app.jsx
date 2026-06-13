/* ============ App shell ============ */
const { useState: uS, useEffect: uE, useRef: uR } = React;
const TAB_KEY = 'mira_tab_v1';

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

  // Load user balance on mount
  uE(() => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.me().then(function(u) { setUser(u); }).catch(function() {});
  }, []);

  const tokens = user ? user.balance_credits : '…';
  const refreshBalance = () => {
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.me().then(function(u) { setUser(u); }).catch(function() {});
    }
  };

  // chats: {id: number, title, msgs: [{role:'user'|'bot', text, streaming?}], loaded}
  const [chats, setChats] = uS([]);
  const [activeChat, setActiveChat] = uS(null);
  const streamCtrl = uR(null); // AbortController for current SSE stream

  // Load chat list on mount
  uE(() => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.agentChats().then(function(data) {
      if (data && Array.isArray(data.chats)) {
        setChats(data.chats.map(function(c) {
          return { id: c.id, title: c.title || 'Чат', msgs: [], loaded: false };
        }));
      }
    }).catch(function() {});
  }, []);

  // create sub-screen
  const [createOpen, setCreateOpen] = uS(false);
  const [mode, setMode] = uS('photo');
  const [preset, setPreset] = uS(null);
  const [model, setModel] = uS(() => window.MiraCore.MODELS[0]);
  const [aspect, setAspect] = uS(() => window.MiraCore.ASPECTS[1]);
  const [picker, setPicker] = uS(null);

  uE(() => { localStorage.setItem(TAB_KEY, tab); }, [tab]);

  const openCreate = (m, p = null) => { setMode(m); setPreset(p); setCreateOpen(true); };
  const goTab = (t) => { setCreateOpen(false); setActiveChat(null); setTab(t); };

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
  const startChat = (text) => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.agentCreateChat('default', text).then(function(data) {
      var c = data.chat;
      var serverMsgs = serverMsgsToLocal(c.messages);
      setChats(cs => [{ id: c.id, title: c.title || 'Новый чат', msgs: serverMsgs, loaded: true }, ...cs]);
      setActiveChat(c.id);
      doStream(c.id, text);
    }).catch(function(err) {
      alert((err && err.message) || 'Не удалось создать чат');
    });
  };

  // Send message in existing chat
  const sendInChat = (text) => {
    if (!activeChat) return;
    setChats(cs => cs.map(c => c.id === activeChat
      ? { ...c, msgs: [...c.msgs, { role: 'user', text: text }] }
      : c
    ));
    doStream(activeChat, text);
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
            ? { ...c, msgs: serverMsgs, loaded: true, title: data.chat.title || c.title }
            : c
          ));
        }).catch(function() {});
      }
      return cs;
    });
  };

  const curChat = chats.find(c => c.id === activeChat);

  let body;
  if (createOpen) {
    body = <CreateScreen tokens={tokens} mode={mode} setMode={setMode} preset={preset}
      model={model} aspect={aspect}
      onPickModel={() => setPicker('model')} onPickAspect={() => setPicker('aspect')}
      onBack={() => setCreateOpen(false)}/>;
  } else if (tab === 'agent') {
    body = <AgentScreen tokens={tokens} onBuyPro={() => setTopup(true)}
      onCreatePhoto={() => openCreate('photo')} onCreateVideo={() => openCreate('video')}
      onTopup={() => setTopup(true)} onTab={goTab}
      onStartChat={startChat} chats={chats}
      onOpenChat={openChat} onDeleteChat={deleteChat}/>;
  } else if (tab === 'gen') {
    body = <GenerationScreen tokens={tokens} onTopup={() => setTopup(true)}
      onCreatePhoto={() => openCreate('photo')} onCreateVideo={() => openCreate('video')}
      onTemplate={(t) => openCreate('photo', t)} onTab={goTab}/>;
  } else {
    body = <ProfileScreen tokens={tokens} onTopup={() => setTopup(true)} onTab={goTab}/>;
  }

  return <div className="phone">
    {body}
    {curChat && <ChatScreen chat={curChat} onBack={() => setActiveChat(null)} onSend={sendInChat}/>}
    {topup && <Topup tokens={tokens} onClose={() => setTopup(false)}/>}
    {picker === 'model' && <window.PickerSheet title="Модель" options={window.MiraCore.MODELS}
      current={model} onSelect={setModel} onClose={() => setPicker(null)}/>}
    {picker === 'aspect' && <window.PickerSheet title="Соотношение сторон" options={window.MiraCore.ASPECTS}
      current={aspect} onSelect={setAspect} onClose={() => setPicker(null)}/>}
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
  const [packs, setPacks] = uS(fallbackPacks);
  const [sel, setSel] = uS(1);
  const [customAmount, setCustomAmount] = uS('');
  const [customError, setCustomError] = uS('');

  uE(() => {
    let alive = true;
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.pricing().then(data => {
        if (alive && data && Array.isArray(data.token_packages) && data.token_packages.length)
          setPacks(data.token_packages);
      }).catch(() => {});
    }
    return () => { alive = false; };
  }, []);

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

  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Пополнить токены</div>
        <div className="muted" style={{ fontSize:13.5, marginBottom:14 }}>Текущий баланс: {tokens} ★</div>

        <div className="label-sec" style={{ marginBottom:8 }}>Готовые пакеты</div>
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {packs.map((p, i) => (
            <div key={i} className="opt" onClick={() => setSel(i)}
              style={{ border:'1px solid ' + (sel === i ? 'var(--ink)' : 'var(--line)'),
                borderRadius:14, padding:'13px 14px', background: sel === i ? '#f8f7f2' : 'transparent' }}>
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
          padding:'10px 14px', border:'1px solid var(--line)' }}>
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

        <div className="muted" style={{ fontSize:12.5, marginTop:14 }}>Оплата скоро будет доступна</div>
      </div>
      <button className="sheet-cta" disabled style={{ opacity:.55, cursor:'not-allowed' }}>
        Скоро будет доступно{customValid ? ` · ${customNum} ₽` : ` · ${chosen ? chosen.price_rub : ''} ₽`}
      </button>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
