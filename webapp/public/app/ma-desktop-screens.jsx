/* ============================================================
   Hubicx — Desktop (PC) screens
   Loaded only in desktop.html, before ma-app.jsx.
   Uses globals from ma-core (useState/useEffect/useRef, MiraCore)
   and window.HubicxApi. Mobile screens are untouched.
   ============================================================ */

/* ---- template catalog (photo / video) ---- */
const DESK_TPL = [
  { t:'Ты из MadMax',        img:'assets/cov/m1.png',   type:'photo' },
  { t:'Полёт в доспехах',    img:'assets/cov/m2.png',   type:'photo' },
  { t:'Скетч-шарж',          img:'assets/cov/m4.png',   type:'photo' },
  { t:'Пластилиновый мир',   img:'assets/cov/m5.png',   type:'photo' },
  { t:'Анти-стресс открытка',img:'assets/cov/m6.png',   type:'photo' },
  { t:'Гадание по ладони',   img:'assets/cov/m7.png',   type:'photo' },
  { t:'Неоновый портрет',    img:'assets/cov/w3.png',   type:'photo' },
  { t:'Аниме-аватар',        img:'assets/cov/hero1.png',type:'photo' },
  { t:'Мой день за 15 сек',  img:'assets/cov/m3.png',   type:'video' },
  { t:'Оживить портрет',     img:'assets/cov/m8.png',   type:'video' },
  { t:'Кадр из фильма',      img:'assets/cov/w1.png',   type:'video' },
  { t:'Танцующий аватар',    img:'assets/cov/w2.png',   type:'video' },
];

/* ---- self-contained task poller (mirrors ma-create.jsx) ---- */
const D_POLL_MS = 3000;
const D_POLL_MAX = 230; // ~11.5 min, must exceed backend FAL_TASK_TIMEOUT
function dPollTask(taskId, onUpdate, onDone, onError) {
  var cancelled = false, attempts = 0;
  function check() {
    if (cancelled) return;
    window.HubicxApi.getTask(taskId).then(function(task) {
      if (cancelled) return;
      onUpdate(task);
      if (task.status === 'completed') { onDone(task); return; }
      if (task.status === 'refunded') { onError(task.error_message || 'Произошла ошибка генерации', 'refunded'); return; }
      attempts++;
      if (attempts >= D_POLL_MAX) { onError('Генерация занимает дольше обычного. Результат появится в «Истории», как только будет готов.', 'timeout'); return; }
      setTimeout(check, D_POLL_MS);
    }).catch(function(err) {
      if (cancelled) return;
      onError((err && err.message) || 'Ошибка запроса', 'error');
    });
  }
  check();
  return function() { cancelled = true; };
}

/* ============================================================
   Notifications dropdown — derives items from generation history
   ============================================================ */
function timeAgo(iso) {
  if (!iso) return '';
  var d = new Date(iso); if (isNaN(d.getTime())) return '';
  var sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'только что';
  var min = Math.floor(sec / 60); if (min < 60) return min + ' мин';
  var hr = Math.floor(min / 60); if (hr < 24) return hr + ' ч';
  var day = Math.floor(hr / 24); if (day === 1) return 'вчера';
  return day + ' дн';
}

function DeskNotifs({ items, onClose }) {
  const { Ic } = window.MiraCore;
  return <div className="dk-notif" onClick={e => e.stopPropagation()}>
    <div className="dk-notif-top">
      <span>Уведомления</span>
    </div>
    <div className="dk-notif-list">
      {items.length === 0
        ? <div className="dk-notif-empty">Пока нет уведомлений</div>
        : items.map(function(n, i) {
            return <div key={i} className="dk-notif-item">
              <span className="dk-notif-ic" style={{ background:n.bg }}><Ic n={n.ic} s={18} c={n.c}/></span>
              <div className="dk-notif-tx">
                <div className="dk-notif-t">{n.title}</div>
                <div className="dk-notif-s">{n.sub}</div>
              </div>
              <div className="dk-notif-time">{n.time}</div>
            </div>;
          })}
    </div>
  </div>;
}

/* ============================================================
   Shell: sidebar + topbar + content slot
   ============================================================ */
