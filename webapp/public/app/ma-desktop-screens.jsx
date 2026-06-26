/* ============================================================
   Hubicx — Desktop (PC) screens
   Loaded only in desktop.html, before ma-app.jsx.

   BUILD: 20260622-v3
   ============================================================ */
(function(){ if (typeof window!=='undefined' && window.__APP_BUILD__ && window.__APP_BUILD__!=='20260623-bonus1') { var u = new URL(window.location); u.searchParams.set('_r', Date.now()); window.location.replace(u.href); } })();
   /* Uses globals from ma-core (useState/useEffect/useRef, MiraCore)
   and window.HubicxApi. Mobile screens are untouched.
   ============================================================ */

/* ---- template catalog (photo / video) ---- */
const DESK_TPL = (window.MiraCore && (window.MiraCore.CREATE_TPL || window.MiraCore.TEMPLATES)) || [];

const DESK_FAV_KEY = 'hbx_favorite_templates_v1';
function tplKey(t) { return (t && (t.code || t.t)) || ''; }
function defaultFavTemplateKeys() {
  return DESK_TPL.filter(function(t) { return t.type === 'photo'; }).slice(0, 9).map(tplKey);
}
function readFavTemplateKeys() {
  try {
    var raw = localStorage.getItem(DESK_FAV_KEY);
    if (!raw) return defaultFavTemplateKeys();
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : defaultFavTemplateKeys();
  } catch (e) { return defaultFavTemplateKeys(); }
}
function writeFavTemplateKeys(keys) {
  try { localStorage.setItem(DESK_FAV_KEY, JSON.stringify(keys || [])); } catch (e) {}
}
function matchesTplSearch(t, query) {
  var q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [t.t, t.category, t.type].some(function(v) { return String(v || '').toLowerCase().indexOf(q) !== -1; });
}

function modelFields(model) { return (model && model.form_schema && Array.isArray(model.form_schema.fields)) ? model.form_schema.fields : []; }
function getModelField(model, names) {
  var fields = modelFields(model);
  for (var i = 0; i < names.length; i++) {
    var f = fields.find(function(x) { return x && x.name === names[i]; });
    if (f) return f;
  }
  return null;
}
function getQualityField(model) {
  var resolution = getModelField(model, ['quality', 'resolution']);
  if (resolution) return resolution;
  return null;
}
function getDurationField(model) { return getModelField(model, ['duration']); }
function getAspectField(model) {
  var aspect = getModelField(model, ['aspect_ratio']);
  if (aspect) return aspect;
  var imageSize = getModelField(model, ['image_size']);
  if (imageSize && Array.isArray(imageSize.options)) return imageSize;
  return null;
}
function aspectValueForField(field, aspectId) {
  if (!field) return aspectId;
  var opts = fieldOptions(field).map(function(o) { return String(o); });
  if (opts.indexOf(String(aspectId)) !== -1) return aspectId;
  var map = {
    '1:1': ['square_hd', 'square', '1:1'],
    '2:3': ['portrait_4_3', 'portrait_16_9', '9:16', '2:3'],
    '3:4': ['3:4', 'portrait_4_3', 'portrait_16_9'],
    '4:5': ['4:5', 'portrait_4_3', 'portrait_16_9'],
    '3:2': ['landscape_4_3', 'landscape_16_9', '16:9', '3:2'],
    '4:3': ['4:3', 'landscape_4_3', 'landscape_16_9'],
    '5:4': ['5:4', 'landscape_4_3', 'landscape_16_9'],
    '9:16': ['portrait_16_9', '9:16', 'portrait_4_3'],
    '16:9': ['landscape_16_9', '16:9', 'landscape_4_3'],
    '21:9': ['21:9', 'landscape_16_9']
  };
  var candidates = map[String(aspectId)] || [String(aspectId)];
  for (var i = 0; i < candidates.length; i++) if (opts.indexOf(candidates[i]) !== -1) return candidates[i];
  return fieldDefault(field) || aspectId;
}
function getAspectOptionsForModel(model, fallbackAspects) {
  var field = getAspectField(model);
  if (!field) return fallbackAspects;
  var opts = fieldOptions(field).map(function(o) { return String(o); });
  var filtered = fallbackAspects.filter(function(a) {
    if (opts.indexOf(String(a.id)) !== -1) return true;
    if (field.name !== 'image_size') return false;
    var map = {
      '1:1': ['square_hd', 'square'],
      '2:3': ['portrait_4_3', 'portrait_16_9'],
      '3:4': ['portrait_4_3', 'portrait_16_9'],
      '4:5': ['portrait_4_3'],
      '3:2': ['landscape_4_3', 'landscape_16_9'],
      '4:3': ['landscape_4_3', 'landscape_16_9'],
      '5:4': ['landscape_4_3'],
      '9:16': ['portrait_16_9'],
      '16:9': ['landscape_16_9'],
      '21:9': ['landscape_16_9']
    };
    return (map[String(a.id)] || []).some(function(v) { return opts.indexOf(v) !== -1; });
  });
  return filtered.length ? filtered : fallbackAspects;
}
function templateModelCode(t) { return (t && t.modelCode) || 'nano_banana_pro'; }
function templateQualityValue(t) { return t && (t.qualityValue || t.quality || t.resolution); }
function templateDurationValue(t) { return t && (t.durationValue || t.duration); }
function isSeedanceModelCode(code) { return /^seedance_2_/.test(String(code || '')) || String(code || '').indexOf('seedance') === 0; }
function resolveSeedanceAutoCode(code, files) {
  var selected = String(code || '');
  var list = Array.isArray(files) ? files.filter(Boolean) : [];
  var images = list.filter(function(f) { return !f || f.type !== 'video'; }).length;
  var videos = list.filter(function(f) { return f && f.type === 'video'; }).length;
  var isFast = selected === 'seedance_2_fast_auto' || selected.indexOf('_fast') !== -1;
  if (selected !== 'seedance_2_auto' && selected !== 'seedance_2_fast_auto') return selected;
  if (images >= 2 || videos > 0) return isFast ? 'seedance_2_reference_fast' : 'seedance_2_reference';
  if (images === 1) return isFast ? 'seedance_2_i2v_fast' : 'seedance_2_i2v';
  return 'seedance_2_t2v';
}
function displaySeedanceAutoCode(code) {
  var s = String(code || '');
  if (!isSeedanceModelCode(s)) return s;
  if (s === 'seedance_2_auto' || s === 'seedance_2_fast_auto') return s;
  return s.indexOf('_fast') !== -1 ? 'seedance_2_fast_auto' : 'seedance_2_auto';
}
function fieldDefault(field) {
  if (!field) return null;
  if (field.default != null) return field.default;
  return field.options && field.options.length ? field.options[0] : null;
}
function fieldOptions(field) { return field && Array.isArray(field.options) ? field.options : []; }
function prettyOption(v) {
  var s = String(v == null ? '' : v);
  var map = { auto:'Auto', square_hd:'HD', square:'Square', portrait_4_3:'4:3', portrait_16_9:'9:16', landscape_4_3:'4:3', landscape_16_9:'16:9', auto_2K:'2K', auto_4K:'4K' };
  return map[s] || s;
}
function shortModelDescription(m) {
  var code = String((m && m.code) || '');
  if (code === 'nano_banana_2') return 'Быстрая генерация';
  if (code === 'nano_banana_pro') return 'Pro · высокое разрешение';
  if (code === 'nano_banana_edit') return 'Редактирование фото';
  if (code === 'gpt_image_2') return 'Качественная генерация';
  if (code === 'gpt_image_2_edit') return 'Редактирование фото';
  if (code === 'seedream') return 'Фотореализм';
  if (code === 'flux_schnell') return 'Быстро и дёшево';
  if (code === 'z_image') return 'Доступная генерация';
  if (code === 'kling_21_i2v') return 'Image → video';
  if (code === 'kling_30_i2v') return 'Image → video · 720p';
  if (code === 'kling_30_motion_control') return 'Motion control';
  if (code === 'grok_video_t2v') return 'Текст → видео';
  if (code === 'grok_video_i2v') return 'Фото → видео';
  if (code === 'veo_31_t2v') return 'Текст → видео';
  if (code === 'veo_31_i2v') return 'Фото → видео';
  if (code.indexOf('happy_horse') !== -1) return 'Липсинк-видео';
  return (m && m.description) ? String(m.description).replace(/\s+через\s+Fal\.?/ig, '').replace(/\s+высокая\s+стоимость\.?/ig, '') : '';
}
function estimateModelPrice(model, inputs) {
  if (!model) return 0;
  var rules = model.form_schema && model.form_schema.price_rules;
  var total = Number((rules && rules.base) || model.price_credits || 0);
  if (rules && Array.isArray(rules.multipliers)) {
    rules.multipliers.forEach(function(rule) {
      if (!rule || !rule.field) return;
      var value = inputs && inputs[rule.field];
      if (value == null) return;
      var mult = 1;
      if (rule.mode === 'multiply_by_value') mult = Number(value) || 1;
      else if (rule.values) {
        var key = String(value);
        mult = Number(rule.values[key] != null ? rule.values[key] : rule.values[key.toLowerCase()]) || 1;
      }
      total *= mult;
    });
  }
  return Math.max(1, Math.ceil(total || Number(model.price_credits || 0)));
}

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
   Auth screen (desktop browser — email/password login & register)
   ============================================================ */
function DeskAuth({ onAuthed }) {
  const { Ic } = window.MiraCore;
  const [tab, setTab] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = function() {
    var em = email.trim();
    if (!em || !password) { setErr('Введите email и пароль'); return; }
    if (tab === 'register' && password.length < 6) { setErr('Пароль должен быть не короче 6 символов'); return; }
    setBusy(true); setErr('');
    var p = tab === 'register'
      ? window.HubicxApi.register(em, password, name.trim())
      : window.HubicxApi.login(em, password);
    p.then(function(data) { setBusy(false); if (onAuthed) onAuthed(data && data.user); })
      .catch(function(e) { setBusy(false); setErr((e && e.message) || 'Не удалось войти'); });
  };

  return <div className="dk-auth">
    <div className="dk-auth-card">
      <div className="dk-auth-brand"><div className="dk-logo"><img src="assets/logo.jpg" alt="Hubicx"/></div><div className="dk-word">Hubicx</div></div>
      <div className="dk-auth-h">{tab === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</div>
      <div className="dk-auth-sub">Фото, видео и AI-чат на компьютере</div>

      <div className="dk-seg" style={{ marginTop:20 }}>
        <button className={tab === 'login' ? 'on' : ''} onClick={() => { setTab('login'); setErr(''); }}>Вход</button>
        <button className={tab === 'register' ? 'on' : ''} onClick={() => { setTab('register'); setErr(''); }}>Регистрация</button>
      </div>

      <div className="dk-auth-fields">
        {tab === 'register' && <input className="dk-auth-in" placeholder="Имя (необязательно)" value={name}
          onChange={e => setName(e.target.value)}/>}
        <input className="dk-auth-in" type="email" placeholder="Email" value={email}
          autoComplete="email" onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}/>
        <input className="dk-auth-in" type="password" placeholder="Пароль" value={password}
          autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}/>
      </div>

      {err && <div className="dk-pay-err" style={{ textAlign:'left', marginTop:12 }}>{err}</div>}

      <button className="dk-cta" style={{ marginTop:16 }} disabled={busy} onClick={submit}>
        {busy ? 'Подождите…' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
      </button>

      <div className="dk-auth-foot">
        {tab === 'login'
          ? <span>Нет аккаунта? <b onClick={() => { setTab('register'); setErr(''); }}>Зарегистрироваться</b></span>
          : <span>Уже есть аккаунт? <b onClick={() => { setTab('login'); setErr(''); }}>Войти</b></span>}
      </div>
      <div className="dk-auth-note">Уже пользуетесь ботом в Telegram? Откройте профиль в Mini App и нажмите «Связать аккаунты», чтобы входить с тем же балансом.</div>
    </div>
  </div>;
}

