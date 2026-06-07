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
  const [mode, setMode] = uS('photo');
  const [preset, setPreset] = uS(null);
  const [model, setModel] = uS(()=>defaultModelForMode('photo'));
  const [aspect, setAspect] = uS(()=>window.MiraCore.ASPECTS[1]);
  const [picker, setPicker] = uS(null); // 'model' | 'aspect' | null

  React.useEffect(()=>{ localStorage.setItem(TAB_KEY, tab); }, [tab]);

  const refreshBalance = React.useCallback(()=>{
    let alive = true;
    if(!window.HubicxApi) return ()=>{};
    window.HubicxApi.me()
      .then(me=>{ if(!alive) return; const next=Number(me.balance_credits || 0); setTokens(next); localStorage.setItem(TOK_KEY, String(next)); setAuthHint(''); })
      .catch(err=>{ if(!alive) return; setTokens(0); setAuthHint(err && err.code==='unauthorized' ? window.HubicxApi.authHint() : 'Баланс временно недоступен'); });
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
      .catch(err=>{ if(!alive) return; setHistoryHint((err && err.code)==='unauthorized' ? window.HubicxApi.authHint() : 'История временно недоступна'); });
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
  const openCreate = (m, p=null) => { applyMode(m); setPreset(p); setCreateOpen(true); };
  const goTab = (t)=>{ setCreateOpen(false); setActiveChat(null); setTab(t); };

  // ---- chat logic ----
  const botReply = (chatId, text, promptPrefix='') => {
    setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:true}:c));
    const fallback = ()=>{
      const line = window.BOT_LINES[Math.floor(Math.random()*window.BOT_LINES.length)];
      setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:false, msgs:[...c.msgs,{role:'bot',text:line}]}:c));
    };
    if(!window.HubicxApi || !window.HubicxApi.getInitData()){
      setTimeout(fallback, 900);
      return;
    }
    const profilePrefix = composeProfilePrefix(profile);
    const fullPrefix = [profilePrefix, promptPrefix].filter(Boolean).join('\n\nРежим агента:\n');
    window.HubicxApi.chat({prompt: fullPrefix ? `${fullPrefix}\n\nЗапрос пользователя: ${text}` : text})
      .then(res=>{
        setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:false, lastTaskId:res.task && res.task.id, msgs:[...c.msgs,{role:'bot',text:res.text || 'Готово'}]}:c));
        refreshAfterTask();
      })
      .catch(err=>{
        const msg = (err && err.message) || 'Не удалось получить ответ';
        setChats(cs=>cs.map(c=>c.id===chatId?{...c, typing:false, msgs:[...c.msgs,{role:'bot',text:msg}]}:c));
        refreshAfterTask();
      });
  };
  const startChat = (text, promptPrefix='') => {
    const id = 'c'+Date.now();
    const title = text.length>34? text.slice(0,34)+'…' : text;
    setChats(cs=>[{id, title, promptPrefix, msgs:[{role:'user',text}], typing:false}, ...cs]);
    setActiveChat(id);
    botReply(id, text, promptPrefix);
  };
  const sendInChat = (text) => {
    setChats(cs=>cs.map(c=>c.id===activeChat?{...c, draft:'', msgs:[...c.msgs,{role:'user',text}]}:c));
    const chat = chats.find(c=>c.id===activeChat);
    botReply(activeChat, text, chat && chat.promptPrefix);
  };
  const openDraftChat = (text='', promptPrefix='') => {
    const draft = (text || '').trim();
    const id = 'c'+Date.now();
    const title = draft ? (draft.length>34? draft.slice(0,34)+'…' : draft) : 'Новый чат';
    setChats(cs=>[{id, title, promptPrefix, draft, msgs:[], typing:false}, ...cs]);
    setActiveChat(id);
  };
  const deleteChat = (id) => setChats(cs=>cs.filter(c=>c.id!==id));
  const curChat = chats.find(c=>c.id===activeChat);

  let body;
  if(createOpen){
    body = <CreateScreen tokens={tokens} mode={mode} setMode={applyMode} preset={preset}
      model={model} aspect={aspect}
      onPickModel={()=>setPicker('model')} onPickAspect={()=>setPicker('aspect')}
      onTaskDone={refreshAfterTask}/>;
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
    {curChat && <ChatScreen chat={curChat} onBack={()=>setActiveChat(null)} onSend={sendInChat}/>}
    {!curChat && <BottomNav tab={createOpen?'gen':tab} onTab={goTab}/>}
    {topup && <Topup tokens={tokens} onClose={()=>setTopup(false)}/>}
    {picker==='model' && <window.PickerSheet title="Модель" options={modelsByType(modelTypeForMode(mode))}
      current={model} onSelect={setModel} onClose={()=>setPicker(null)}/>}
    {picker==='aspect' && <window.PickerSheet title="Соотношение сторон" options={window.MiraCore.ASPECTS}
      current={aspect} onSelect={setAspect} onClose={()=>setPicker(null)}/>}
  </div>;
}

function Topup({ tokens, onClose }){
  const { Star } = window.MiraCore;
  const packs=[{n:50,p:'149 ₽'},{n:150,p:'399 ₽',tag:'Выгодно'},{n:500,p:'1 190 ₽'}];
  const [sel, setSel] = uS(1);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Пополнить токены</div>
        <div className="muted" style={{fontSize:14,marginBottom:14}}>Текущий баланс: {tokens}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {packs.map((p,i)=>(
            <div key={i} className="opt" onClick={()=>setSel(i)}
              style={{border:'1px solid '+(sel===i?'rgba(77,155,245,.7)':'var(--glass-line)'),
                borderRadius:14,padding:'13px 14px',background:sel===i?'rgba(47,128,237,.14)':'rgba(255,255,255,.03)'}}>
              <Star s={20} c="#3e92f0"/>
              <span style={{fontWeight:700,fontSize:17}}>{p.n} токенов</span>
              {p.tag && <span style={{fontSize:12,fontWeight:700,color:'#fff',background:'#2f80ed',
                padding:'3px 9px',borderRadius:8}}>{p.tag}</span>}
              <span style={{marginLeft:'auto',fontWeight:700,fontSize:16}}>{p.p}</span>
            </div>
          ))}
        </div>
      </div>
      <button className="sheet-cta" onClick={onClose}>Оплатить {packs[sel].p}</button>
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