function DeskShell({ tab, onTab, onProfile, tokens, user, onTopup, title, subtitle, chatsBadge, children }) {
  const { Ic, Star } = window.MiraCore;
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.history().then(function(items) {
      if (!Array.isArray(items)) return;
      var list = [];
      items.slice(0, 6).forEach(function(it) {
        if (it.status === 'completed') {
          var isVid = it.task_type === 'video';
          list.push({ ic: isVid ? 'video' : 'image', c:'#5f9184', bg:'#e6efe9',
            title: (isVid ? 'Видео готово' : 'Фото готово'),
            sub: it.prompt || it.title || 'Результат в «Истории»', time: timeAgo(it.created_at || it.updated_at) });
        } else if (it.status === 'refunded') {
          list.push({ ic:'close', c:'#c0473e', bg:'#f6e7e4',
            title:'Генерация не удалась', sub:'Токены возвращены на баланс', time: timeAgo(it.created_at) });
        } else if (it.status === 'processing' || it.status === 'queued' || it.status === 'created') {
          list.push({ ic:'sparkle', c:'#c98a4e', bg:'#fbeede',
            title:'Генерация в работе', sub: it.prompt || 'Скоро будет готово', time: timeAgo(it.created_at) });
        }
      });
      setNotifs(list);
    }).catch(function() {});
  }, []);

  const hasUnread = notifs.length > 0;
  const nav = [
    { id:'home',    label:'Главная',   icon:'grid'    },
    { id:'gen',     label:'Генерация', icon:'wand'    },
    { id:'tpl',     label:'Шаблоны',   icon:'sparkle' },
    { id:'chat',    label:'Чат',       icon:'chat', badge: chatsBadge },
    { id:'history', label:'История',   icon:'clock'   },
    { id:'fav',     label:'Избранное', icon:'heart'   },
  ];
  const name = (user && (user.first_name || user.username)) || 'Профиль';
  const uname = (user && user.username) ? '@' + user.username : 'Hubicx';
  const initial = (name || 'H').trim().charAt(0).toUpperCase();

  return <div className="dk" onClick={() => notifOpen && setNotifOpen(false)}>
    <aside className="dk-side">
      <div className="dk-brand">
        <div className="dk-logo">✦</div>
        <div className="dk-word">Hubicx</div>
      </div>
      <div className="dk-menu-lbl">МЕНЮ</div>
      <nav className="dk-navs">
        {nav.map(function(n) {
          return <div key={n.id} className={'dk-nav' + (tab === n.id ? ' on' : '')} onClick={() => onTab(n.id)}>
            <span className="dk-ni"><Ic n={n.icon} s={19}/></span>
            <span className="dk-nl">{n.label}</span>
            {n.badge ? <span className="dk-badge">{n.badge}</span> : null}
          </div>;
        })}
      </nav>

      <div className="dk-bal">
        <div className="dk-bal-lbl">Баланс</div>
        <div className="dk-bal-row">
          <div className="dk-bal-num"><Star s={17} c="#c9c7f4"/> {tokens} <span className="dk-bal-un">токенов</span></div>
        </div>
        <button className="dk-topup" onClick={onTopup}>Пополнить</button>
      </div>

      <div className={'dk-user' + (tab === 'profile' ? ' on' : '')} onClick={onProfile}>
        <div className="dk-ava">{initial}</div>
        <div className="dk-uinfo">
          <div className="dk-uname">{name} <span className="dk-pro">Pro</span></div>
          <div className="dk-uhandle">{uname}</div>
        </div>
        <span className="dk-theme" onClick={(e) => { e.stopPropagation(); }}><Ic n="sun" s={17} c="var(--faint)"/></span>
      </div>
    </aside>

    <main className="dk-main">
      <header className="dk-top">
        <div className="dk-th">
          <div className="dk-title">{title}</div>
          {subtitle ? <div className="dk-sub">{subtitle}</div> : null}
        </div>
        <div className="dk-search">
          <span className="dk-search-ic"><Ic n="search" s={18} c="var(--faint)"/></span>
          <input placeholder="Поиск шаблонов, чатов…" readOnly/>
        </div>
        <div className="dk-tok" onClick={onTopup}>
          <Star s={16} c="#c9c7f4"/> <span>{tokens}</span>
          <span className="dk-tok-plus"><Ic n="plus" s={15}/></span>
        </div>
        <div className="dk-bell-wrap">
          <div className="dk-bell" onClick={(e) => { e.stopPropagation(); setNotifOpen(o => !o); }}>
            <Ic n="bell" s={19} c="var(--muted)"/>
            {hasUnread && <span className="dk-bell-dot"></span>}
          </div>
          {notifOpen && <DeskNotifs items={notifs} onClose={() => setNotifOpen(false)}/>}
        </div>
      </header>
      <div className="dk-content">{children}</div>
    </main>
  </div>;
}

/* ============================================================
   Главная (home)
   ============================================================ */
