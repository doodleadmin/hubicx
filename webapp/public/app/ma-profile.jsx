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
  lang:['Русский','English','Español','Português'],
  style:['Дружелюбный','Формальный','Краткий и по делу','Подробный','С юмором','Вдохновляющий'],
  hubicxLang:['Русский','English','Español','Português'],
  gender:['Мужской','Женский','Другое','Не указывать'],
  age:['До 18','18–24','25–34','35–44','45–54','55+'],
  timezone:['Москва (UTC+3)','Калининград (UTC+2)','Самара (UTC+4)','Дубай (UTC+4)','Лондон (UTC+0)','Нью-Йорк (UTC−5)','Токио (UTC+9)'],
};
const EMOJIS = ['✨','🔥','💎','🌙','⭐','🚀','🎨','💜','🌸','⚡','🦋','🌊','🍀','☀️','🎯','🧠'];

const LANG_MAP = {'ru':'Русский','en':'English','es':'Español','pt':'Português'};
const LANG_MAP_REV = {'Русский':'ru','English':'en','Español':'es','Português':'pt'};

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

function MobileLinkAccountSheet({ onClose, onLinked }) {
  const { Ic } = window.MiraCore;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = function() {
    var em = email.trim();
    if (!em || password.length < 6) { setErr('Email и пароль от 6 символов'); return; }
    setBusy(true); setErr('');
    function finish(data) {
      var nextUser = data && data.user ? data.user : data;
      setBusy(false); setDone(true);
      if (onLinked) onLinked(nextUser);
    }
    function showError(e, fallback) {
      setBusy(false);
      setErr((e && e.message) || fallback || 'Не удалось связать аккаунты');
    }
    window.HubicxApi.linkTelegram(em, password).then(finish).catch(function(firstErr) {
      window.HubicxApi.linkEmail(em, password).then(finish).catch(function(secondErr) {
        var msg = String((secondErr && secondErr.message) || '').toLowerCase();
        if (msg.indexOf('существ') >= 0 || msg.indexOf('занят') >= 0 || msg.indexOf('already') >= 0) {
          showError(firstErr, 'Email уже зарегистрирован. Проверьте пароль от аккаунта сайта.');
        } else {
          showError(secondErr || firstErr, 'Не удалось связать аккаунты');
        }
      });
    });
  };

  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet profile-sheet account-link-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card profile-sheet-card account-link-card">
        <button className="sheet-x" onClick={onClose}><Ic n="close" s={18}/></button>
        <div className="account-link-icon"><Ic n="user" s={22} c="#5f9184"/></div>
        <div className="sheet-title">Связать аккаунты</div>
        <div className="muted account-link-copy">
          Введите email и пароль. Если аккаунт сайта уже есть, мы объединим его с Telegram. Если нет — создадим вход на сайт с этим же балансом.
        </div>
        {done
          ? <div className="account-link-done"><Ic n="check" s={22} c="#5f9184"/> Готово. Аккаунты связаны.</div>
          : <>
            <div className="profile-sheet-scroll account-link-fields">
              <input className="text-in" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
              <input className="text-in" type="password" autoComplete="current-password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
            {err && <div className="account-link-error">{err}</div>}
            <button className="sheet-cta profile-sheet-cta account-link-cta" disabled={busy} onClick={submit}>{busy ? 'Связываем...' : 'Связать аккаунты'}</button>
          </>}
      </div>
    </div>
  </div>;
}

