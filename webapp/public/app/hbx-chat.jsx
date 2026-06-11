/* ============ Agent chat (in-window, animated) ============ */
const BOT_LINES = [
  "Конечно! Давайте разберёмся вместе. Расскажите чуть подробнее, что именно нужно — и я помогу.",
  "Отличная идея. Вот как я предлагаю двигаться: сначала уточним цель, затем подберём формат и детали.",
  "Готово ✨ Я набросал вариант. Скажите, если что-то поправить — стиль, длину или тон.",
  "Понял вас. Могу сгенерировать фото или видео по этому описанию — просто скажите слово.",
];

const GENERAL_QUICK = ['chat.quick.help','chat.quick.plan','chat.quick.short'];

function ChatScreen({ chat, onBack, onSend, onModeChange }){
  const { Ic } = window.HubicxCore;
  const t = window.t || ((k)=>k);
  const [val, setVal] = useState(chat.draft || "");
  const [modeSheet, setModeSheet] = useState(false);
  const endRef = useRef(null);
  const agent = window.getAgentByCode ? window.getAgentByCode(chat.agentMode || 'general') : null;
  const modeName = agent ? t(agent.nameKey) : t('agent.mode.general');

  useEffect(()=>{ setVal(chat.draft || ""); }, [chat.id]);
  useEffect(()=>{ if(endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; }, [chat.msgs.length]);

  const send = () => {
    const txt = val.trim();
    if(!txt) return;
    setVal("");
    onSend(txt);
  };

  const quickKeys = (agent && agent.quickKeys && agent.quickKeys.length) ? agent.quickKeys : GENERAL_QUICK;
  const showQuick = chat.msgs.length === 0;

  return <div className="chat-wrap">
    <div className="chat-top">
      <div className="chat-back" onClick={onBack}><Ic n="back" s={22}/></div>
      <div className="chat-id">
        <div className="chat-av"><img src="assets/logo.jpg" alt=""/></div>
        <div>
          <div style={{fontWeight:700,fontSize:16}}>{t('agent.hubicx_agent')}</div>
          <div className="muted" style={{fontSize:12}}>{chat.typing ? t('agent.typing') : t('agent.online')}</div>
        </div>
      </div>
    </div>

    <div className="chat-mode-bar" onClick={()=>setModeSheet(true)}>
      <Ic n="bolt" s={14} c="#4d9bf5"/>
      <span>{t('chat.mode')}: <b>{modeName}</b></span>
      <Ic n="back" s={13} c="#8a94a6" style={{transform:'rotate(-90deg)'}}/>
    </div>

    <div className="chat-body" ref={endRef}>
      {showQuick && quickKeys.length>0 && (
        <div className="chat-quick-hints">
          {quickKeys.map(k=><div key={k} className="pill" onClick={()=>setVal(t(k))} style={{fontSize:13}}>{t(k)}</div>)}
        </div>
      )}
      {chat.msgs.map((m,i)=>(
        <div key={i} className={"bubble "+(m.role==='user'?'me':'bot')}>{m.text}</div>
      ))}
      {chat.typing && <div className="bubble bot typing"><span></span><span></span><span></span></div>}
    </div>

    <div className="chat-input">
      <div className="askbar" style={{marginTop:0}}>
        <input placeholder={t('agent.message')} value={val}
          onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') send(); }}/>
        <div className={"send"+(val.trim()?" on":"")} onClick={send}><Ic n="arrowUp" s={20}/></div>
      </div>
    </div>

    {modeSheet && <div className="sheet-ov" onClick={()=>setModeSheet(false)}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-card">
          <div className="sheet-grab"></div>
          <div className="sheet-title">{t('chat.choose_mode')}</div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:10}}>
            {(window.HUBICX_AGENTS || []).map(a=>(
              <div key={a.code} className="opt" onClick={()=>{ onModeChange(a.code); setModeSheet(false); }}
                style={{border:'1px solid '+(chat.agentMode===a.code?'rgba(77,155,245,.7)':'var(--glass-line)'),
                  borderRadius:14,padding:'12px 14px',background:chat.agentMode===a.code?'rgba(47,128,237,.14)':'rgba(255,255,255,.03)'}}>
                <div style={{fontWeight:700,fontSize:15}}>{t(a.nameKey)}</div>
                <div className="muted" style={{fontSize:12,marginTop:2}}>{t(a.descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>}
  </div>;
}
window.ChatScreen = ChatScreen;
window.BOT_LINES = BOT_LINES;
