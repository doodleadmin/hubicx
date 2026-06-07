/* ============ Agent (home) screen ============ */
const HUBICX_AGENTS = [
  {name:'Prompt Master', description:'Улучшает промпты', prompt:'Ты Prompt Master Hubicx. Улучши запрос пользователя для генеративной AI-модели.', quick:['Улучши промпт','Сделай 3 варианта']},
  {name:'SMM Assistant', description:'Идеи и посты', prompt:'Ты SMM Assistant Hubicx. Помогай с контент-планом, постами и рекламными текстами.', quick:['Пост для Telegram','Идеи Reels']},
  {name:'Design Brief Builder', description:'Бриф для дизайна', prompt:'Ты Design Brief Builder Hubicx. Превращай идею в понятный дизайн-бриф.', quick:['Собери бриф','Moodboard prompt']},
  {name:'Video Script Writer', description:'Сценарии видео', prompt:'Ты Video Script Writer Hubicx. Пиши короткие сценарии и shot list для видео.', quick:['Сценарий 15 сек','Shot list']},
  {name:'Telegram Bot Copywriter', description:'Тексты для ботов', prompt:'Ты Telegram Bot Copywriter Hubicx. Пиши тексты кнопок, онбординг и сообщения для Telegram-ботов.', quick:['Онбординг','Текст кнопок']},
];

function AgentScreen({ tokens, authHint, onBuyPro, onCreatePhoto, onCreateVideo, onTopup, onStartChat, chats, onOpenChat, onDeleteChat }){
  const { Ic, TokenBadge, HERO } = window.MiraCore;
  const [val, setVal] = useState("");
  const [agent, setAgent] = useState(HUBICX_AGENTS[0]);
  const send = ()=>{ const t=val.trim(); if(!t) return; setVal(""); onStartChat(t, agent.prompt); };
  return <div className="screen scr-enter">
    <div className="topbar">
      <div className="tb-av" style={{padding:0,overflow:'hidden'}}>
        <img src="assets/logo.jpg" alt="Hubicx" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      </div>
      <div className="tb-pro" onClick={onBuyPro}><Ic n="bolt" s={17} c="#fff"/> Купить Hubicx Pro</div>
      <TokenBadge n={tokens}/>
    </div>
    {authHint && <div className="muted" style={{textAlign:'center',fontSize:12,marginTop:8}}>{authHint}</div>}

    <h1 style={{fontSize:30,fontWeight:800,lineHeight:1.15,letterSpacing:'-.02em',
      textAlign:'center',margin:'42px 8px 30px'}}>Чем я могу помочь Вам сегодня?</h1>

    <div className="askbar">
      <input placeholder="Спросить что-нибудь..." value={val}
        onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==='Enter') send(); }}/>
      <div className={"send"+(val.trim()?" on":"")} onClick={send}><Ic n="arrowUp" s={20}/></div>
    </div>

    <div style={{display:'flex',gap:10,marginTop:14}}>
      <div className="pill" style={{flex:1}} onClick={onCreatePhoto}><Ic n="image" s={19}/> Создать фото</div>
      <div className="pill" style={{flex:1}} onClick={onCreateVideo}><Ic n="video" s={19}/> Создать видео</div>
    </div>
    <div style={{display:'flex',justifyContent:'center',marginTop:10}}>
      <div className="pill"><Ic n="chat" s={18}/> Добавить в чат</div>
    </div>

    <div className="rail" style={{marginTop:14}}>
      {HUBICX_AGENTS.map(a=><div key={a.name} className="pill" onClick={()=>setAgent(a)}
        style={{scrollSnapAlign:'start',whiteSpace:'nowrap',borderColor:agent.name===a.name?'rgba(77,155,245,.7)':'var(--glass-line)'}}>
        {a.name}
      </div>)}
    </div>
    <div className="muted" style={{fontSize:12,marginTop:8,textAlign:'center'}}>{agent.description}</div>

    {chats && chats.length>0 && <>
      <div className="sec-h"><h2>Мои чаты</h2></div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {chats.map(c=>(
          <div className="chat-plate" key={c.id} onClick={()=>onOpenChat(c.id)}>
            <div className="cp-av"><img src="assets/logo.jpg" alt=""/></div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontWeight:700,fontSize:15,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.title}</div>
              <div className="muted" style={{fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.msgs.length? c.msgs[c.msgs.length-1].text : ''}</div>
            </div>
            <div className="cp-x" onClick={e=>{ e.stopPropagation(); onDeleteChat(c.id); }}><Ic n="close" s={17}/></div>
          </div>
        ))}
      </div>
    </>}

    <div className="sec-h">
      <h2>Фото и видео</h2>
      <span className="all">Показать все</span>
    </div>
    <div className="rail">
      {HERO.map((h,i)=>(
        <div className="thumb" key={i} style={{width:152,height:152,scrollSnapAlign:'start'}}>
          <img src={h.img} alt=""/>
        </div>
      ))}
    </div>
  </div>;
}
window.AgentScreen = AgentScreen;
