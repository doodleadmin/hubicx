/* ============ App shell ============ */
const { useState: uS } = React;
const TOK_KEY = 'mira_tokens_v1', TAB_KEY = 'mira_tab_v1', CHATS_KEY = 'hbx_chats_v1';

function App() {
  const { Star } = window.MiraCore;
  const [tab, setTab] = uS(() => localStorage.getItem(TAB_KEY) || 'agent');
  const [tokens] = uS(() => { const v = localStorage.getItem(TOK_KEY); return v == null ? 10 : +v; });
  const [topup, setTopup] = uS(false);

  // chats
  const [chats, setChats] = uS(() => {
    try { return JSON.parse(localStorage.getItem(CHATS_KEY)) || []; } catch(e) { return []; }
  });
  const [activeChat, setActiveChat] = uS(null);
  React.useEffect(() => { localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); }, [chats]);

  // create sub-screen
  const [createOpen, setCreateOpen] = uS(false);
  const [mode, setMode] = uS('photo');
  const [preset, setPreset] = uS(null);
  const [model, setModel] = uS(() => window.MiraCore.MODELS[0]);
  const [aspect, setAspect] = uS(() => window.MiraCore.ASPECTS[1]);
  const [picker, setPicker] = uS(null); // 'model' | 'aspect' | null

  React.useEffect(() => { localStorage.setItem(TAB_KEY, tab); }, [tab]);

  const openCreate = (m, p = null) => { setMode(m); setPreset(p); setCreateOpen(true); };
  const goTab = (t) => { setCreateOpen(false); setActiveChat(null); setTab(t); };

  // chat logic
  const botReply = (chatId) => {
    setChats(cs => cs.map(c => c.id === chatId ? { ...c, typing:true } : c));
    setTimeout(() => {
      const line = window.BOT_LINES[Math.floor(Math.random() * window.BOT_LINES.length)];
      setChats(cs => cs.map(c => c.id === chatId ? { ...c, typing:false, msgs:[...c.msgs,{role:'bot',text:line}] } : c));
    }, 1100);
  };
  const startChat = (text) => {
    const id = 'c' + Date.now();
    const title = text.length > 34 ? text.slice(0, 34) + '…' : text;
    setChats(cs => [{ id, title, msgs:[{ role:'user', text }], typing:false }, ...cs]);
    setActiveChat(id);
    botReply(id);
  };
  const sendInChat = (text) => {
    setChats(cs => cs.map(c => c.id === activeChat ? { ...c, msgs:[...c.msgs,{ role:'user', text }] } : c));
    botReply(activeChat);
  };
  const deleteChat = (id) => setChats(cs => cs.filter(c => c.id !== id));
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
      onStartChat={startChat} chats={chats} onOpenChat={(id) => setActiveChat(id)} onDeleteChat={deleteChat}/>;
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

  React.useEffect(() => {
    let alive = true;
    if (window.HubicxApi && window.HubicxApi.pricing) {
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
        Скоро будет доступно{customValid ? ` · ${customNum} ₽` : ` · ${chosen.price_rub} ₽`}
      </button>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
