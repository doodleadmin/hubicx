/* ============ Hubicx core: icons, data, shared UI ============ */
const { useState, useEffect, useRef } = React;

/* ---- inline icons (stroke) ---- */
var IC_DUO = {
  sage: 'rgba(127,170,157,.28)',
  lilac: 'rgba(182,181,230,.34)',
};

function Ic({ n, s = 22, c = "currentColor", sw = 1.9, on = false, duo = "sage" }) {
  const p = {
    bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>,
    image: <g><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 21"/></g>,
    video: <g><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/></g>,
    chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>,
    telegram: <path d="M21.5 4.5L18.4 18.9c-.2.9-.8 1.1-1.6.7l-4.7-3.5-2.3 2.2c-.25.25-.46.46-.94.46l.34-4.8 8.7-7.9c.38-.34-.08-.53-.59-.19L6.6 13.1 2 11.6c-1-.31-1.02-1 .21-1.48L20.1 3.4c.83-.31 1.56.19 1.4 1.1z"/>,
    arrowUp: <path d="M12 19V6M6 12l6-6 6 6"/>,
    chev: <path d="M9 6l6 6-6 6"/>,
    user: <g><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></g>,
    cam: <g><path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="3.4"/></g>,
    sparkle: <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z"/>,
    globe: <g><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 2.6 15.6 0 18M12 3c-2.6 2.4-2.6 15.6 0 18"/></g>,
    wand: <g><path d="M15 4V2M19 8h2M17.5 5.5l1.5-1.5M4 20l9-9"/><path d="M14 7l3 3"/></g>,
    plus: <path d="M12 5v14M5 12h14"/>,
    addimg: <g><rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 15l5-4 4 3 3-2 6 4"/><circle cx="9" cy="9" r="1.6"/></g>,
    aspect: <rect x="7" y="3.5" width="10" height="17" rx="2.5"/>,
    check: <path d="M5 12.5l4.5 4.5L19 6.5"/>,
    back: <path d="M15 5l-7 7 7 7"/>,
    close: <path d="M6 6l12 12M18 6L6 18"/>,
    edit: <path d="M14 4l6 6M3 21l1-5L17 3l4 4L8 20z"/>,
    model: <g><circle cx="12" cy="12" r="2.4"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/></g>,
    bell: <g><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></g>,
    gear: <g><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"/></g>,
    sliders: <g><path d="M4 7h11M19 7h1M4 17h6M14 17h6"/><circle cx="17" cy="7" r="2"/><circle cx="12" cy="17" r="2"/></g>,
    heart: <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20z"/>,
    star: <path d="M12 3l2.5 5.3 5.5.8-4 4 1 5.9-5-2.8-5 2.8 1-5.9-4-4 5.5-.8z"/>,
    grid: <g><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></g>,
    clock: <g><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></g>,
    search: <g><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></g>,
    sun: <g><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></g>,
    moon: <path d="M21 13.2A7.8 7.8 0 1 1 10.8 3a6.2 6.2 0 0 0 10.2 10.2z"/>,
    download: <g><path d="M12 4v11M7 11l5 5 5-5"/><path d="M5 20h14"/></g>,
    copy: <g><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></g>,
    lock: <g><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></g>,
    unlock: <g><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M16 10V7a4 4 0 0 0-7.5-2"/></g>,
  };
  var w = on ? 1.8 : (s < 18 && sw === 1.9 ? 2.1 : sw);
  return <svg width={s} height={s} viewBox="0 0 24 24"
    fill={on ? (IC_DUO[duo] || duo) : "none"}
    stroke={on ? "var(--ink, #1c1c1a)" : c}
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition:'fill .18s ease, stroke .18s ease' }}>{p[n]}</svg>;
}

function HxSheet({ onClose, children, maxHeight, sheetClassName = '', cardClassName = '', ovClassName = '' }) {
  var cardRef = useRef(null);
  var ovRef = useRef(null);
  var drag = useRef({ on:false, startY:0, dy:0 });
  var [closing, setClosing] = useState(false);

  var close = function() {
    if (closing) return;
    setClosing(true);
    if (window.tgHaptic) window.tgHaptic('light');
    setTimeout(onClose, 300);
  };
  var setY = function(y, cls) {
    var el = cardRef.current; if (!el) return;
    el.className = ('sheet-card ' + cardClassName + ' ' + cls).trim();
    el.style.transform = y > 0 ? 'translateY(' + y + 'px)' : '';
    var ov = ovRef.current;
    if (ov) ov.style.background = 'rgba(28,28,22,' + Math.max(0, .36 * (1 - y / 260)).toFixed(3) + ')';
  };
  var onDown = function(e) {
    var t = e.touches ? e.touches[0] : e;
    drag.current = { on:true, startY:t.clientY, dy:0 };
  };
  var onMove = function(e) {
    if (!drag.current.on) return;
    var t = e.touches ? e.touches[0] : e;
    var dy = Math.max(0, t.clientY - drag.current.startY);
    drag.current.dy = dy;
    setY(dy, 'hx-dragging');
  };
  var onUp = function() {
    if (!drag.current.on) return;
    drag.current.on = false;
    var dy = drag.current.dy;
    var h = cardRef.current ? cardRef.current.offsetHeight : 300;
    if (dy > Math.min(120, h / 3)) { close(); return; }
    setY(0, 'hx-settling');
    var ov = ovRef.current; if (ov) ov.style.background = '';
  };

  return <div ref={ovRef} className={('sheet-ov ' + ovClassName + (closing ? ' hx-closing' : '')).trim()} onClick={close}>
    <div className={'sheet ' + sheetClassName} onClick={function(e) { e.stopPropagation(); }}>
      <div ref={cardRef} className={'sheet-card ' + cardClassName + (closing ? ' hx-out' : '')}
        style={maxHeight ? { maxHeight:maxHeight } : null}>
        <div className="sheet-grab-zone"
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
          <div className="sheet-grab"></div>
        </div>
        {children}
      </div>
    </div>
  </div>;
}

/* ---- token star (filled) ---- */
function Star({ s = 16, c = "#1c1c1a" }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 2l2.4 6.4L21 9l-5 4.2L17.4 21 12 17.3 6.6 21 8 13.2 3 9l6.6-.6z"/>
  </svg>;
}

/* ---- token badge ---- */
function TokenBadge({ n }) {
  return <div className="tb-tok"><Star s={15} c="#c9c7f4"/><span>{n}</span></div>;
}