/* ============================================================
   Shell: sidebar + topbar + content slot
   ============================================================ */
function DeskShell({ tab, onTab, onProfile, tokens, user, onTopup, title, subtitle, chatsBadge, theme, onToggleTheme, searchQuery, onSearchQuery, children }) {
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
  ];
  const name = (user && (user.first_name || user.username)) || 'Профиль';
  const uname = (user && user.username) ? '@' + user.username : 'Hubicx';
  const initial = (name || 'H').trim().charAt(0).toUpperCase();

  return <div className="dk" onClick={() => notifOpen && setNotifOpen(false)}>
    <aside className="dk-side">
      <div className="dk-brand">
        <div className="dk-logo"><img src="assets/logo.jpg" alt="Hubicx"/></div>
        <div className="dk-word">Hubicx</div>
      </div>
      <div className="dk-menu-lbl">МЕНЮ</div>
      <nav className="dk-navs">
        {nav.map(function(n) {
            return <div key={n.id} data-onb={'desk-nav-' + n.id} className={'dk-nav' + (tab === n.id ? ' on' : '')} onClick={() => onTab(n.id)}>
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
        <button className="dk-topup" data-onb="desk-topup" onClick={onTopup}>Пополнить</button>
      </div>

      <div className={'dk-user' + (tab === 'profile' ? ' on' : '')} data-onb="desk-profile" onClick={onProfile}>
        <div className="dk-ava">{initial}</div>
        <div className="dk-uinfo">
          <div className="dk-uname">{name} {user && user.subscription && user.subscription.is_active ? <span className="dk-pro">{user.subscription.title}</span> : null}</div>
          <div className="dk-uhandle">{uname}</div>
        </div>
        <span className="dk-theme" title="Сменить тему" onClick={(e) => { e.stopPropagation(); if (onToggleTheme) onToggleTheme(); }}><Ic n={theme === 'dark' ? 'sun' : 'moon'} s={17} c="var(--faint)"/></span>
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
          <input placeholder={tab === 'gen' || tab === 'tpl' ? 'Поиск шаблонов…' : 'Поиск шаблонов, чатов…'}
            value={tab === 'gen' || tab === 'tpl' ? (searchQuery || '') : ''}
            onChange={e => onSearchQuery && onSearchQuery(e.target.value)}
            readOnly={!(tab === 'gen' || tab === 'tpl')}/>
        </div>
        <div className="dk-tok" onClick={onTopup}>
          <Star s={16} c="#c9c7f4"/> <span>{tokens}</span>
          <span className="dk-tok-plus"><Ic n="plus" s={15}/></span>
        </div>
        <button className="dk-theme-btn" title="Сменить тему" onClick={(e) => { e.stopPropagation(); if (onToggleTheme) onToggleTheme(); }}>
          <Ic n={theme === 'dark' ? 'sun' : 'moon'} s={19} c="var(--muted)"/>
        </button>
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
function DeskHome({ tokens, onGen, onStartChat, onTemplate, onHistory }) {
  const { Ic, ASPECTS } = window.MiraCore;
  const [hmode, setHmode] = useState('photo'); // photo | video | chat
  const [val, setVal] = useState('');
  const [apiModels, setApiModels] = useState(window.MiraCore.FALLBACK_MODELS || []);
  const [modelCode, setModelCode] = useState(null);
  const [aspectId, setAspectId] = useState('2:3');
  const [qualityValue, setQualityValue] = useState(null);
  const [uiModelLabel, setUiModelLabel] = useState(null);
  const [uiAspectLabel, setUiAspectLabel] = useState(null);
  const [uiQualityLabel, setUiQualityLabel] = useState(null);
  const [batchCount, setBatchCount] = useState(1);
  const [open, setOpen] = useState(null); // 'model' | 'quality' | 'duration' | 'batch' | 'aspect'
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);

  useEffect(function() {
    if (!window.HubicxApi) { setApiModels(window.MiraCore.FALLBACK_MODELS); return; }
    window.HubicxApi.models().then(function(m) {
      if (Array.isArray(m) && m.length > 0) setApiModels(m);
      else setApiModels(window.MiraCore.FALLBACK_MODELS);
    }).catch(function() { setApiModels(window.MiraCore.FALLBACK_MODELS); });
  }, []);

  const filtered = apiModels.filter(function(m) {
    if (hmode === 'video') return m.task_type === 'video' || m.category === 'video';
    return m.task_type === 'image' || (m.category === 'photo' && m.task_type !== 'video');
  });
  var curCode = modelCode || (filtered[0] && filtered[0].code);
  var curModel = filtered.find(function(m) { return m.code === curCode; }) || filtered[0];
  var modelLabel = uiModelLabel || (curModel ? curModel.title : 'Seedream 4.5');
  var aspectOpts = getAspectOptionsForModel(curModel, ASPECTS);
  var aspectObj = aspectOpts.find(function(a) { return a.id === aspectId; }) || aspectOpts[0] || ASPECTS[1];
  var qField = getQualityField(curModel);
  var qOptions = fieldOptions(qField);
  var qValue = qField ? (qOptions.some(function(o) { return String(o) === String(qualityValue); }) ? qualityValue : fieldDefault(qField)) : null;
  var qualityLabel = uiQualityLabel || prettyOption(qValue);
  var aspectLabel = uiAspectLabel || (aspectObj ? aspectObj.t : '2:3');
  var priceInputs = {};
  if (qField && qValue != null) priceInputs[qField.name] = qValue;
  var onePrice = curModel ? estimateModelPrice(curModel, priceInputs) : 0;
  var totalPrice = Math.max(1, onePrice * batchCount);

  const submit = function() {
    const t = val.trim();
    if (hmode === 'chat') { onStartChat(t || 'Привет!'); return; }
    onGen(hmode, t, { modelCode: curModel ? curModel.code : null, aspectId: aspectId, qualityField: qField ? qField.name : null, qualityValue: qValue, batchCount: batchCount });
  };

  const chips = ['Неоновый портрет','Оживить фото','Аватар в стиле аниме','Кадр из фильма','Минималистичный постер'];
  const acts = [
    { t:'Создать фото', s:'Из текста или фото', ic:'image', bg:'#e6efe9', c:'#5f9184', go:() => onGen('photo','') },
    { t:'Создать видео', s:'Оживить изображение', ic:'video', bg:'#eae8fb', c:'#6f6cc8', go:() => onGen('video','') },
    { t:'Чат с AI', s:'Идеи, тексты, помощь', ic:'chat', bg:'#e4eef4', c:'#5b8fb0', go:() => onStartChat('Привет!') },
    { t:'Шаблоны', s:'Каталог образов', ic:'sparkle', bg:'#fbeede', c:'#c98a4e', go:() => onTemplate(null) },
    { t:'История', s:'Ваши результаты', ic:'clock', bg:'#eef0e8', c:'#7f8d73', go:() => onHistory && onHistory() },
  ];
  var favSet = new Set(favTplKeys);
  const toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  const popular = DESK_TPL.slice(0, 5);

  return <div className="dk-page dk-templates-page">
    <div className="dk-home-top">
    <div className="dk-hero" data-onb="desk-home-hero">
      <h1 className="dk-hero-h">Чем займёмся <span className="dk-grad">сегодня?</span></h1>
      <p className="dk-hero-sub">Опишите идею — Hubicx превратит её в фото, видео или текст.</p>

      <div className="dk-modes">
        {[['photo','Фото','image'],['video','Видео','video'],['chat','Чат','chat']].map(function(m) {
          return <button key={m[0]} className={'dk-mode' + (hmode === m[0] ? ' on' : '')} onClick={() => { setHmode(m[0]); setModelCode(null); setQualityValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiAspectLabel(null); }}>
            <Ic n={m[2]} s={17}/> {m[1]}
          </button>;
        })}
      </div>

      <div className="dk-askbar" data-onb="desk-create">
        <input placeholder={hmode === 'chat' ? 'Спросите что-нибудь…' : 'Например: портрет в неоновом ночном городе, дождь, отражения, киберпанк…'}
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}/>
        {hmode !== 'chat' && <>
          <div className="dk-ask-pill-wrap">
            <button key={'home-model-' + (modelCode || curCode || 'init') + '-' + modelLabel} className={'dk-ask-pill' + (open === 'model' ? ' on' : '')}
              onClick={() => setOpen(open === 'model' ? null : 'model')}>
              <Ic n="sparkle" s={14}/> {modelLabel} <Ic n="chev" s={13}/>
            </button>
            {open === 'model' && <div className="dk-ask-menu">
              {filtered.length === 0
                ? <div className="dk-ask-opt muted">Модели загружаются…</div>
                : filtered.map(function(m) {
                    return <div key={m.code} className={'dk-ask-opt' + (m.code === curCode ? ' on' : '')}
                      onClick={() => { setModelCode(m.code); setQualityValue(null); setUiModelLabel(m.title); setUiQualityLabel(null); setOpen(null); }}>
                      <span>{m.title}</span><span className="dk-ask-opt-p">{m.price_credits} ★</span>
                    </div>;
                  })}
            </div>}
          </div>
          <div className="dk-ask-pill-wrap">
            <button key={'home-aspect-' + aspectId + '-' + aspectLabel} className={'dk-ask-pill' + (open === 'aspect' ? ' on' : '')}
              onClick={() => setOpen(open === 'aspect' ? null : 'aspect')}>
              <Ic n="aspect" s={14}/> {aspectLabel} <Ic n="chev" s={13}/>
            </button>
            {open === 'aspect' && <div className="dk-ask-menu">
              {aspectOpts.map(function(a) {
                return <div key={a.id} className={'dk-ask-opt' + (a.id === aspectId ? ' on' : '')}
                  onClick={() => { setAspectId(a.id); setUiAspectLabel(a.t); setOpen(null); }}>
                  <span>{a.t}</span><span className="dk-ask-opt-p">{a.s}</span>
                </div>;
              })}
            </div>}
          </div>
          {qField && <div className="dk-ask-pill-wrap">
            <button key={'home-quality-' + String(qValue) + '-' + qualityLabel} className={'dk-ask-pill' + (open === 'quality' ? ' on' : '')}
              onClick={() => setOpen(open === 'quality' ? null : 'quality')}>
              <Ic n="sparkle" s={14}/> {qualityLabel} <Ic n="chev" s={13}/>
            </button>
            {open === 'quality' && <div className="dk-ask-menu">
              {qOptions.map(function(o) {
                return <div key={String(o)} className={'dk-ask-opt' + (String(o) === String(qValue) ? ' on' : '')}
                  onClick={() => { setQualityValue(o); setUiQualityLabel(prettyOption(o)); setOpen(null); }}>
                  <span>{prettyOption(o)}</span><span className="dk-ask-opt-p">качество</span>
                </div>;
              })}
            </div>}
          </div>}
          <div className="dk-ask-pill-wrap">
            <button className={'dk-ask-pill' + (open === 'batch' ? ' on' : '')}
              onClick={() => setOpen(open === 'batch' ? null : 'batch')}>
              <Ic n="image" s={14}/> {batchCount} шт <Ic n="chev" s={13}/>
            </button>
            {open === 'batch' && <div className="dk-ask-menu">
              {[1,2,4].map(function(n) {
                return <div key={n} className={'dk-ask-opt' + (n === batchCount ? ' on' : '')}
                  onClick={() => { setBatchCount(n); setOpen(null); }}>
                  <span>{n} генераци{n === 1 ? 'я' : 'и'}</span><span className="dk-ask-opt-p">{onePrice * n} ★</span>
                </div>;
              })}
            </div>}
          </div>
        </>}
        <button className="dk-ask-cta" onClick={submit}><Ic n="sparkle" s={16}/> Создать · {totalPrice} ★</button>
      </div>

      <div className="dk-chips">
        {chips.map(function(c, i) {
          return <div key={i} className="dk-chip" onClick={() => onGen('photo', c)}><Ic n="sparkle" s={13} c="var(--link)"/> {c}</div>;
        })}
      </div>
    </div>

    <div className="dk-acts dk-home-acts" data-onb="desk-actions">
      {acts.map(function(a, i) {
        return <div key={i} className="dk-act" onClick={a.go}>
          <div className="dk-act-ic" style={{ background:a.bg }}><Ic n={a.ic} s={22} c={a.c}/></div>
          <div className="dk-act-t">{a.t}</div>
          <div className="dk-act-s">{a.s}</div>
        </div>;
      })}
    </div>
    </div>

    <div className="dk-sec" data-onb="desk-templates-head">
      <h2>Популярные шаблоны</h2>
      <span className="dk-all" onClick={() => onTemplate(null)}>Все шаблоны</span>
    </div>
    <div className="dk-tpl-grid">
      {popular.map(function(t, i) {
        return <DeskTplCard key={i} t={t} fav={favSet.has(tplKey(t))} onFav={toggleFavTpl} onClick={() => onTemplate(t)}/>;
      })}
    </div>
  </div>;
}

/* ---- template card ---- */
function DeskTplCard({ t, onClick, fav, onFav }) {
  const { Ic, TemplateMedia } = window.MiraCore;
  return <div className="dk-tpl" onClick={onClick}>
    <div className="dk-tpl-img">
      <TemplateMedia t={t} loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }}/>
      <div className="dk-tpl-badge">{t.type === 'video' ? <Ic n="video" s={13} c="#fff"/> : <Ic n="image" s={13} c="#fff"/>}</div>
      <button className={'dk-tpl-fav' + (fav ? ' on' : '')} title={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
        onClick={function(e) { e.stopPropagation(); if (onFav) onFav(t); }}><Ic n="star" s={22} c="currentColor"/></button>
    </div>
    <div className="dk-tpl-lbl">{t.t}</div>
  </div>;
}