function DeskHome({ tokens, onGen, onStartChat, onTemplate }) {
  const { Ic, ASPECTS } = window.MiraCore;
  const [hmode, setHmode] = useState('photo'); // photo | video | chat
  const [val, setVal] = useState('');
  const [apiModels, setApiModels] = useState([]);
  const [modelCode, setModelCode] = useState(null);
  const [aspectId, setAspectId] = useState('2:3');
  const [open, setOpen] = useState(null); // 'model' | 'aspect'

  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.models().then(function(m) { if (Array.isArray(m)) setApiModels(m); }).catch(function() {});
  }, []);

  const filtered = apiModels.filter(function(m) {
    if (hmode === 'video') return m.category === 'video' || m.task_type === 'video';
    return m.category !== 'video' && m.task_type !== 'video';
  });
  var curCode = modelCode || (filtered[0] && filtered[0].code);
  var curModel = filtered.find(function(m) { return m.code === curCode; }) || filtered[0];
  var modelLabel = curModel ? curModel.title : 'Seedream 4.5';
  var aspectObj = ASPECTS.find(function(a) { return a.id === aspectId; }) || ASPECTS[1];

  const submit = function() {
    const t = val.trim();
    if (hmode === 'chat') { onStartChat(t || 'Привет!'); return; }
    onGen(hmode, t, { modelCode: curModel ? curModel.code : null, aspectId: aspectId });
  };

  const chips = ['Неоновый портрет','Оживить фото','Аватар в стиле аниме','Кадр из фильма','Минималистичный постер'];
  const acts = [
    { t:'Создать фото', s:'Из текста или фото', ic:'image', bg:'#e6efe9', c:'#5f9184', go:() => onGen('photo','') },
    { t:'Создать видео', s:'Оживить изображение', ic:'video', bg:'#eae8fb', c:'#6f6cc8', go:() => onGen('video','') },
    { t:'Чат с AI', s:'Идеи, тексты, помощь', ic:'chat', bg:'#e4eef4', c:'#5b8fb0', go:() => onStartChat('Привет!') },
    { t:'Аватары', s:'Ваш стиль в арте', ic:'sparkle', bg:'#fbeede', c:'#c98a4e', go:() => onTemplate(DESK_TPL[7]) },
  ];
  const popular = DESK_TPL.slice(0, 5);

  return <div className="dk-page">
    <div className="dk-hero">
      <h1 className="dk-hero-h">Чем займёмся <span className="dk-grad">сегодня?</span></h1>
      <p className="dk-hero-sub">Опишите идею — Hubicx превратит её в фото, видео или текст.</p>

      <div className="dk-modes">
        {[['photo','Фото','image'],['video','Видео','video'],['chat','Чат','chat']].map(function(m) {
          return <button key={m[0]} className={'dk-mode' + (hmode === m[0] ? ' on' : '')} onClick={() => setHmode(m[0])}>
            <Ic n={m[2]} s={17}/> {m[1]}
          </button>;
        })}
      </div>

      <div className="dk-askbar">
        <input placeholder={hmode === 'chat' ? 'Спросите что-нибудь…' : 'Например: портрет в неоновом ночном городе, дождь, отражения, киберпанк…'}
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}/>
        {hmode !== 'chat' && <>
          <div className="dk-ask-pill-wrap">
            <button className={'dk-ask-pill' + (open === 'model' ? ' on' : '')}
              onClick={() => setOpen(open === 'model' ? null : 'model')}>
              <Ic n="sparkle" s={14}/> {modelLabel} <Ic n="chev" s={13}/>
            </button>
            {open === 'model' && <div className="dk-ask-menu">
              {filtered.length === 0
                ? <div className="dk-ask-opt muted">Модели загружаются…</div>
                : filtered.map(function(m) {
                    return <div key={m.code} className={'dk-ask-opt' + (m.code === curCode ? ' on' : '')}
                      onClick={() => { setModelCode(m.code); setOpen(null); }}>
                      <span>{m.title}</span><span className="dk-ask-opt-p">{m.price_credits} ★</span>
                    </div>;
                  })}
            </div>}
          </div>
          <div className="dk-ask-pill-wrap">
            <button className={'dk-ask-pill' + (open === 'aspect' ? ' on' : '')}
              onClick={() => setOpen(open === 'aspect' ? null : 'aspect')}>
              <Ic n="aspect" s={14}/> {aspectObj.t} <Ic n="chev" s={13}/>
            </button>
            {open === 'aspect' && <div className="dk-ask-menu">
              {ASPECTS.map(function(a) {
                return <div key={a.id} className={'dk-ask-opt' + (a.id === aspectId ? ' on' : '')}
                  onClick={() => { setAspectId(a.id); setOpen(null); }}>
                  <span>{a.t}</span><span className="dk-ask-opt-p">{a.s}</span>
                </div>;
              })}
            </div>}
          </div>
        </>}
        <button className="dk-ask-cta" onClick={submit}><Ic n="sparkle" s={16}/> Создать</button>
      </div>

      <div className="dk-chips">
        {chips.map(function(c, i) {
          return <div key={i} className="dk-chip" onClick={() => onGen('photo', c)}><Ic n="sparkle" s={13} c="var(--link)"/> {c}</div>;
        })}
      </div>
    </div>

    <div className="dk-acts">
      {acts.map(function(a, i) {
        return <div key={i} className="dk-act" onClick={a.go}>
          <div className="dk-act-ic" style={{ background:a.bg }}><Ic n={a.ic} s={22} c={a.c}/></div>
          <div className="dk-act-t">{a.t}</div>
          <div className="dk-act-s">{a.s}</div>
        </div>;
      })}
    </div>

    <div className="dk-sec">
      <h2>Популярные шаблоны</h2>
      <span className="dk-all" onClick={() => onTemplate(null)}>Все шаблоны</span>
    </div>
    <div className="dk-tpl-grid">
      {popular.map(function(t, i) {
        return <DeskTplCard key={i} t={t} onClick={() => onTemplate(t)}/>;
      })}
    </div>
  </div>;
}

/* ---- template card ---- */
function DeskTplCard({ t, onClick }) {
  const { Ic } = window.MiraCore;
  return <div className="dk-tpl" onClick={onClick}>
    <div className="dk-tpl-img">
      <img src={t.img} alt="" onError={(e) => { e.target.style.display = 'none'; }}/>
      <div className="dk-tpl-badge">{t.type === 'video' ? <Ic n="video" s={13} c="#fff"/> : <Ic n="image" s={13} c="#fff"/>}</div>
    </div>
    <div className="dk-tpl-lbl">{t.t}</div>
  </div>;
}

/* ============================================================
   Генерация (two-panel: form + canvas)
   ============================================================ */