/* ---- top segmented nav ---- */
function mobileTimeAgo(iso) {
  if (!iso) return '';
  var d = new Date(iso); if (isNaN(d.getTime())) return '';
  var sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'только что';
  var min = Math.floor(sec / 60); if (min < 60) return min + ' мин';
  var hr = Math.floor(min / 60); if (hr < 24) return hr + ' ч';
  var day = Math.floor(hr / 24); return day + ' д';
}
function TopNav({ active, onTab }) {
  if (window.DESKTOP_MODE) return null;
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const toggleNotifs = function() {
    var next = !notifOpen;
    setNotifOpen(next);
    if (next && !loaded && window.HubicxApi && window.HubicxApi.hasAuth()) {
      window.HubicxApi.history().then(function(items) {
        var list = (Array.isArray(items) ? items : []).slice(0, 8).map(function(it) {
          var failed = it.status === 'refunded';
          var done = it.status === 'completed';
          return {
            title: failed ? 'Генерация не удалась' : done ? 'Результат готов' : 'Генерация в работе',
            sub: failed ? 'Токены возвращены на баланс' : (it.title || it.prompt || 'Фото или видео'),
            time: mobileTimeAgo(it.created_at),
            ic: failed ? 'close' : done ? 'check' : 'sparkle',
            c: failed ? '#c0473e' : '#5f9184',
            bg: failed ? '#fde0dc' : '#e6efe9'
          };
        });
        setNotifs(list); setLoaded(true);
      }).catch(function() { setLoaded(true); });
    }
  };
  return <div className="topnav" data-onb="mob-topnav">
    <div className="tn-seg">
      {[['agent','Главная'],['gen','Генерация'],['profile','Профиль']].map(([id,l]) => (
        <div key={id} data-onb={'mob-tab-' + id} className={'tn-item' + (active === id ? ' on' : '')}
          onClick={() => { if (window.tgHaptic) window.tgHaptic('selection'); onTab(id); }}>{l}</div>
      ))}
    </div>
    <div className="tn-icon" onClick={toggleNotifs}>
      <Ic n="bell" s={20}/>
      {notifs.length > 0 && <span className="tn-dot"></span>}
      {notifOpen && <div className="m-notif" onClick={function(e) { e.stopPropagation(); }}>
        <div className="m-notif-top">
          <span>Уведомления</span>
          <button onClick={function(e) { e.stopPropagation(); setNotifOpen(false); }}>×</button>
        </div>
        {!loaded && <div className="m-notif-empty">Загружаем…</div>}
        {loaded && notifs.length === 0 && <div className="m-notif-empty">Пока нет уведомлений</div>}
        {loaded && notifs.map(function(n, i) {
          return <div key={i} className="m-notif-item">
            <span className="m-notif-ic" style={{ background:n.bg }}><Ic n={n.ic} s={15} c={n.c}/></span>
            <div className="m-notif-tx"><div className="m-notif-t">{n.title}</div><div className="m-notif-s">{n.sub}</div></div>
            <div className="m-notif-time">{n.time}</div>
          </div>;
        })}
      </div>}
    </div>
  </div>;
}

/* ---- fallback models (matches production DB seed) ---- */
const FALLBACK_MODELS = [
  { code:'nano_banana_2_lite', title:'Nano Banana 2 Lite',        category:'photo', task_type:'image', price_credits:25,  description:'Быстрая и доступная генерация' },
  { code:'nano_banana_2',      title:'Nano Banana 2',             category:'photo', task_type:'image', price_credits:40,  description:'Быстрая генерация' },
  { code:'nano_banana_pro',    title:'Nano Banana Pro',           category:'photo', task_type:'image', price_credits:80,  description:'Создаёт и улучшает фото в высоком качестве', input_type:'image', form_schema:{ fields:[
    { name:'prompt', type:'textarea' },
    { name:'image_urls', type:'files' },
    { name:'aspect_ratio', type:'select', default:'1:1', options:['1:1','4:5','3:4','9:16','16:9'] },
    { name:'resolution', type:'select', default:'1K', options:['1K','2K','4K'] },
    { name:'num_images', type:'select', default:1, options:[1,2,3,4] }
  ], price_rules:{ base:80, multipliers:[{ field:'resolution', values:{ '1K':1, '2K':1, '4K':2 } }, { field:'num_images', mode:'multiply_by_value' }], min:1, round:'ceil' } } },
  { code:'nano_banana_edit',   title:'Nano Banana · редактор',    category:'photo', task_type:'image', price_credits:60,  description:'Изменяет загруженное фото по описанию', input_type:'image' },
  { code:'gpt_image_2',        title:'GPT Image 2',               category:'photo', task_type:'image', price_credits:90,  description:'Точные изображения и надписи' },
  { code:'gpt_image_2_edit',   title:'GPT Image 2 · редактор',    category:'photo', task_type:'image', price_credits:110, description:'Аккуратно изменяет загруженное фото', input_type:'image' },
  { code:'seedream',           title:'Seedream',                  category:'photo', task_type:'image', price_credits:35,  description:'Фотореалистичный' },
  { code:'flux_schnell',       title:'Flux · быстрый',            category:'photo', task_type:'image', price_credits:30,  description:'Быстрые изображения по описанию' },
  { code:'z_image',            title:'Z-Image',                   category:'photo', task_type:'image', price_credits:25,  description:'Доступный' },
  { code:'seedance_2_t2v',     title:'Seedance 2.0 · по тексту',  category:'video', task_type:'video', price_credits:460, description:'Создаёт видео по текстовому описанию' },
  { code:'seedance_2_t2v_fast',title:'Seedance 2.0 · быстро по тексту',category:'video', task_type:'video', price_credits:370, description:'Быстро создаёт видео по описанию' },
  { code:'seedance_2_mini_t2v',title:'Seedance 2.0 · доступно по тексту',category:'video', task_type:'video', price_credits:240, description:'Доступное видео для быстрых задач' },
  { code:'seedance_2_i2v_fast',title:'Seedance 2.0 · быстро по фото',category:'video',task_type:'video', price_credits:370, description:'Быстро оживляет фотографию', input_type:'image' },
  { code:'seedance_2_mini_i2v',title:'Seedance 2.0 · доступно по фото',category:'video',task_type:'video', price_credits:240, description:'Доступно оживляет фотографию', input_type:'image' },
  { code:'seedance_2_reference',title:'Seedance 2.0 · по референсам',category:'video',task_type:'video', price_credits:460, description:'Создаёт видео по нескольким референсам', input_type:'image', form_schema:{ fields:[
    { name:'image_urls', type:'files' },
    { name:'prompt', type:'textarea' },
    { name:'aspect_ratio', type:'select', default:'9:16', options:['21:9','16:9','4:3','1:1','3:4','9:16','auto'] },
    { name:'duration', type:'select', default:'5', options:['auto','4','5','6','7','8','9','10','11','12','13','14','15'] },
    { name:'resolution', type:'select', default:'480p', options:['480p','720p','1080p'] },
    { name:'generate_audio', type:'switch', default:true }
  ], price_rules:{ base:460, multipliers:[{ field:'resolution', values:{ '480p':0.45, '720p':1, '1080p':2.25 } }, { field:'duration', values:{ auto:1, '4':0.8, '5':1, '6':1.2, '7':1.4, '8':1.6, '9':1.8, '10':2, '11':2.2, '12':2.4, '13':2.6, '14':2.8, '15':3 } }], min:1, round:'ceil' } } },
  { code:'seedance_2_reference_fast',title:'Seedance 2.0 · быстро по референсам',category:'video',task_type:'video', price_credits:370, description:'Быстро создаёт видео по референсам', input_type:'image' },
  { code:'seedance_2_mini_reference',title:'Seedance 2.0 · доступно по референсам',category:'video',task_type:'video', price_credits:240, description:'Доступное видео по референсам', input_type:'image' },
  { code:'seedance_2_i2v',     title:'Seedance 2.0 · по фото',    category:'video', task_type:'video', price_credits:460, description:'Качественно оживляет фотографию', input_type:'image' },
  { code:'kling_21_i2v',       title:'Kling 2.1 · по фото',       category:'video', task_type:'video', price_credits:220, description:'Оживляет загруженную фотографию', input_type:'image' },
  { code:'kling_30_i2v',       title:'Kling 3.0 · по фото',       category:'video', task_type:'video', price_credits:260, description:'Качественно оживляет фотографию', input_type:'image', form_schema:{ fields:[
    { name:'image_url', type:'file' },
    { name:'prompt', type:'textarea' },
    { name:'duration', type:'select', default:'10', options:['3','4','5','6','7','8','9','10','11','12','13','14','15'] },
    { name:'resolution', type:'select', default:'720p', options:['720p'] },
    { name:'generate_audio', type:'switch', default:false },
    { name:'template_pipeline', type:'hidden' }
  ], price_rules:{ base:260, multipliers:[{ field:'duration', values:{ '3':0.4, '4':0.5, '5':0.6, '6':0.7, '7':0.8, '8':0.9, '9':1, '10':1, '11':1.1, '12':1.2, '13':1.3, '14':1.4, '15':1.5 } }], min:1, round:'ceil' } } },
  { code:'kling_30_motion_control',title:'Kling 3.0 · движение',category:'video',task_type:'video', price_credits:260, description:'Переносит движение из видео на персонажа', input_type:'image', form_schema:{ fields:[
    { name:'image_url', type:'file' },
    { name:'video_url', type:'file' },
    { name:'prompt', type:'textarea' },
    { name:'character_orientation', type:'select', default:'image', options:['image','video'] },
    { name:'keep_original_sound', type:'switch', default:true }
  ] } },
  { code:'grok_video_t2v',     title:'Grok · по тексту',          category:'video', task_type:'video', price_credits:320, description:'Создаёт видео по текстовому описанию' },
  { code:'grok_video_i2v',     title:'Grok · по фото',            category:'video', task_type:'video', price_credits:340, description:'Оживляет загруженное фото', input_type:'image' },
  { code:'veo_31_t2v',         title:'Veo 3.1 · по тексту',       category:'video', task_type:'video', price_credits:900, description:'Кинематографичное видео по описанию' },
  { code:'veo_31_i2v',         title:'Veo 3.1 · по фото',         category:'video', task_type:'video', price_credits:900, description:'Кинематографично оживляет фото', input_type:'image' },
];