/* ---- centered picker modal (model / format) ---- */
function DeskPicker({ title, options, current, onPick, onClose }) {
  const { Ic } = window.MiraCore;
  return <div className="dk-modal-ov" onClick={onClose}>
    <div className="dk-picker" onClick={e => e.stopPropagation()}>
      <div className="dk-picker-top">
        <span>{title}</span>
        <button className="dk-modal-x" onClick={onClose}><Ic n="close" s={18}/></button>
      </div>
      <div className="dk-picker-list">
        {options.map(function(o) {
          return <div key={o.id} className={'dk-picker-opt' + (o.id === current ? ' on' : '')} onClick={() => onPick(o.id)}>
            <div><div className="dk-opt-t">{o.title}</div>{o.sub ? <div className="dk-opt-s">{o.sub}</div> : null}</div>
            {o.id === current && <Ic n="check" s={20} c="var(--ink)"/>}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

function DeskFloatingPicker({ kind, options, current, onPick }) {
  const { Ic } = window.MiraCore;
  return <div className={'dk-floating-menu dk-floating-' + (kind || 'default')}>
    {options.map(function(o) {
      return <div key={o.id} className={'dk-floating-opt' + (String(o.id) === String(current) ? ' on' : '')} onClick={() => onPick(o.id)}>
        <div><div className="dk-opt-t">{o.title}</div>{o.sub ? <div className="dk-opt-s">{o.sub}</div> : null}</div>
        {String(o.id) === String(current) && <Ic n="check" s={18} c="var(--ink)"/>}
      </div>;
    })}
  </div>;
}

/* ============================================================
   Генерация (two-panel: form + canvas)
   ============================================================ */
const DESK_STAGES = [
  { t: 'В очереди',   s: 'Готовим задачу для модели' },
  { t: 'Композиция',  s: 'Раскладываю сцену и формы' },
  { t: 'Детализация', s: 'Прорисовываю детали и фактуру' },
  { t: 'Свет и цвет', s: 'Настраиваю освещение и тон' },
  { t: 'Финал',       s: 'Повышаю чёткость, готовлю результат' },
];

function DeskStageCanvas({ mode, aspectId }) {
  const estMs = mode === 'video' ? 150000 : 30000;
  const [pct, setPct] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(function() {
    var id = setInterval(function() {
      var t = Date.now() - startRef.current;
      var lin = Math.min(1, t / estMs);
      setPct(Math.min(99, Math.round((1 - Math.pow(1 - lin, 1.7)) * 100)));
    }, 200);
    return function() { clearInterval(id); };
  }, []);
  var idx = Math.min(DESK_STAGES.length - 1, Math.floor((pct / 100) * DESK_STAGES.length));
  var eta = Math.max(1, Math.ceil((estMs / 1000) * (1 - pct / 100)));
  var aspectCss = (aspectId || '2:3').replace(':', '/');

  return <div className="dk-stage-wrap">
    <div className="dk-stage" style={{ aspectRatio: aspectCss }}>
      <div className="gen-skel"></div>
      <div className="gen-grain"></div>
    </div>
    <div className="gen-stages">
      {DESK_STAGES.map(function(s, i) {
        return <div key={i} className={'gen-chip' + (i < idx ? ' done' : i === idx ? ' act' : '')}><i/></div>;
      })}
    </div>
    <div className="gen-stagerow">
      <div className="gen-stage-l"><span className="gen-dot"></span><span>{DESK_STAGES[idx].t}</span></div>
      <div className="gen-eta">≈ {eta} сек · {pct}%</div>
    </div>
    <div className="dk-canvas-es" style={{ marginTop:8, textAlign:'center' }}>
      {mode === 'video'
        ? 'Видео генерируется 2–3 минуты — можно продолжать работу, результат появится здесь и в «Истории».'
        : DESK_STAGES[idx].s}
    </div>
  </div>;
}

function DeskGen({ tokens, initMode, initPrompt, initTpl, initModelCode, initAspectId, initQualityField, initQualityValue, initBatchCount, refreshBalance, searchQuery }) {
  const { Ic, Star, ASPECTS } = window.MiraCore;
  const [mode, setMode] = useState(initMode || 'photo');
  const [apiModels, setApiModels] = useState(window.MiraCore.FALLBACK_MODELS || []);
  const [modelsLoaded, setModelsLoaded] = useState(true);
  const [selectedModelCode, setSelectedModelCode] = useState(initModelCode || (initTpl ? templateModelCode(initTpl) : null));
  const [selectedAspect, setSelectedAspect] = useState(
    (initAspectId && ASPECTS.find(function(a) { return a.id === initAspectId; })) || ASPECTS[1]);
  const [selectedQuality, setSelectedQuality] = useState(initQualityValue || null);
  const [selectedDuration, setSelectedDuration] = useState(initTpl ? (templateDurationValue(initTpl) || null) : null);
  const [uiModelLabel, setUiModelLabel] = useState(null);
  const [uiQualityLabel, setUiQualityLabel] = useState(null);
  const [uiDurationLabel, setUiDurationLabel] = useState(null);
  const [uiDurationValue, setUiDurationValue] = useState(initTpl ? (templateDurationValue(initTpl) || null) : null);
  const [uiAspectLabel, setUiAspectLabel] = useState(null);
  const [durationLocked, setDurationLocked] = useState(!!(initTpl && initTpl.durationLocked));
  const [batchCount, setBatchCount] = useState(initBatchCount || 1);
  const [open, setOpen] = useState(null); // 'model' | 'quality' | 'duration' | 'batch' | 'aspect'
  const [tab, setTab] = useState(initTpl ? 'tpl' : (initPrompt ? 'prompt' : 'tpl'));
  const [selTpl, setSelTpl] = useState(initTpl ? initTpl.t : null);
  const [templateLocked, setTemplateLocked] = useState(!!initTpl);
  const [prompt, setPrompt] = useState(initPrompt || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedVideoFile, setUploadedVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  const fileRef = useRef(null);
  const videoFileRef = useRef(null);
  const uploadSlotRef = useRef(null);

  const [canvas, setCanvas] = useState('idle'); // idle | generating | done | error
  const [task, setTask] = useState(null);
  const [sessionItems, setSessionItems] = useState([]);
  const [err, setErr] = useState(null);
  const [errKind, setErrKind] = useState('error');
  const cancelRef = useRef(null);

  useEffect(function() {
    if (!window.HubicxApi) { setApiModels(window.MiraCore.FALLBACK_MODELS); setModelsLoaded(true); return; }
    window.HubicxApi.models().then(function(m) {
      if (Array.isArray(m) && m.length > 0) setApiModels(m);
      else setApiModels(window.MiraCore.FALLBACK_MODELS);
      setModelsLoaded(true);
    }).catch(function() { setApiModels(window.MiraCore.FALLBACK_MODELS); setModelsLoaded(true); });
  }, []);
  const cancelRunning = function() {
    if (!cancelRef.current) return;
    if (Array.isArray(cancelRef.current)) cancelRef.current.forEach(function(fn) { try { if (fn) fn(); } catch(e) {} });
    else { try { cancelRef.current(); } catch(e) {} }
    cancelRef.current = null;
  };
  useEffect(function() { return function() { cancelRunning(); }; }, []);

  const filtered = apiModels.filter(function(m) {
    if (mode === 'video') return m.task_type === 'video' || m.category === 'video';
    return m.task_type === 'image' || (m.category === 'photo' && m.task_type !== 'video');
  });
  var hasSeedance = filtered.some(function(m) { return isSeedanceModelCode(m.code) && String(m.code).indexOf('_fast') === -1; });
  var hasSeedanceFast = filtered.some(function(m) { return isSeedanceModelCode(m.code) && String(m.code).indexOf('_fast') !== -1; });
  const modelOpts = [];
  if (mode === 'video' && hasSeedance) modelOpts.push({ id:'seedance_2_auto', t:'Seedance 2.0', s:'Автовыбор: текст / фото / референсы', price:'от 250 ★' });
  if (mode === 'video' && hasSeedanceFast) modelOpts.push({ id:'seedance_2_fast_auto', t:'Seedance 2.0 Fast', s:'Дешевле и быстрее, автовыбор режима', price:'от 180 ★' });
  filtered.forEach(function(m) {
    if (mode === 'video' && isSeedanceModelCode(m.code)) return;
    modelOpts.push({ id:m.code, t:m.title, s:shortModelDescription(m), price:(m.price_credits || 0) + ' ★' });
  });
  var defaultModelId = (modelOpts[0] && modelOpts[0].id) || (filtered[0] && filtered[0].code) || null;
  var displayModelId = displaySeedanceAutoCode(selectedModelCode || defaultModelId);
  var selectedTpl = DESK_TPL.find(function(t) { return t.t === selTpl; }) || null;
  var referenceSlots = selectedTpl && Array.isArray(selectedTpl.referenceSlots) ? selectedTpl.referenceSlots : null;
  var uploadedRefFiles = referenceSlots ? uploadedFiles.filter(Boolean) : (uploadedFile ? [uploadedFile] : []);
  var currentModelCode = resolveSeedanceAutoCode(displayModelId, uploadedRefFiles);
  var curCode = displayModelId;
  var curModel = filtered.find(function(m) { return m.code === currentModelCode; }) || filtered[0];
  var curOpt = modelOpts.find(function(m) { return m.id === displayModelId; }) || modelOpts.find(function(m) { return m.id === currentModelCode; }) || modelOpts[0];
  var needsVideoFile = !!getModelField(curModel, ['video_url']);
  var aspectOpts = getAspectOptionsForModel(curModel, ASPECTS);
  var selectedAspectSafe = aspectOpts.find(function(a) { return selectedAspect && a.id === selectedAspect.id; }) || aspectOpts[0] || selectedAspect;
  var qField = getQualityField(curModel);
  var durationField = getDurationField(curModel);
  var qOptions = fieldOptions(qField);
  var qValue = qField ? (qOptions.some(function(o) { return String(o) === String(selectedQuality); }) ? selectedQuality : (initQualityField === qField.name && initQualityValue != null ? initQualityValue : fieldDefault(qField))) : null;
  var durationOptions = fieldOptions(durationField);
  var durationValue = durationField ? (durationOptions.some(function(o) { return String(o) === String(uiDurationValue || selectedDuration); }) ? (uiDurationValue || selectedDuration) : ((selectedTpl && templateDurationValue(selectedTpl)) || fieldDefault(durationField))) : null;
  if (selectedTpl && Array.isArray(selectedTpl.durationOptions) && selectedTpl.durationOptions.length && selectedTpl.durationOptions.indexOf(String(durationValue)) === -1) durationValue = String(selectedTpl.durationOptions[0]);
  var displayModelLabel = uiModelLabel || (curOpt ? curOpt.t : null);
  var displayQualityLabel = uiQualityLabel || prettyOption(qValue);
  var displayDurationLabel = uiDurationLabel || (durationValue != null ? String(durationValue) + ' сек' : null);
  var displayAspectLabel = uiAspectLabel || (selectedAspectSafe ? selectedAspectSafe.t + ' · ' + selectedAspectSafe.s : '');
  var priceInputs = {};
  if (qField && qValue != null) priceInputs[qField.name] = qValue;
  if (durationField && durationValue != null) priceInputs[durationField.name] = String(durationValue);
  var onePrice = curModel ? estimateModelPrice(curModel, priceInputs) : (mode === 'video' ? 5 : 2);
  var price = Math.max(1, onePrice * batchCount);

  const handleFile = function(file, target) {
    if (!file || uploading || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    setUploading(true);
    var preview = URL.createObjectURL(file);
    window.HubicxApi.uploadFile(file).then(function(data) {
      var item = { url:data.url, file_id:data.file_id, preview:preview, type:String(file.type || '').indexOf('video/') === 0 ? 'video' : 'image' };
      if (target === 'video') setUploadedVideoFile(item);
      else if (typeof target === 'number') setUploadedFiles(function(prev) { var next = prev.slice(); while (next.length <= target) next.push(null); next[target] = item; return next; });
      else setUploadedFile(item);
      setUploading(false);
    }).catch(function(e) { setUploading(false); if (target === 'video') setUploadedVideoFile(null); else if (typeof target === 'number') setUploadedFiles(function(prev) { var next = prev.slice(); next[target] = null; return next; }); else setUploadedFile(null); alert((e && e.message) || 'Ошибка загрузки'); });
  };

  var favSet = new Set(favTplKeys);
  const toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  var tplList = DESK_TPL.filter(function(t) {
    return (mode === 'video' ? (t.type === 'video' && favSet.has(tplKey(t))) : (t.type === 'photo' && favSet.has(tplKey(t)))) && matchesTplSearch(t, searchQuery);
  });
  var hasText = (tab === 'tpl' && selTpl) || (tab === 'prompt' && prompt.trim().length > 0);
  var needsTplImage = tab === 'tpl' && selectedTpl && selectedTpl.requiresImage;
  var requiredRefCount = referenceSlots ? referenceSlots.length : 0;
  var refsReady = referenceSlots ? uploadedRefFiles.length >= requiredRefCount : !!uploadedFile;
  var hasMainUpload = referenceSlots ? uploadedRefFiles.length > 0 : !!uploadedFile;
  var ready = ((hasText && (!needsTplImage || refsReady)) || (mode === 'video' && hasMainUpload)) && (!needsVideoFile || !!uploadedVideoFile);

  const pickTemplate = function(t) {
    setTab('tpl'); setSelTpl(t.t); setMode(t.type === 'video' ? 'video' : 'photo');
    setUploadedFile(null); setUploadedFiles([]);
    setSelectedModelCode(templateModelCode(t)); setSelectedQuality(templateQualityValue(t) || null); setSelectedDuration(templateDurationValue(t) || null); setUiDurationValue(templateDurationValue(t) || null); setUiModelLabel(null); setUiQualityLabel(templateQualityValue(t) ? prettyOption(templateQualityValue(t)) : null); setUiDurationLabel(templateDurationValue(t) ? String(templateDurationValue(t)) + ' сек' : null); setUiAspectLabel(null); setDurationLocked(!!t.durationLocked); if (t.aspectId) { var a = ASPECTS.find(function(x){ return String(x.id) === String(t.aspectId); }); if (a) { setSelectedAspect(a); setUiAspectLabel(a.t + ' · ' + a.s); } } setTemplateLocked(true); setOpen(null);
  };
  const clearTemplate = function() {
    setSelTpl(null); setTemplateLocked(false); setTab('prompt'); setPrompt(''); setUploadedFiles([]); setSelectedModelCode(null); setSelectedQuality(null); setSelectedDuration(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setDurationLocked(false); setOpen(null);
  };

  const start = function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !curModel) { alert('Модели не загружены'); return; }
    cancelRunning();
    var inputs = {};
    var aspectField = getAspectField(curModel);
    if (selectedAspectSafe) {
      if (aspectField) inputs[aspectField.name] = aspectValueForField(aspectField, selectedAspectSafe.id);
      else inputs.aspect_ratio = selectedAspectSafe.id;
    }
    if (referenceSlots && uploadedRefFiles.length) {
      var refImageField = getModelField(curModel, ['image_urls', 'image_url']);
      var refIds = uploadedRefFiles.map(function(f) { return f && f.file_id; }).filter(Boolean);
      if (refImageField && refImageField.type === 'files' && refIds.length) inputs[refImageField.name] = refIds;
      else if (refImageField && refImageField.type === 'file' && refIds[0]) inputs[refImageField.name] = refIds[0];
    } else if (uploadedFile) {
      var imageField = getModelField(curModel, ['image_urls', 'image_url']);
      if (imageField && imageField.type === 'files' && uploadedFile.file_id) inputs[imageField.name] = [uploadedFile.file_id];
      else if (imageField && imageField.type === 'file' && uploadedFile.file_id) inputs[imageField.name] = uploadedFile.file_id;
    }
    if (uploadedVideoFile) {
      var videoField = getModelField(curModel, ['video_urls', 'video_url']);
      if (videoField && videoField.type === 'files' && uploadedVideoFile.file_id) inputs[videoField.name] = [uploadedVideoFile.file_id];
      else if (videoField && videoField.type === 'file' && uploadedVideoFile.file_id) inputs[videoField.name] = uploadedVideoFile.file_id;
      else if (videoField) inputs[videoField.name] = uploadedVideoFile.url;
    }
    if (qField && qValue != null) inputs[qField.name] = qValue;
    if (durationField && durationValue != null) inputs[durationField.name] = String(durationValue);
    if (selectedTpl && selectedTpl.templatePipeline) inputs.template_pipeline = selectedTpl.templatePipeline;
    var finalPrompt = (tab === 'prompt' ? prompt.trim() : ((selectedTpl && selectedTpl.prompt) || selTpl)) || null;
    var makePayload = function() { return {
      model_code: curModel.code,
      prompt: finalPrompt,
      input_file_url: (referenceSlots && uploadedRefFiles[0]) ? uploadedRefFiles[0].url : (uploadedFile ? uploadedFile.url : null),
      inputs: inputs,
    }; };
    var count = Math.max(1, Math.min(4, Number(batchCount) || 1));
    var ids = Array.from({ length: count }, function(_, i) { return 'local-' + Date.now() + '-' + i; });
    setSessionItems(ids.map(function(id, i) { return { tempId:id, index:i, status:'creating', task:null, error:null, mode:mode, aspectId:selectedAspectSafe && selectedAspectSafe.id }; }));
    setCanvas('generating'); setErr(null); setTask(null);
    cancelRef.current = [];
    function updateItem(tempId, patch) {
      setSessionItems(function(items) {
        var next = items.map(function(it) { return it.tempId === tempId ? Object.assign({}, it, patch) : it; });
        if (next.length && next.every(function(it) { return ['done','error','timeout','refunded'].indexOf(it.status) !== -1; })) {
          setTimeout(function() { setCanvas('done'); if (refreshBalance) refreshBalance(); }, 0);
        }
        return next;
      });
    }
    function createOne(tempId, delayMs) {
      setTimeout(function() {
        window.HubicxApi.createGeneration(makePayload()).then(function(data) {
        updateItem(tempId, { status:'queued', task_id:data.task_id });
        var stop = dPollTask(data.task_id,
          function(t) { updateItem(tempId, { status:t.status || 'processing', task:t }); },
          function(t) { setTask(t); updateItem(tempId, { status:'done', task:t }); },
          function(m, k) { updateItem(tempId, { status:k || 'error', error:m }); });
        if (Array.isArray(cancelRef.current)) cancelRef.current.push(stop);
        }).catch(function(e) { updateItem(tempId, { status:'error', error:(e && e.message) || 'Ошибка создания задачи' }); });
      }, delayMs || 0);
    }
    ids.forEach(function(tempId, i) { createOne(tempId, i * 350); });
  };
  const reset = function() {
    cancelRunning();
    setCanvas('idle'); setTask(null); setErr(null); setSessionItems([]);
  };

  return <div className="dk-gen">
    {/* ── left form ── */}
    <div className="dk-gen-form">
      <div className="dk-seg">
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setUploadedFiles([]); setSelectedModelCode(null); setSelectedQuality(null); setSelectedDuration(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setSelTpl(null); setTemplateLocked(false); setDurationLocked(false); }}><Ic n="image" s={17}/> Фото</button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setUploadedFiles([]); setSelectedModelCode(null); setSelectedQuality(null); setSelectedDuration(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setSelTpl(null); setTemplateLocked(false); setDurationLocked(false); }}><Ic n="video" s={17}/> Видео</button>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:'none' }}
        onChange={e => { var slot = uploadSlotRef.current; uploadSlotRef.current = null; handleFile(e.target.files && e.target.files[0], typeof slot === 'number' ? slot : undefined); e.target.value = ''; }}/>
      <input ref={videoFileRef} type="file" accept="video/*" style={{ display:'none' }}
        onChange={e => { handleFile(e.target.files && e.target.files[0], 'video'); e.target.value = ''; }}/>

      {referenceSlots
        ? <div className="dk-ref-slots">
            {referenceSlots.map(function(slot, i) {
              var f = uploadedFiles[i];
              return f
                ? <div className="dk-drop has" key={i} onClick={() => { uploadSlotRef.current = i; fileRef.current && fileRef.current.click(); }}>
                    <img src={f.preview} alt="" className="dk-drop-bg"/>
                    <div className="dk-drop-in"><div className="dk-drop-ic"><Ic n="check" s={22} c="#5f9184"/></div>
                      <div className="dk-drop-t">{slot.label || 'Фото загружено'}</div><div className="dk-drop-s">Нажмите, чтобы заменить</div></div>
                    <button className="dk-drop-x" onClick={e => { e.stopPropagation(); setUploadedFiles(function(prev) { var next = prev.slice(); next[i] = null; return next; }); }}>✕</button>
                  </div>
                : <div className="dk-drop" key={i} onClick={() => { if (!uploading) { uploadSlotRef.current = i; fileRef.current && fileRef.current.click(); } }}>
                    {uploading
                      ? <><div className="dk-drop-ic"><div className="gen-spinner" style={{ width:26, height:26 }}></div></div><div className="dk-drop-t">Загружаю…</div></>
                      : <><div className="dk-drop-ic"><Ic n="addimg" s={22} c="var(--ink)"/></div>
                          <div className="dk-drop-t">{slot.label || 'Загрузите фото'}</div>
                          <div className="dk-drop-s">{slot.hint || 'Перетащите или выберите файл'}</div></>}
                  </div>;
            })}
          </div>
        : uploadedFile
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
                  <div className="dk-drop-t">{needsTplImage && selectedTpl ? selectedTpl.inputLabel : (mode === 'photo' ? 'Загрузите фото' : 'Загрузите фото для видео')}</div>
                  <div className="dk-drop-s">Перетащите или выберите файл</div></>}
          </div>}

      {needsVideoFile && (uploadedVideoFile
        ? <div className="dk-drop has" style={{ marginTop:10 }} onClick={() => videoFileRef.current && videoFileRef.current.click()}>
            <video src={uploadedVideoFile.preview} muted playsInline className="dk-drop-bg"/>
            <div className="dk-drop-in"><div className="dk-drop-ic"><Ic n="check" s={22} c="#5f9184"/></div>
              <div className="dk-drop-t">Видео движения загружено</div><div className="dk-drop-s">Нажмите, чтобы заменить</div></div>
            <button className="dk-drop-x" onClick={e => { e.stopPropagation(); setUploadedVideoFile(null); }}>✕</button>
          </div>
        : <div className="dk-drop" style={{ marginTop:10 }} onClick={() => !uploading && videoFileRef.current && videoFileRef.current.click()}>
            {uploading
              ? <><div className="dk-drop-ic"><div className="gen-spinner" style={{ width:26, height:26 }}></div></div><div className="dk-drop-t">Загружаю…</div></>
              : <><div className="dk-drop-ic"><Ic n="video" s={22} c="var(--ink)"/></div>
                  <div className="dk-drop-t">Загрузите видео движения</div>
                  <div className="dk-drop-s">Нужно для Motion Control</div></>}
          </div>)}

      <div className="dk-seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={() => { setTab('prompt'); setSelTpl(null); setUploadedFiles([]); setTemplateLocked(false); setDurationLocked(false); }}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <React.Fragment>
          {selectedTpl && <div className="dk-template-selected">
            {selectedTpl.coverVideo
              ? <video src={selectedTpl.coverVideo} muted autoPlay playsInline loop preload="metadata" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>
              : <img src={selectedTpl.img} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>}
            <div className="dk-template-selected-tx">
              <div className="dk-template-selected-k">Выбран шаблон</div>
              <div className="dk-template-selected-v">{selectedTpl.t}</div>
              <div className="dk-template-selected-s">Модель закреплена за шаблоном. Нажмите замок, чтобы сменить.</div>
            </div>
            <button className="dk-template-clear" title="Убрать шаблон" onClick={clearTemplate}><Ic n="close" s={18}/></button>
          </div>}
          <div className="dk-gen-tpls">
            {tplList.map(function(t, i) {
              return <div key={i} className={'dk-gen-tpl' + (selTpl === t.t ? ' on' : '')} onClick={() => pickTemplate(t)}>
                {t.coverVideo
                  ? <video src={t.coverVideo} muted autoPlay playsInline loop preload="metadata" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>
                  : <img src={t.img} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>}
                <button className="dk-gen-tpl-fav on" title="Убрать из избранного" onClick={function(e) { e.stopPropagation(); toggleFavTpl(t); if (selTpl === t.t) setSelTpl(null); }}><Ic n="star" s={18} c="currentColor"/></button>
                <div className="dk-gen-tpl-l">{t.t}</div>
              </div>;
            })}
            {tplList.length === 0 && <div className="dk-gen-tpl-empty">Избранных шаблонов не найдено. Добавьте их сердечком в разделе «Шаблоны».</div>}
          </div>
        </React.Fragment>
        : <textarea className="dk-ta" value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Опишите, что хотите сгенерировать…"/>}

      <div className="dk-lbl">Детали</div>
      <div className="dk-card">
        <div className={'dk-row' + (templateLocked ? ' locked' : '')} onClick={() => !templateLocked && modelOpts.length > 0 && setOpen(open === 'model' ? null : 'model')}>
          <div className="dk-row-ic"><Ic n="model" s={20} c="var(--ink)"/></div>
          <div className="dk-row-tx"><div className="dk-row-k">Модель</div>
            <div className="dk-row-v" key={'gen-model-label-' + (selectedModelCode || curCode || 'init') + '-' + (displayModelLabel || '') + '-' + price}>{!modelsLoaded ? 'Загрузка…' : displayModelLabel ? displayModelLabel + ' · ' + price + ' ★' : 'Нет моделей'}</div></div>
          {selectedTpl && <button className={'dk-lock-btn' + (!templateLocked ? ' off' : '')} title={templateLocked ? 'Модель закреплена. Нажмите, чтобы разблокировать' : 'Модель разблокирована'} onClick={function(e){ e.stopPropagation(); setTemplateLocked(!templateLocked); if (templateLocked) setOpen('model'); }}>
            <Ic n={templateLocked ? 'lock' : 'unlock'} s={18}/>
          </button>}
          {!templateLocked && modelOpts.length > 0 && <span className="chev"><Ic n="chev" s={19}/></span>}
        </div>
        <div className="dk-row-div"></div>
        {qField && <React.Fragment>
          <div className="dk-row" onClick={() => setOpen(open === 'quality' ? null : 'quality')}>
            <div className="dk-row-ic"><Ic n="sparkle" s={20} c="var(--ink)"/></div>
            <div className="dk-row-tx"><div className="dk-row-k">Качество</div>
              <div className="dk-row-v" key={'gen-quality-label-' + String(qValue) + '-' + displayQualityLabel}>{displayQualityLabel}</div></div>
            <span className="chev"><Ic n="chev" s={19}/></span>
          </div>
          <div className="dk-row-div"></div>
        </React.Fragment>}
        {durationField && <React.Fragment>
          <div className={'dk-row' + (durationLocked ? ' locked' : '')} onClick={() => !durationLocked && setOpen(open === 'duration' ? null : 'duration')}>
            <div className="dk-row-ic"><Ic n="clock" s={20} c="var(--ink)"/></div>
            <div className="dk-row-tx"><div className="dk-row-k">Длительность</div>
              <div className="dk-row-v" key={'gen-duration-label-' + String(durationValue) + '-' + displayDurationLabel + '-' + (durationLocked ? 'locked' : 'open')}>{displayDurationLabel}</div>
              {selectedTpl && durationLocked && <div className="dk-row-s">Длительность закреплена за шаблоном</div>}
            </div>
            {selectedTpl && durationLocked && <button className={'dk-lock-btn' + (!durationLocked ? ' off' : '')}
              title={selectedTpl.durationUnlockable === false ? 'Длительность закреплена за шаблоном' : 'Длительность закреплена. Нажмите, чтобы разблокировать'}
              onClick={function(e){ e.stopPropagation(); if (selectedTpl.durationUnlockable === false) return; setDurationLocked(false); setOpen('duration'); }}>
              <Ic n="lock" s={18}/>
            </button>}
            {selectedTpl && !durationLocked && selectedTpl.durationLocked && <button className="dk-lock-btn off" title="Длительность разблокирована" onClick={function(e){ e.stopPropagation(); setDurationLocked(true); setOpen(null); }}><Ic n="unlock" s={18}/></button>}
            {!durationLocked && <span className="chev"><Ic n="chev" s={19}/></span>}
          </div>
          <div className="dk-row-div"></div>
        </React.Fragment>}
        <div className="dk-row" onClick={() => setOpen(open === 'batch' ? null : 'batch')}>
          <div className="dk-row-ic"><Ic n="image" s={20} c="var(--ink)"/></div>
          <div className="dk-row-tx"><div className="dk-row-k">Количество</div>
            <div className="dk-row-v">{batchCount} генераци{batchCount === 1 ? 'я' : 'и'} · {price} ★</div></div>
          <span className="chev"><Ic n="chev" s={19}/></span>
        </div>
        <div className="dk-row-div"></div>
        <div className="dk-row" onClick={() => setOpen(open === 'aspect' ? null : 'aspect')}>
          <div className="dk-row-ic"><Ic n="aspect" s={20} c="var(--ink)"/></div>
          <div className="dk-row-tx"><div className="dk-row-k">Формат</div>
            <div className="dk-row-v" key={'gen-aspect-label-' + (selectedAspectSafe && selectedAspectSafe.id) + '-' + displayAspectLabel}>{displayAspectLabel}</div></div>
          <span className="chev"><Ic n="chev" s={19}/></span>
        </div>
        {open === 'model' && !templateLocked && <DeskFloatingPicker kind="model"
          options={modelOpts.map(function(o){ return { id:o.id, title:o.t, sub:(o.s ? o.s + ' · ' : '') + (o.price || '') }; })} current={curCode}
          onPick={function(id){ var opt = modelOpts.find(function(o){ return o.id === id; }); setSelectedModelCode(id); setSelectedQuality(null); setSelectedDuration(null); setUiDurationValue(null); setUiModelLabel(opt ? opt.t : null); setUiQualityLabel(null); setUiDurationLabel(null); setOpen(null); }}/>} 
        {open === 'quality' && qField && <DeskFloatingPicker kind="quality"
          options={qOptions.map(function(o){ return { id:String(o), title:prettyOption(o), sub:qField.label || 'Качество' }; })} current={String(qValue)}
          onPick={function(id){ var opt = qOptions.find(function(o){ return String(o) === String(id); }); var val = opt != null ? opt : id; setSelectedQuality(val); setUiQualityLabel(prettyOption(val)); setOpen(null); }}/>} 
        {open === 'duration' && !durationLocked && durationField && <DeskFloatingPicker kind="duration"
          options={(selectedTpl && Array.isArray(selectedTpl.durationOptions) && selectedTpl.durationOptions.length ? selectedTpl.durationOptions : durationOptions).map(function(o){ return { id:String(o), title:String(o) + ' сек', sub:'Длительность видео' }; })} current={String(durationValue)}
          onPick={function(id){ setSelectedDuration(id); setUiDurationValue(id); setUiDurationLabel(String(id) + ' сек'); setOpen(null); }}/>} 
        {open === 'batch' && <DeskFloatingPicker kind="batch"
          options={[1,2,4].map(function(n){ return { id:String(n), title:String(n) + (n === 1 ? ' генерация' : ' генерации'), sub:(onePrice * n) + ' ★' }; })} current={String(batchCount)}
          onPick={function(id){ setBatchCount(Number(id) || 1); setOpen(null); }}/>} 
        {open === 'aspect' && <DeskFloatingPicker kind="aspect"
          options={aspectOpts.map(function(a){ return { id:a.id, title:a.t, sub:a.s }; })} current={selectedAspectSafe.id}
          onPick={function(id){ var a = aspectOpts.find(function(x){return x.id===id;}); if (a) { setSelectedAspect(a); setUiAspectLabel(a.t + ' · ' + a.s); } setOpen(null); }}/>} 
      </div>

      <button className="dk-cta" disabled={!ready || uploading || !modelsLoaded || !curModel || canvas === 'generating'} onClick={start}>
        <Ic n="sparkle" s={17}/> {canvas === 'generating' ? 'Генерация…' : 'Сгенерировать · ' + price + ' ★'}
      </button>
    </div>

    {/* ── right session collection ── */}
    <div className="dk-canvas dk-session-panel">
      <div className="dk-canvas-h">Текущая сессия</div>
      <div className="dk-canvas-body">
        {canvas === 'idle' && <div className="dk-canvas-empty">
          <div className="dk-canvas-ph"><Ic n="image" s={40} c="var(--faint)"/></div>
          <div className="dk-canvas-et">Здесь появится результат</div>
          <div className="dk-canvas-es">Выберите шаблон или опишите идею — результаты появятся коллекцией в этой сессии</div>
        </div>}
        {(canvas === 'generating' || canvas === 'done') && sessionItems.length > 0 && <DeskSessionGrid items={sessionItems} onAgain={reset}/>} 
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

function DeskSessionGrid({ items, onAgain }) {
  const { Ic } = window.MiraCore;
  return <div className="dk-session">
    <div className="dk-session-grid">
      {items.map(function(item) { return <DeskSessionCard key={item.tempId} item={item}/>; })}
    </div>
    <div className="dk-session-actions">
      <button className="dk-cta dk-cta-sm" onClick={onAgain}>Новая генерация</button>
    </div>
  </div>;
}

function DeskSessionCard({ item }) {
  const { Ic } = window.MiraCore;
  var task = item.task || {};
  var url = task.output_file_url;
  var isVideo = task.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(url || '');
  var done = item.status === 'done' && url;
  var failed = ['error','timeout','refunded'].indexOf(item.status) !== -1;
  return <div className={'dk-session-card' + (done ? ' done' : failed ? ' failed' : ' loading')}>
    {done ? <React.Fragment>
      {isVideo ? <video src={url} controls playsInline className="dk-session-media"/> : <img src={url} alt="Результат" className="dk-session-media"/>}
      <a className="dk-session-download" href={url} download target="_blank" rel="noreferrer"><Ic n="download" s={15}/></a>
    </React.Fragment> : failed ? <div className="dk-session-failed">
      <div>⚠️</div><b>{item.status === 'timeout' ? 'Почти готово' : 'Ошибка'}</b><span>{item.error || 'Не удалось сгенерировать'}</span>
    </div> : <div className="dk-session-loading">
      <div className="gen-skel"></div><div className="gen-grain"></div><span>{item.status === 'creating' ? 'Создаю задачу…' : 'Генерирую…'}</span>
    </div>}
  </div>;
}

function DeskResult({ task, onAgain, aspectId }) {
  const { Ic } = window.MiraCore;
  const isVideo = task.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(task.output_file_url || '');
  const [sent, setSent] = useState('idle');
  const send = function() {
    if (sent !== 'idle' || !window.HubicxApi) return;
    setSent('sending');
    window.HubicxApi.sendToChat(task.id).then(function() { setSent('done'); }).catch(function() { setSent('error'); });
  };
  var aspectCss = (aspectId || '1:1').replace(':', '/');
  return <div className="dk-result">
    <div className="dk-stage dk-result-stage" style={{ aspectRatio: aspectCss }}>
      {isVideo
        ? <video src={task.output_file_url} controls autoPlay playsInline className="dk-result-media gen-media in"/>
        : <img src={task.output_file_url} alt="Результат" className="dk-result-media gen-media in"/>}
      <div className="gen-grain"></div>
    </div>
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
   Чат (list + conversation + agent catalog)
   ============================================================ */
const DESK_AGENTS = [
  { code:'copywriter', name:'Копирайтер', desc:'Тексты, офферы, лендинги', icon:'✍️', color:'#ffefe5' },
  { code:'smm_assistant', name:'СММщик', desc:'Посты, сторис, контент-план', icon:'📱', color:'#eaf3ff' },
  { code:'marketer', name:'Маркетолог', desc:'Упаковка, воронки, гипотезы', icon:'📈', color:'#eef8e8' },
  { code:'designer', name:'Дизайнер', desc:'Визуал, брифы, арт-дирекшн', icon:'🎨', color:'#f3edff' },
  { code:'scenarist', name:'Сценарист', desc:'Reels, Shorts, AI-видео', icon:'🎬', color:'#fff4dc' },
  { code:'davinci', name:'Давинчи', desc:'Креативные идеи и концепты', icon:'🧠', color:'#eaf7f2' },
  { code:'thinker', name:'Мыслитель', desc:'Решения, стратегия, анализ', icon:'💡', color:'#eef0ff' },
  { code:'editor', name:'Редактор', desc:'Улучшить текст и стиль', icon:'📝', color:'#f7eee8' },
  { code:'prompt_master', name:'Промпт-мастер', desc:'Промпты для фото и видео', icon:'✨', color:'#fff9d9' },
];
function deskAgentByCode(code) {
  return DESK_AGENTS.find(function(a) { return a.code === code; }) || null;
}

function DeskChat({ chats, activeChat, onOpenChat, onStartChat, onSend, onDeleteChat, onSetAgent }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bodyRef = useRef(null);
  const cur = chats.find(function(c) { return c.id === activeChat; });
  const msgs = (cur && cur.msgs) || [];
  const last = msgs[msgs.length - 1];
  const streaming = last && last.streaming;
  const curAgent = deskAgentByCode(cur && cur.agent_mode);

  useEffect(function() { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; },
    [msgs.length, last && last.text]);

  const send = function() {
    const t = val.trim(); if (!t) return;
    if (streaming) return;
    setVal('');
    if (cur) onSend(t); else onStartChat(t);
  };

  const starters = ['Идея для поста про осень','Какой сегодня день?','Помоги с текстом','Сценарий для рилса'];
  const chooseAgent = function(agent) {
    if (cur) {
      if (onSetAgent) onSetAgent(cur.id, agent.code);
    } else {
      onStartChat('Привет! Помоги мне как ' + agent.name.toLowerCase() + '.', agent.code);
    }
  };
  const clearAgent = function() {
    if (cur && onSetAgent) onSetAgent(cur.id, 'general');
  };

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
        var ag = deskAgentByCode(c.agent_mode);
        return <div key={c.id} className={'dk-chat-item' + (c.id === activeChat ? ' on' : '')} onClick={() => onOpenChat(c.id)}>
          <div className="dk-chat-av"><img src="assets/logo.jpg" alt=""/></div>
          <div className="dk-chat-meta"><div className="dk-chat-title">{c.title}</div><div className="dk-chat-prev">{ag ? ag.name + ' · ' : ''}{lm}</div></div>
          <span className="dk-chat-x" onClick={e => { e.stopPropagation(); onDeleteChat(c.id); }}><Ic n="close" s={15}/></span>
        </div>;
      })}
    </div>

    <div className="dk-conv">
      {cur ? <>
        <div className="dk-conv-h">
          <div className="dk-conv-av"><img src="assets/logo.jpg" alt=""/></div>
          <div className="dk-conv-headtext"><div className="dk-conv-name">{curAgent ? curAgent.name : 'Агент Hubicx'}</div>
            <div className="dk-conv-status" style={{ color: streaming ? '#c98a4e' : '#7a9c92' }}>{streaming ? 'печатает…' : (curAgent ? curAgent.desc : 'онлайн')}</div></div>
          {curAgent && <button className="dk-agent-pill" onClick={clearAgent} title="Вернуть обычный чат">
            <span>{curAgent.icon}</span> Активен агент <Ic n="close" s={14}/>
          </button>}
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
      </> : <div className="dk-conv-nochat">
        <div className="dk-conv-empty" style={{ flex:1 }}>
          <div className="dk-conv-empty-ic"><Ic n="chat" s={40} c="var(--faint)"/></div>
          <div className="dk-canvas-et">Выберите чат или начните новый</div>
          <div className="dk-canvas-es">AI-помощник ответит на вопросы, поможет с текстами и идеями</div>
        </div>
        <div className="dk-conv-input">
          <div className="dk-conv-ask">
            <input placeholder="Напишите что-нибудь, чтобы начать чат…" value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { var t = val.trim(); if (t) { setVal(''); onStartChat(t); } } }}/>
            <button className={'dk-conv-send' + (val.trim() ? ' on' : '')}
              onClick={() => { var t = val.trim(); if (t) { setVal(''); onStartChat(t); } }}>
              <Ic n="arrowUp" s={19}/>
            </button>
          </div>
        </div>
      </div>}
    </div>
    <div className="dk-agents-panel">
      <div className="dk-agents-head">
        <div>
          <div className="dk-agents-title">AI-агенты</div>
          <div className="dk-agents-sub">Выберите роль для текущего чата</div>
        </div>
        <button className="dk-chat-settings-btn" onClick={() => setSettingsOpen(true)} title="Настройки общения">
          <Ic n="sliders" s={17}/>
        </button>
      </div>
      <div className="dk-agents-grid">
        {DESK_AGENTS.map(function(a) {
          var on = curAgent && curAgent.code === a.code;
          return <button key={a.code} className={'dk-agent-card' + (on ? ' on' : '')} onClick={() => chooseAgent(a)}>
            <span className="dk-agent-emoji" style={{ background:a.color }}>{a.icon}</span>
            <span className="dk-agent-name">{a.name}</span>
            <span className="dk-agent-desc">{a.desc}</span>
          </button>;
        })}
      </div>
      <div className="dk-agents-hint">Агент меняет стиль и системный промпт следующих сообщений в чате.</div>
    </div>
    {settingsOpen && window.ChatSettingsSheet && <window.ChatSettingsSheet onClose={() => setSettingsOpen(false)}/>}
  </div>;
}

