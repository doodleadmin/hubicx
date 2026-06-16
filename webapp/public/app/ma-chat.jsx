/* ============ Chat screen ============ */
const MOBILE_AGENTS = [
  { code:'general', name:'Агент Hubicx', desc:'Обычный универсальный чат', icon:'✨', color:'#eef0ff' },
  { code:'copywriter', name:'Копирайтер', desc:'Тексты и офферы', icon:'✍️', color:'#ffefe5' },
  { code:'smm_assistant', name:'СММщик', desc:'Посты и контент-план', icon:'📱', color:'#eaf3ff' },
  { code:'marketer', name:'Маркетолог', desc:'Воронки и гипотезы', icon:'📈', color:'#eef8e8' },
  { code:'designer', name:'Дизайнер', desc:'Визуал и брифы', icon:'🎨', color:'#f3edff' },
  { code:'scenarist', name:'Сценарист', desc:'Reels и AI-видео', icon:'🎬', color:'#fff4dc' },
  { code:'davinci', name:'Давинчи', desc:'Креативные идеи', icon:'🧠', color:'#eaf7f2' },
  { code:'thinker', name:'Мыслитель', desc:'Стратегия и анализ', icon:'💡', color:'#eef0ff' },
  { code:'editor', name:'Редактор', desc:'Улучшить текст', icon:'📝', color:'#f7eee8' },
  { code:'prompt_master', name:'Промпт-мастер', desc:'Промпты генераций', icon:'✨', color:'#fff9d9' },
];
function mobileAgentByCode(code) {
  return MOBILE_AGENTS.find(function(a) { return a.code === code; }) || MOBILE_AGENTS[0];
}

function ChatScreen({ chat, onBack, onSend, onSetAgent }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const bodyRef = useRef(null);
  const msgs = chat.msgs || [];
  const curAgent = mobileAgentByCode(chat.agent_mode || 'general');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [msgs.length, msgs[msgs.length - 1] && msgs[msgs.length - 1].text]);

  const send = () => {
    const t = val.trim();
    if (!t) return;
    // Prevent sending while a stream is in progress
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg && lastMsg.streaming) return;
    setVal("");
    onSend(t);
  };

  // Show typing dots when last message is streaming with no text yet
  const lastMsg = msgs[msgs.length - 1];
  const isStreaming = lastMsg && lastMsg.streaming;
  const showTyping = isStreaming && !lastMsg.text;

  return <div className="chat-wrap">
    <div className="chat-top">
      <div className="chat-back" onClick={onBack}><Ic n="back" s={22}/></div>
      <div className="chat-id">
        <div className="chat-av">
          <img src="assets/logo.jpg" alt=""/>
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:16 }}>{curAgent.name}</div>
          <div className="muted" style={{ fontSize:12, fontWeight:600, color: isStreaming ? '#c98a4e' : '#7a9c92' }}>
            {isStreaming ? 'печатает…' : (curAgent.code === 'general' ? 'онлайн' : curAgent.desc)}
          </div>
        </div>
      </div>
      <button className="chat-agent-btn" onClick={() => setAgentOpen(true)} title="Выбрать агента"><Ic n="sliders" s={19}/></button>
    </div>

    <div className="chat-body" ref={bodyRef}>
      {msgs.map((m, i) => {
        if (m.streaming && !m.text) return null; // shown as typing dots below
        return <div key={i} className={'bubble ' + (m.role === 'user' ? 'me' : 'bot') + (m.isError ? ' err' : '')}>
          {m.text}
        </div>;
      })}
      {showTyping && <div className="bubble bot typing"><span/><span/><span/></div>}
    </div>

    <div className="chat-input">
      <div className="askbar" style={{ marginTop:0 }}>
        <input placeholder="Сообщение…" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(); }}/>
        <div className={'send' + (val.trim() && !isStreaming ? ' on' : '')} onClick={send}>
          <Ic n="arrowUp" s={20}/>
        </div>
      </div>
    </div>
    {agentOpen && <AgentSheet current={curAgent.code} onClose={() => setAgentOpen(false)} onSelect={function(a) {
      if (onSetAgent) onSetAgent(chat.id, a.code);
      setAgentOpen(false);
    }}/>} 
  </div>;
}

function AgentSheet({ current, onSelect, onClose }) {
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet agent-sheet" onClick={function(e) { e.stopPropagation(); }}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Выберите агента</div>
        <div className="muted" style={{ fontSize:13, marginTop:4 }}>Агент меняет стиль следующих сообщений</div>
        <div className="picker-grid" style={{ marginTop:10 }}>
          {MOBILE_AGENTS.map(function(a) {
            return <button key={a.code} className={'agent-choice' + (current === a.code ? ' on' : '')} onClick={() => onSelect(a)}>
              <span className="a-emoji" style={{ background:a.color }}>{a.icon}</span>
              <span className="a-name">{a.name}</span>
              <span className="a-desc">{a.desc}</span>
            </button>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

window.ChatScreen = ChatScreen;