function makeSeedancePriceRules(base, resolutionMultipliers) {
  var durationKeys = ['4','5','6','7','8','9','10','11','12','13','14','15'];
  var table = {};
  Object.keys(resolutionMultipliers).forEach(function(resolution) {
    var multiplier = Number(resolutionMultipliers[resolution]) || 1;
    table[resolution] = { auto: Math.ceil(base * multiplier) };
    durationKeys.forEach(function(duration) {
      table[resolution][duration] = Math.ceil(base * multiplier * (Number(duration) / 5));
    });
  });
  return {
    default_duration: '5',
    default_resolution: '720p',
    resolution_duration_prices: table,
  };
}

FALLBACK_MODELS.forEach(function(model) {
  var code = String((model && model.code) || '');
  if (code.indexOf('seedance_2_') !== 0) return;
  var isMini = code.indexOf('_mini') !== -1;
  var isFast = !isMini && code.indexOf('_fast') !== -1;
  var base = isMini ? 240 : (isFast ? 370 : 460);
  var resolutionMultipliers = isMini ? { '480p':0.466, '720p':1 } : (isFast ? { '480p':0.45, '720p':1 } : { '480p':0.45, '720p':1, '1080p':2.25 });
  var isReference = code.indexOf('reference') !== -1;
  var isImage = code.indexOf('_i2v') !== -1;
  var mediaField = isReference
    ? { name:'image_urls', type:'files', required:true, max_files:8 }
    : (isImage ? { name:'image_url', type:'file', required:true } : null);
  var fields = [];
  if (mediaField) fields.push(mediaField);
  fields.push({ name:'prompt', type:'textarea', required:true });
  fields.push({ name:'aspect_ratio', type:'select', default:isImage ? 'auto' : '16:9', options:['auto','21:9','16:9','4:3','1:1','3:4','9:16'] });
  fields.push({ name:'duration', type:'select', default:'5', options:['auto','4','5','6','7','8','9','10','11','12','13','14','15'] });
  fields.push({ name:'resolution', type:'select', default:isReference ? '480p' : '720p', options:Object.keys(resolutionMultipliers) });
  fields.push({ name:'generate_audio', type:'switch', default:true });
  model.price_rules = makeSeedancePriceRules(base, resolutionMultipliers);
  model.form_schema = Object.assign({}, model.form_schema || {}, { fields:fields });
  model.default_params = Object.assign({ duration:'5', resolution:isReference ? '480p' : '720p', generate_audio:true }, model.default_params || {});
});

function mergeModelCatalog(remoteModels) {
  var byCode = {};
  FALLBACK_MODELS.forEach(function(model) {
    if (model && model.code) byCode[model.code] = Object.assign({}, model);
  });
  (Array.isArray(remoteModels) ? remoteModels : []).forEach(function(model) {
    if (!model || !model.code) return;
    var fallback = byCode[model.code] || {};
    byCode[model.code] = Object.assign({}, fallback, model, {
      form_schema: model.form_schema || fallback.form_schema || null,
      default_params: model.default_params || fallback.default_params || null,
      price_rules: model.price_rules || fallback.price_rules || null,
    });
  });
  return Object.keys(byCode).map(function(code) { return byCode[code]; });
}

function priceRuleValue(inputs, names, fallback) {
  inputs = inputs || {};
  for (var i = 0; i < names.length; i++) {
    if (inputs[names[i]] != null && inputs[names[i]] !== '') return inputs[names[i]];
  }
  return fallback;
}

function normalizeResolutionKey(value) {
  var raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  var lower = raw.toLowerCase();
  if (/^\d+k$/.test(lower)) return lower.toUpperCase();
  return lower;
}

function normalizeDurationKey(value) {
  var raw = String(value == null ? '' : value).trim().toLowerCase();
  if (!raw) return '';
  var match = raw.match(/^(\d+)(?:\s*(?:s|sec|сек|сек\.|seconds))?$/i);
  return match ? String(parseInt(match[1], 10)) : raw;
}

function readRulePrice(table, key) {
  if (!table || key == null) return null;
  if (table[key] != null) return table[key];
  var alt = String(key);
  if (table[alt] != null) return table[alt];
  if (table[alt.toLowerCase()] != null) return table[alt.toLowerCase()];
  if (table[alt.toUpperCase()] != null) return table[alt.toUpperCase()];
  return null;
}

function isModelForMode(model, mode) {
  if (!model || !mode) return true;
  var isVideo = model.task_type === 'video' || model.category === 'video';
  var isPhoto = model.task_type === 'image' || (model.category === 'photo' && model.task_type !== 'video');
  if (mode === 'video') return isVideo;
  if (mode === 'photo') return isPhoto;
  return true;
}