function DeskGen({ tokens, initMode, initPrompt, initTpl, initModelCode, initAspectId, refreshBalance }) {
  const { Ic, Star, ASPECTS } = window.MiraCore;
  const [mode, setMode] = useState(initMode || 'photo');
  const [apiModels, setApiModels] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [selectedModelCode, setSelectedModelCode] = useState(initModelCode || null);
  const [selectedAspect, setSelectedAspect] = useState(
    (initAspectId && ASPECTS.find(function(a) { return a.id === initAspectId; })) || ASPECTS[1]);
  const [open, setOpen] = useState(null); // 'model' | 'aspect'
  const [tab, setTab] = useState(initTpl ? 'tpl' : (initPrompt ? 'prompt' : 'tpl'));
  const [selTpl, setSelTpl] = useState(initTpl ? initTpl.t : null);
  const [prompt, setPrompt] = useState(initPrompt || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const [canvas, setCanvas] = useState('idle'); // idle | generating | done | error
  const [task, setTask] = useState(null);
  const [err, setErr] = useState(null);
  const [errKind, setErrKind] = useState('error');
  const cancelRef = useRef(null);

  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) { setModelsLoaded(true); return; }
    window.HubicxApi.models().then(function(m) { if (Array.isArray(m)) setApiModels(m); setModelsLoaded(true); })
      .catch(function() { setModelsLoaded(true); });
  }, []);
  useEffect(function() { return function() { if (cancelRef.current) cancelRef.current(); }; }, []);

  const filtered = apiModels.filter(function(m) {
    if (mode === 'video') return m.category === 'video' || m.task_type === 'video';
    return m.category !== 'video' && m.task_type !== 'video';
  });
  const modelOpts = filtered.map(function(m) {
    return { id:m.code, t:m.title, s:(m.description || m.category || '') + ' · ' + m.price_credits + ' ★' };
  });
  var curCode = selectedModelCode || (filtered[0] && filtered[0].code);
  var curModel = filtered.find(function(m) { return m.code === curCode; }) || filtered[0];
  var curOpt = modelOpts.find(function(m) { return m.id === curCode; }) || modelOpts[0];
  var price = curModel ? curModel.price_credits : (mode === 'video' ? 5 : 2);

  const handleFile = function(file) {
    if (!file || uploading || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    setUploading(true);
    var preview = URL.createObjectURL(file);
    window.HubicxApi.uploadFile(file).then(function(data) {
      setUploadedFile({ url:data.url, file_id:data.file_id, preview:preview }); setUploading(false);
    }).catch(function(e) { setUploading(false); setUploadedFile(null); alert((e && e.message) || 'Ошибка загрузки'); });
  };

  var hasText = (tab === 'tpl' && selTpl) || (tab === 'prompt' && prompt.trim().length > 0);
  var ready = hasText || (mode === 'video' && !!uploadedFile);

  const start = function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !curModel) { alert('Модели не загружены'); return; }
    var inputs = {};
    if (selectedAspect) inputs.aspect_ratio = selectedAspect.id;
    if (uploadedFile) inputs.image_url = uploadedFile.url;
    var payload = {
      model_code: curModel.code,
      prompt: (tab === 'prompt' ? prompt.trim() : selTpl) || null,
      input_file_url: uploadedFile ? uploadedFile.url : null,
      inputs: inputs,
    };
    setCanvas('generating'); setErr(null); setTask(null);
    window.HubicxApi.createGeneration(payload).then(function(data) {
      cancelRef.current = dPollTask(data.task_id,
        function(t) { setTask(t); },
        function(t) { setTask(t); setCanvas('done'); if (refreshBalance) refreshBalance(); },
        function(m, k) { setCanvas('error'); setErr(m); setErrKind(k || 'error'); if (refreshBalance) refreshBalance(); });
    }).catch(function(e) { setCanvas('error'); setErr((e && e.message) || 'Ошибка создания задачи'); setErrKind('error'); });
  };
  const reset = function() {
    if (cancelRef.current) { cancelRef.current(); cancelRef.current = null; }
    setCanvas('idle'); setTask(null); setErr(null);
  };

  const tplList = DESK_TPL.filter(function(t) { return mode === 'video' ? t.type === 'video' : t.type === 'photo'; });

  return <div className="dk-gen">
    {/* ── left form ── */}
    <div className="dk-gen-form">
      <div className="dk-seg">
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setSelectedModelCode(null); setSelTpl(null); }}><Ic n="image" s={17}/> Фото</button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setSelectedModelCode(null); setSelTpl(null); }}><Ic n="video" s={17}/> Видео</button>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:'none' }}
        onChange={e => { handleFile(e.target.files && e.target.files[0]); e.target.value = ''; }}/>

      {uploadedFile
        ? <div className="dk-drop has" onClick={() => fileRef.current && fileRef.current.click()}>
            <img src={uploadedFile.preview} alt="" className="dk-drop-bg"/>
            <div className="dk-drop-in"><div className="dk-drop-ic"><Ic n="check" s={22} c="#5f9184"/></div>
              <div className="dk-drop-t">Файл загружен</div><div className="dk-drop-s">Нажмите, чтобы заменить</div></div>
            <button className="dk-drop-x" onClick={e => { e.stopPropagation(); setUploadedFile(null); }}>✕</button>
          </div>
        : <div className="dk-drop" onClick={() => !uploading && fileRef.current && fileRef.current.click()}>
            {uploading
              ? <><div className="dk-drop-ic"><div className="gen-spinner" style={{ width:26, height:26 }}></div></div><div className="dk-drop-t">Загружаю…</div></>
              : <><div className="dk-drop-ic"><Ic n="addimg" s={22} c="var(--ink)"/></div>
                  <div className="dk-drop-t">{mode === 'photo' ? 'Загрузите фото' : 'Загрузите фото для видео'}</div>
                  <div className="dk-drop-s">Перетащите или выберите файл</div></>}
          </div>}

      <div className="dk-seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={() => setTab('prompt')}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <div className="dk-gen-tpls">
            {tplList.map(function(t, i) {
              return <div key={i} className={'dk-gen-tpl' + (selTpl === t.t ? ' on' : '')} onClick={() => setSelTpl(t.t)}>
                <img src={t.img} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>
                <div className="dk-gen-tpl-l">{t.t}</div>
              </div>;
            })}
          </div>
        : <textarea className="dk-ta" value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Опишите, что хотите сгенерировать…"/>}

      <div className="dk-lbl">Детали</div>
      <div className="dk-card">
        <div className="dk-row" onClick={() => modelOpts.length > 0 && setOpen(open === 'model' ? null : 'model')}>
          <div className="dk-row-ic"><Ic n="model" s={20} c="var(--ink)"/></div>
          <div className="dk-row-tx"><div className="dk-row-k">Модель</div>
            <div className="dk-row-v">{!modelsLoaded ? 'Загрузка…' : curOpt ? curOpt.t + ' · ' + price + ' ★' : 'Нет моделей'}</div></div>
          {modelOpts.length > 0 && <span className="chev"><Ic n="chev" s={19}/></span>}
        </div>
        {open === 'model' && <div className="dk-drop-list">
          {modelOpts.map(function(o) {
            return <div key={o.id} className={'dk-drop-opt' + (o.id === curCode ? ' on' : '')}
              onClick={() => { setSelectedModelCode(o.id); setOpen(null); }}>
              <div><div className="dk-opt-t">{o.t}</div><div className="dk-opt-s">{o.s}</div></div>
              {o.id === curCode && <Ic n="check" s={20} c="var(--ink)"/>}
            </div>;
          })}
        </div>}
        <div className="dk-row-div"></div>
        <div className="dk-row" onClick={() => setOpen(open === 'aspect' ? null : 'aspect')}>
          <div className="dk-row-ic"><Ic n="aspect" s={20} c="var(--ink)"/></div>
          <div className="dk-row-tx"><div className="dk-row-k">Формат</div>
            <div className="dk-row-v">{selectedAspect.t} · {selectedAspect.s}</div></div>
          <span className="chev"><Ic n="chev" s={19}/></span>
        </div>
        {open === 'aspect' && <div className="dk-drop-list">
          {ASPECTS.map(function(o) {
            return <div key={o.id} className={'dk-drop-opt' + (o.id === selectedAspect.id ? ' on' : '')}
              onClick={() => { setSelectedAspect(o); setOpen(null); }}>
              <div><div className="dk-opt-t">{o.t}</div><div className="dk-opt-s">{o.s}</div></div>
              {o.id === selectedAspect.id && <Ic n="check" s={20} c="var(--ink)"/>}
            </div>;
          })}
        </div>}
      </div>

      <button className="dk-cta" disabled={!ready || uploading || !modelsLoaded || !curModel || canvas === 'generating'} onClick={start}>
        <Ic n="sparkle" s={17}/> {canvas === 'generating' ? 'Генерация…' : 'Сгенерировать · ' + price + ' ★'}
      </button>
    </div>

    {/* ── right canvas ── */}
    <div className="dk-canvas">
      <div className="dk-canvas-h">Холст</div>
      <div className="dk-canvas-body">
        {canvas === 'idle' && <div className="dk-canvas-empty">
          <div className="dk-canvas-ph"><Ic n="image" s={40} c="var(--faint)"/></div>
          <div className="dk-canvas-et">Здесь появится результат</div>
          <div className="dk-canvas-es">Выберите шаблон или опишите идею и нажмите «Сгенерировать»</div>
        </div>}
        {canvas === 'generating' && <div className="dk-canvas-empty">
          <div className="gen-spinner"></div>
          <div className="dk-canvas-et" style={{ marginTop:18 }}>{task && (task.status === 'processing' || task.status === 'running') ? 'Генерация…' : 'В очереди…'}</div>
          <div className="dk-canvas-es">{mode === 'video' ? 'Видео генерируется 2–3 минуты. Можно продолжать работу — результат появится здесь и в «Истории».' : 'Обычно занимает 15–40 секунд.'}</div>
        </div>}
        {canvas === 'done' && task && <DeskResult task={task} onAgain={reset}/>}
        {canvas === 'error' && <div className="dk-canvas-empty">
          <div style={{ fontSize:40 }}>{errKind === 'timeout' ? '⏳' : '⚠️'}</div>
          <div className="dk-canvas-et" style={{ marginTop:12 }}>{errKind === 'timeout' ? 'Почти готово' : 'Ошибка'}</div>
          <div className="dk-canvas-es">{err}</div>
          {errKind === 'refunded' && <div className="dk-refund">✓ Токены возвращены на баланс</div>}
          <button className="dk-cta dk-cta-sm" onClick={reset} style={{ marginTop:16, width:'auto', padding:'0 24px' }}>
            {errKind === 'timeout' ? 'Понятно' : 'Попробовать снова'}
          </button>
        </div>}
      </div>
    </div>
  </div>;
}

