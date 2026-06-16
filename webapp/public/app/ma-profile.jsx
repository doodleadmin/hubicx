/* ============ Profile screen — full settings + personality ============ */
function IconChip({ bg, children }) {
  return <div style={{ width:38, height:38, borderRadius:11, background:bg, flex:'0 0 auto',
    display:'flex', alignItems:'center', justifyContent:'center' }}>{children}</div>;
}

const PROF_KEY = 'hbx_profile_v1';
const PROF_DEFAULTS = {
  llm:'MiniMax M2.5', lang:'Русский', daily:false,
  style:'', hubicxLang:'', emoji:'✨', traits:'',
  name:'', gender:'Другое', age:'', location:'',
  activity:'', interests:'', timezone:'',
  _apiLoaded: false,
};
const OPTS = {
  llm:['MiniMax M2.5','GPT-4o','Claude 3.5 Sonnet','Gemini 2.0 Pro','DeepSeek V3','Llama 3.3'],
  lang:['Русский','English','Español','Deutsch','Français','中文'],
  style:['Дружелюбный','Формальный','Краткий и по делу','Подробный','С юмором','Вдохновляющий'],
  hubicxLang:['Русский','English','Español','Deutsch','Français','中文'],
  gender:['Мужской','Женский','Другое','Не указывать'],
  age:['До 18','18–24','25–34','35–44','45–54','55+'],
  timezone:['Москва (UTC+3)','Калининград (UTC+2)','Самара (UTC+4)','Дубай (UTC+4)','Лондон (UTC+0)','Нью-Йорк (UTC−5)','Токио (UTC+9)'],
};
const EMOJIS = ['✨','🔥','💎','🌙','⭐','🚀','🎨','💜','🌸','⚡','🦋','🌊','🍀','☀️','🎯','🧠'];

const LANG_MAP = {'ru':'Русский','en':'English','es':'Español','de':'Deutsch','fr':'Français','zh':'中文'};
const LANG_MAP_REV = {'Русский':'ru','English':'en','Español':'es','Deutsch':'de','Français':'fr','中文':'zh'};

function serverToUI(data) {
  var about = {};
  try { about = JSON.parse(data.about_user || '{}'); } catch(e) {}
  var personality = {};
  try { personality = JSON.parse(data.hubicx_personality || '{}'); } catch(e) {}
  return {
    lang: LANG_MAP[data.language_code] || 'Русский',
    daily: !!data.daily_enabled,
    style: data.communication_style || '',
    hubicxLang: LANG_MAP[data.language_code] || '',
    emoji: data.persona_emoji || '✨',
    traits: personality.traits || '',
    name: about.name || '',
    gender: about.gender || 'Другое',
    age: about.age || '',
    location: about.location || '',
    activity: about.activity || '',
    interests: about.interests || '',
    timezone: about.timezone || '',
    _apiLoaded: true,
  };
}

function uiToServer(p) {
  return {
    language_code: LANG_MAP_REV[p.lang] || 'ru',
    daily_enabled: !!p.daily,
    communication_style: p.style || null,
    persona_emoji: p.emoji || null,
    hubicx_personality: JSON.stringify({ traits: p.traits || '' }),
    about_user: JSON.stringify({
      name: p.name || '', gender: p.gender || '', age: p.age || '',
      location: p.location || '', activity: p.activity || '',
      interests: p.interests || '', timezone: p.timezone || '',
    }),
  };
}