function computeGenerationPrice(model, inputs, context) {
  if (!model || !isModelForMode(model, context && context.mode)) return 0;
  inputs = inputs || {};
  var basePrice = Number(model.price_credits || 0);
  var dbRules = model.price_rules && typeof model.price_rules === 'object' ? model.price_rules : null;
  var formRules = model.form_schema && model.form_schema.price_rules;
  var rules = dbRules || (formRules && typeof formRules === 'object' ? formRules : null);
  if (dbRules) {
    var res = priceRuleValue(inputs, ['resolution', 'quality'], dbRules.default_resolution || '');
    var resKey = normalizeResolutionKey(res);
    var dur = priceRuleValue(inputs, ['duration', 'duration_seconds'], dbRules.default_duration || '5');
    var durKey = normalizeDurationKey(dur);
    if (dbRules.resolution_duration_prices) {
      var byResolution = readRulePrice(dbRules.resolution_duration_prices, resKey) || readRulePrice(dbRules.resolution_duration_prices, res);
      var tablePrice = byResolution ? readRulePrice(byResolution, durKey) || readRulePrice(byResolution, dur) : null;
      if (tablePrice != null) return Math.max(1, Math.ceil(Number(tablePrice) || basePrice || 1));
      return Math.max(1, Math.ceil(basePrice || 1));
    }
    if (dbRules.duration_prices) {
      var durationPrice = readRulePrice(dbRules.duration_prices, durKey) || readRulePrice(dbRules.duration_prices, dur);
      if (durationPrice != null) return Math.max(1, Math.ceil(Number(durationPrice) || basePrice || 1));
      return Math.max(1, Math.ceil(basePrice || 1));
    }
    if (dbRules.resolution_prices) {
      var resolutionPrice = readRulePrice(dbRules.resolution_prices, resKey) || readRulePrice(dbRules.resolution_prices, res);
      var price = Number(resolutionPrice != null ? resolutionPrice : basePrice);
      if (dbRules.multiply_by_num_images) price *= Math.max(1, Number(inputs.num_images) || 1);
      return Math.max(1, Math.ceil(price || basePrice || 1));
    }
    if (dbRules.multiply_by_num_images) {
      return Math.max(1, Math.ceil((basePrice || 1) * Math.max(1, Number(inputs.num_images) || 1)));
    }
  }
  var total = Number((rules && rules.base) || basePrice || 0);
  if (rules && Array.isArray(rules.multipliers)) {
    rules.multipliers.forEach(function(rule) {
      if (!rule || !rule.field) return;
      var value = inputs[rule.field];
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
  return Math.max(1, Math.ceil(total || basePrice || 0));
}

const MODEL_CATALOG_CACHE_KEY = 'hbx_model_catalog_v6';

function readCachedModelCatalog() {
  try {
    var raw = window.localStorage && window.localStorage.getItem(MODEL_CATALOG_CACHE_KEY);
    var parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function persistModelCatalog(models) {
  if (!Array.isArray(models) || !models.length) return;
  try {
    if (window.localStorage) window.localStorage.setItem(MODEL_CATALOG_CACHE_KEY, JSON.stringify(models));
  } catch (_) {}
}

function initialModelCatalog() {
  return mergeModelCatalog(readCachedModelCatalog());
}

/* ---- data ---- */

function TemplateMedia({ t, loading = 'lazy', decoding = 'async', fetchPriority = 'auto', onError }) {
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const mediaRef = useRef(null);
  useEffect(function() {
    setVideoReady(false);
    setShouldLoadVideo(false);
  }, [t && t.coverVideo]);

  useEffect(function() {
    if (!(t && t.coverVideo)) return;
    var conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    var lowData = !!(conn && (conn.saveData || /(^|-)2g$/.test(String(conn.effectiveType || ''))));
    if (lowData) return;
    var node = mediaRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      var fallbackTimer = setTimeout(function() { setShouldLoadVideo(true); }, loading === 'eager' ? 80 : 900);
      return function() { clearTimeout(fallbackTimer); };
    }
    var observer = new IntersectionObserver(function(entries) {
      if (entries.some(function(entry) { return entry.isIntersecting || entry.intersectionRatio > 0; })) {
        setShouldLoadVideo(true);
        observer.disconnect();
      }
    }, { rootMargin: loading === 'eager' ? '280px 0px' : '180px 0px', threshold: 0.01 });
    observer.observe(node);
    return function() { observer.disconnect(); };
  }, [t && t.coverVideo, loading]);

  if (t && t.coverVideo) {
    const coverPoster = t.coverPoster || t.img || t.coverVideo.replace(/\.mp4(?:\?.*)?$/i, '.webp');
    return (
      <div ref={mediaRef} className={'tpl-media' + (videoReady ? ' ready' : ' loading') + ' has-fallback'}>
        <img className="tpl-media-fallback" src={coverPoster} alt="" loading={loading} decoding={decoding} fetchPriority={fetchPriority} onError={(event) => { event.currentTarget.style.display = 'none'; }}/>
        <video
          className={'tpl-media-video' + (videoReady ? ' ready' : '')}
          src={shouldLoadVideo ? t.coverVideo : undefined}
          poster={coverPoster}
          muted
          autoPlay
          playsInline
          loop
          preload={shouldLoadVideo ? 'metadata' : 'none'}
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onError={onError}
        ></video>
      </div>
    );
  }
  return <img src={t && t.img} alt="" loading={loading} decoding={decoding} fetchPriority={fetchPriority} onError={onError}/>;
}

function writePriceTrace(source, payload) {
  try {
    window.__HUBICX_LAST_PRICE_TRACE__ = payload;
    var enabled = false;
    try { enabled = localStorage.getItem('hubicx_debug_pricing') === '1'; } catch(e) {}
    if (enabled && window.console && console.table) console.table([Object.assign({ source:source }, payload || {})]);
    else if (enabled && window.console && console.log) console.log('[Hubicx price trace]', source, payload);
  } catch(e) {}
}

function isInsufficientBalanceError(error) {
  var text = [error && error.message, error && error.code, error && error.detail]
    .filter(Boolean).join(' ').toLowerCase();
  return /insufficient|not enough|balance|недостат|не хватает|нехват/.test(text);
}

const TEMPLATES = (window.HubicxVideoTemplates || []).concat([
  { code:'tv-broadcast', t:'ТВ трансляция', img:'assets/cov/hero1.png', coverVideo:'assets/templates/video/tv-broadcast/cover.mp4', type:'video', category:'Эффекты', requiresImage:true, inputLabel:'Селфи или фото человека', modelCode:'kling_30_i2v', qualityValue:'720p', aspectId:'16:9', duration:'10', durationOptions:['7','10','15'], durationLocked:true, templatePipeline:'tv_broadcast_kling_30', referenceSlots:[
    { label:'Селфи человека', hint:'Загрузите одно фото лица' }
  ], prompt:'Человек смотрит матч' },
  { code:'catastrophic-love', t:'Катастрофичная любовь', img:'assets/cov/hero3.png', coverVideo:'assets/templates/video/catastrophic-love/cover.mp4', type:'video', category:'Пары', requiresImage:true, inputLabel:'Фото мужчины и девушки', modelCode:'seedance_2_reference', qualityValue:'480p', aspectId:'9:16', duration:'15', durationOptions:['15'], durationLocked:true, durationUnlockable:false, referenceSlots:[
    { label:'Фото девушки', hint:'Селфи или фото по пояс' },
    { label:'Фото мужчины', hint:'Селфи или фото по пояс' }
  ], prompt:`Use the attached reference images as character identity references throughout the entire video.

@image_1: the woman
@image_2: the man

Both characters must remain realistic, visually consistent, and recognizable in every shot. Keep natural skin texture, realistic anatomy, natural facial micro-expressions, and believable motion. Avoid identity drift, face distortion, or changes in appearance between shots.

0:00–0:02s: Cinematic handheld medium waist-up shot of a young couple standing face to face on the rocky coastline of Istanbul Bosphorus during an approaching storm. The Bosphorus Bridge looms in the background through heavy fog. Strong wind bends wet grass and sprays seawater into the air. The ocean below crashes violently against jagged rocks. The woman screams emotionally: “You never listen to me!” The man shouts back over the wind. Natural overlapping dialogue, realistic breathing, cinematic tension. Ultra-realistic skin textures, shallow depth of field, film grain, dramatic storm lighting, 4K.

0:02–0:04s: Camera slowly pushes closer while circling slightly around them. The man gestures aggressively and yells: “Because you never try to understand me!” Their voices overlap naturally. Wind intensifies. Dark storm clouds accelerate across the sky. Ambient city sounds disappear beneath the growing storm. The emotional tension becomes unbearable. Cinematic realism, handheld instability, volumetric fog, natural facial micro-expressions.

0:04–0:06s: A deep metallic rumble emerges from above. Without cutting away, an enormous flaming meteor suddenly appears behind them in the sky over the Bosphorus. Orange fire trails illuminate the entire environment from behind, casting dramatic backlight on their faces and hair. The couple slowly stops arguing and turns in shock. Camera shakes subtly from atmospheric vibration. Hyper-realistic fire simulation and dynamic lighting.

0:06–0:08s: The meteor slams directly into the ocean beside the bridge. A deafening explosion erupts. Massive shockwave. Blinding white-orange flash consumes the frame for a moment. Water explodes upward into the sky. Sound briefly muffles from the impact pressure. Their hair and clothing violently whip forward from the blast force. Handheld camera nearly loses balance. Cinematic destruction physics, realistic water simulation, ultra-detailed debris and mist.

0:08–0:10s: The ocean suddenly pulls backward at terrifying speed, exposing black rocks beneath the waterline. Then an impossibly massive tsunami wave rises behind them, towering over the Bosphorus Bridge like a moving wall of death. The sky turns almost black-gray. A licensed cinematic melancholic piano ballad begins softly in the background, dramatic and intimate, without using any specific real song or exact copyrighted lyrics. The couple stands frozen, breathing heavily, staring at the incoming catastrophe.

0:10–0:13s: Camera remains locked emotionally on the couple while the gigantic tsunami rapidly grows closer, dominating the entire background frame. Their anger dissolves into silence and realization. The man slowly turns toward the woman. Their eyes fill with fear, regret, and love. Wind screams around them. Sea spray fills the air. Soft original vocals begin in a cinematic pop-ballad style, conveying farewell, fear, and the need to escape, but not quoting any existing song. Epic cinematic melancholy atmosphere, emotional realism, shallow depth of field.

0:13–0:15s: Close-up shot. The man pulls the woman toward him urgently and they kiss passionately as the monstrous wave crashes directly behind them. Water, mist, and storm debris engulf the frame. The kiss feels desperate, emotional, and final — accepting the end of the world together. The original chorus rises emotionally without using copyrighted lyrics. At the exact climax, the tsunami completely consumes them and the entire screen.

0:15s: Hard cut to black. Only distant storm ambience and fading music reverb remain. Style: Cinematic, ultra-realistic, emotional disaster film aesthetic, handheld camera, shallow depth of field, natural skin tones, strong wind simulation, storm atmosphere, realistic tsunami physics, volumetric fog, dynamic lighting, film grain, epic emotional tension, photorealistic water and destruction, 4K HDR, dramatic cinematic color grading.` },
  { code:'neo-noir', t:'Нео-нуар', coverVideo:'assets/templates/photo/neo-noir/cover.mp4', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', modelCode:'nano_banana_pro', qualityValue:'1K', prompt:`Transform the user-uploaded image with a cinematic neo-noir color grade and lighting while **preserving the original image exactly**. Do **not** change the person's pose, facial expression, body position, hand placement, gaze, facial features, hairstyle, clothing, accessories, composition, framing, camera angle, perspective, background, objects, or proportions. Do not add, remove, replace, or reposition any elements. **Retain the original composition and identity with 100% fidelity.**

Apply only the visual style: cinematic neo-noir lighting, strong teal and orange color contrast, cold green-teal overhead side lighting creating sculpted facial features and hard shadows, warm amber practical light glowing softly from below and the background, diffused warm highlights, low-key lighting, deep shadows, high contrast, minimal fill light, moody night interior atmosphere, cinematic film color grading, teal shadows, warm highlights, dark background, realistic skin texture, subtle film still aesthetic.

**Image-to-image edit only. Do not reinterpret, regenerate, or redesign the scene. Preserve geometry, identity, pose, framing, lighting direction, object positions, and all scene details exactly. The final image must be the exact same photograph with only the cinematic neo-noir lighting and color grading applied, as if it were professionally color graded in post-production.**` },
  { code:'motion-blur', t:'Скорость', coverVideo:'assets/templates/photo/motion-blur/cover.mp4', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', modelCode:'nano_banana_pro', qualityValue:'1K', prompt:`Transform the user-uploaded image to look as if it was captured while moving quickly. **Preserve the original image exactly**: do not change the person's pose, facial expression, body position, hand placement, gaze, composition, framing, camera angle, perspective, clothing, hairstyle, background, objects, or proportions. Do not add, remove, replace, or reposition any elements. **Retain the original composition and facial features with 100% fidelity.**

Apply only the photographic effect: intense full-frame motion blur across the entire image, with long horizontal streaks, smeared colors, and a strong sense of forward motion. Keep the subject's face, body, and proportions recognizable but naturally blurred as if captured in-camera during rapid movement. The blur must be continuous and directionally consistent across both the subject and the background, realistically simulating motion from a fast-moving vehicle or a camera held while running.

**Image-to-image edit only. Do not reinterpret or regenerate the scene. Preserve geometry, identity, pose, framing, object positions, and lighting exactly. The final result should be the exact same photo, with only realistic motion blur added as an in-camera effect.**` },
  { code:'silent-hill-fog', t:'Тёмный туман', coverVideo:'assets/templates/photo/silent-hill-fog/cover.mp4', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', modelCode:'nano_banana_pro', qualityValue:'1K', prompt:`Add a thick, dark, super realistic fog effect to the photo, similar to Silent Hill. The fog should look naturally integrated with depth and volume — dense in the background, partially covering the scenery, and lighter in the foreground to create a mysterious, cinematic atmosphere. The person's face and body must remain unchanged and sharp, without distortion. Keep perfect composition and focus on the subject. Ultra realistic, photorealism, high resolution, cinematic lighting, volumetric fog, 8k` },
  { code:'g7x-flash', t:'Вспышка G7X', coverVideo:'assets/templates/photo/g7x-flash/cover.mp4', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', modelCode:'nano_banana_pro', qualityValue:'1K', prompt:`Transform this photo to look as if it was shot on a Canon G7X using direct on-camera flash. **Preserve the original image exactly**: do not change the person's pose, facial expression, body position, hand placement, gaze, composition, framing, camera angle, perspective, clothing, hairstyle, background, objects, or proportions. Do not add, remove, or reposition any elements. **Retain the original composition and facial features with 100% fidelity.**

Apply only the photographic look: bright direct flash on the subject, slightly darker ambient background, glossy highlights, warm skin tones, vibrant colors, crisp detail, subtle vignette, realistic point-and-shoot aesthetic, high contrast, clean luxury lifestyle vibe, natural skin texture, candid paparazzi-style flash photography. The result should look like the **exact same photo**, with only the camera rendering and lighting characteristics changed, as if it had originally been captured on a Canon G7X with flash.` },
  { t:'Полароид с вечеринки', img:'assets/templates/photo/polaroid-party/cover.webp', type:'photo', category:'Женское', requiresImage:true, modelCode:'nano_banana_pro', qualityValue:'1K', inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

A physical Polaroid photograph lying on a messy party table. In the photo: a close-up of the woman's face, she is sticking out her tongue playfully, and a friend's hand is drawing the number "30" on her cheek with bright blue glitter gel. She wears butterfly hair clips and small silver hoop earrings. The photo itself has the classic white border, slightly off-center. Around the Polaroid: spilled glitter, a lipstick mark, a disposable camera, and a rhinestone-studded Motorola Razr phone. Style: authentic, candid, nostalgic party snapshot. Preserve her genuine, playful expression.` },
  { t:'Розы', img:'assets/templates/photo/roses/cover.webp', type:'photo', category:'Женское', requiresImage:true, modelCode:'nano_banana_pro', qualityValue:'1K', inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

Create a glamorous romantic editorial photo from a high overhead top-down angle. The woman is sitting on a dark wooden floor, centered in the frame, surrounded tightly by many large lush bouquets of red and white roses arranged all around her in a luxurious decorative composition. She is wearing a black satin slip dress with thin spaghetti straps, elegant and form-fitting. Her pose is calm and feminine: seated on the floor, body facing forward, hands placed near her sides on the floor, head tilted slightly upward toward the camera. She is looking directly into the camera with a soft, calm, slightly dreamy and serious expression. Lighting should look like direct camera flash photography: bright frontal flash, crisp details, soft shadows, glossy highlights on the dress, high contrast, clean skin, and a stylish luxury bouquet aesthetic. The composition should feel symmetrical, rich, romantic, and visually dense with roses filling the frame. Keep the mood elegant, luxurious, and romantic. Make it look like a real flash photo taken at a celebration or intimate luxury event.` },
  { t:'Розы с корги', img:'assets/templates/photo/roses-corgi/cover.webp', type:'photo', category:'Животные', requiresImage:true, modelCode:'nano_banana_pro', qualityValue:'1K', inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

Create a photorealistic vertical 3:4 lifestyle editorial photo with the exact same pose and camera angle as the reference composition. The camera must be placed almost directly overhead in a true bird’s-eye / top-down perspective, looking straight down at the woman. Preserve the pose and framing as closely as possible.

The woman is seated on a grey tiled sidewalk near the boundary where the tiled pavement meets dark asphalt. Her body is centered in the frame. She is looking straight up into the camera. Her legs are bent, knees opened outward, with both feet positioned toward the upper part of the frame. Her arms extend downward with both palms resting flat on the tiled ground near the bottom of the frame. Keep this pose very accurately.

She wears a dark brown leather jacket with realistic leather texture, a white top underneath, white trousers, brown leather shoes, and large transparent-frame glasses. Her hair is blonde, smooth, center-parted, with one loose strand falling across her face. Her expression is calm, soft, and slightly playful.

Place a large brown leather tote bag on the ground to the woman’s right side, close to her hip and arm.

Surround the woman with many Pembroke Welsh Corgis arranged in a tight circular ring around her body. The dogs should closely match the reference composition: compact corgi bodies, upright ears, short legs, mostly red-and-white coats with a few darker tricolor corgis. The corgis are positioned evenly around her, filling the perimeter of the frame. Most of them are looking up toward the camera, while some are looking toward the woman. Keep the arrangement dense, balanced, and visually similar to the reference.

The lower part of the image should show grey square pavement tiles, while the upper part should show dark asphalt. The environment is clean, simple, and minimal.

Lighting should be soft natural overcast daylight with balanced exposure, gentle shadows, and realistic textures. The style should feel like a clean modern lifestyle/fashion editorial photo. High detail in the dog fur, leather jacket, pavement texture, glasses, and facial features. Nearly everything should remain in focus.

Important: preserve the top-down camera angle, the exact seated pose, the leg position, the hand placement, the centered composition, and the circular arrangement of the corgis as closely as possible.

Photorealistic, realistic anatomy, no duplicated dogs, no merged limbs, no extra paws or heads, no deformed animals, no text, no logos, no watermark.` },
  { t:'Метро', img:'assets/templates/photo/metro/cover.webp', type:'photo', category:'Женское', requiresImage:true, modelCode:'nano_banana_pro', qualityValue:'1K', inputLabel:'Фото лица девушки или по пояс', prompt:`Use the uploaded woman as a strict identity reference. Preserve her recognizable face, facial features, hairstyle, skin tone, visible silhouette, and overall appearance as accurately as the reference photo allows. Keep her clearly recognizable as the same person. Do not replace her face or identity.

Create a photorealistic vertical 3:4 high-fashion editorial subway portrait with the same framing, camera angle, and background style as the reference image.

The woman stands completely still on an underground subway platform, perfectly centered in the frame, facing directly toward the camera. Use a straight-on frontal camera angle at about chest-to-face level, not from above and not from below.

Preserve the shot size carefully: frame her as a medium portrait from the top of the head to around the waist. Do not show the full body. Her upper body should dominate the frame and fill most of the composition.

Her posture is rigid, upright, symmetrical, and motionless. Her arms hang naturally along her sides. Her expression is calm, cold, serious, emotionally distant, and controlled.

She wears narrow black sunglasses, layered delicate silver chain necklaces, a minimal black sleeveless fashion top that fully covers the torso, long black opera gloves, and loose grey tailored trousers visible only at the bottom edge of the crop. Her hair is dark, sleek, and tightly slicked back in a wet-look style. Add natural-looking freckles on her face, neck, shoulders, and visible arms while preserving the uploaded woman’s identity.

Behind her, a silver subway train rushes past at high speed, filling almost the entire background. The train must be strongly blurred with horizontal motion blur, with visible windows, metallic panels, and hints of signage or light streaks. The woman remains perfectly sharp and in focus, creating a strong contrast between her stillness and the speed of the moving train.

Use a cold urban color palette with blue-grey and metallic tones. The atmosphere should feel modern, cinematic, minimal, detached, and high-fashion. Lighting should be crisp and editorial, with detailed facial features, subtle highlights on the jewelry and gloves, and realistic subway reflections.

Important: preserve the medium portrait crop, not full body; preserve the centered composition; preserve the straight-on camera angle; preserve the subway train directly behind her; preserve the strong horizontal motion blur in the train while keeping the woman sharply in focus.

Photorealistic, realistic face detail, realistic fabric texture, detailed freckles, detailed jewelry, realistic subway motion blur, high contrast, no text, no logos, no watermark.` },
  { t:'Волк', img:'assets/templates/photo/wolf/cover.webp', type:'photo', category:'Животные', requiresImage:true, modelCode:'nano_banana_pro', qualityValue:'1K', inputLabel:'Фото лица девушки или по пояс', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible. Keep natural eye appearance, natural hair appearance, and do not add new tattoos or piercings.

Ultra-realistic gritty night flash photo of the same woman from the input image. Vertical 3:4 Scene: dark bedroom at night, messy bed with rumpled pale sheets. She is lying on the bed in a high-fashion pose. Her upper body is propped up on one elbow, shoulders angled toward the camera. The supporting arm is bent, hand near her jawline as if framing her face. Her other arm stretches across the bed, hand resting lightly on the sheets or near the wolf prop. One leg is bent at the knee and slightly raised, the other extended, creating elegant lines. She is close to the camera with an intense, editorial gaze — slightly tired but confident and powerful, like an after-party fashion snapshot. Next to her on the bed is a large black wolf prop / animatronic (clearly a staged photo prop, not attacking), mouth open showing teeth, dramatic but non-violent, posed as if protectively looming beside her. Outfit: sparkly silver sequin strapless bustier/top fully covering the chest, styled like an evening corset. It catches the flash with strong specular highlights. She may wear dark high-waisted shorts or underwear partly visible under the sheets. Hairstyle: sleek, damp styling, hair brushed back from the face with a clean center part, lengths falling naturally around the shoulders with soft separation, a few messy flyaways around the temples for a lived-in look. Makeup: bold editorial model makeup suited to night flash. Skin: medium-coverage base with natural texture still visible, semi matte finish with subtle sheen on high points. Strong sculpting contour under cheekbones and along the nose, warm blush on the apples of the cheeks. Eyes: smokey, slightly smudged look with dark eyeliner around the eyes, blended charcoal or deep brown shadow on the upper lid and lower lash line, a touch of metallic shimmer on the inner corners to catch the flash. Lashes thick and lengthened with mascara. Brows groomed and defined, keeping natural shape. Lips: full, over-defined lips in a muted rose or brown-nude satin shade, not glossy but catching a bit of light.

Lighting: harsh on-camera flash from the front, plus moody blue ambient lighting in the room. A cool blue fill or rim light leaks in from one side, tinting the sheets and edges of the wolf and casting subtle cyan highlights on her skin and hair. Deep shadows, dark background, strong specular highlights on sequins and the wolf prop, gritty magazine snapshot vibe.

CAMERA: point-and-shoot / early-2000s digicam look, 35mm equiv, f/2.8, 1/60s, ISO 1600, direct flash.

PROCESSING: cold blue tint overall, very high contrast, strongly underexposed background, very heavy analog-style film grain and digital noise across the entire image, clearly visible even in highlights, slight blur from movement, mild vignette, crunchy over-sharpened edges, raw imperfect aesthetic.` },
  { code:'camera-g7x', t:'Камера G7X', img:'assets/templates/photo/camera-g7x/cover.webp', type:'photo', category:'Эффекты', requiresImage:true, modelCode:'nano_banana_pro', qualityValue:'1K', inputLabel:'Любое фото', prompt:`Use the uploaded image as the main reference. Preserve the exact person, face, facial features, body shape, figure, proportions, pose, clothing, background, framing, and overall composition as accurately as possible. Keep the subject fully recognizable as the same person. Do not change the person, do not replace the face or body, and do not redesign the scene. Apply only the visual style described below.

Apply a photorealistic Canon PowerShot G7X Mark III signature look to the uploaded image. Create a 1-inch sensor creamy bokeh feel, f/1.8–2.8 24–100mm lens look, and a built-in flash pop directly on the skin for a flattering glow and specular highlights. Make the background slightly underexposed, dark, and softly blurred, around -1.3 to -2 EV. Give the skin soft warm tones with golden-hour peach undertones, translucent pores, and a subtle natural oil sheen. Use low-contrast natural SOOC-style grading, creamy colors with no harsh saturation, subtle low film grain, and a dreamy haze glow around the subject. Create shallow depth-of-field portrait perfection with a trendy 2025 vlog / Instagram aesthetic. Keep the result hyper-real but with organic imperfections and a professional human photo vibe.` },
  { code:'cinematic-portrait', t:'Кино-портрет', coverVideo:'assets/templates/photo/cinematic-portrait/cover.mp4', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Улучшите портрет, полностью сохранив индивидуальность модели, геометрию лица, его выразительность и индивидуальность. Допускайте только незначительные уточнения, не изменяя черт лица. Сохраняйте фон на 100% идентичным — никаких замен, дополнений или изменений. Повторный рендеринг, как при съемке на Sony A1 с объективом 85 мм f/1.4 (f/1.6, ISO 100, 1/200), с кинематографической малой глубиной резкости, четким фокусом на лице и нейтральным цветовым профилем. Подбирайте оригинальное направление освещения и настроение, усиливая его мягким направленным светом, теплыми бликами, холодными тенями, более глубоким контрастом, широким динамическим диапазоном, естественной микроконтрастностью и плавными тональными переходами. Сохраняйте реалистичную текстуру кожи, естественные цвета, тонкую зернистость пленки и оригинальную атмосферу. Увеличьте реалистичность, глубину и детализацию без изменения сцены. Никаких изменений фона, изменения формы лица, искусственного свечения, резкого или ровного освещения, искусственной кожи или чрезмерного сглаживания. Кинематографическое качество изображения в формате 4K.@Создать изображение` },
  { code:'pixar-caricature', t:'3D карикатура', coverVideo:'assets/templates/photo/pixar-caricature/cover.mp4', type:'photo', category:'Персонажи', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Используй загруженное фото. Реальный человек остаётся полностью без изменений — точное лицо, волосы, кожа, одежда, поза, фон, освещение, кадрирование. Ничего не менять.

Рядом с ним разместить премиум 3D-карикатуру в стиле Pixar того же человека. Высота — до плеча. Большие выразительные глаза, слегка увеличенная голова, элегантные пропорции. Карикатура слегка касается его плеча. Тёплое, естественное взаимодействие — без объятий, без держания за руки.

То же освещение, та же сцена, бесшовная интеграция. Ультрадетализация, 8K, кинематографическое качество.

Негатив: Funko Pop, чиби, игрушка, маскот, пластик, изменённый реальный человек, висящая в воздухе фигура, низкое качество.` },
  { code:'anime-movie-frame', t:'Аниме-кадр', coverVideo:'assets/templates/photo/anime-movie-frame/cover.mp4', type:'photo', category:'Стили', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Transform the uploaded photo into a cinematic Japanese anime film frame while preserving the original composition, pose, camera angle, perspective, environment, and storytelling.

Keep the character instantly recognizable with refined anime proportions, expressive eyes, natural-looking hair, detailed clothing, and rich facial expressions.

Use clean anime line art, cinematic shadows, soft gradients, subtle rim lighting, warm color grading, and premium hand-painted textures.

Add gentle environmental motion such as flowing hair, moving clothes, floating dust particles, drifting leaves, soft atmospheric haze, and volumetric sun rays.

Reimagine the entire scene as a high-budget theatrical anime movie with stunning background art, immersive lighting, and exceptional detail.

Final result: an official-looking frame from a world-class Japanese animated feature film, elegant, atmospheric, cinematic, ultra-detailed, 8K.

Negative prompt: low quality, blurry, CGI, plastic, 3D render, chibi, cartoon, comic style, distorted anatomy, extra limbs, violence, explosions, destruction, speed lines.` },
  { code:'claymation-portrait', t:'Пластилин', coverVideo:'assets/templates/photo/claymation-portrait/cover.mp4', type:'photo', category:'Стили', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Transform the uploaded photo into an absurd stop-motion clay animation inspired by classic British claymation.

Preserve the original composition exactly: same framing, pose, facial expression, clothing, camera angle, lighting, perspective, and background.

Turn every subject into a handcrafted clay character with exaggerated caricature features: oversized asymmetrical eyes, huge mouth, chunky teeth, visible pink gums, expressive eyebrows, slightly distorted proportions, and humorous facial expressions.

Use heavy matte modeling clay with visible fingerprints, sculpting marks, tiny cracks, dents, rough handmade imperfections, and slightly uneven geometry to emphasize the handcrafted stop-motion look.

Soft studio lighting, macro depth of field, cinematic color grading, ultra-detailed textures, realistic clay materials, premium stop-motion aesthetic, 8K.

Negative prompt: CGI plastic, glossy surface, realistic human skin, anime, Pixar, smooth textures, low quality, blurry, extra limbs, distorted anatomy, watermark, text.` },
  { code:'age-timeline', t:'Лента возраста', coverVideo:'assets/templates/photo/age-timeline/cover.mp4', type:'photo', category:'Портрет', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Create a hyper-realistic chronological portrait of the same person shown at ages 5, 12, 25, 40, and 65, arranged from left to right.

Maintain perfect identity across every age: identical facial bone structure, proportions, skin characteristics, facial features, and expression, showing only natural biological aging. The person should remain instantly recognizable at every stage.

Use a clean dark gradient background with cinematic side and top lighting, placing all versions in one seamless shared environment.

Dress each version in age-appropriate clothing while preserving a consistent visual style.

Compose the image like a premium editorial portrait with subtle perspective, soft depth of field, and a faint curved arrow suggesting the passage of time.

Ultra-realistic skin textures, natural aging details, cinematic shadows, realistic reflections, premium color grading, ultra-detailed, photorealistic, 8K, vertical 3:4 composition, centered layout.

Negative prompt: different person, face swap, inconsistent identity, duplicate faces, exaggerated aging, cartoon, CGI, low quality, blurry, distorted anatomy, extra limbs, text, watermark.` },
  { code:'lego-minifigure', t:'LEGO-фигурка', coverVideo:'assets/templates/photo/lego-minifigure/cover.mp4', type:'photo', category:'Персонажи', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Преобразуйте людей на изображении в точные фигурки Lego Minifigure. Сохраните выражение лица, позу, прическу, аксессуары и фоновую сцену максимально близко к оригиналу.

Технические характеристики фигурки: крупная цилиндрическая голова с плоским верхом и характерным стабом, круглые руки-крюки без пальцев, блочное прямоугольное тело с горизонтальным стыком на талии, квадратные ступни. Кожа, одежда и аксессуары — матовый ABS-пластик с легким глянцем. Детали одежды — плоская 2D-печать прямо на корпусе фигурки, не объёмная лепка.

Рендер: фотореалистичный 3D, мягкое студийное освещение с небольшими тенями, макро-съёмка с боке на фоне, резкость на фигурке. Финальный результат — будто реальная коллекционная LEGO-фигурка сфотографирована в студии на оригинальном фоне из референса.` },
  { code:'skin-retouch', t:'Ретушь кожи', coverVideo:'assets/templates/photo/skin-retouch/cover.mp4', type:'photo', category:'Портрет', requiresImage:true, inputLabel:'Любое фото', modelCode:'gpt_image_2_edit', qualityValue:'low', prompt:`Skin enhancement retouch, preserve original identity and structure, refine skin texture without smoothing, maintain pores, freckles, and natural variation, reduce temporary blemishes and redness only, even out tone subtly without flattening depth, retain natural highlights and shadow transitions, keep under-eye detail intact with slight softening not removal, avoid plastic or airbrushed finish, maintain original lighting and color balance, enhance micro-contrast for realistic texture, lips and eyes untouched except for natural clarity, no reshaping of facial features, no artificial glow, no over-sharpening, seamless integration with original image, invisible edit with high realism.` },
]).map(function(t) {
  if (t && t.code === 'catastrophic-love') {
    t = Object.assign({}, t, {
      templatePipeline:'seedance_gpt_image_reference_sheet_v1',
      referencePrepCredits:110,
      qualityLocked:false,
      aspectLocked:false,
    });
  }
  if (!t || t.type !== 'photo') return t;
  return Object.assign({}, t, {
    aspectId: t.aspectId || '3:4',
    aspectLocked: t.aspectLocked !== false,
  });
});
const CREATE_TPL = TEMPLATES.slice();

/* ---- favorites (shared between mobile & desktop) ---- */
function tplKey(t) { return (t && (t.code || t.t)) || ''; }
const MOB_FAV_KEY = 'hbx_mob_favorite_templates_v1';
function defaultFavTemplateKeys() {
  return TEMPLATES.slice(0, 4).map(tplKey);
}
function readFavTemplateKeys() {
  try {
    var raw = localStorage.getItem(MOB_FAV_KEY);
    if (!raw) return defaultFavTemplateKeys();
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : defaultFavTemplateKeys();
  } catch (e) { return defaultFavTemplateKeys(); }
}
function writeFavTemplateKeys(keys) {
  try { localStorage.setItem(MOB_FAV_KEY, JSON.stringify(keys || [])); } catch (e) {}
}
function videoFormatPrompt(aspectId) {
  var descriptions = {
    '1:1':'Square 1:1 video, balanced centered framing.',
    '2:3':'Vertical portrait 2:3 video, full-height composition.',
    '3:4':'Vertical portrait 3:4 video, portrait composition.',
    '4:5':'Vertical portrait 4:5 video, social-feed composition.',
    '3:2':'Horizontal landscape 3:2 video, wide composition.',
    '4:3':'Horizontal landscape 4:3 video, classic composition.',
    '5:4':'Horizontal landscape 5:4 video, compact wide composition.',
    '9:16':'Vertical smartphone video, 9:16 portrait framing.',
    '16:9':'Horizontal widescreen video, 16:9 landscape framing.',
    '21:9':'Ultra-wide cinematic video, 21:9 framing.'
  };
  return descriptions[String(aspectId)] || ('Video aspect ratio ' + String(aspectId || 'auto') + '.');
}
function templatePromptForOutput(t, aspectId, quality) {
  var prompt = String((t && t.prompt) || '');
  return prompt
    .replace(/\{\{VIDEO_FORMAT\}\}/g, videoFormatPrompt(aspectId))
    .replace(/\{\{VIDEO_QUALITY\}\}/g, 'Output resolution: ' + String(quality || 'provider default') + '.');
}
const MODELS = [
  { id:'gpt', t:'GPT Image 2', s:'Генерация текста' },
  { id:'nano', t:'Nano Banana', s:'Базовая' },
  { id:'nanopro', t:'Nano Banana Pro', s:'Pro' },
  { id:'qwen', t:'Qwen', s:'Творческая свобода' },
  { id:'seed', t:'Seedream 4.5', s:'Похожесть лица' },
];
const ASPECTS = [
  { id:'1:1', t:'1:1', s:'Квадрат', preview:'1 / 1' },
  { id:'2:3', t:'2:3', s:'Портрет', preview:'2 / 3' },
  { id:'3:4', t:'3:4', s:'Портрет', preview:'3 / 4' },
  { id:'4:5', t:'4:5', s:'Портрет', preview:'4 / 5' },
  { id:'3:2', t:'3:2', s:'Альбом', preview:'3 / 2' },
  { id:'4:3', t:'4:3', s:'Альбом', preview:'4 / 3' },
  { id:'5:4', t:'5:4', s:'Альбом', preview:'5 / 4' },
  { id:'9:16', t:'9:16', s:'Сторис', preview:'9 / 16' },
  { id:'16:9', t:'16:9', s:'Широкий', preview:'16 / 9' },
  { id:'21:9', t:'21:9', s:'Кино', preview:'21 / 9' },
];

window.MiraCore = { Ic, Star, TokenBadge, TopNav, HxSheet, TemplateMedia, TEMPLATES, CREATE_TPL, MODELS, ASPECTS, FALLBACK_MODELS, mergeModelCatalog, initialModelCatalog, persistModelCatalog, computeGenerationPrice, tplKey, MOB_FAV_KEY, defaultFavTemplateKeys, readFavTemplateKeys, writeFavTemplateKeys, writePriceTrace, isInsufficientBalanceError, templatePromptForOutput };