/* ============================================================
   Шаблоны (catalog: Все / Фото / Видео)
   ============================================================ */
function DeskTemplates({ onTemplate, searchQuery }) {
  const [filter, setFilter] = useState('all');
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  var favSet = new Set(favTplKeys);
  const toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  const list = DESK_TPL.filter(function(t) {
    var typeOk = filter === 'all' || t.type === filter || (filter === 'fav' && favSet.has(tplKey(t)));
    return typeOk && matchesTplSearch(t, searchQuery);
  });
  return <div className="dk-page dk-templates-page">
    <div className="dk-tpl-tabs">
      {[['all','Все'],['photo','Фото'],['video','Видео'],['fav','Избранное']].map(function(f) {
        return <button key={f[0]} className={'dk-tpl-tab' + (filter === f[0] ? ' on' : '')} onClick={() => setFilter(f[0])}>{f[1]}</button>;
      })}
    </div>
    <div className="dk-tpl-grid wide">
      {list.map(function(t, i) { return <DeskTplCard key={i} t={t} fav={favSet.has(tplKey(t))} onFav={toggleFavTpl} onClick={() => onTemplate(t)}/>; })}
      {list.length === 0 && <div className="dk-gen-tpl-empty">{filter === 'fav' ? 'В избранном пока нет шаблонов. Нажмите ★ на карточке шаблона.' : 'Ничего не найдено'}</div>}
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
    return <div className="dk-page dk-history-page">
      <div className="dk-back" onClick={() => setView(null)}><Ic n="back" s={20}/> Назад к истории</div>
      <div className="dk-view">
        {isVideo ? <video src={view.output_file_url} controls className="dk-view-media"/> : <img src={view.output_file_url} alt="" className="dk-view-media"/>}
      </div>
    </div>;
  }

  return <div className="dk-page dk-history-page">
    {loaded && history.length === 0 && <div className="dk-empty-card dk-empty-fill dk-history-empty">
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

/* ---- account linking modal (Telegram ↔ desktop account) ---- */
function DeskLinkEmail({ onClose, onLinked }) {
  const { Ic } = window.MiraCore;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = function() {
    var em = email.trim();
    if (!em || password.length < 6) { setErr('Email и пароль (от 6 символов)'); return; }
    setBusy(true); setErr('');
    function finish(u) {
      setBusy(false); setDone(true);
      if (onLinked) onLinked(u && u.user ? u.user : u);
    }
    function fail(e, fallback) {
      setBusy(false);
      setErr((e && e.message) || fallback || 'Не удалось связать аккаунты');
    }
    window.HubicxApi.linkTelegram(em, password).then(finish).catch(function(firstErr) {
      window.HubicxApi.linkEmail(em, password).then(finish).catch(function(secondErr) {
        var msg = String((secondErr && secondErr.message) || '').toLowerCase();
        if (msg.indexOf('существ') >= 0 || msg.indexOf('занят') >= 0 || msg.indexOf('already') >= 0) {
          fail(firstErr, 'Email уже зарегистрирован. Проверьте пароль от аккаунта сайта.');
        } else {
          fail(secondErr || firstErr, 'Не удалось связать аккаунты');
        }
      });
    });
  };

  return <div className="dk-modal-ov" onClick={onClose}>
    <div className="dk-modal dk-link-modal" onClick={e => e.stopPropagation()}>
      <button className="dk-modal-x" onClick={onClose}><Ic n="close" s={18}/></button>
      <div className="dk-link-hero">
        <span><Ic n="user" s={24} c="#5f9184"/></span>
        <div>
          <div className="dk-modal-title">Связать аккаунты</div>
          <div className="dk-modal-sub">Введите email и пароль. Если аккаунт сайта уже есть, мы объединим его с Telegram. Если нет — создадим вход на сайт с этим же балансом.</div>
        </div>
      </div>
      {done
        ? <div className="dk-link-done"><Ic n="check" s={22} c="#5f9184"/> Готово. Аккаунты связаны.</div>
        : <>
          <div className="dk-auth-fields dk-link-fields">
            <input className="dk-auth-in" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
            <input className="dk-auth-in" type="password" placeholder="Пароль (от 6 символов)" value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          {err && <div className="dk-pay-err" style={{ textAlign:'left', marginTop:12 }}>{err}</div>}
          <button className="dk-cta" style={{ marginTop:16 }} disabled={busy} onClick={submit}>{busy ? 'Связываем...' : 'Связать аккаунты'}</button>
        </>}
    </div>
  </div>;
}

function DeskTelegramLinkModal({ onClose }) {
  const { Ic } = window.MiraCore;
  const openBot = function() { window.open('https://t.me/hubicx_bot', '_blank', 'noopener,noreferrer'); };
  return <div className="dk-modal-ov" onClick={onClose}>
    <div className="dk-modal dk-link-modal" onClick={e => e.stopPropagation()}>
      <button className="dk-modal-x" onClick={onClose}><Ic n="close" s={18}/></button>
      <div className="dk-link-hero">
        <span><Ic n="chat" s={24} c="#5f9184"/></span>
        <div>
          <div className="dk-modal-title">Привязать Telegram</div>
          <div className="dk-modal-sub">Откройте Hubicx в Telegram и в профиле нажмите «Связать аккаунты». Введите email и пароль от сайта — баланс, история и подписка станут общими.</div>
        </div>
      </div>
      <div className="dk-link-steps">
        <div><b>1</b><span>Откройте бота Hubicx</span></div>
        <div><b>2</b><span>Запустите Mini App и откройте профиль</span></div>
        <div><b>3</b><span>Нажмите «Связать аккаунты»</span></div>
      </div>
      <button className="dk-cta" onClick={openBot}>Открыть Telegram</button>
    </div>
  </div>;
}

/* ============================================================
   Профиль (dashboard)
   ============================================================ */
function DeskProfile({ tokens, user, onTopup, onUserUpdate }) {
  const { Ic, Star } = window.MiraCore;
  const [linkMode, setLinkMode] = useState(null);
  const [telegramHelp, setTelegramHelp] = useState(false);
  const [bonus, setBonus] = useState(null);
  const [bonusState, setBonusState] = useState('');
  const [bonusToast, setBonusToast] = useState(false);
  const bonusRef = useRef(null);
  const isTelegram = window.HubicxApi && window.HubicxApi.isTelegram();
  const hasPassword = user && user.has_password;
  const hasTelegram = user && Number(user.telegram_id || 0) > 0;
  const logout = function() { if (window.HubicxApi) window.HubicxApi.logout(); window.location.reload(); };
  const [history, setHistory] = useState([]);
  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    window.HubicxApi.history().then(function(items) { if (Array.isArray(items)) setHistory(items); }).catch(function() {});
  }, []);

  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth() || !window.HubicxApi.bonuses) return;
    var alive = true;
    window.HubicxApi.bonuses().then(function(data) {
      if (!alive) return;
      setBonus(data && data.bonus_program ? data.bonus_program : data);
    }).catch(function() {});
    return function() { alive = false; };
  }, []);

  const done = history.filter(function(i) { return i.status === 'completed'; });
  const photos = done.filter(function(i) { return i.task_type !== 'video'; }).length;
  const videos = done.filter(function(i) { return i.task_type === 'video'; }).length;
  const name = (user && (user.first_name || user.username)) || 'Пользователь';
  const uname = (user && user.username) ? '@' + user.username : (user && user.email ? user.email : '@hubicx');
  const initial = (name || 'H').trim().charAt(0).toUpperCase();
  const recent = done.slice(0, 4);
  const activeSub = user && user.subscription && user.subscription.is_active;
  const subTitle = activeSub ? user.subscription.title : 'Без подписки';
  const bonusTasks = (bonus && Array.isArray(bonus.tasks)) ? bonus.tasks : [];
  const bonusBalance = bonus ? (typeof bonus.bonus_credits === 'number' ? bonus.bonus_credits : (typeof bonus.total_tokens === 'number' ? bonus.total_tokens : null)) : null;
  const hasManualBonus = bonusTasks.some(function(t) { return t && !t.claimed && (t.claimable !== false || t.action_url); });

  useEffect(function() {
    if (!hasManualBonus) return;
    var now = Date.now();
    var last = 0;
    try { last = parseInt(localStorage.getItem('hbx_bonus_toast_seen_v1') || '0', 10) || 0; } catch(e) {}
    if (now - last < 24 * 60 * 60 * 1000) return;
    setBonusToast(true);
    try { localStorage.setItem('hbx_bonus_toast_seen_v1', String(now)); } catch(e) {}
  }, [hasManualBonus]);

  const claimProfileBonus = function(code) {
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

  const stats = [
    { ic:'sparkle', c:'#7a9c92', n:done.length, l:'генераций' },
    { ic:'image',   c:'#5f9184', n:photos,      l:'фото' },
    { ic:'video',   c:'#6f6cc8', n:videos,      l:'видео' },
  ];

  return <div className="dk-prof">
    <div className="dk-prof-main">
      <div className="dk-prof-card">
        <div className="dk-prof-top">
          <div className="dk-prof-ava">{initial}</div>
          <div className="dk-prof-id">
            <div className="dk-prof-name">{name}</div>
            <div className="dk-prof-handle">{uname}</div>
          </div>
          <span className={'dk-prof-plan' + (activeSub ? ' on' : '')}>{subTitle}</span>
        </div>
        <div className="dk-prof-summary">
          <div><span>Баланс</span><b><Star s={15} c="#c9c7f4"/> {tokens}</b></div>
          <div><span>История</span><b>{done.length} генераций</b></div>
          <div><span>Telegram</span><b style={{ color: hasTelegram || isTelegram ? '#5f9184' : 'var(--muted)' }}>{hasTelegram || isTelegram ? 'привязан' : 'не привязан'}</b></div>
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
        : <div className="dk-empty-card dk-empty-fill dk-profile-empty"><div style={{ fontSize:34 }}>✨</div><div className="dk-canvas-es">Ваши работы появятся здесь</div></div>}
    </div>

    <div className="dk-prof-side">
      <div className="dk-card dk-pad">
        <div className="dk-side-lbl">Баланс токенов</div>
        <div className="dk-side-bal"><Star s={22} c="#c9c7f4"/> {tokens}</div>
        <button className="dk-cta" onClick={onTopup}>Пополнить</button>
        <div className="dk-side-note">1 фото ≈ 2 ★ · 1 видео ≈ 5 ★</div>
      </div>

      {bonusToast && <div className="dk-card dk-pad" style={{ borderColor:'rgba(127,170,157,.55)', background:'linear-gradient(135deg, rgba(127,170,157,.18), rgba(255,255,255,.72))' }}>
        <div className="dk-side-h">🎁 У вас есть бесплатные токены</div>
        <div className="dk-side-note" style={{ marginTop:0, marginBottom:10, textAlign:'left' }}>Заберите доступные бонусы в профиле.</div>
        <button className="dk-btn-sec" style={{ width:'100%' }} onClick={function() { setBonusToast(false); if (bonusRef.current) bonusRef.current.scrollIntoView({ behavior:'smooth', block:'center' }); }}>Посмотреть</button>
      </div>}

      {bonus && <div ref={bonusRef} className="dk-card dk-pad dk-bonus-card-v2">
        <div className="dk-bonus-head">
          <div>
            <div className="dk-side-h">🎁 Бонусные токены</div>
            <div className="dk-side-note" style={{ marginTop:4, textAlign:'left' }}>{bonus.title || '50 токенов сразу + бонусы за задания после проверки'}</div>
          </div>
          {bonusBalance !== null && <div className="dk-bonus-bal"><b>{bonusBalance}</b><span>★</span></div>}
        </div>
        <div className="dk-bonus-tasks">
          {bonusTasks.map(function(t) {
            var claimed = !!t.claimed;
            var manual = t.kind === 'manual_claim' && t.claimable !== false;
            var url = t.action_url || '';
            var status = t.status_label || (manual ? 'Доступно' : (t.kind === 'automatic' ? 'Авто' : 'Скоро'));
            return <div className={'dk-bonus-task' + (claimed ? ' done' : '')} key={t.code}>
              <div className="dk-bonus-copy">
                <span>{t.title}</span>
                <small>{t.description || ''}</small>
              </div>
              <div className="dk-bonus-act">
                <b>+{t.tokens || t.credits || 0} ★</b>
                {claimed ? <em>Готово</em>
                  : manual ? <button onClick={() => claimProfileBonus(t.code)}>Забрать</button>
                  : url ? <a href={url} target="_blank" rel="noopener noreferrer">{t.action_label || 'Открыть'}</a>
                  : <em>{status}</em>}
              </div>
            </div>;
          })}
        </div>
        {bonusState && <div className="dk-side-note" style={{ marginTop:10 }}>{bonusState}</div>}
      </div>}

      <div className="dk-card dk-pad">
        <div className="dk-side-h"><Ic n="bolt" s={17} c="#c98a4e"/> Доступ</div>
        <div className="dk-kv"><span>Подписка</span><b>{user && user.subscription && user.subscription.is_active ? user.subscription.title : 'нет'}</b></div>
        <div className="dk-kv"><span>Фото-шаблоны</span><b style={{ color:'#5f9184' }}>доступны</b></div>
        <div className="dk-side-note" style={{ marginTop:8, textAlign:'left' }}>Без подписки фото-шаблоны запускаются на базовой модели. Видео по-прежнему требует платные токены.</div>
      </div>

      <div className="dk-card dk-pad">
        <div className="dk-side-h"><Ic n="user" s={17} c="var(--muted)"/> Аккаунт</div>
        {user && user.email && <div className="dk-kv"><span>Email</span><b>{user.email}</b></div>}
        {isTelegram && !hasPassword && <>
          <div className="dk-side-note" style={{ marginTop:0, marginBottom:10, textAlign:'left' }}>Свяжите Telegram с email-аккаунтом, чтобы один баланс работал в Mini App и на сайте.</div>
          <button className="dk-btn-sec" style={{ width:'100%' }} onClick={() => setLinkMode('link')}><Ic n="user" s={16}/> Связать аккаунты</button>
        </>}
        {isTelegram && hasPassword && <div className="dk-kv"><span>Вход с ПК</span><b style={{ color:'#5f9184' }}>включён</b></div>}
        {!isTelegram && <>
          <div className="dk-kv"><span>Telegram</span><b style={{ color: hasTelegram ? '#5f9184' : 'var(--muted)' }}>{hasTelegram ? 'привязан' : 'не привязан'}</b></div>
          {!hasTelegram && <>
            <div className="dk-side-note" style={{ marginTop:8, marginBottom:10, textAlign:'left' }}>Привязка Telegram завершается в Mini App, потому что Telegram должен подтвердить ваш аккаунт.</div>
            <button className="dk-btn-sec" style={{ width:'100%' }} onClick={() => setTelegramHelp(true)}><Ic n="chat" s={16}/> Привязать Telegram</button>
          </>}
          <button className="dk-btn-sec" style={{ width:'100%', marginTop:10 }} onClick={logout}>Выйти из аккаунта</button>
        </>}
      </div>
    </div>
    {linkMode && <DeskLinkEmail onClose={() => setLinkMode(null)} onLinked={function(nextUser) { if (nextUser && onUserUpdate) onUserUpdate(nextUser); }}/>}
    {telegramHelp && <DeskTelegramLinkModal onClose={() => setTelegramHelp(false)}/>}
  </div>;
}

