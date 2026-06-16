/* ============================================================
   Hubicx — Desktop (PC) screens
   Loaded only in desktop.html, before ma-app.jsx.
   Uses globals from ma-core (useState/useEffect/useRef, MiraCore)
   and window.HubicxApi. Mobile screens are untouched.
   ============================================================ */

/* ---- template catalog (photo / video) ---- */
const DESK_TPL = [
  { t:'Полароид с вечеринки', img:'assets/templates/photo/polaroid-party/cover.jpg', type:'photo', category:'Женское', requiresImage:true, inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

A physical Polaroid photograph lying on a messy party table. In the photo: a close-up of the woman's face, she is sticking out her tongue playfully, and a friend's hand is drawing the number "30" on her cheek with bright blue glitter gel. She wears butterfly hair clips and small silver hoop earrings. The photo itself has the classic white border, slightly off-center. Around the Polaroid: spilled glitter, a lipstick mark, a disposable camera, and a rhinestone-studded Motorola Razr phone. Style: authentic, candid, nostalgic party snapshot. Preserve her genuine, playful expression.` },
  { t:'Розы', img:'assets/templates/photo/roses/cover.jpg', type:'photo', category:'Женское', requiresImage:true, inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

Create a glamorous romantic editorial photo from a high overhead top-down angle. The woman is sitting on a dark wooden floor, centered in the frame, surrounded tightly by many large lush bouquets of red and white roses arranged all around her in a luxurious decorative composition. She is wearing a black satin slip dress with thin spaghetti straps, elegant and form-fitting. Her pose is calm and feminine: seated on the floor, body facing forward, hands placed near her sides on the floor, head tilted slightly upward toward the camera. She is looking directly into the camera with a soft, calm, slightly dreamy and serious expression. Lighting should look like direct camera flash photography: bright frontal flash, crisp details, soft shadows, glossy highlights on the dress, high contrast, clean skin, and a stylish luxury bouquet aesthetic. The composition should feel symmetrical, rich, romantic, and visually dense with roses filling the frame. Keep the mood elegant, luxurious, and romantic. Make it look like a real flash photo taken at a celebration or intimate luxury event.` },
  { t:'Розы с корги', img:'assets/templates/photo/roses-corgi/cover.jpg', type:'photo', category:'Животные', requiresImage:true, inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

Create a photorealistic vertical 3:4 lifestyle editorial photo with the exact same pose and camera angle as the reference composition. The camera must be placed almost directly overhead in a true bird’s-eye / top-down perspective, looking straight down at the woman. Preserve the pose and framing as closely as possible.

The woman is seated on a grey tiled sidewalk near the boundary where the tiled pavement meets dark asphalt. Her body is centered in the frame. She is looking straight up into the camera. Her legs are bent, knees opened outward, with both feet positioned toward the upper part of the frame. Her arms extend downward with both palms resting flat on the tiled ground near the bottom of the frame. Keep this pose very accurately.

She wears a dark brown leather jacket with realistic leather texture, a white top underneath, white trousers, brown leather shoes, and large transparent-frame glasses. Her hair is blonde, smooth, center-parted, with one loose strand falling across her face. Her expression is calm, soft, and slightly playful.

Place a large brown leather tote bag on the ground to the woman’s right side, close to her hip and arm.

Surround the woman with many Pembroke Welsh Corgis arranged in a tight circular ring around her body. The dogs should closely match the reference composition: compact corgi bodies, upright ears, short legs, mostly red-and-white coats with a few darker tricolor corgis. The corgis are positioned evenly around her, filling the perimeter of the frame. Most of them are looking up toward the camera, while some are looking toward the woman. Keep the arrangement dense, balanced, and visually similar to the reference.

The lower part of the image should show grey square pavement tiles, while the upper part should show dark asphalt. The environment is clean, simple, and minimal.

Lighting should be soft natural overcast daylight with balanced exposure, gentle shadows, and realistic textures. The style should feel like a clean modern lifestyle/fashion editorial photo. High detail in the dog fur, leather jacket, pavement texture, glasses, and facial features. Nearly everything should remain in focus.

Important: preserve the top-down camera angle, the exact seated pose, the leg position, the hand placement, the centered composition, and the circular arrangement of the corgis as closely as possible.

Photorealistic, realistic anatomy, no duplicated dogs, no merged limbs, no extra paws or heads, no deformed animals, no text, no logos, no watermark.` },
  { t:'Метро', img:'assets/templates/photo/metro/cover.jpg', type:'photo', category:'Женское', requiresImage:true, inputLabel:'Фото лица девушки или по пояс', prompt:`Use the uploaded woman as a strict identity reference. Preserve her recognizable face, facial features, hairstyle, skin tone, visible silhouette, and overall appearance as accurately as the reference photo allows. Keep her clearly recognizable as the same person. Do not replace her face or identity.

Create a photorealistic vertical 3:4 high-fashion editorial subway portrait with the same framing, camera angle, and background style as the reference image.

The woman stands completely still on an underground subway platform, perfectly centered in the frame, facing directly toward the camera. Use a straight-on frontal camera angle at about chest-to-face level, not from above and not from below.

Preserve the shot size carefully: frame her as a medium portrait from the top of the head to around the waist. Do not show the full body. Her upper body should dominate the frame and fill most of the composition.

Her posture is rigid, upright, symmetrical, and motionless. Her arms hang naturally along her sides. Her expression is calm, cold, serious, emotionally distant, and controlled.

She wears narrow black sunglasses, layered delicate silver chain necklaces, a minimal black sleeveless fashion top that fully covers the torso, long black opera gloves, and loose grey tailored trousers visible only at the bottom edge of the crop. Her hair is dark, sleek, and tightly slicked back in a wet-look style. Add natural-looking freckles on her face, neck, shoulders, and visible arms while preserving the uploaded woman’s identity.

Behind her, a silver subway train rushes past at high speed, filling almost the entire background. The train must be strongly blurred with horizontal motion blur, with visible windows, metallic panels, and hints of signage or light streaks. The woman remains perfectly sharp and in focus, creating a strong contrast between her stillness and the speed of the moving train.

Use a cold urban color palette with blue-grey and metallic tones. The atmosphere should feel modern, cinematic, minimal, detached, and high-fashion. Lighting should be crisp and editorial, with detailed facial features, subtle highlights on the jewelry and gloves, and realistic subway reflections.

Important: preserve the medium portrait crop, not full body; preserve the centered composition; preserve the straight-on camera angle; preserve the subway train directly behind her; preserve the strong horizontal motion blur in the train while keeping the woman sharply in focus.

Photorealistic, realistic face detail, realistic fabric texture, detailed freckles, detailed jewelry, realistic subway motion blur, high contrast, no text, no logos, no watermark.` },
  { t:'Волк', img:'assets/templates/photo/wolf/cover.jpg', type:'photo', category:'Животные', requiresImage:true, inputLabel:'Фото лица девушки или по пояс', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible. Keep natural eye appearance, natural hair appearance, and do not add new tattoos or piercings.

Ultra-realistic gritty night flash photo of the same woman from the input image. Vertical 3:4 Scene: dark bedroom at night, messy bed with rumpled pale sheets. She is lying on the bed in a high-fashion pose. Her upper body is propped up on one elbow, shoulders angled toward the camera. The supporting arm is bent, hand near her jawline as if framing her face. Her other arm stretches across the bed, hand resting lightly on the sheets or near the wolf prop. One leg is bent at the knee and slightly raised, the other extended, creating elegant lines. She is close to the camera with an intense, editorial gaze — slightly tired but confident and powerful, like an after-party fashion snapshot. Next to her on the bed is a large black wolf prop / animatronic (clearly a staged photo prop, not attacking), mouth open showing teeth, dramatic but non-violent, posed as if protectively looming beside her. Outfit: sparkly silver sequin strapless bustier/top fully covering the chest, styled like an evening corset. It catches the flash with strong specular highlights. She may wear dark high-waisted shorts or underwear partly visible under the sheets. Hairstyle: sleek, damp styling, hair brushed back from the face with a clean center part, lengths falling naturally around the shoulders with soft separation, a few messy flyaways around the temples for a lived-in look. Makeup: bold editorial model makeup suited to night flash. Skin: medium-coverage base with natural texture still visible, semi matte finish with subtle sheen on high points. Strong sculpting contour under cheekbones and along the nose, warm blush on the apples of the cheeks. Eyes: smokey, slightly smudged look with dark eyeliner around the eyes, blended charcoal or deep brown shadow on the upper lid and lower lash line, a touch of metallic shimmer on the inner corners to catch the flash. Lashes thick and lengthened with mascara. Brows groomed and defined, keeping natural shape. Lips: full, over-defined lips in a muted rose or brown-nude satin shade, not glossy but catching a bit of light.

Lighting: harsh on-camera flash from the front, plus moody blue ambient lighting in the room. A cool blue fill or rim light leaks in from one side, tinting the sheets and edges of the wolf and casting subtle cyan highlights on her skin and hair. Deep shadows, dark background, strong specular highlights on sequins and the wolf prop, gritty magazine snapshot vibe.

CAMERA: point-and-shoot / early-2000s digicam look, 35mm equiv, f/2.8, 1/60s, ISO 1600, direct flash.

PROCESSING: cold blue tint overall, very high contrast, strongly underexposed background, very heavy analog-style film grain and digital noise across the entire image, clearly visible even in highlights, slight blur from movement, mild vignette, crunchy over-sharpened edges, raw imperfect aesthetic.` },
  { code:'camera-g7x', t:'Камера G7X', img:'assets/templates/photo/camera-g7x/cover.gif', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', prompt:`Use the uploaded image as the main reference. Preserve the exact person, face, facial features, body shape, figure, proportions, pose, clothing, background, framing, and overall composition as accurately as possible. Keep the subject fully recognizable as the same person. Do not change the person, do not replace the face or body, and do not redesign the scene. Apply only the visual style described below.

Apply a photorealistic Canon PowerShot G7X Mark III signature look to the uploaded image. Create a 1-inch sensor creamy bokeh feel, f/1.8–2.8 24–100mm lens look, and a built-in flash pop directly on the skin for a flattering glow and specular highlights. Make the background slightly underexposed, dark, and softly blurred, around -1.3 to -2 EV. Give the skin soft warm tones with golden-hour peach undertones, translucent pores, and a subtle natural oil sheen. Use low-contrast natural SOOC-style grading, creamy colors with no harsh saturation, subtle low film grain, and a dreamy haze glow around the subject. Create shallow depth-of-field portrait perfection with a trendy 2025 vlog / Instagram aesthetic. Keep the result hyper-real but with organic imperfections and a professional human photo vibe.` },
];

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
      <div className="dk-auth-brand"><div className="dk-logo">✦</div><div className="dk-word">Hubicx</div></div>
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
      <div className="dk-auth-note">Уже пользуетесь ботом в Telegram? Откройте «Настройки → Привязать email», чтобы входить с тем же балансом.</div>
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
  const [apiModels, setApiModels] = useState([]);
  const [modelCode, setModelCode] = useState(null);
  const [aspectId, setAspectId] = useState('2:3');
  const [qualityValue, setQualityValue] = useState(null);
  const [batchCount, setBatchCount] = useState(1);
  const [open, setOpen] = useState(null); // 'model' | 'aspect'
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
  var modelLabel = curModel ? curModel.title : 'Seedream 4.5';
  var aspectOpts = getAspectOptionsForModel(curModel, ASPECTS);
  var aspectObj = aspectOpts.find(function(a) { return a.id === aspectId; }) || aspectOpts[0] || ASPECTS[1];
  var qField = getQualityField(curModel);
  var qOptions = fieldOptions(qField);
  var qValue = qField ? (qOptions.some(function(o) { return String(o) === String(qualityValue); }) ? qualityValue : fieldDefault(qField)) : null;
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
    { t:'История', s:'Ваши результаты', ic:'history', bg:'#eef0e8', c:'#7f8d73', go:() => onHistory && onHistory() },
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
                      onClick={() => { setModelCode(m.code); setQualityValue(null); setOpen(null); }}>
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
              {aspectOpts.map(function(a) {
                return <div key={a.id} className={'dk-ask-opt' + (a.id === aspectId ? ' on' : '')}
                  onClick={() => { setAspectId(a.id); setOpen(null); }}>
                  <span>{a.t}</span><span className="dk-ask-opt-p">{a.s}</span>
                </div>;
              })}
            </div>}
          </div>
          {qField && <div className="dk-ask-pill-wrap">
            <button className={'dk-ask-pill' + (open === 'quality' ? ' on' : '')}
              onClick={() => setOpen(open === 'quality' ? null : 'quality')}>
              <Ic n="sparkle" s={14}/> {prettyOption(qValue)} <Ic n="chev" s={13}/>
            </button>
            {open === 'quality' && <div className="dk-ask-menu">
              {qOptions.map(function(o) {
                return <div key={String(o)} className={'dk-ask-opt' + (String(o) === String(qValue) ? ' on' : '')}
                  onClick={() => { setQualityValue(o); setOpen(null); }}>
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

    <div className="dk-acts dk-home-acts">
      {acts.map(function(a, i) {
        return <div key={i} className="dk-act" onClick={a.go}>
          <div className="dk-act-ic" style={{ background:a.bg }}><Ic n={a.ic} s={22} c={a.c}/></div>
          <div className="dk-act-t">{a.t}</div>
          <div className="dk-act-s">{a.s}</div>
        </div>;
      })}
    </div>
    </div>

    <div className="dk-sec">
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
  const { Ic } = window.MiraCore;
  return <div className="dk-tpl" onClick={onClick}>
    <div className="dk-tpl-img">
      <img src={t.img} alt="" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }}/>
      <div className="dk-tpl-badge">{t.type === 'video' ? <Ic n="video" s={13} c="#fff"/> : <Ic n="image" s={13} c="#fff"/>}</div>
      <button className={'dk-tpl-fav' + (fav ? ' on' : '')} title={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
        onClick={function(e) { e.stopPropagation(); if (onFav) onFav(t); }}><Ic n="heart" s={32} c="currentColor"/></button>
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
  const [apiModels, setApiModels] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [selectedModelCode, setSelectedModelCode] = useState(initModelCode || (initTpl ? templateModelCode(initTpl) : null));
  const [selectedAspect, setSelectedAspect] = useState(
    (initAspectId && ASPECTS.find(function(a) { return a.id === initAspectId; })) || ASPECTS[1]);
  const [selectedQuality, setSelectedQuality] = useState(initQualityValue || null);
  const [batchCount, setBatchCount] = useState(initBatchCount || 1);
  const [open, setOpen] = useState(null); // 'model' | 'aspect'
  const [tab, setTab] = useState(initTpl ? 'tpl' : (initPrompt ? 'prompt' : 'tpl'));
  const [selTpl, setSelTpl] = useState(initTpl ? initTpl.t : null);
  const [templateLocked, setTemplateLocked] = useState(!!initTpl);
  const [prompt, setPrompt] = useState(initPrompt || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  const fileRef = useRef(null);

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
  const modelOpts = filtered.map(function(m) {
    return { id:m.code, t:m.title, s:(m.description || m.category || '') + ' · ' + m.price_credits + ' ★' };
  });
  var curCode = selectedModelCode || (filtered[0] && filtered[0].code);
  var curModel = filtered.find(function(m) { return m.code === curCode; }) || filtered[0];
  var curOpt = modelOpts.find(function(m) { return m.id === curCode; }) || modelOpts[0];
  var aspectOpts = getAspectOptionsForModel(curModel, ASPECTS);
  var selectedAspectSafe = aspectOpts.find(function(a) { return selectedAspect && a.id === selectedAspect.id; }) || aspectOpts[0] || selectedAspect;
  var qField = getQualityField(curModel);
  var qOptions = fieldOptions(qField);
  var qValue = qField ? (qOptions.some(function(o) { return String(o) === String(selectedQuality); }) ? selectedQuality : (initQualityField === qField.name && initQualityValue != null ? initQualityValue : fieldDefault(qField))) : null;
  var priceInputs = {};
  if (qField && qValue != null) priceInputs[qField.name] = qValue;
  var onePrice = curModel ? estimateModelPrice(curModel, priceInputs) : (mode === 'video' ? 5 : 2);
  var price = Math.max(1, onePrice * batchCount);

  const handleFile = function(file) {
    if (!file || uploading || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    setUploading(true);
    var preview = URL.createObjectURL(file);
    window.HubicxApi.uploadFile(file).then(function(data) {
      setUploadedFile({ url:data.url, file_id:data.file_id, preview:preview }); setUploading(false);
    }).catch(function(e) { setUploading(false); setUploadedFile(null); alert((e && e.message) || 'Ошибка загрузки'); });
  };

  var favSet = new Set(favTplKeys);
  const toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  var tplList = DESK_TPL.filter(function(t) {
    return (mode === 'video' ? t.type === 'video' : t.type === 'photo') && favSet.has(tplKey(t)) && matchesTplSearch(t, searchQuery);
  });
  var selectedTpl = DESK_TPL.find(function(t) { return t.t === selTpl; }) || null;
  var hasText = (tab === 'tpl' && selTpl) || (tab === 'prompt' && prompt.trim().length > 0);
  var needsTplImage = tab === 'tpl' && selectedTpl && selectedTpl.requiresImage;
  var ready = (hasText && (!needsTplImage || !!uploadedFile)) || (mode === 'video' && !!uploadedFile);

  const pickTemplate = function(t) {
    setTab('tpl'); setSelTpl(t.t); setMode(t.type === 'video' ? 'video' : 'photo');
    setSelectedModelCode(templateModelCode(t)); setSelectedQuality(null); setTemplateLocked(true); setOpen(null);
  };
  const clearTemplate = function() {
    setSelTpl(null); setTemplateLocked(false); setTab('prompt'); setPrompt(''); setSelectedModelCode(null); setSelectedQuality(null); setOpen(null);
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
    if (uploadedFile) {
      var imageField = getModelField(curModel, ['image_urls', 'image_url']);
      if (imageField && imageField.type === 'files' && uploadedFile.file_id) inputs[imageField.name] = [uploadedFile.file_id];
      else if (imageField && imageField.type === 'file' && uploadedFile.file_id) inputs[imageField.name] = uploadedFile.file_id;
    }
    if (qField && qValue != null) inputs[qField.name] = qValue;
    var finalPrompt = (tab === 'prompt' ? prompt.trim() : ((selectedTpl && selectedTpl.prompt) || selTpl)) || null;
    var makePayload = function() { return {
      model_code: curModel.code,
      prompt: finalPrompt,
      input_file_url: uploadedFile ? uploadedFile.url : null,
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
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setSelectedModelCode(null); setSelectedQuality(null); setSelTpl(null); setTemplateLocked(false); }}><Ic n="image" s={17}/> Фото</button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setSelectedModelCode(null); setSelectedQuality(null); setSelTpl(null); setTemplateLocked(false); }}><Ic n="video" s={17}/> Видео</button>
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
                  <div className="dk-drop-t">{needsTplImage && selectedTpl ? selectedTpl.inputLabel : (mode === 'photo' ? 'Загрузите фото' : 'Загрузите фото для видео')}</div>
                  <div className="dk-drop-s">Перетащите или выберите файл</div></>}
          </div>}

      <div className="dk-seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={() => { setTab('prompt'); setSelTpl(null); setTemplateLocked(false); }}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <React.Fragment>
          {selectedTpl && <div className="dk-template-selected">
            <img src={selectedTpl.img} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>
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
                <img src={t.img} alt="" onError={(e) => { e.target.style.visibility = 'hidden'; }}/>
                <button className="dk-gen-tpl-fav on" title="Убрать из избранного" onClick={function(e) { e.stopPropagation(); toggleFavTpl(t); if (selTpl === t.t) setSelTpl(null); }}><Ic n="heart" s={32} c="currentColor"/></button>
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
            <div className="dk-row-v">{!modelsLoaded ? 'Загрузка…' : curOpt ? curOpt.t + ' · ' + price + ' ★' : 'Нет моделей'}</div></div>
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
              <div className="dk-row-v">{prettyOption(qValue)}</div></div>
            <span className="chev"><Ic n="chev" s={19}/></span>
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
            <div className="dk-row-v">{selectedAspectSafe.t} · {selectedAspectSafe.s}</div></div>
          <span className="chev"><Ic n="chev" s={19}/></span>
        </div>
        {open === 'model' && !templateLocked && <DeskFloatingPicker kind="model"
          options={modelOpts.map(function(o){ return { id:o.id, title:o.t, sub:o.s }; })} current={curCode}
          onPick={function(id){ setSelectedModelCode(id); setSelectedQuality(null); setOpen(null); }}/>} 
        {open === 'quality' && qField && <DeskFloatingPicker kind="quality"
          options={qOptions.map(function(o){ return { id:String(o), title:prettyOption(o), sub:qField.label || 'Качество' }; })} current={String(qValue)}
          onPick={function(id){ var opt = qOptions.find(function(o){ return String(o) === String(id); }); setSelectedQuality(opt != null ? opt : id); setOpen(null); }}/>} 
        {open === 'batch' && <DeskFloatingPicker kind="batch"
          options={[1,2,4].map(function(n){ return { id:String(n), title:String(n) + (n === 1 ? ' генерация' : ' генерации'), sub:(onePrice * n) + ' ★' }; })} current={String(batchCount)}
          onPick={function(id){ setBatchCount(Number(id) || 1); setOpen(null); }}/>} 
        {open === 'aspect' && <DeskFloatingPicker kind="aspect"
          options={aspectOpts.map(function(a){ return { id:a.id, title:a.t, sub:a.s }; })} current={selectedAspectSafe.id}
          onPick={function(id){ var a = aspectOpts.find(function(x){return x.id===id;}); if (a) setSelectedAspect(a); setOpen(null); }}/>} 
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
  const list = DESK_TPL.filter(function(t) { return (filter === 'all' || t.type === filter) && matchesTplSearch(t, searchQuery); });
  return <div className="dk-page dk-templates-page">
    <div className="dk-tpl-tabs">
      {[['all','Все'],['photo','Фото'],['video','Видео']].map(function(f) {
        return <button key={f[0]} className={'dk-tpl-tab' + (filter === f[0] ? ' on' : '')} onClick={() => setFilter(f[0])}>{f[1]}</button>;
      })}
    </div>
    <div className="dk-tpl-grid wide">
      {list.map(function(t, i) { return <DeskTplCard key={i} t={t} fav={favSet.has(tplKey(t))} onFav={toggleFavTpl} onClick={() => onTemplate(t)}/>; })}
      {list.length === 0 && <div className="dk-gen-tpl-empty">Ничего не найдено</div>}
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

/* ---- link-email modal (Telegram ↔ desktop account) ----
   mode='create' → set a new email+password on this Telegram account (linkEmail)
   mode='merge'  → connect an account already registered on the website (linkTelegram) */
function DeskLinkEmail({ mode, onClose, onLinked }) {
  const { Ic } = window.MiraCore;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const isMerge = mode === 'merge';

  const submit = function() {
    var em = email.trim();
    if (!em || password.length < 6) { setErr('Email и пароль (от 6 символов)'); return; }
    setBusy(true); setErr('');
    var p = isMerge ? window.HubicxApi.linkTelegram(em, password) : window.HubicxApi.linkEmail(em, password);
    p.then(function(u) { setBusy(false); setDone(true); if (onLinked) onLinked(u && u.user ? u.user : u); })
      .catch(function(e) { setBusy(false); setErr((e && e.message) || 'Не удалось привязать'); });
  };

  return <div className="dk-modal-ov" onClick={onClose}>
    <div className="dk-modal" style={{ maxWidth:440 }} onClick={e => e.stopPropagation()}>
      <button className="dk-modal-x" onClick={onClose}><Ic n="close" s={18}/></button>
      <div className="dk-modal-title">{isMerge ? 'Войти в аккаунт сайта' : 'Привязать email'}</div>
      <div className="dk-modal-sub">{isMerge
        ? 'Введите email и пароль аккаунта, который вы создали на сайте — балансы объединятся.'
        : 'Задайте email и пароль, чтобы входить с компьютера с тем же балансом.'}</div>
      {done
        ? <div className="dk-refund" style={{ marginTop:20 }}>✓ Готово. Аккаунты связаны.</div>
        : <>
          <div className="dk-auth-fields" style={{ marginTop:18 }}>
            <input className="dk-auth-in" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
            <input className="dk-auth-in" type="password" placeholder="Пароль (от 6 символов)" value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
          {err && <div className="dk-pay-err" style={{ textAlign:'left', marginTop:12 }}>{err}</div>}
          <button className="dk-cta" style={{ marginTop:16 }} disabled={busy} onClick={submit}>{busy ? 'Сохраняем…' : (isMerge ? 'Связать аккаунты' : 'Привязать')}</button>
        </>}
    </div>
  </div>;
}

/* ============================================================
   Профиль (dashboard)
   ============================================================ */
function DeskProfile({ tokens, user, onTopup, onSettings }) {
  const { Ic, Star } = window.MiraCore;
  const [linkMode, setLinkMode] = useState(null); // null | 'create' | 'merge'
  const isTelegram = window.HubicxApi && window.HubicxApi.isTelegram();
  const hasPassword = user && user.has_password;
  const logout = function() { if (window.HubicxApi) window.HubicxApi.logout(); window.location.reload(); };
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

      <div className="dk-card dk-pad">
        <div className="dk-side-h"><Ic n="user" s={17} c="var(--muted)"/> Аккаунт</div>
        {user && user.email && <div className="dk-kv"><span>Email</span><b>{user.email}</b></div>}
        {isTelegram && !hasPassword && <>
          <div className="dk-side-note" style={{ marginTop:0, marginBottom:10, textAlign:'left' }}>Привяжите email, чтобы входить с компьютера с тем же балансом.</div>
          <button className="dk-btn-sec" style={{ width:'100%' }} onClick={() => setLinkMode('create')}><Ic n="plus" s={16}/> Привязать email для ПК</button>
          <div className="dk-auth-foot" style={{ marginTop:10 }}>Уже регистрировались на сайте? <b onClick={() => setLinkMode('merge')}>Связать аккаунт</b></div>
        </>}
        {isTelegram && hasPassword && <div className="dk-kv"><span>Вход с ПК</span><b style={{ color:'#5f9184' }}>включён</b></div>}
        {!isTelegram && <button className="dk-btn-sec" style={{ width:'100%', marginTop:6 }} onClick={logout}>Выйти из аккаунта</button>}
      </div>
    </div>
    {linkMode && <DeskLinkEmail mode={linkMode} onClose={() => setLinkMode(null)} onLinked={() => {}}/>}
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