function ProfileScreen({ tokens, onTopup, onTab, theme, onToggleTheme, user, onUserUpdate }) {
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
  const [bonus, setBonus] = useState(null);
  const [bonusState, setBonusState] = useState('');
  const [bonusToast, setBonusToast] = useState(false);
  const [linkMode, setLinkMode] = useState(null);
  const bonusRef = useRef(null);
  const saveTimerRef = useRef(null);
  const isTelegram = window.HubicxApi && window.HubicxApi.isTelegram();
  const hasPassword = user && user.has_password;
  const tgProfile = (() => {
    try {
      var tgUser = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
      return tgUser || {};
    } catch(e) { return {}; }
  })();
  const displayName = (user && (user.first_name || user.username)) || tgProfile.first_name || p.name || 'Пользователь';
  const displayHandle = user && user.username ? '@' + user.username : (tgProfile.username ? '@' + tgProfile.username : (user && user.email ? user.email : 'Hubicx'));
  const avatarUrl = (user && user.photo_url) || tgProfile.photo_url || '';
  const avatarInitial = String(displayName || 'H').trim().charAt(0).toUpperCase() || 'H';
  const activeSub = user && user.subscription && user.subscription.is_active ? user.subscription : null;
  const subTitle = activeSub ? activeSub.title : 'Без подписки';
  const subMeta = activeSub
    ? ((activeSub.kind === 'template' ? 'Шаблоны' : 'Генерации') + (activeSub.tokens_per_month ? ' · ' + activeSub.tokens_per_month + ' токенов/мес' : ''))
    : 'Можно выбрать тариф для шаблонов';

  useEffect(function() {
    document.body.classList.toggle('hbx-modal-open', !!editor);
    return function() { document.body.classList.remove('hbx-modal-open'); };
  }, [!!editor]);

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

  // Load bonus tasks on mount
  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !window.HubicxApi.bonuses) return;
    var alive = true;
    window.HubicxApi.bonuses().then(function(data) {
      if (!alive) return;
      setBonus(data && data.bonus_program ? data.bonus_program : data);
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

  useEffect(function() {
    var code = LANG_MAP_REV[p.lang] || 'ru';
    if (window.HubicxI18n && window.HubicxI18n.setLang) window.HubicxI18n.setLang(code);
  }, [p.lang]);

  var bonusTasks = (bonus && Array.isArray(bonus.tasks)) ? bonus.tasks : [];
  var bonusBalance = bonus ? (typeof bonus.bonus_credits === 'number' ? bonus.bonus_credits : (typeof bonus.total_tokens === 'number' ? bonus.total_tokens : null)) : null;
  var hasManualBonus = bonusTasks.some(function(t) { return t && !t.claimed && (t.claimable !== false || t.action_url); });
  useEffect(function() {
    if (!hasManualBonus) return;
    var now = Date.now();
    var last = 0;
    try { last = parseInt(localStorage.getItem('hbx_bonus_toast_seen_v1') || '0', 10) || 0; } catch(e) {}
    if (now - last < 24 * 60 * 60 * 1000) return;
    setBonusToast(true);
    try { localStorage.setItem('hbx_bonus_toast_seen_v1', String(now)); } catch(e) {}
  }, [hasManualBonus]);

  const claimProfileBonus = (code) => {
    if (!window.HubicxApi || !window.HubicxApi.claimBonus || !code) return;
    setBonusState('Начисляем…');
    window.HubicxApi.claimBonus(code).then(function() {
      setBonusState('Бонус начислен');
      return window.HubicxApi.bonuses ? window.HubicxApi.bonuses() : null;
    }).then(function(data) {
      if (data) setBonus(data && data.bonus_program ? data.bonus_program : data);
      setTimeout(function() { setBonusState(''); }, 2200);
    }).catch(function(e) {
      setBonusState((e && e.message) || 'Не удалось начислить бонус');
      setTimeout(function() { setBonusState(''); }, 3200);
    });
  };

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
      <div className="card mob-profile-hero" data-onb="mob-profile-card">
        <div className="mob-profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt=""/> : <span>{avatarInitial}</span>}
        </div>
        <div className="mob-profile-id">
          <div className="mob-profile-name">{displayName}</div>
          <div className="mob-profile-handle">{displayHandle}</div>
        </div>
        <button className="mob-profile-topup" onClick={onTopup}><Star s={14} c="#c9c7f4"/> {tokens}</button>
      </div>

      <div className={'card mob-sub-card' + (activeSub ? ' active' : '')}>
        <div>
          <div className="mob-sub-k">Текущий тариф</div>
          <div className="mob-sub-title">{subTitle}</div>
          <div className="mob-sub-meta">{subMeta}</div>
        </div>
        <button onClick={onTopup}>{activeSub ? 'Управлять' : 'Выбрать'}</button>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <Row chip={<IconChip bg="#e6eeff"><Star s={16} c="#6060c0"/></IconChip>}
          title="Мои токены" value={tokens} onClick={onTopup}/>
        <Row chip={<IconChip bg="#d0e8f5"><Ic n="globe" s={18} c="#2f80ed"/></IconChip>}
          title="Язык" value={p.lang} onClick={() => openOpts('lang','Язык')} last/>
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

      <div className="card" style={{ overflow:'hidden', marginTop:14 }}>
        <div className="row-link locked">
          <IconChip bg="#e9f1ec"><Ic n="user" s={18} c="#5f9184"/></IconChip>
          <span style={{ fontWeight:700, fontSize:15.5 }}>Аккаунт</span>
          <span className="muted" style={{ marginLeft:'auto', fontSize:13, textAlign:'right' }}>
            {user && user.email ? user.email : (isTelegram ? 'Telegram' : 'Email')}
          </span>
        </div>
        <div className="divider"></div>
        {isTelegram && !hasPassword && <>
          <div style={{ padding:'14px 18px 6px', color:'var(--muted)', fontSize:13, lineHeight:1.42 }}>
            Свяжите Telegram с email-аккаунтом, чтобы один баланс, история и подписка были доступны в Mini App и на сайте.
          </div>
          <div style={{ display:'grid', gap:10, padding:'8px 18px 16px' }}>
            <button className="btn-primary" onClick={() => setLinkMode('link')}>Связать аккаунты</button>
          </div>
        </>}
        {isTelegram && hasPassword && <div className="row-link locked">
          <IconChip bg="#edf7e9"><Ic n="check" s={18} c="#5f9184"/></IconChip>
          <span style={{ fontWeight:700, fontSize:15.5 }}>Вход на сайте</span>
          <span className="muted" style={{ marginLeft:'auto', fontSize:13 }}>включен</span>
        </div>}
        {!isTelegram && <div style={{ padding:'14px 18px 16px', color:'var(--muted)', fontSize:13, lineHeight:1.42 }}>
          Telegram привязывается через Mini App: откройте бота и в профиле свяжите этот email.
        </div>}
      </div>

      <div style={{ marginTop:18, marginBottom:6 }}>
        <span className="label-sec">История генераций</span>
      </div>
      <div className="hist-rail" data-onb="mob-history">
        {!histLoaded && <div className="card" style={{ padding:'22px 18px', display:'flex', justifyContent:'center' }}><div className="gen-spinner"></div></div>}
        {histLoaded && history.length === 0 && <div className="card" style={{ padding:'22px 18px', textAlign:'center' }}>
          <div style={{ fontSize:30 }}>✨</div>
          <div style={{ fontWeight:800, fontSize:15, marginTop:6 }}>История пока пустая</div>
          <div className="muted" style={{ fontSize:13, marginTop:4 }}>Создайте фото или видео — результаты появятся здесь</div>
        </div>}
        {histLoaded && history.slice(0, 10).map(function(item) {
          var isCompleted = item.status === 'completed';
          var isFailed = item.status === 'refunded';
          return <div key={item.id} className="hist-card"
            onClick={() => isCompleted && item.output_file_url && setViewTask(item)}>
            <div className="hist-thumb">
              {isCompleted && item.output_file_url
                ? <img src={item.output_file_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <Ic n={isFailed ? 'close' : 'sparkle'} s={20} c={isFailed ? '#c0473e' : 'var(--muted)'}/>} 
            </div>
            <div className="hist-meta">
              <div className="hist-title">
                {item.title || item.prompt || 'Генерация'}
              </div>
              <div className="muted" style={{ fontSize:11.5 }}>
                {isFailed ? '✗ Ошибка · возврат токенов'
                  : isCompleted ? '✓ Готово · ' + item.cost_credits + ' ★'
                  : '⏳ ' + (item.status === 'queued' ? 'В очереди' : 'Генерация…')}
              </div>
            </div>
          </div>;
        })}
      </div>

      {bonus && <div ref={bonusRef} className="card bonus-card-v2" data-onb="mob-bonuses" style={{ marginTop:18 }}>
        <div className="bonus-head-v2">
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, minWidth:0 }}>
            <IconChip bg="#fff2c7">🎁</IconChip>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:850, fontSize:17 }}>Бонусные токены</div>
              <div className="muted" style={{ fontSize:13, lineHeight:1.35, marginTop:3 }}>{bonus.title || '50 токенов сразу + бонусы за задания после проверки'}</div>
            </div>
          </div>
          {bonusBalance !== null && <div className="bonus-bal-v2"><b>{bonusBalance}</b><span>★</span></div>}
        </div>
        <div className="bonus-list-v2">
          {bonusTasks.map(function(t) {
            var claimed = !!t.claimed;
            var manual = t.kind === 'manual_claim' && t.claimable !== false;
            var url = t.action_url || '';
            var status = t.status_label || (manual ? 'Доступно' : (t.kind === 'automatic' ? 'Авто' : 'Скоро'));
            return <div className={'bonus-task-v2' + (claimed ? ' done' : '')} key={t.code}>
              <div className="bonus-copy-v2">
                <span>{t.title}</span>
                <small>{t.description || ''}</small>
              </div>
              <div className="bonus-act-v2">
                <b>+{t.tokens || t.credits || 0} ★</b>
                {claimed ? <em>Готово</em>
                  : manual ? <button onClick={() => claimProfileBonus(t.code)}>Забрать</button>
                  : url ? <a href={url} target="_blank" rel="noopener noreferrer">{t.action_label || 'Открыть'}</a>
                  : <em>{status}</em>}
              </div>
            </div>;
          })}
        </div>
        {bonusState && <div className="muted" style={{ marginTop:8, fontSize:13 }}>{bonusState}</div>}
      </div>}

      <div style={{ height:24 }}/>

    </div>
    {editor && editor.kind === 'opts' && <OptsSheet title={editor.title} options={editor.options}
      current={p[editor.field]} onSave={v => set(editor.field, v)} onClose={() => setEditor(null)}/>}
    {editor && editor.kind === 'text' && <TextSheet title={editor.title} ph={editor.ph}
      current={p[editor.field]} onSave={v => set(editor.field, v)} onClose={() => setEditor(null)}/>}
    {editor && editor.kind === 'emoji' && <EmojiSheet current={p.emoji}
      onSave={v => set('emoji', v)} onClose={() => setEditor(null)}/>} 
    {bonusToast && <div className="bonus-toast-top">
      <div className="bonus-toast-ic">🎁</div>
      <div className="bonus-toast-copy">
        <b>У вас есть бесплатные токены</b>
        <span>Заберите бонусы в профиле</span>
      </div>
      <button className="bonus-toast-main" onClick={function() { setBonusToast(false); if (bonusRef.current) bonusRef.current.scrollIntoView({ behavior:'smooth', block:'center' }); }}>Смотреть</button>
      <button className="bonus-toast-x" onClick={() => setBonusToast(false)}>×</button>
    </div>}
    {linkMode && <MobileLinkAccountSheet onClose={() => setLinkMode(null)} onLinked={function(nextUser) { if (nextUser && onUserUpdate) onUserUpdate(nextUser); }}/>}
  </div>;
}

