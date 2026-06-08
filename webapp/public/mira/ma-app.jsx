/* ============ App shell ============ */
const { useState: uS } = React;
const TOK_KEY='mira_tokens_v1', TAB_KEY='mira_tab_v1', CHATS_KEY='hbx_chats_v1', PROF_KEY='hbx_profile_v1';

function loadMiraProfile(){
  try{ return JSON.parse(localStorage.getItem(PROF_KEY)) || JSON.parse(localStorage.getItem('hubicx-profile')) || {}; }
  catch(e){ return {}; }
}

function profileLine(label, value){ return value ? `- ${label}: ${value}` : ''; }

function composeProfilePrefix(profile){
  const p = profile || loadMiraProfile();
  let about = p.about_user || '';
  let personality = p.hubicx_personality || '';
  try{ const a = JSON.parse(about); about = [a.name, a.activity, a.interests, a.location].filter(Boolean).join('; '); }catch(e){}
  try{ const h = JSON.parse(personality); personality = [h.hubicxLang, h.traits].filter(Boolean).join('; '); }catch(e){}
  const lines = [
    profileLine('О пользователе', about),
    profileLine('Предпочитаемый стиль общения', p.communication_style || p.style),
    profileLine('Личность Hubicx', personality || p.traits),
    profileLine('Язык ответа', p.language_code || p.lang),
    profileLine('Эмодзи/персона', p.persona_emoji || p.emoji),
  ].filter(Boolean);
  return lines.length ? `Профиль пользователя:\n${lines.join('\n')}` : '';
}

