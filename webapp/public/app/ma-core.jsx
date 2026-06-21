/* ============ Hubicx core: icons, data, shared UI ============ */
const { useState, useEffect, useRef } = React;

/* ---- inline icons (stroke) ---- */
function Ic({ n, s = 22, c = "currentColor", sw = 1.9 }) {
  const p = {
    bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>,
    image: <g><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 21"/></g>,
    video: <g><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/></g>,
    chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>,
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
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
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
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[n]}</svg>;
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
  return <div className="topnav">
    <div className="tn-seg">
      {[['agent','Главная'],['gen','Генерация'],['profile','Профиль']].map(([id,l]) => (
        <div key={id} className={'tn-item' + (active === id ? ' on' : '')} onClick={() => onTab(id)}>{l}</div>
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
  { code:'nano_banana_2',      title:'Nano Banana 2',             category:'photo', task_type:'image', price_credits:40,  description:'Быстрая генерация' },
  { code:'nano_banana_pro',    title:'Nano Banana Pro',           category:'photo', task_type:'image', price_credits:80,  description:'Pro · высокое разрешение' },
  { code:'nano_banana_edit',   title:'Nano Banana Edit',          category:'photo', task_type:'image', price_credits:60,  description:'Редактирование фото', input_type:'image' },
  { code:'gpt_image_2',        title:'GPT Image 2',               category:'photo', task_type:'image', price_credits:90,  description:'OpenAI · качественная генерация' },
  { code:'gpt_image_2_edit',   title:'GPT Image 2 Edit',          category:'photo', task_type:'image', price_credits:110, description:'OpenAI · редактирование фото', input_type:'image' },
  { code:'seedream',           title:'Seedream',                  category:'photo', task_type:'image', price_credits:35,  description:'Фотореалистичный' },
  { code:'flux_schnell',       title:'Fast Image',                category:'photo', task_type:'image', price_credits:30,  description:'Молниеносный' },
  { code:'z_image',            title:'Z-Image',                   category:'photo', task_type:'image', price_credits:25,  description:'Доступный' },
  { code:'seedance_2_t2v',     title:'Seedance 2 Text to Video',  category:'video', task_type:'video', price_credits:250, description:'Текст → видео' },
  { code:'seedance_2_i2v_fast',title:'Seedance 2 Fast Image→Video',category:'video',task_type:'video', price_credits:180, description:'Быстрый Image → видео', input_type:'image' },
  { code:'seedance_2_reference',title:'Seedance 2 Reference→Video',category:'video',task_type:'video', price_credits:225, description:'Топовое видео по нескольким референсам', input_type:'image', form_schema:{ fields:[
    { name:'image_urls', type:'files' },
    { name:'prompt', type:'textarea' },
    { name:'aspect_ratio', type:'select', default:'9:16', options:['21:9','16:9','4:3','1:1','3:4','9:16','auto'] },
    { name:'duration', type:'select', default:'5', options:['auto','4','5','6','7','8','9','10','11','12','13','14','15'] },
    { name:'resolution', type:'select', default:'480p', options:['480p','720p','1080p'] },
    { name:'generate_audio', type:'switch', default:true }
  ], price_rules:{ base:225, multipliers:[{ field:'resolution', values:{ '480p':0.45, '720p':1, '1080p':2.25 } }, { field:'duration', values:{ auto:1, '4':0.8, '5':1, '6':1.2, '7':1.4, '8':1.6, '9':1.8, '10':2, '11':2.2, '12':2.4, '13':2.6, '14':2.8, '15':3 } }], min:1, round:'ceil' } } },
  { code:'seedance_2_reference_fast',title:'Seedance 2 Fast Reference→Video',category:'video',task_type:'video', price_credits:180, description:'Быстрое видео по нескольким референсам', input_type:'image' },
  { code:'seedance_2_i2v',     title:'Seedance 2 Image to Video', category:'video', task_type:'video', price_credits:250, description:'Качественный Image → видео', input_type:'image' },
  { code:'kling_21_i2v',       title:'Kling 2.1 Image to Video',  category:'video', task_type:'video', price_credits:220, description:'Kling 2.1 Image → видео', input_type:'image' },
  { code:'kling_30_i2v',       title:'Kling 3.0 Image to Video',  category:'video', task_type:'video', price_credits:260, description:'Kling 3.0 · image → video', input_type:'image', form_schema:{ fields:[
    { name:'image_url', type:'file' },
    { name:'prompt', type:'textarea' },
    { name:'duration', type:'select', default:'10', options:['3','4','5','6','7','8','9','10','11','12','13','14','15'] },
    { name:'resolution', type:'select', default:'720p', options:['720p'] },
    { name:'generate_audio', type:'switch', default:false },
    { name:'template_pipeline', type:'hidden' }
  ], price_rules:{ base:260, multipliers:[{ field:'duration', values:{ '3':0.4, '4':0.5, '5':0.6, '6':0.7, '7':0.8, '8':0.9, '9':1, '10':1, '11':1.1, '12':1.2, '13':1.3, '14':1.4, '15':1.5 } }], min:1, round:'ceil' } } },
  { code:'kling_30_motion_control',title:'Kling 3.0 Motion Control',category:'video',task_type:'video', price_credits:260, description:'Kling · перенос движения', input_type:'image', form_schema:{ fields:[
    { name:'image_url', type:'file' },
    { name:'video_url', type:'file' },
    { name:'prompt', type:'textarea' },
    { name:'character_orientation', type:'select', default:'image', options:['image','video'] },
    { name:'keep_original_sound', type:'switch', default:true }
  ] } },
  { code:'grok_video_t2v',     title:'Grok Imagine Video',        category:'video', task_type:'video', price_credits:320, description:'Grok · текст → видео' },
  { code:'grok_video_i2v',     title:'Grok Image to Video',       category:'video', task_type:'video', price_credits:340, description:'Grok · image → видео', input_type:'image' },
  { code:'veo_31_t2v',         title:'Veo 3.1 Text to Video',     category:'video', task_type:'video', price_credits:900, description:'Google Veo · текст → видео' },
  { code:'veo_31_i2v',         title:'Veo 3.1 Image to Video',    category:'video', task_type:'video', price_credits:900, description:'Google Veo · image → видео', input_type:'image' },
];

/* ---- data ---- */

function TemplateMedia({ t, loading = 'lazy', decoding = 'async', fetchPriority = 'auto', onError }) {
  if (t && t.coverVideo) {
    return <video src={t.coverVideo} muted autoPlay playsInline loop preload="metadata" onError={onError}></video>;
  }
  return <img src={t && t.img} alt="" loading={loading} decoding={decoding} fetchPriority={fetchPriority} onError={onError}/>;
}

const TEMPLATES = [
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
  { t:'Полароид с вечеринки', img:'assets/templates/photo/polaroid-party/cover.webp', type:'photo', category:'Женское', requiresImage:true, inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

A physical Polaroid photograph lying on a messy party table. In the photo: a close-up of the woman's face, she is sticking out her tongue playfully, and a friend's hand is drawing the number "30" on her cheek with bright blue glitter gel. She wears butterfly hair clips and small silver hoop earrings. The photo itself has the classic white border, slightly off-center. Around the Polaroid: spilled glitter, a lipstick mark, a disposable camera, and a rhinestone-studded Motorola Razr phone. Style: authentic, candid, nostalgic party snapshot. Preserve her genuine, playful expression.` },
  { t:'Розы', img:'assets/templates/photo/roses/cover.webp', type:'photo', category:'Женское', requiresImage:true, inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

Create a glamorous romantic editorial photo from a high overhead top-down angle. The woman is sitting on a dark wooden floor, centered in the frame, surrounded tightly by many large lush bouquets of red and white roses arranged all around her in a luxurious decorative composition. She is wearing a black satin slip dress with thin spaghetti straps, elegant and form-fitting. Her pose is calm and feminine: seated on the floor, body facing forward, hands placed near her sides on the floor, head tilted slightly upward toward the camera. She is looking directly into the camera with a soft, calm, slightly dreamy and serious expression. Lighting should look like direct camera flash photography: bright frontal flash, crisp details, soft shadows, glossy highlights on the dress, high contrast, clean skin, and a stylish luxury bouquet aesthetic. The composition should feel symmetrical, rich, romantic, and visually dense with roses filling the frame. Keep the mood elegant, luxurious, and romantic. Make it look like a real flash photo taken at a celebration or intimate luxury event.` },
  { t:'Розы с корги', img:'assets/templates/photo/roses-corgi/cover.webp', type:'photo', category:'Животные', requiresImage:true, inputLabel:'Фото лица девушки', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible.

Create a photorealistic vertical 3:4 lifestyle editorial photo with the exact same pose and camera angle as the reference composition. The camera must be placed almost directly overhead in a true bird’s-eye / top-down perspective, looking straight down at the woman. Preserve the pose and framing as closely as possible.

The woman is seated on a grey tiled sidewalk near the boundary where the tiled pavement meets dark asphalt. Her body is centered in the frame. She is looking straight up into the camera. Her legs are bent, knees opened outward, with both feet positioned toward the upper part of the frame. Her arms extend downward with both palms resting flat on the tiled ground near the bottom of the frame. Keep this pose very accurately.

She wears a dark brown leather jacket with realistic leather texture, a white top underneath, white trousers, brown leather shoes, and large transparent-frame glasses. Her hair is blonde, smooth, center-parted, with one loose strand falling across her face. Her expression is calm, soft, and slightly playful.

Place a large brown leather tote bag on the ground to the woman’s right side, close to her hip and arm.

Surround the woman with many Pembroke Welsh Corgis arranged in a tight circular ring around her body. The dogs should closely match the reference composition: compact corgi bodies, upright ears, short legs, mostly red-and-white coats with a few darker tricolor corgis. The corgis are positioned evenly around her, filling the perimeter of the frame. Most of them are looking up toward the camera, while some are looking toward the woman. Keep the arrangement dense, balanced, and visually similar to the reference.

The lower part of the image should show grey square pavement tiles, while the upper part should show dark asphalt. The environment is clean, simple, and minimal.

Lighting should be soft natural overcast daylight with balanced exposure, gentle shadows, and realistic textures. The style should feel like a clean modern lifestyle/fashion editorial photo. High detail in the dog fur, leather jacket, pavement texture, glasses, and facial features. Nearly everything should remain in focus.

Important: preserve the top-down camera angle, the exact seated pose, the leg position, the hand placement, the centered composition, and the circular arrangement of the corgis as closely as possible.

Photorealistic, realistic anatomy, no duplicated dogs, no merged limbs, no extra paws or heads, no deformed animals, no text, no logos, no watermark.` },
  { t:'Метро', img:'assets/templates/photo/metro/cover.webp', type:'photo', category:'Женское', requiresImage:true, inputLabel:'Фото лица девушки или по пояс', prompt:`Use the uploaded woman as a strict identity reference. Preserve her recognizable face, facial features, hairstyle, skin tone, visible silhouette, and overall appearance as accurately as the reference photo allows. Keep her clearly recognizable as the same person. Do not replace her face or identity.

Create a photorealistic vertical 3:4 high-fashion editorial subway portrait with the same framing, camera angle, and background style as the reference image.

The woman stands completely still on an underground subway platform, perfectly centered in the frame, facing directly toward the camera. Use a straight-on frontal camera angle at about chest-to-face level, not from above and not from below.

Preserve the shot size carefully: frame her as a medium portrait from the top of the head to around the waist. Do not show the full body. Her upper body should dominate the frame and fill most of the composition.

Her posture is rigid, upright, symmetrical, and motionless. Her arms hang naturally along her sides. Her expression is calm, cold, serious, emotionally distant, and controlled.

She wears narrow black sunglasses, layered delicate silver chain necklaces, a minimal black sleeveless fashion top that fully covers the torso, long black opera gloves, and loose grey tailored trousers visible only at the bottom edge of the crop. Her hair is dark, sleek, and tightly slicked back in a wet-look style. Add natural-looking freckles on her face, neck, shoulders, and visible arms while preserving the uploaded woman’s identity.

Behind her, a silver subway train rushes past at high speed, filling almost the entire background. The train must be strongly blurred with horizontal motion blur, with visible windows, metallic panels, and hints of signage or light streaks. The woman remains perfectly sharp and in focus, creating a strong contrast between her stillness and the speed of the moving train.

Use a cold urban color palette with blue-grey and metallic tones. The atmosphere should feel modern, cinematic, minimal, detached, and high-fashion. Lighting should be crisp and editorial, with detailed facial features, subtle highlights on the jewelry and gloves, and realistic subway reflections.

Important: preserve the medium portrait crop, not full body; preserve the centered composition; preserve the straight-on camera angle; preserve the subway train directly behind her; preserve the strong horizontal motion blur in the train while keeping the woman sharply in focus.

Photorealistic, realistic face detail, realistic fabric texture, detailed freckles, detailed jewelry, realistic subway motion blur, high contrast, no text, no logos, no watermark.` },
  { t:'Волк', img:'assets/templates/photo/wolf/cover.webp', type:'photo', category:'Животные', requiresImage:true, inputLabel:'Фото лица девушки или по пояс', prompt:`Use the uploaded woman as a strict identity reference. Preserve her exact face, facial features, bone structure, skin tone, body shape, figure, proportions, and overall appearance as accurately as the reference photo allows. Keep her fully recognizable as the same person. Do not change her identity, do not replace her with a different face or different body type. If the reference photo shows only part of the body, preserve the visible proportions and infer the rest as consistently as possible. Keep natural eye appearance, natural hair appearance, and do not add new tattoos or piercings.

Ultra-realistic gritty night flash photo of the same woman from the input image. Vertical 3:4 Scene: dark bedroom at night, messy bed with rumpled pale sheets. She is lying on the bed in a high-fashion pose. Her upper body is propped up on one elbow, shoulders angled toward the camera. The supporting arm is bent, hand near her jawline as if framing her face. Her other arm stretches across the bed, hand resting lightly on the sheets or near the wolf prop. One leg is bent at the knee and slightly raised, the other extended, creating elegant lines. She is close to the camera with an intense, editorial gaze — slightly tired but confident and powerful, like an after-party fashion snapshot. Next to her on the bed is a large black wolf prop / animatronic (clearly a staged photo prop, not attacking), mouth open showing teeth, dramatic but non-violent, posed as if protectively looming beside her. Outfit: sparkly silver sequin strapless bustier/top fully covering the chest, styled like an evening corset. It catches the flash with strong specular highlights. She may wear dark high-waisted shorts or underwear partly visible under the sheets. Hairstyle: sleek, damp styling, hair brushed back from the face with a clean center part, lengths falling naturally around the shoulders with soft separation, a few messy flyaways around the temples for a lived-in look. Makeup: bold editorial model makeup suited to night flash. Skin: medium-coverage base with natural texture still visible, semi matte finish with subtle sheen on high points. Strong sculpting contour under cheekbones and along the nose, warm blush on the apples of the cheeks. Eyes: smokey, slightly smudged look with dark eyeliner around the eyes, blended charcoal or deep brown shadow on the upper lid and lower lash line, a touch of metallic shimmer on the inner corners to catch the flash. Lashes thick and lengthened with mascara. Brows groomed and defined, keeping natural shape. Lips: full, over-defined lips in a muted rose or brown-nude satin shade, not glossy but catching a bit of light.

Lighting: harsh on-camera flash from the front, plus moody blue ambient lighting in the room. A cool blue fill or rim light leaks in from one side, tinting the sheets and edges of the wolf and casting subtle cyan highlights on her skin and hair. Deep shadows, dark background, strong specular highlights on sequins and the wolf prop, gritty magazine snapshot vibe.

CAMERA: point-and-shoot / early-2000s digicam look, 35mm equiv, f/2.8, 1/60s, ISO 1600, direct flash.

PROCESSING: cold blue tint overall, very high contrast, strongly underexposed background, very heavy analog-style film grain and digital noise across the entire image, clearly visible even in highlights, slight blur from movement, mild vignette, crunchy over-sharpened edges, raw imperfect aesthetic.` },
  { code:'camera-g7x', t:'Камера G7X', img:'assets/templates/photo/camera-g7x/cover.webp', type:'photo', category:'Эффекты', requiresImage:true, inputLabel:'Любое фото', prompt:`Use the uploaded image as the main reference. Preserve the exact person, face, facial features, body shape, figure, proportions, pose, clothing, background, framing, and overall composition as accurately as possible. Keep the subject fully recognizable as the same person. Do not change the person, do not replace the face or body, and do not redesign the scene. Apply only the visual style described below.

Apply a photorealistic Canon PowerShot G7X Mark III signature look to the uploaded image. Create a 1-inch sensor creamy bokeh feel, f/1.8–2.8 24–100mm lens look, and a built-in flash pop directly on the skin for a flattering glow and specular highlights. Make the background slightly underexposed, dark, and softly blurred, around -1.3 to -2 EV. Give the skin soft warm tones with golden-hour peach undertones, translucent pores, and a subtle natural oil sheen. Use low-contrast natural SOOC-style grading, creamy colors with no harsh saturation, subtle low film grain, and a dreamy haze glow around the subject. Create shallow depth-of-field portrait perfection with a trendy 2025 vlog / Instagram aesthetic. Keep the result hyper-real but with organic imperfections and a professional human photo vibe.` },
];
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
const MODELS = [
  { id:'gpt', t:'GPT Image 2', s:'Генерация текста' },
  { id:'nano', t:'Nano Banana', s:'Базовая' },
  { id:'nanopro', t:'Nano Banana Pro', s:'Pro' },
  { id:'qwen', t:'Qwen', s:'Творческая свобода' },
  { id:'seed', t:'Seedream 4.5', s:'Похожесть лица' },
];
const ASPECTS = [
  { id:'1:1', t:'1:1', s:'Квадрат' },
  { id:'2:3', t:'2:3', s:'Портрет' },
  { id:'3:4', t:'3:4', s:'Портрет' },
  { id:'4:5', t:'4:5', s:'Портрет' },
  { id:'3:2', t:'3:2', s:'Альбом' },
  { id:'4:3', t:'4:3', s:'Альбом' },
  { id:'5:4', t:'5:4', s:'Альбом' },
  { id:'9:16', t:'9:16', s:'Сторис' },
  { id:'16:9', t:'16:9', s:'Широкий' },
  { id:'21:9', t:'21:9', s:'Кино' },
];

window.MiraCore = { Ic, Star, TokenBadge, TopNav, TemplateMedia, TEMPLATES, CREATE_TPL, MODELS, ASPECTS, FALLBACK_MODELS, tplKey, MOB_FAV_KEY, defaultFavTemplateKeys, readFavTemplateKeys, writeFavTemplateKeys };