function DeskResult({ task, onAgain }) {
  const { Ic } = window.MiraCore;
  const isVideo = task.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(task.output_file_url || '');
  const [sent, setSent] = useState('idle');
  const send = function() {
    if (sent !== 'idle' || !window.HubicxApi) return;
    setSent('sending');
    window.HubicxApi.sendToChat(task.id).then(function() { setSent('done'); }).catch(function() { setSent('error'); });
  };
  return <div className="dk-result">
    {isVideo
      ? <video src={task.output_file_url} controls autoPlay playsInline className="dk-result-media"/>
      : <img src={task.output_file_url} alt="Результат" className="dk-result-media"/>}
    {task.prompt && <div className="dk-result-cap">{task.prompt}</div>}
    <div className="dk-result-acts">
      <button className="dk-btn-sec" onClick={send} disabled={sent === 'sending' || sent === 'done'}>
        {sent === 'done' ? '✓ Отправлено' : sent === 'sending' ? 'Отправка…' : sent === 'error' ? 'Ошибка' : '📤 В Telegram'}
      </button>
      <a className="dk-btn-sec" href={task.output_file_url} download target="_blank" rel="noreferrer"><Ic n="download" s={16}/> Скачать</a>
      <button className="dk-cta dk-cta-sm" onClick={onAgain}>Создать ещё</button>
    </div>
  </div>;
}

