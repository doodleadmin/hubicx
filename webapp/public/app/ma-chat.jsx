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

const CHAT_PROF_KEY = 'hbx_profile_v1';
const CHAT_PROF_DEFAULTS = { llm:'MiniMax M2.5', style:'', hubicxLang:'', emoji:'✨', traits:'', lang:'Русский' };
const CHAT_OPTS = {
  llm:['MiniMax M2.5','GPT-4o','Claude 3.5 Sonnet','Gemini 2.0 Pro','DeepSeek V3','Llama 3.3'],
  style:['Дружелюбный','Формальный','Краткий и по делу','Подробный','С юмором','Вдохновляющий'],
  hubicxLang:['Русский','English','Español','Português'],
};
const CHAT_EMOJIS = ['✨','🔥','💎','🌙','⭐','🚀','🎨','💜','🌸','⚡','🦋','🌊','🍀','☀️','🎯','🧠'];
const CHAT_LANG_MAP = {'ru':'Русский','en':'English','es':'Español','pt':'Português'};
const CHAT_LANG_MAP_REV = {'Русский':'ru','English':'en','Español':'es','Português':'pt'};

function chatProfileFromServer(data) {
  var personality = {};
  try { personality = JSON.parse(data.hubicx_personality || '{}'); } catch(e) {}
  return {
    style: data.communication_style || '',
    hubicxLang: CHAT_LANG_MAP[data.language_code] || '',
    lang: CHAT_LANG_MAP[data.language_code] || 'Русский',
    emoji: data.persona_emoji || '✨',
    traits: personality.traits || '',
  };
}

function chatProfileToServer(p) {
  return {
    language_code: CHAT_LANG_MAP_REV[p.hubicxLang || p.lang] || 'ru',
    communication_style: p.style || null,
    persona_emoji: p.emoji || null,
    hubicx_personality: JSON.stringify({ traits: p.traits || '' }),
  };
}

function ChatScreen({ chat, onBack, onSend, onSetAgent }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
        <button className="chat-agent-btn" style={{ marginLeft:0 }} onClick={() => setAgentOpen(true)} title="Выбрать агента"><Ic n="sliders" s={19}/></button>
        <button className="chat-agent-btn" style={{ marginLeft:0 }} onClick={() => setSettingsOpen(true)} title="Настройки чата"><Ic n="gear" s={19}/></button>
      </div>
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
    {settingsOpen && <ChatSettingsSheet onClose={() => setSettingsOpen(false)}/>}
  </div>;
}

function AgentSheet({ current, onSelect, onClose }) {
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet agent-sheet" onClick={function(e) { e.stopPropagation(); }}>
      <div className="sheet-card chat-settings-card">
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

function ChatSettingsSheet({ onClose }) {
  const [p, setP] = useState(function() {
    try { return Object.assign({}, CHAT_PROF_DEFAULTS, JSON.parse(localStorage.getItem(CHAT_PROF_KEY) || '{}')); }
    catch(e) { return Object.assign({}, CHAT_PROF_DEFAULTS); }
  });
  const [saved, setSaved] = useState('');
  const saveTimer = useRef(null);

  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !window.HubicxApi.profile) return;
    var alive = true;
    window.HubicxApi.profile().then(function(data) {
      if (!alive) return;
      setP(function(prev) { return Object.assign({}, prev, chatProfileFromServer(data)); });
    }).catch(function() {});
    return function() { alive = false; };
  }, []);

  function persist(next) {
    try {
      var old = JSON.parse(localStorage.getItem(CHAT_PROF_KEY) || '{}');
      localStorage.setItem(CHAT_PROF_KEY, JSON.stringify(Object.assign({}, old, next)));
    } catch(e) {}
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(function() {
      if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !window.HubicxApi.updateProfile) return;
      window.HubicxApi.updateProfile(chatProfileToServer(next)).then(function() {
        setSaved('Сохранено');
        setTimeout(function() { setSaved(''); }, 1600);
      }).catch(function() {});
    }, 500);
  }

  function setField(k, v) {
    setP(function(prev) {
      var next = Object.assign({}, prev, { [k]: v });
      if (k === 'hubicxLang') next.lang = v;
      persist(next);
      return next;
    });
  }

  return <div className="sheet-ov chat-settings-ov" onClick={onClose}>
    <div className="sheet agent-sheet chat-settings-sheet" onClick={function(e) { e.stopPropagation(); }}>
      <div className="sheet-card chat-settings-card">
        <div className="sheet-grab"></div>
        <div className="chat-settings-head">
          <div className="chat-settings-mark">AI</div>
          <div className="chat-settings-copy">
            <div className="sheet-title">Настройки общения</div>
            <div className="chat-settings-sub">Стиль, язык и характер Hubicx для следующих сообщений.</div>
          </div>
          <button className="chat-settings-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="chat-settings-body">
          <div className="chat-settings-group">
            <div className="chat-settings-section">LLM-модель</div>
            <div className="chat-settings-grid chat-settings-grid-models">
              {CHAT_OPTS.llm.map(function(o) { return <button key={o} className={'chat-setting-choice' + (p.llm === o ? ' on' : '')} onClick={() => setField('llm', o)}>
                <span>{o}</span>
              </button>; })}
            </div>
          </div>

          <div className="chat-settings-group">
            <div className="chat-settings-section">Стиль общения</div>
            <div className="chat-settings-grid">
              {CHAT_OPTS.style.map(function(o) { return <button key={o} className={'chat-setting-choice' + (p.style === o ? ' on' : '')} onClick={() => setField('style', o)}>
                <span>{o}</span>
              </button>; })}
            </div>
          </div>

          <div className="chat-settings-group">
            <div className="chat-settings-section">Язык Hubicx</div>
            <div className="chat-settings-grid chat-settings-grid-lang">
              {CHAT_OPTS.hubicxLang.map(function(o) { return <button key={o} className={'chat-setting-choice' + (p.hubicxLang === o || (!p.hubicxLang && p.lang === o) ? ' on' : '')} onClick={() => setField('hubicxLang', o)}>
                <span>{o}</span>
              </button>; })}
            </div>
          </div>

          <div className="chat-settings-group chat-settings-group-emoji">
            <div className="chat-settings-section">Любимый эмодзи</div>
            <div className="emoji-grid chat-settings-emoji-grid">
              {CHAT_EMOJIS.map(function(e) { return <div key={e} className={'emoji-cell' + (p.emoji === e ? ' on' : '')} onClick={() => setField('emoji', e)}>{e}</div>; })}
            </div>
          </div>

          <div className="chat-settings-group chat-settings-group-text">
            <div className="chat-settings-section">Информация для чата</div>
            <textarea className="text-in chat-settings-text" placeholder="Например: спокойный, внимательный, любит короткие ответы..." value={p.traits || ''} onChange={e => setField('traits', e.target.value)} />
          </div>
        </div>

        <div className="chat-settings-foot">
          <div className={'chat-settings-saved' + (saved ? ' on' : '')}>{saved || 'Сохраняется автоматически'}</div>
          <button className="sheet-cta chat-settings-done" onClick={onClose}>Готово</button>
        </div>
      </div>
    </div>
  </div>;
}

window.ChatSettingsSheet = ChatSettingsSheet;
window.ChatScreen = ChatScreen;