/* ============================================================
   Topup modal (centered, horizontal packages)
   ============================================================ */
function DeskTopup({ tokens, onClose }) {
  const { Star, Ic } = window.MiraCore;
  const fallback = [
    { code:'topup_300', tokens:300, price_rub:249, bonus_tokens:0, total_tokens:300, effective_price_per_token:0.83 },
    { code:'topup_1000', tokens:1000, price_rub:790, bonus_tokens:0, total_tokens:1000, effective_price_per_token:0.79 },
    { code:'topup_3000', tokens:3000, price_rub:1990, bonus_tokens:0, total_tokens:3000, effective_price_per_token:0.66 },
    { code:'topup_10000', tokens:10000, price_rub:5990, bonus_tokens:0, total_tokens:10000, effective_price_per_token:0.60 },
  ];
  const fallbackSubs = [
    { code:'templates_mini', title:'Шаблоны Mini', price_rub:790, tokens_per_month:800, badge:'Старт' },
    { code:'templates_plus', title:'Шаблоны Plus', price_rub:2590, tokens_per_month:3500, badge:'Для контента' },
    { code:'creator', title:'Creator', price_rub:1490, tokens_per_month:1800, badge:'Личный' },
    { code:'creator_pro', title:'Creator Pro', price_rub:3990, tokens_per_month:6500, badge:'Популярный' },
    { code:'studio', title:'Studio', price_rub:9900, tokens_per_month:18000, badge:'Для бизнеса' },
  ];
  const fallbackBonus = { title:'50 токенов сразу + бонусы за задания после проверки', note:'Бонусные токены доступны для базовых фото-моделей.', tasks:[
    { code:'signup', title:'Бонус за регистрацию', tokens:50, kind:'automatic', claimed:true },
    { code:'social_subscribe', title:'Подписаться на наш канал', description:'Откройте Telegram-канал. Автопроверка появится после подключения канала к боту.', tokens:70, kind:'external_check', action_url:'https://t.me/hubicx_bot', action_label:'Открыть канал', status_label:'Проверка скоро' },
  ] };
  const [packs, setPacks] = useState(null);
  const [subs, setSubs] = useState(fallbackSubs);
  const [bonus, setBonus] = useState(fallbackBonus);
  const [enabled, setEnabled] = useState(false);
  const [packSel, setPackSel] = useState(1);
  const [subSel, setSubSel] = useState(0); // null = token package selected
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customErr, setCustomErr] = useState('');
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState('');

  useEffect(function() {
    var alive = true;
    if (window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.pricing().then(function(data) {
        if (!alive) return;
        if (data && Array.isArray(data.token_packages) && data.token_packages.length) setPacks(data.token_packages.slice(0, 4));
        else setPacks(fallback);
        if (data && Array.isArray(data.subscription_plans) && data.subscription_plans.length) setSubs(data.subscription_plans);
        if (data && data.bonus_program) setBonus(data.bonus_program);
        if (data && data.payments_enabled) setEnabled(true);
      }).catch(function() { if (alive) setPacks(fallback); });
    } else setPacks(fallback);
    return function() { alive = false; };
  }, []);

  const pay = function() {
    if (paying || !window.HubicxApi) return;
    var payload;
    var customNum = parseInt(customAmount, 10);
    var customValid = customOpen && customAmount && !isNaN(customNum) && customNum >= 99;
    if (customValid) {
      payload = { amount_rub: customNum, credits: customNum };
    } else if (subSel !== null) {
      var sub = selectedSub;
      if (!sub) return;
      payload = { amount_rub: sub.price_rub, credits: sub.tokens_per_month, package_code: sub.code };
    } else {
      var chosen = packs && (packs[packSel] || packs[0]);
      if (!chosen) return;
      payload = { amount_rub: chosen.price_rub, credits: chosen.total_tokens || chosen.tokens, package_code: chosen.code };
    }
    setPayErr(''); setPaying(true);
    window.HubicxApi.createPayment(Object.assign({}, payload, { return_url: 'https://hubicx.ru' }))
      .then(function(data) {
        setPaying(false);
        if (data.payment_url) {
          var tg = window.Telegram && window.Telegram.WebApp;
          if (tg && tg.openLink) tg.openLink(data.payment_url); else window.open(data.payment_url, '_blank');
          onClose();
        } else setPayErr(data.message || 'Не удалось создать платёж');
      }).catch(function(e) { setPaying(false); setPayErr((e && e.message) || 'Ошибка при создании платежа'); });
  };

  var templateSubs = (subs || []).filter(function(p) { return String(p.code || '').indexOf('templates_') === 0; });
  var fullSubs = (subs || []).filter(function(p) { return String(p.code || '').indexOf('templates_') !== 0; });
  var visibleSubs = templateSubs.concat(fullSubs);
  var selectedSub = subSel === null ? null : (visibleSubs[subSel] || visibleSubs[0] || null);
  var customNumView = parseInt(customAmount, 10);
  var customValidView = customOpen && customAmount && !isNaN(customNumView) && customNumView >= 99;
  var chosen = customValidView ? { price_rub: customNumView, title:'Своя сумма' } : (selectedSub || (packs && (packs[packSel] || packs[0])));
  var chosenPrice = chosen ? chosen.price_rub : '';
  var chosenLabel = selectedSub ? selectedSub.title : (customValidView ? 'Своя сумма' : '');
  const handleCustomChange = function(v) {
    var num = parseInt(v, 10);
    setCustomAmount(v);
    if (!v || isNaN(num)) { setCustomErr(''); return; }
    if (num < 99) { setCustomErr('Минимум 99 ₽'); return; }
    setCustomErr('');
  };
  const claimBonus = function(code) {
    if (!window.HubicxApi || !window.HubicxApi.claimBonus) return;
    window.HubicxApi.claimBonus(code).then(function() { return window.HubicxApi.bonuses ? window.HubicxApi.bonuses() : null; })
      .then(function(data) { if (data) setBonus(data); })
      .catch(function(e) { setPayErr((e && e.message) || 'Не удалось начислить бонус'); });
  };
  return <div className="dk-modal-ov" onClick={onClose}>
    <div className="dk-modal dk-topup-modal" onClick={e => e.stopPropagation()}>
      <button className="dk-modal-x" onClick={onClose}><Ic n="close" s={18}/></button>
      <div className="dk-modal-title">Тарифы Hubicx</div>
      <div className="dk-modal-sub">Баланс сейчас: {tokens} ★</div>

      {packs === null
        ? <div style={{ padding:'40px 0', display:'flex', justifyContent:'center' }}><div className="gen-spinner"></div></div>
        : <>
        {bonus && <div className="dk-bonus-card dk-bonus-card-v2 dk-topup-bonus">
          <div className="dk-bonus-title">{bonus.title}</div>
          {bonus.note && <div className="dk-bonus-note">{bonus.note}</div>}
          <div className="dk-bonus-tasks">{(bonus.tasks || []).map(function(t) {
            var claimed = !!t.claimed;
            var manual = t.kind === 'manual_claim' && t.claimable !== false;
            var url = t.action_url || '';
            var status = t.status_label || (manual ? 'Доступно' : (t.kind === 'automatic' ? 'Авто' : 'Скоро'));
            return <div className={'dk-bonus-task' + (claimed ? ' done' : '')} key={t.code}>
              <div className="dk-bonus-copy"><span>{t.title}</span><small>{t.description || ''}</small></div>
              <div className="dk-bonus-act">
                <b>+{t.tokens || t.credits || 0} ★</b>
                {claimed ? <em>Готово</em>
                  : manual ? <button onClick={() => claimBonus(t.code)}>Забрать</button>
                  : url ? <a href={url} target="_blank" rel="noopener noreferrer">{t.action_label || 'Открыть'}</a>
                  : <em>{status}</em>}
              </div>
          </div>; })}</div>
        </div>}

        {templateSubs.length > 0 && <React.Fragment>
        <div className="dk-topup-label">Для шаблонов</div>
        <div className="dk-sub-grid dk-sub-grid-templates">
          {templateSubs.map(function(p, i) { return <div key={p.code}
              className={'dk-sub-card' + (selectedSub && selectedSub.code === p.code && !customValidView ? ' on' : '')}
              onClick={() => { setSubSel(i); setPackSel(1); setCustomAmount(''); setCustomErr(''); }}>
            {p.badge && <div className="dk-sub-badge">{p.badge}</div>}
            <div className="dk-sub-title">{p.title}</div>
            <div className="dk-sub-n"><Star s={22} c="#c9c7f4"/> {p.tokens_per_month}</div>
            <div className="dk-sub-meta">токенов / месяц</div>
            <div className="dk-sub-price">{p.price_rub} ₽/мес</div>
          </div>; })}
        </div>
        </React.Fragment>}

        {fullSubs.length > 0 && <React.Fragment>
        <div className="dk-topup-label">Для генераций</div>
        <div className="dk-sub-grid dk-sub-grid-plans">
          {fullSubs.map(function(p, i) {
            var realIndex = templateSubs.length + i;
            return <div key={p.code}
              className={'dk-sub-card' + (selectedSub && selectedSub.code === p.code && !customValidView ? ' on' : '')}
              onClick={() => { setSubSel(realIndex); setPackSel(1); setCustomAmount(''); setCustomErr(''); }}>
              {p.badge && <div className="dk-sub-badge">{p.badge}</div>}
              <div className="dk-sub-title">{p.title}</div>
              <div className="dk-sub-n"><Star s={22} c="#c9c7f4"/> {p.tokens_per_month}</div>
              <div className="dk-sub-meta">токенов / месяц</div>
              <div className="dk-sub-price">{p.price_rub} ₽/мес</div>
            </div>;
          })}
        </div>
        </React.Fragment>}

        <div className="dk-topup-label">Разовые пакеты</div>
        <div className="dk-packs">
          {packs.map(function(p, i) {
            var best = i === 1;
            return <div key={i} className={'dk-pack' + (subSel === null && packSel === i && !customValidView ? ' on' : '')} onClick={() => { setSubSel(null); setPackSel(i); setCustomAmount(''); setCustomErr(''); }}>
              {best && <div className="dk-pack-best">Выгодно</div>}
              <Star s={22} c="#c9c7f4"/>
              <div className="dk-pack-n">{p.total_tokens || p.tokens}</div>
              {p.bonus_tokens > 0 && <div className="dk-pack-bonus">+{p.bonus_tokens} бонус</div>}
              <div className="dk-pack-price">{p.price_rub} ₽</div>
            </div>;
          })}
        </div>

        <button className="dk-topup-more" onClick={() => setCustomOpen(!customOpen)}>
          {customOpen ? 'Скрыть свою сумму' : 'Нужна другая сумма?'}
        </button>
        {customOpen && <div className="dk-custom-box">
          <input className="dk-auth-in" type="number" min="99" placeholder="Введите сумму от 99 ₽" value={customAmount} onChange={function(e) { handleCustomChange(e.target.value); }}/>
          {customValidView && <div className="dk-custom-preview"><span>{customNumView} ₽</span><b>{customNumView} токенов</b></div>}
          {customErr && <div className="dk-pay-err">{customErr}</div>}
        </div>}

        <div className="dk-feats">
          <span><Ic n="bolt" s={14} c="#c98a4e"/> Мгновенное зачисление</span>
          <span><Ic n="sparkle" s={14} c="#7a9c92"/> Все модели и форматы</span>
          <span><Ic n="star" s={14} c="#c45c92"/> Бонусные токены за пакет</span>
        </div>

        {payErr && <div className="dk-pay-err">{payErr}</div>}
        {!enabled && <div className="dk-modal-sub" style={{ marginTop:10 }}>Оплата скоро будет доступна</div>}

        <button className="dk-cta" disabled={!enabled || paying || !chosen || !!customErr} onClick={pay} style={{ marginTop:14 }}>
          {paying ? 'Создаём платёж…' : enabled ? 'Оплатить' + (chosen && chosenPrice ? ' · ' + chosenPrice + ' ₽' + (chosenLabel ? ' — ' + chosenLabel : '') : '') : 'Скоро будет доступно'}
        </button>
      </>}
    </div>
  </div>;
}

window.DeskAuth = DeskAuth;
window.DeskShell = DeskShell;
window.DeskHome = DeskHome;
window.DeskGen = DeskGen;
window.DeskChat = DeskChat;
window.DeskTemplates = DeskTemplates;
window.DeskHistory = DeskHistory;
window.DeskFavorites = DeskFavorites;
window.DeskProfile = DeskProfile;
window.DeskTopup = DeskTopup;