function App(){
  const { BottomNav, Star, defaultModelForMode, isModelAllowedForMode, modelsByType, modelTypeForMode } = window.MiraCore;
  const [lang, setLang] = uS(()=>window.HubicxI18n ? window.HubicxI18n.getLang() : 'ru');
  const t = window.t || ((k)=>k);
  const [tab, setTab] = uS(()=>localStorage.getItem(TAB_KEY)||'agent');
  const [tokens, setTokens] = uS(()=>{ const v=localStorage.getItem(TOK_KEY); return v==null?0:+v; });
  const [authHint, setAuthHint] = uS('');
  const [topup, setTopup] = uS(false);
  const [history, setHistory] = uS([]);
  const [historyHint, setHistoryHint] = uS('');
  const [profile, setProfile] = uS(()=>loadMiraProfile());

  // chats
  const [chats, setChats] = uS(()=>{ try{ return JSON.parse(localStorage.getItem(CHATS_KEY))||[]; }catch(e){ return []; } });
  const [activeChat, setActiveChat] = uS(null); // chat id
  React.useEffect(()=>{ localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); }, [chats]);

  // create sub-screen state
  const [createOpen, setCreateOpen] = uS(false);
  const [createKey, setCreateKey] = uS(0);
  const [mode, setMode] = uS('photo');
  const [preset, setPreset] = uS(null);
  const [model, setModel] = uS(()=>defaultModelForMode('photo'));
  const [aspect, setAspect] = uS(()=>window.MiraCore.ASPECTS[1]);
  const [picker, setPicker] = uS(null); // 'model' | 'aspect' | null

  React.useEffect(()=>{ localStorage.setItem(TAB_KEY, tab); }, [tab]);
  React.useEffect(()=>{
    const h = (e)=>setLang((e && e.detail && e.detail.lang) || (window.HubicxI18n && window.HubicxI18n.getLang()) || 'ru');
    window.addEventListener('hubicx:lang', h);
    return ()=>window.removeEventListener('hubicx:lang', h);
  }, []);

  const refreshBalance = React.useCallback(()=>{
    let alive = true;
    if(!window.HubicxApi) return ()=>{};
    window.HubicxApi.me()
      .then(me=>{ if(!alive) return; const next=Number(me.balance_credits || 0); setTokens(next); localStorage.setItem(TOK_KEY, String(next)); setAuthHint(''); })
      .catch(err=>{ if(!alive) return; setTokens(0); setAuthHint(err && err.code==='unauthorized' ? t('common.open_telegram') : t('common.balance_unavailable')); });
    return ()=>{ alive=false; };
  }, []);
  React.useEffect(()=>{
    return refreshBalance();
  }, []);
  const refreshHistory = React.useCallback(()=>{
    let alive = true;
    if(!window.HubicxApi || !window.HubicxApi.getInitData()) { setHistory([]); return ()=>{}; }
    window.HubicxApi.history()
      .then(items=>{ if(!alive) return; setHistory(Array.isArray(items) ? items.slice(0,10) : []); setHistoryHint(''); })
      .catch(err=>{ if(!alive) return; setHistoryHint((err && err.code)==='unauthorized' ? t('common.open_telegram') : t('history.unavailable')); });
    return ()=>{ alive=false; };
  }, []);
  React.useEffect(()=>{ return refreshHistory(); }, []);
  const refreshAfterTask = React.useCallback(()=>{ refreshBalance(); refreshHistory(); }, [refreshBalance, refreshHistory]);
  const refreshProfile = React.useCallback(()=>{
    if(!window.HubicxApi || !window.HubicxApi.getInitData()) return;
    window.HubicxApi.profile().then(p=>{
      setProfile(p || {});
      localStorage.setItem(PROF_KEY, JSON.stringify(p || {}));
      localStorage.setItem('hubicx-profile', JSON.stringify(p || {}));
      if(p && p.language_code) localStorage.setItem('hubicx-language', p.language_code);
      if(p && p.language_code && window.HubicxI18n) window.HubicxI18n.setLang(p.language_code);
    }).catch(()=>{});
  }, []);
  React.useEffect(()=>{ refreshProfile(); }, []);

  const applyMode = (m) => {
    setMode(m);
    setModel(cur=>isModelAllowedForMode(cur, m) ? cur : defaultModelForMode(m));
  };
  React.useEffect(()=>{
    if(!isModelAllowedForMode(model, mode)) setModel(defaultModelForMode(mode));
  }, [mode, model && model.code]);
  const openCreate = (m, p=null) => { applyMode(m); setPreset(p); setCreateKey(k=>k+1); setCreateOpen(true); };
  const newGeneration = () => { setPreset(null); setCreateKey(k=>k+1); };
  const goTab = (t)=>{ setCreateOpen(false); setActiveChat(null); setTab(t); };

  // ---- chat logic ----
  const botReply = (chatId, text, agentMode='general') => {
    setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:true}:c));
    const fallback = ()=>{
      const line = window.BOT_LINES[Math.floor(Math.random()*window.BOT_LINES.length)];
      setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:false, msgs:[...c.msgs,{role:'bot',text:line}]}:c));
    };
    if(!window.HubicxApi || !window.HubicxApi.getInitData()){
      setTimeout(fallback, 900);
      return;
    }
    const agent = window.getAgentByCode ? window.getAgentByCode(agentMode) : null;
    const rolePrefix = (agent && agent.prompt) || '';
    const profilePrefix = composeProfilePrefix(profile);
    const fullPrefix = [profilePrefix, rolePrefix].filter(Boolean).join('\n\n');
    window.HubicxApi.chat({prompt: fullPrefix ? `${fullPrefix}\n\nЗапрос пользователя: ${text}` : text})
      .then(res=>{
        setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:false, lastTaskId:res.task && res.task.id, msgs:[...c.msgs,{role:'bot',text:res.text || 'Готово'}]}:c));
        refreshAfterTask();
      })
      .catch(err=>{
        const msg = (err && err.message) || t('agent.no_answer');
        setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:false, msgs:[...c.msgs,{role:'bot',text:msg}]}:c));
        refreshAfterTask();
      });
  };
  const startChat = (text) => {
    const id = 'c'+Date.now();
    const title = text.length>34? text.slice(0,34)+'…' : text;
    setChats(cs=>[{id, title, agentMode:'general', msgs:[{role:'user',text}], typing:false}, ...cs]);
    setActiveChat(id);
    botReply(id, text, 'general');
  };
  const sendInChat = (text) => {
    setChats(cs=>cs.map(c=>c.id===activeChat?{...c, draft:'', msgs:[...c.msgs,{role:'user',text}]}:c));
    const chat = chats.find(c=>c.id===activeChat);
    botReply(activeChat, text, chat && chat.agentMode);
  };
  const openDraftChat = (text='') => {
    const draft = (text || '').trim();
    const id = 'c'+Date.now();
    const title = draft ? (draft.length>34? draft.slice(0,34)+'…' : draft) : t('agent.new_chat');
    setChats(cs=>[{id, title, agentMode:'general', draft, msgs:[], typing:false}, ...cs]);
    setActiveChat(id);
  };
  const changeChatMode = (modeCode) => {
    setChats(cs=>cs.map(c=>c.id===activeChat?{...c, agentMode:modeCode}:c));
  };
  const deleteChat = (id) => setChats(cs=>cs.filter(c=>c.id!==id));
  const curChat = chats.find(c=>c.id===activeChat);

  let body;
  if(createOpen){
    body = <CreateScreen key={createKey} tokens={tokens} mode={mode} setMode={applyMode} preset={preset}
      model={model} aspect={aspect}
      onPickModel={()=>setPicker('model')} onPickAspect={()=>setPicker('aspect')}
      onTaskDone={refreshAfterTask} onNewGeneration={newGeneration} onContinueChat={openDraftChat}/>;
  } else if(tab==='agent'){
    body = <AgentScreen tokens={tokens} authHint={authHint} onBuyPro={()=>setTopup(true)}
      onCreatePhoto={()=>openCreate('photo')} onCreateVideo={()=>openCreate('video')} onTopup={()=>setTopup(true)}
      onStartChat={startChat} onAddToChat={openDraftChat} chats={chats} onOpenChat={(id)=>setActiveChat(id)} onDeleteChat={deleteChat}/>;
  } else if(tab==='gen'){
    body = <GenerationScreen tokens={tokens} authHint={authHint} onTopup={()=>setTopup(true)}
      onCreatePhoto={()=>openCreate('photo')} onCreateVideo={()=>openCreate('video')}
      onTemplate={(t)=>openCreate('photo', t)} history={history} historyHint={historyHint}
      onRefreshHistory={refreshHistory} onBalanceRefresh={refreshBalance}/>;
  } else {
    body = <ProfileScreen tokens={tokens} authHint={authHint} onTopup={()=>setTopup(true)} history={history} historyHint={historyHint}
      onRefreshHistory={refreshHistory} onBalanceRefresh={refreshBalance} onProfileChange={setProfile}/>;
  }

  return <div className="phone">
    <div className="bgfx"><div className="blob b1"></div><div className="blob b2"></div></div>
    {body}
    {curChat && <ChatScreen chat={curChat} onBack={()=>setActiveChat(null)} onSend={sendInChat} onModeChange={changeChatMode}/>}
    {!curChat && <BottomNav tab={createOpen?'gen':tab} onTab={goTab}/>}
    {topup && <Topup tokens={tokens} onClose={()=>setTopup(false)}/>}
    {picker==='model' && <window.PickerSheet title={t('gen.model')} options={modelsByType(modelTypeForMode(mode))}
      current={model} onSelect={setModel} onClose={()=>setPicker(null)}/>}
    {picker==='aspect' && <window.PickerSheet title={t('gen.aspect')} options={window.MiraCore.ASPECTS}
      current={aspect} onSelect={setAspect} onClose={()=>setPicker(null)}/>}
  </div>;
}