/* ============================================================
   Чат (two-panel: list + conversation)
   ============================================================ */
function DeskChat({ chats, activeChat, onOpenChat, onStartChat, onSend, onDeleteChat }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState('');
  const bodyRef = useRef(null);
  const cur = chats.find(function(c) { return c.id === activeChat; });
  const msgs = (cur && cur.msgs) || [];
  const last = msgs[msgs.length - 1];
  const streaming = last && last.streaming;

  useEffect(function() { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; },
    [msgs.length, last && last.text]);

  const send = function() {
    const t = val.trim(); if (!t) return;
    if (streaming) return;
    setVal('');
    if (cur) onSend(t); else onStartChat(t);
  };

  const starters = ['Идея для поста про осень','Какой сегодня день?','Помоги с текстом','Сценарий для рилса'];

  return <div className="dk-chat">
    <div className="dk-chat-list">
      <button className="dk-newchat" onClick={() => onStartChat('Привет!')}><Ic n="plus" s={17}/> Новый чат</button>
      {chats.length === 0 && <div className="dk-chat-starters">
        <div className="dk-lbl" style={{ marginTop:6 }}>Быстрый старт</div>
        {starters.map(function(s, i) {
          return <div key={i} className="dk-starter" onClick={() => onStartChat(s)}>
            <span className="dk-starter-ic"><Ic n="sparkle" s={16} c="var(--link)"/></span>{s}
          </div>;
        })}
      </div>}
      {chats.map(function(c) {
        var lm = c.msgs && c.msgs.length ? c.msgs[c.msgs.length - 1].text : '';
        return <div key={c.id} className={'dk-chat-item' + (c.id === activeChat ? ' on' : '')} onClick={() => onOpenChat(c.id)}>
          <div className="dk-chat-av"><img src="assets/logo.jpg" alt=""/></div>
          <div className="dk-chat-meta"><div className="dk-chat-title">{c.title}</div><div className="dk-chat-prev">{lm}</div></div>
          <span className="dk-chat-x" onClick={e => { e.stopPropagation(); onDeleteChat(c.id); }}><Ic n="close" s={15}/></span>
        </div>;
      })}
    </div>

    <div className="dk-conv">
      {cur ? <>
        <div className="dk-conv-h">
          <div className="dk-conv-av"><img src="assets/logo.jpg" alt=""/></div>
          <div><div className="dk-conv-name">Агент Hubicx</div>
            <div className="dk-conv-status" style={{ color: streaming ? '#c98a4e' : '#7a9c92' }}>{streaming ? 'печатает…' : 'онлайн'}</div></div>
        </div>
        <div className="dk-conv-body" ref={bodyRef}>
          {msgs.map(function(m, i) {
            if (m.streaming && !m.text) return null;
            return <div key={i} className={'bubble ' + (m.role === 'user' ? 'me' : 'bot') + (m.isError ? ' err' : '')}>{m.text}</div>;
          })}
          {streaming && !last.text && <div className="bubble bot typing"><span/><span/><span/></div>}
        </div>
        <div className="dk-conv-input">
          <div className="dk-conv-ask">
            <input placeholder="Сообщение…" value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(); }}/>
            <button className={'dk-conv-send' + (val.trim() && !streaming ? ' on' : '')} onClick={send}><Ic n="arrowUp" s={19}/></button>
          </div>
        </div>
      </> : <div className="dk-conv-empty">
        <div className="dk-conv-empty-ic"><Ic n="chat" s={40} c="var(--faint)"/></div>
        <div className="dk-canvas-et">Выберите чат или начните новый</div>
        <div className="dk-canvas-es">AI-помощник ответит на вопросы, поможет с текстами и идеями</div>
      </div>}
    </div>
  </div>;
}

/* ============================================================
   Шаблоны (catalog: Все / Фото / Видео)
   ============================================================ */
function DeskTemplates({ onTemplate }) {
  const [filter, setFilter] = useState('all');
  const list = DESK_TPL.filter(function(t) { return filter === 'all' || t.type === filter; });
  return <div className="dk-page">
    <div className="dk-tpl-tabs">
      {[['all','Все'],['photo','Фото'],['video','Видео']].map(function(f) {
        return <button key={f[0]} className={'dk-tpl-tab' + (filter === f[0] ? ' on' : '')} onClick={() => setFilter(f[0])}>{f[1]}</button>;
      })}
    </div>
    <div className="dk-tpl-grid wide">
      {list.map(function(t, i) { return <DeskTplCard key={i} t={t} onClick={() => onTemplate(t)}/>; })}
    </div>
  </div>;
}

/* ============================================================
   История (past generations)
   ============================================================ */