function ProfileScreen({ tokens, onTopup, onTab, theme, onToggleTheme }) {
  const { Ic, Star, TopNav } = window.MiraCore;
  theme = theme || ((window.HubicxTheme && window.HubicxTheme.theme) || 'light');
  onToggleTheme = onToggleTheme || (window.HubicxTheme && window.HubicxTheme.toggle) || function() {};
  const [p, setP] = useState(() => {
    try { return { ...PROF_DEFAULTS, ...(JSON.parse(localStorage.getItem(PROF_KEY)) || {}) }; }
    catch(e) { return { ...PROF_DEFAULTS }; }
  });
  const [editor, setEditor] = useState(null);
  const [history, setHistory] = useState([]);
  const [histLoaded, setHistLoaded] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const saveTimerRef = useRef(null);

  // Save to localStorage on every change
  useEffect(() => {
    var toStore = Object.assign({}, p);
    delete toStore._apiLoaded;
    localStorage.setItem(PROF_KEY, JSON.stringify(toStore));
    // Sync to API (debounced 800ms), only after API data has loaded
    if (!p._apiLoaded || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(function() {
      window.HubicxApi.updateProfile(uiToServer(p)).catch(function() {});
    }, 800);
  }, [p]);

  // Load from API on mount
  useEffect(() => {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    var alive = true;
    window.HubicxApi.profile().then(function(data) {
      if (!alive) return;
      setP(function(prev) { return Object.assign({}, prev, serverToUI(data)); });
    }).catch(function() {});
    return function() { alive = false; };
  }, []);

  // Generation history now lives in Profile on mobile.
  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) { setHistLoaded(true); return; }
    window.HubicxApi.history().then(function(items) {
      if (Array.isArray(items)) setHistory(items);
      setHistLoaded(true);
    }).catch(function() { setHistLoaded(true); });
  }, []);

  var hasPending = history.some(function(item) {
    return item.status === 'queued' || item.status === 'created' || item.status === 'processing';
  });
  useEffect(function() {
    if (!hasPending || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    var timer = setInterval(function() {
      window.HubicxApi.history().then(function(items) {
        if (Array.isArray(items)) setHistory(items);
      }).catch(function() {});
    }, 5000);
    return function() { clearInterval(timer); };
  }, [hasPending]);

  const set = (k, v) => setP(s => ({ ...s, [k]:v }));

  const openOpts = (field, title) => setEditor({ kind:'opts', field, title, options:OPTS[field] });
  const openText = (field, title, ph) => setEditor({ kind:'text', field, title, ph });
  const openEmoji = () => setEditor({ kind:'emoji', field:'emoji', title:'Любимый эмодзи' });

  const ValRow = ({ field, label, promptLabel, title, ph, kind='text', last }) => {
    const v = p[field];
    const open = () => kind === 'opts' ? openOpts(field, title) : openText(field, title, ph);
    return <>
      {v
        ? <div className="prow" onClick={open}>
            <div style={{ flex:1 }}>
              <div className="muted" style={{ fontSize:13 }}>{label}</div>
              <div style={{ fontSize:15.5, fontWeight:600, marginTop:2 }}>{v}</div>
            </div>
            <span className="chev"><Ic n="chev" s={18}/></span>
          </div>
        : <div className="linkrow" onClick={open}>{promptLabel}</div>}
      {!last && <div className="divider" style={{ marginLeft:0 }}></div>}
    </>;
  };

  const Row = ({ chip, title, value, onClick, last }) => (
    <>
      <div className="row-link" onClick={onClick}>
        {chip}
        <span style={{ fontWeight:700, fontSize:15.5, whiteSpace:'nowrap' }}>{title}</span>
        <span className="muted" style={{ marginLeft:'auto', fontSize:14.5 }}>{value}</span>
        <span className="chev" style={{ marginLeft:8 }}><Ic n="chev" s={19}/></span>
      </div>
      {!last && <div className="divider"></div>}
    </>
  );

  if (viewTask) {
    var isVideo = viewTask.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(viewTask.output_file_url || '');
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <TopNav active="profile" onTab={onTab}/>
      <div className="screen scr-enter" style={{ paddingTop:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ cursor:'pointer', padding:'4px 6px' }} onClick={() => setViewTask(null)}>
            <Ic n="back" s={22}/>
          </div>
          <div style={{ fontWeight:800, fontSize:17, flex:1 }}>{viewTask.title || 'Результат'}</div>
        </div>
        {isVideo
          ? <video src={viewTask.output_file_url} controls playsInline
              style={{ maxWidth:'100%', width:'auto', height:'auto', maxHeight:340, borderRadius:18, objectFit:'contain', background:'#000', display:'block', margin:'0 auto' }}/>
          : <img src={viewTask.output_file_url} alt="Результат"
              style={{ maxWidth:'100%', width:'auto', height:'auto', maxHeight:400, borderRadius:18, objectFit:'contain', display:'block', margin:'0 auto' }}/>} 
        <div style={{ marginTop:16, display:'flex', gap:10 }}>
          <button className="btn-secondary" style={{ flex:1 }} onClick={function() {
            if (window.HubicxApi) window.HubicxApi.sendToChat(viewTask.id).catch(function() {});
          }}>📤 В Telegram</button>
          <button className="btn-primary" style={{ flex:1 }} onClick={() => setViewTask(null)}>Назад</button>
        </div>
      </div>
    </div>;
  }

  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <TopNav active="profile" onTab={onTab}/>
    <div className="screen scr-enter" style={{ paddingTop:14 }}>

      <div className="label-sec">Профиль</div>
      <div className="card" style={{ overflow:'hidden' }}>
        <Row chip={<IconChip bg="#e6eeff"><Star s={16} c="#6060c0"/></IconChip>}
          title="Мои токены" value={tokens} onClick={onTopup}/>
        <Row chip={<IconChip bg="#ead0f5"><Ic n="wand" s={18} c="#9b3fc8"/></IconChip>}
          title="LLM-модель" value={p.llm} onClick={() => openOpts('llm','LLM-модель')}/>
        <Row chip={<IconChip bg="#d0e8f5"><Ic n="globe" s={18} c="#2f80ed"/></IconChip>}
          title="Язык" value={p.lang} onClick={() => openOpts('lang','Язык')} last/>
      </div>

      <div className="card" style={{ overflow:'hidden', marginTop:14 }}>
        <div className="row-link" onClick={() => set('daily', !p.daily)}>
          <IconChip bg="#fde0dc"><Ic n="bolt" s={17} c="#c0473e"/></IconChip>
          <span style={{ fontWeight:700, fontSize:15.5 }}>Hubicx Daily</span>
          <span className="muted" style={{ marginLeft:'auto', marginRight:10, fontSize:14 }}>
            {p.daily ? 'Включен' : 'Выключен'}
          </span>
          <span className={'switch' + (p.daily ? ' on' : '')}><i></i></span>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden', marginTop:14 }}>
        <div className="row-link" onClick={onToggleTheme}>
          <IconChip bg={theme === 'dark' ? '#323742' : '#fff6bf'}><Ic n={theme === 'dark' ? 'moon' : 'sun'} s={17} c={theme === 'dark' ? '#d8def0' : '#b79a18'}/></IconChip>
          <span style={{ fontWeight:700, fontSize:15.5 }}>Тёмная тема</span>
          <span className="muted" style={{ marginLeft:'auto', marginRight:10, fontSize:14 }}>
            {theme === 'dark' ? 'Включена' : 'Выключена'}
          </span>
          <span className={'switch' + (theme === 'dark' ? ' on' : '')}><i></i></span>
        </div>
      </div>

      <div style={{ marginTop:18, marginBottom:6 }}>
        <span className="label-sec">История генераций</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {!histLoaded && <div className="card" style={{ padding:'22px 18px', display:'flex', justifyContent:'center' }}><div className="gen-spinner"></div></div>}
        {histLoaded && history.length === 0 && <div className="card" style={{ padding:'22px 18px', textAlign:'center' }}>
          <div style={{ fontSize:30 }}>✨</div>
          <div style={{ fontWeight:800, fontSize:15, marginTop:6 }}>История пока пустая</div>
          <div className="muted" style={{ fontSize:13, marginTop:4 }}>Создайте фото или видео — результаты появятся здесь</div>
        </div>}
        {histLoaded && history.slice(0, 10).map(function(item) {
          var isCompleted = item.status === 'completed';
          var isFailed = item.status === 'refunded';
          return <div key={item.id} className="chat-plate" style={{ alignItems:'center' }}
            onClick={() => isCompleted && item.output_file_url && setViewTask(item)}>
            <div style={{ width:46, height:46, borderRadius:12, overflow:'hidden', flex:'0 0 auto',
              background:'var(--faint)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isCompleted && item.output_file_url
                ? <img src={item.output_file_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <Ic n={isFailed ? 'close' : 'sparkle'} s={20} c={isFailed ? '#c0473e' : 'var(--muted)'}/>}
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {item.title || item.prompt || 'Генерация'}
              </div>
              <div className="muted" style={{ fontSize:12.5 }}>
                {isFailed ? '✗ Ошибка · возврат токенов'
                  : isCompleted ? '✓ Готово · ' + item.cost_credits + ' ★'
                  : '⏳ ' + (item.status === 'queued' ? 'В очереди' : 'Генерация…')}
              </div>
            </div>
            {isCompleted && item.output_file_url && <span className="chev"><Ic n="chev" s={18}/></span>}
          </div>;
        })}
      </div>

      <div style={{ marginTop:18, marginBottom:6 }}>
        <span className="label-sec">Личность Hubicx</span>
      </div>
      <div className="card" style={{ padding:'2px 16px' }}>
        <ValRow field="style" label="Стиль общения" promptLabel="Указать стиль общения" title="Стиль общения" kind="opts"/>
        <ValRow field="hubicxLang" label="Язык Hubicx" promptLabel="Указать язык Hubicx" title="Язык Hubicx" kind="opts"/>
        <div className="prow" onClick={openEmoji}>
          <div style={{ flex:1 }}>
            <div className="muted" style={{ fontSize:13 }}>Любимый эмодзи</div>
            <div style={{ fontSize:24, marginTop:2 }}>{p.emoji}</div>
          </div>
          <span className="chev"><Ic n="chev" s={18}/></span>
        </div>
        <div className="divider" style={{ marginLeft:0 }}></div>
        <ValRow field="traits" label="Черты характера" promptLabel="Указать черты характера"
          title="Черты характера" ph="Например: спокойный, внимательный…" last/>
      </div>

      <div style={{ marginTop:18, marginBottom:6 }}>
        <span className="label-sec">О Вас</span>
      </div>
      <div className="card" style={{ padding:'4px 16px' }}>
        <ValRow field="name" label="Имя" promptLabel="Указать имя" title="Имя" ph="Ваше имя"/>
        <ValRow field="gender" label="Пол" promptLabel="Указать пол" title="Пол" kind="opts"/>
        <ValRow field="age" label="Возраст" promptLabel="Указать возраст" title="Возраст" kind="opts"/>
        <ValRow field="location" label="Локация" promptLabel="Указать локацию" title="Локация" ph="Город"/>
        <ValRow field="activity" label="Вид деятельности" promptLabel="Указать деятельность" title="Деятельность" ph="Чем вы занимаетесь"/>
        <ValRow field="interests" label="Интересы" promptLabel="Указать интересы" title="Интересы" ph="Ваши интересы"/>
        <ValRow field="timezone" label="Часовой пояс" promptLabel="Указать часовой пояс" title="Часовой пояс" kind="opts" last/>
      </div>

      <div style={{ height:24 }}/>

      {editor && editor.kind === 'opts' && <OptsSheet title={editor.title} options={editor.options}
        current={p[editor.field]} onSave={v => set(editor.field, v)} onClose={() => setEditor(null)}/>}
      {editor && editor.kind === 'text' && <TextSheet title={editor.title} ph={editor.ph}
        current={p[editor.field]} onSave={v => set(editor.field, v)} onClose={() => setEditor(null)}/>}
      {editor && editor.kind === 'emoji' && <EmojiSheet current={p.emoji}
        onSave={v => set('emoji', v)} onClose={() => setEditor(null)}/>}
    </div>
  </div>;
}

/* ---- editor sheets ---- */
function OptsSheet({ title, options, current, onSave, onClose }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        {options.map(o => (
          <div className="opt" key={o} onClick={() => setVal(o)}>
            <div className="o-t" style={{ fontWeight:700 }}>{o}</div>
            {val === o && <span className="o-check"><Ic n="check" s={22} sw={2.4}/></span>}
          </div>
        ))}
      </div>
      <button className="sheet-cta" onClick={() => { onSave(val); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
function TextSheet({ title, ph, current, onSave, onClose }) {
  const [val, setVal] = useState(current || "");
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        <input ref={ref} className="text-in" placeholder={ph || "Введите значение"} value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onSave(val.trim()); onClose(); } }}/>
      </div>
      <button className="sheet-cta" onClick={() => { onSave(val.trim()); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
function EmojiSheet({ current, onSave, onClose }) {
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Любимый эмодзи</div>
        <div className="emoji-grid">
          {EMOJIS.map(e => (
            <div key={e} className={'emoji-cell' + (val === e ? ' on' : '')} onClick={() => setVal(e)}>{e}</div>
          ))}
        </div>
      </div>
      <button className="sheet-cta" onClick={() => { onSave(val); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
window.ProfileScreen = ProfileScreen;