function Topup({ tokens, onClose }){
  const { Star } = window.MiraCore;
  const t = window.t || ((k)=>k);
  const fallbackPacks=[
    {code:'start',title:'160 токенов',tokens:160,price_rub:149,bonus_tokens:11,base_tokens:149,total_tokens:160,effective_price_per_token:0.93},
    {code:'basic',title:'450 токенов',tokens:450,price_rub:399,bonus_tokens:51,base_tokens:399,total_tokens:450,effective_price_per_token:0.89},
    {code:'pro',title:'1000 токенов',tokens:1000,price_rub:849,bonus_tokens:151,base_tokens:849,total_tokens:1000,effective_price_per_token:0.85},
    {code:'max',title:'2200 токенов',tokens:2200,price_rub:1690,bonus_tokens:510,base_tokens:1690,total_tokens:2200,effective_price_per_token:0.77},
    {code:'ultra',title:'4200 токенов',tokens:4200,price_rub:2990,bonus_tokens:1210,base_tokens:2990,total_tokens:4200,effective_price_per_token:0.71},
  ];
  const [packs, setPacks] = uS(fallbackPacks);
  const [sel, setSel] = uS(1);
  const [customAmount, setCustomAmount] = uS('');
  const [customError, setCustomError] = uS('');
  React.useEffect(()=>{
    let alive=true;
    if(window.HubicxApi && window.HubicxApi.pricing){
      window.HubicxApi.pricing().then(data=>{
        if(alive && data && Array.isArray(data.token_packages) && data.token_packages.length) setPacks(data.token_packages);
      }).catch(()=>{});
    }
    return ()=>{ alive=false; };
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
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{t('profile.topup')}</div>
        <div className="muted" style={{fontSize:14,marginBottom:14}}>{t('profile.current_balance',{tokens})}</div>

        {/* Готовые пакеты */}
        <div className="label-sec" style={{marginBottom:8}}>Готовые пакеты</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {packs.map((p,i)=>(
            <div key={i} className="opt" onClick={()=>setSel(i)}
              style={{border:'1px solid '+(sel===i?'rgba(77,155,245,.7)':'var(--glass-line)'),
                borderRadius:14,padding:'13px 14px',background:sel===i?'rgba(47,128,237,.14)':'rgba(255,255,255,.03)'}}>
              <Star s={20} c="#3e92f0"/>
              <div style={{flex:1}}>
                <span style={{fontWeight:700,fontSize:17}}>{(p.total_tokens || p.tokens)} {t('common.tokens')}</span>
                {p.bonus_tokens > 0 && <span style={{fontSize:12,fontWeight:700,color:'#2f80ed',marginLeft:6}}>+{p.bonus_tokens} бонус</span>}
                <div className="muted" style={{fontSize:11,marginTop:2}}>
                  {p.effective_price_per_token != null ? `${p.effective_price_per_token} ₽ за токен` : `${p.price_rub} ₽`}
                </div>
              </div>
              <span style={{fontWeight:700,fontSize:16}}>{p.price_rub} ₽</span>
            </div>
          ))}
        </div>

        {/* Своя сумма */}
        <div className="label-sec" style={{marginTop:18,marginBottom:8}}>Своя сумма</div>
        <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,.04)',borderRadius:12,padding:'10px 14px',border:'1px solid var(--glass-line)'}}>
          <input type="number" placeholder="Введите сумму от 99 ₽" value={customAmount}
            onChange={e=>handleCustomChange(e.target.value)}
            style={{flex:1,background:'transparent',border:'none',color:'#fff',fontSize:16,fontWeight:600,outline:'none',
              fontFamily:'inherit',MozAppearance:'textfield'}} min="99"/>
          <span style={{fontWeight:700,fontSize:15,color:'rgba(255,255,255,.5)'}}>₽</span>
        </div>
        {customError && <div className="muted" style={{fontSize:12,marginTop:6,color:'#ff4d3d'}}>{customError}</div>}
        {customValid && <div style={{marginTop:8,padding:'10px 14px',background:'rgba(47,128,237,.08)',borderRadius:10}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
            <span style={{color:'rgba(255,255,255,.6)'}}>{customNum} ₽</span>
            <span style={{fontWeight:700}}>{customNum} токенов</span>
          </div>
          <div className="muted" style={{fontSize:12,marginTop:4}}>Бонус: 0 · 1 ₽ = 1 токен</div>
        </div>}

        <div className="muted" style={{fontSize:13,marginTop:14}}>Оплата скоро будет доступна</div>
      </div>
      <button className="sheet-cta" disabled style={{opacity:.55,cursor:'not-allowed'}} onClick={e=>e.preventDefault()}>
        Скоро будет доступно{customValid ? ` · ${customNum} ₽` : chosen ? ` · ${chosen.price_rub} ₽` : ''}
      </button>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