function DeskHistory() {
  const { Ic } = window.MiraCore;
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState(null);

  const load = function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) { setLoaded(true); return; }
    window.HubicxApi.history().then(function(items) { if (Array.isArray(items)) setHistory(items); setLoaded(true); })
      .catch(function() { setLoaded(true); });
  };
  useEffect(load, []);
  var hasPending = history.some(function(i) { return i.status === 'queued' || i.status === 'created' || i.status === 'processing'; });
  useEffect(function() {
    if (!hasPending || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    var t = setInterval(function() { window.HubicxApi.history().then(function(items) { if (Array.isArray(items)) setHistory(items); }).catch(function() {}); }, 5000);
    return function() { clearInterval(t); };
  }, [hasPending]);

  if (view) {
    const isVideo = view.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(view.output_file_url || '');
    return <div className="dk-page">
      <div className="dk-back" onClick={() => setView(null)}><Ic n="back" s={20}/> Назад к истории</div>
      <div className="dk-view">
        {isVideo ? <video src={view.output_file_url} controls className="dk-view-media"/> : <img src={view.output_file_url} alt="" className="dk-view-media"/>}
        {view.prompt && <div className="dk-result-cap" style={{ maxWidth:520 }}>{view.prompt}</div>}
      </div>
    </div>;
  }

  return <div className="dk-page">
    {loaded && history.length === 0 && <div className="dk-empty-card">
      <div style={{ fontSize:38 }}>✨</div>
      <div className="dk-canvas-et">Здесь появятся ваши работы</div>
      <div className="dk-canvas-es">Создайте первое фото или видео — результат сохранится в истории</div>
    </div>}
    <div className="dk-hist-grid">
      {history.map(function(item) {
        var done = item.status === 'completed';
        var failed = item.status === 'refunded';
        return <div key={item.id} className="dk-hist" onClick={() => done && item.output_file_url && setView(item)}>
          <div className="dk-hist-img">
            {done && item.output_file_url
              ? <img src={item.output_file_url} alt=""/>
              : <Ic n={failed ? 'close' : 'sparkle'} s={26} c={failed ? '#c0473e' : 'var(--faint)'}/>}
          </div>
          <div className="dk-hist-meta">
            <div className="dk-hist-t">{item.title || item.prompt || 'Генерация'}</div>
            <div className="dk-hist-s">{failed ? '✗ Ошибка · возврат' : done ? '✓ ' + item.cost_credits + ' ★' : '⏳ ' + (item.status === 'queued' ? 'В очереди' : 'Генерация…')}</div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ============================================================
   Избранное (placeholder — no API yet)
   ============================================================ */
function DeskFavorites() {
  return <div className="dk-page">
    <div className="dk-empty-card">
      <div style={{ fontSize:38 }}>🤍</div>
      <div className="dk-canvas-et">В избранном пока пусто</div>
      <div className="dk-canvas-es">Отмечайте лучшие работы — они появятся здесь для быстрого доступа</div>
    </div>
  </div>;
}

/* ============================================================
   Профиль (dashboard)
   ============================================================ */
function DeskProfile({ tokens, user, onTopup, onSettings }) {
  const { Ic, Star } = window.MiraCore;
  const [history, setHistory] = useState([]);
  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.history().then(function(items) { if (Array.isArray(items)) setHistory(items); }).catch(function() {});
  }, []);

  const done = history.filter(function(i) { return i.status === 'completed'; });
  const photos = done.filter(function(i) { return i.task_type !== 'video'; }).length;
  const videos = done.filter(function(i) { return i.task_type === 'video'; }).length;
  const name = (user && (user.first_name || user.username)) || 'Пользователь';
  const uname = (user && user.username) ? '@' + user.username : '@hubicx';
  const initial = (name || 'H').trim().charAt(0).toUpperCase();
  const recent = done.slice(0, 4);

  const stats = [
    { ic:'sparkle', c:'#7a9c92', n:done.length, l:'генераций' },
    { ic:'image',   c:'#5f9184', n:photos,      l:'фото' },
    { ic:'video',   c:'#6f6cc8', n:videos,      l:'видео' },
  ];

  return <div className="dk-prof">
    <div className="dk-prof-main">
      <div className="dk-prof-card">
        <div className="dk-prof-ava">{initial}</div>
        <div className="dk-prof-id">
          <div className="dk-prof-name">{name} <span className="dk-pro">Pro</span></div>
          <div className="dk-prof-handle">{uname}</div>
          <div className="dk-prof-btns">
            <button className="dk-btn-sec" onClick={onSettings}><Ic n="gear" s={16}/> Настройки</button>
          </div>
        </div>
      </div>

      <div className="dk-stats">
        {stats.map(function(s, i) {
          return <div key={i} className="dk-stat">
            <Ic n={s.ic} s={20} c={s.c}/>
            <div className="dk-stat-n">{s.n}</div>
            <div className="dk-stat-l">{s.l}</div>
          </div>;
        })}
      </div>

      <div className="dk-sec"><h2>Последние работы</h2></div>
      {recent.length > 0
        ? <div className="dk-tpl-grid">
            {recent.map(function(item) {
              return <div key={item.id} className="dk-tpl">
                <div className="dk-tpl-img">{item.output_file_url ? <img src={item.output_file_url} alt=""/> : <Ic n="image" s={28} c="var(--faint)"/>}</div>
              </div>;
            })}
          </div>
        : <div className="dk-empty-card"><div style={{ fontSize:34 }}>✨</div><div className="dk-canvas-es">Ваши работы появятся здесь</div></div>}
    </div>

    <div className="dk-prof-side">
      <div className="dk-card dk-pad">
        <div className="dk-side-lbl">Баланс токенов</div>
        <div className="dk-side-bal"><Star s={22} c="#c9c7f4"/> {tokens}</div>
        <button className="dk-cta" onClick={onTopup}>Пополнить</button>
        <div className="dk-side-note">1 фото ≈ 2 ★ · 1 видео ≈ 5 ★</div>
      </div>

      <div className="dk-card dk-pad">
        <div className="dk-side-h"><Ic n="bolt" s={17} c="#c98a4e"/> Hubicx Pro</div>
        <div className="dk-kv"><span>Подписка</span><b>активна</b></div>
        <div className="dk-kv"><span>Лимит в день</span><b>без лимита</b></div>
        <div className="dk-kv"><span>Все модели</span><b>доступны</b></div>
      </div>

      <div className="dk-card dk-pad">
        <div className="dk-side-h">Пригласить друга</div>
        <div className="dk-side-note" style={{ marginTop:0, marginBottom:10 }}>+50 ★ вам и другу за регистрацию</div>
        <div className="dk-ref">
          <span className="dk-ref-link">hubicx.ru/r/{(user && user.username) || 'you'}</span>
          <button className="dk-ref-copy" onClick={() => { try { navigator.clipboard.writeText('https://hubicx.ru/r/' + ((user && user.username) || 'you')); } catch(e) {} }}><Ic n="copy" s={15}/></button>
        </div>
      </div>
    </div>
  </div>;
}

/* ============================================================
   Topup modal (centered, horizontal packages)
   ============================================================ */
function DeskTopup({ tokens, onClose }) {
  const { Star, Ic } = window.MiraCore;
  const fallback = [
    { code:'start', tokens:160,  price_rub:149,  bonus_tokens:11,  total_tokens:160,  effective_price_per_token:0.93 },
    { code:'basic', tokens:450,  price_rub:399,  bonus_tokens:51,  total_tokens:450,  effective_price_per_token:0.89 },
    { code:'pro',   tokens:1000, price_rub:849,  bonus_tokens:151, total_tokens:1000, effective_price_per_token:0.85 },
    { code:'max',   tokens:2200, price_rub:1690, bonus_tokens:510, total_tokens:2200, effective_price_per_token:0.77 },
  ];
  const [packs, setPacks] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [sel, setSel] = useState(1);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState('');

  useEffect(function() {
    var alive = true;
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.pricing().then(function(data) {
        if (!alive) return;
        if (data && Array.isArray(data.token_packages) && data.token_packages.length) setPacks(data.token_packages.slice(0, 4));
        else setPacks(fallback);
        if (data && data.payments_enabled) setEnabled(true);
      }).catch(function() { if (alive) setPacks(fallback); });
    } else setPacks(fallback);
    return function() { alive = false; };
  }, []);

  const pay = function() {
    if (paying || !window.HubicxApi || !packs) return;
    var chosen = packs[sel] || packs[0];
    if (!chosen) return;
    setPayErr(''); setPaying(true);
    window.HubicxApi.createPayment({ amount_rub: chosen.price_rub, credits: chosen.total_tokens || chosen.tokens, package_code: chosen.code })
      .then(function(data) {
        setPaying(false);
        if (data.payment_url) {
          var tg = window.Telegram && window.Telegram.WebApp;
          if (tg && tg.openLink) tg.openLink(data.payment_url); else window.open(data.payment_url, '_blank');
          onClose();
        } else setPayErr(data.message || 'Не удалось создать платёж');
      }).catch(function(e) { setPaying(false); setPayErr((e && e.message) || 'Ошибка при создании платежа'); });
  };

  const chosen = packs && (packs[sel] || packs[0]);
  return <div className="dk-modal-ov" onClick={onClose}>
    <div className="dk-modal" onClick={e => e.stopPropagation()}>
      <button className="dk-modal-x" onClick={onClose}><Ic n="close" s={18}/></button>
      <div className="dk-modal-title">Пополнить токены</div>
      <div className="dk-modal-sub">Текущий баланс: {tokens} ★</div>

      {packs === null
        ? <div style={{ padding:'40px 0', display:'flex', justifyContent:'center' }}><div className="gen-spinner"></div></div>
        : <>
        <div className="dk-packs">
          {packs.map(function(p, i) {
            var best = i === 1;
            return <div key={i} className={'dk-pack' + (sel === i ? ' on' : '')} onClick={() => setSel(i)}>
              {best && <div className="dk-pack-best">Выгодно</div>}
              <Star s={22} c="#c9c7f4"/>
              <div className="dk-pack-n">{p.total_tokens || p.tokens}</div>
              {p.bonus_tokens > 0 && <div className="dk-pack-bonus">+{p.bonus_tokens} бонус</div>}
              <div className="dk-pack-price">{p.price_rub} ₽</div>
            </div>;
          })}
        </div>

        <div className="dk-feats">
          <span><Ic n="bolt" s={14} c="#c98a4e"/> Мгновенное зачисление</span>
          <span><Ic n="sparkle" s={14} c="#7a9c92"/> Все модели и форматы</span>
          <span><Ic n="heart" s={14} c="#c45c92"/> Бонусные токены за пакет</span>
        </div>

        {payErr && <div className="dk-pay-err">{payErr}</div>}
        {!enabled && <div className="dk-modal-sub" style={{ marginTop:10 }}>Оплата скоро будет доступна</div>}

        <button className="dk-cta" disabled={!enabled || paying || !chosen} onClick={pay} style={{ marginTop:14 }}>
          {paying ? 'Создаём платёж…' : enabled ? 'Оплатить · ' + (chosen ? chosen.price_rub : '') + ' ₽' : 'Скоро будет доступно · ' + (chosen ? chosen.price_rub : '') + ' ₽'}
        </button>
      </>}
    </div>
  </div>;
}

window.DeskShell = DeskShell;
window.DeskHome = DeskHome;
window.DeskGen = DeskGen;
window.DeskChat = DeskChat;
window.DeskTemplates = DeskTemplates;
window.DeskHistory = DeskHistory;
window.DeskFavorites = DeskFavorites;
window.DeskProfile = DeskProfile;
window.DeskTopup = DeskTopup;