/* ---- editor sheets ---- */
function OptsSheet({ title, options, current, onSave, onClose }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet profile-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card profile-sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        <div className="profile-sheet-scroll">
          {options.map(o => (
            <div className="opt" key={o} onClick={() => setVal(o)}>
              <div className="o-t" style={{ fontWeight:700 }}>{o}</div>
              {val === o && <span className="o-check"><Ic n="check" s={22} sw={2.4}/></span>}
            </div>
          ))}
        </div>
        <button className="sheet-cta profile-sheet-cta" onClick={() => { onSave(val); onClose(); }}>Сохранить</button>
      </div>
    </div>
  </div>;
}
function TextSheet({ title, ph, current, onSave, onClose }) {
  const [val, setVal] = useState(current || "");
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet profile-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card profile-sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        <input ref={ref} className="text-in" placeholder={ph || "Введите значение"} value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onSave(val.trim()); onClose(); } }}/>
        <button className="sheet-cta profile-sheet-cta" onClick={() => { onSave(val.trim()); onClose(); }}>Сохранить</button>
      </div>
    </div>
  </div>;
}
function EmojiSheet({ current, onSave, onClose }) {
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet profile-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card profile-sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Любимый эмодзи</div>
        <div className="profile-sheet-scroll">
          <div className="emoji-grid">
            {EMOJIS.map(e => (
              <div key={e} className={'emoji-cell' + (val === e ? ' on' : '')} onClick={() => setVal(e)}>{e}</div>
            ))}
          </div>
        </div>
        <button className="sheet-cta profile-sheet-cta" onClick={() => { onSave(val); onClose(); }}>Сохранить</button>
      </div>
    </div>
  </div>;
}
window.ProfileScreen = ProfileScreen;
