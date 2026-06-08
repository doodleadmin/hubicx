/* ============ Agent (home) screen ============ */
const HUBICX_AGENTS = [
  {code:'general', nameKey:'agent.mode.general', descKey:'agent.mode.general.desc', prompt:''},
  {code:'prompt_master', nameKey:'agent.mode.prompt_master', descKey:'agent.mode.prompt_master.desc', prompt:'Ты Prompt Master Hubicx. Улучши запрос пользователя для генеративной AI-модели. Отвечай кратко, структурно и сразу давай готовый промпт.', quickKeys:['quick.improve','quick.variants','quick.cinematic']},
  {code:'smm_assistant', nameKey:'agent.mode.smm_assistant', descKey:'agent.mode.smm_assistant.desc', prompt:'Ты SMM Assistant Hubicx. Помогай с контент-планом, постами, рекламными текстами и идеями для соцсетей. Пиши практично и в тоне бренда.', quickKeys:['quick.tg_post','quick.reels','quick.week_plan']},
  {code:'design_brief', nameKey:'agent.mode.design_brief', descKey:'agent.mode.design_brief.desc', prompt:'Ты Design Brief Builder Hubicx. Превращай идею в понятный дизайн-бриф: цель, аудитория, стиль, референсы, deliverables и критерии результата.', quickKeys:['quick.brief','quick.moodboard','quick.brand']},
  {code:'video_script', nameKey:'agent.mode.video_script', descKey:'agent.mode.video_script.desc', prompt:'Ты Video Script Writer Hubicx. Пиши короткие сценарии, hooks, структуру ролика и shot list для генерации видео.', quickKeys:['quick.script15','quick.shotlist','quick.hook']},
  {code:'bot_copywriter', nameKey:'agent.mode.bot_copywriter', descKey:'agent.mode.bot_copywriter.desc', prompt:'Ты Telegram Bot Copywriter Hubicx. Пиши тексты кнопок, онбординг, сообщения, команды и microcopy для Telegram-ботов.', quickKeys:['quick.onboarding','quick.buttons','quick.payment']},
];

function getAgentByCode(code){ return HUBICX_AGENTS.find(a=>a.code===code) || HUBICX_AGENTS[0]; }

function AgentScreen({ tokens, authHint, onBuyPro, onCreatePhoto, onCreateVideo, onTopup, onStartChat, onAddToChat, chats, onOpenChat, onDeleteChat }){
  const { Ic, TokenBadge, HERO } = window.MiraCore;
  const t = window.t || ((k)=>k);
  const [val, setVal] = useState("");
  const send = ()=>{ const txt=val.trim(); if(!txt) return; setVal(""); onStartChat(txt); };
  return <div className="screen agent-screen scr-enter">
    <div className="topbar">
      <div className="tb-av" style={{padding:0,overflow:'hidden'}}>
        <img src="assets/logo.jpg" alt="Hubicx" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      </div>
      <div className="tb-pro" onClick={onBuyPro}><Ic n="bolt" s={17} c="#fff"/> {t('common.buy_pro')}</div>
      <TokenBadge n={tokens}/>
    </div>
    {authHint && <div className="muted" style={{textAlign:'center',fontSize:12,marginTop:8}}>{authHint}</div>}

    <h1 style={{fontSize:30,fontWeight:800,lineHeight:1.15,letterSpacing:'-.02em',
      textAlign:'center',margin:'42px 8px 30px'}}>{t('agent.title')}</h1>

    <div className="askbar">
      <input placeholder={t('agent.placeholder')} value={val}
        onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{ if(e.key==='Enter') send(); }}/>
      <div className={"send"+(val.trim()?" on":"")} onClick={send}><Ic n="arrowUp" s={20}/></div>
    </div>

    <div style={{display:'flex',gap:10,marginTop:14}}>
      <div className="pill" style={{flex:1}} onClick={onCreatePhoto}><Ic n="image" s={19}/> {t('agent.create_photo')}</div>
      <div className="pill" style={{flex:1}} onClick={onCreateVideo}><Ic n="video" s={19}/> {t('agent.create_video')}</div>
    </div>
    <div style={{display:'flex',justifyContent:'center',marginTop:10}}>
      <div className="pill" onClick={()=>onAddToChat(val.trim())}><Ic n="chat" s={18}/> {t('agent.add_chat')}</div>
    </div>

    {chats && chats.length>0 && <>
      <div className="sec-h"><h2>{t('agent.my_chats')}</h2></div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {chats.map(c=>(
          <div className="chat-plate" key={c.id} onClick={()=>onOpenChat(c.id)}>
            <div className="cp-av"><img src="assets/logo.jpg" alt=""/></div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontWeight:700,fontSize:15,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.title}</div>
              <div className="muted" style={{fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.msgs.length? c.msgs[c.msgs.length-1].text : ''}</div>
            </div>
            {c.agentMode && c.agentMode!=='general' && <div className="muted" style={{fontSize:11,whiteSpace:'nowrap',padding:'2px 6px',borderRadius:6,background:'rgba(77,155,245,.12)',color:'#4d9bf5',marginRight:6}}>{t(getAgentByCode(c.agentMode).nameKey)}</div>}
            <div className="cp-x" onClick={e=>{ e.stopPropagation(); onDeleteChat(c.id); }}><Ic n="close" s={17}/></div>
          </div>
        ))}
      </div>
    </>}

    <div className="sec-h">
      <h2>{t('agent.media')}</h2>
      <span className="all">{t('common.show_all')}</span>
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
window.HUBICX_AGENTS = HUBICX_AGENTS;
window.getAgentByCode = getAgentByCode;
