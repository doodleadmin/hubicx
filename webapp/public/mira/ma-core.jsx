/* ============ Mira core: icons, data, shared UI ============ */
const { useState, useEffect, useRef } = React;

/* ---- inline icons (stroke) ---- */
function Ic({n, s=22, c="currentColor", sw=1.9}){
  const p = {
    bolt:<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>,
    image:<g><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 21"/></g>,
    video:<g><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/></g>,
    chat:<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>,
    arrowUp:<path d="M12 19V6M6 12l6-6 6 6"/>,
    chev:<path d="M9 6l6 6-6 6"/>,
    user:<g><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></g>,
    cam:<g><path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="3.4"/></g>,
    sparkle:<path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z"/>,
    globe:<g><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 2.6 15.6 0 18M12 3c-2.6 2.4-2.6 15.6 0 18"/></g>,
    wand:<g><path d="M15 4V2M19 8h2M17.5 5.5l1.5-1.5M4 20l9-9"/><path d="M14 7l3 3"/></g>,
    plus:<path d="M12 5v14M5 12h14"/>,
    addimg:<g><rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 15l5-4 4 3 3-2 6 4"/><circle cx="9" cy="9" r="1.6"/></g>,
    aspect:<rect x="7" y="3.5" width="10" height="17" rx="2.5"/>,
    check:<path d="M5 12.5l4.5 4.5L19 6.5"/>,
    back:<path d="M15 5l-7 7 7 7"/>,
    close:<path d="M6 6l12 12M18 6L6 18"/>,
    edit:<path d="M14 4l6 6M3 21l1-5L17 3l4 4L8 20z"/>,
    model:<g><circle cx="12" cy="12" r="2.4"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/></g>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[n]}</svg>;
}

/* filled token star */
function Star({s=16, c="#3e92f0"}){
  return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 2l2.4 6.4L21 9l-5 4.2L17.4 21 12 17.3 6.6 21 8 13.2 3 9l6.6-.6z"/>
  </svg>;
}

/* token badge */
function TokenBadge({n}){
  return <div className="tb-tok"><Star s={15} c="#cfe0ff"/><span>{n}</span></div>;
}

/* ---- nav ---- */
function BottomNav({tab, onTab}){
  const items=[
    {id:'agent', label:'Агент', ic:'sparkle'},
    {id:'gen', label:'Генерация', ic:'wand'},
    {id:'profile', label:'Профиль', ic:'user'},
  ];
  return <nav className="nav">
    {items.map(it=>{
      const active = tab===it.id;
      return <div key={it.id} className={"nav-item"+(active?" active":"")} onClick={()=>onTab(it.id)}>
        <div className="ni-ic">
          {it.id==='agent'
            ? <AgentGlyph active={active}/>
            : <Ic n={it.ic} s={24}/>}
        </div>
        <span>{it.label}</span>
      </div>;
    })}
  </nav>;
}
function AgentGlyph({active}){
  return <svg width="26" height="26" viewBox="0 0 24 24" fill={active?"#2f80ed":"none"}
    stroke={active?"#2f80ed":"currentColor"} strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 2.5l2.2 4.4 4.8.7-3.5 3.4.8 4.8L12 18l-4.3 2.3.8-4.8L5 12.1l4.8-.7z"/>
  </svg>;
}

/* ---- data ---- */
const HERO = [
  {img:'assets/cov/hero1.png'},
  {img:'assets/cov/hero2.png'},
  {img:'assets/cov/hero3.png'},
];
const TEMPLATES = [
  {t:'Ты из MadMax', img:'assets/cov/m1.png'},
  {t:'Полет в доспехах', img:'assets/cov/m2.png'},
  {t:'Мой день за 15 сек', img:'assets/cov/m3.png'},
  {t:'Скетч-шарж', img:'assets/cov/m4.png'},
  {t:'Пластилиновый мир', img:'assets/cov/m5.png'},
  {t:'Анти-стресс открытка', img:'assets/cov/m6.png'},
];
const CREATE_TPL = [
  {t:'Скетч-шарж', img:'assets/cov/m4.png'},
  {t:'Анти-стресс открытка', img:'assets/cov/m6.png'},
  {t:'Гадание по ладони', img:'assets/cov/m7.png'},
  {t:'Мой день за 15 сек', img:'assets/cov/m3.png'},
];
const MODELS = [
  {id:'nano2', code:'nano_banana_2', t:'Nano Banana 2', title:'Nano Banana 2', type:'image', s:'Фото · быстро', subtitle:'Фото · быстро'},
  {id:'nanopro', code:'nano_banana_pro', t:'Nano Banana Pro', title:'Nano Banana Pro', type:'image', s:'Фото · Pro', subtitle:'Фото · Pro'},
  {id:'nanoedit', code:'nano_banana_edit', t:'Nano Banana Edit', title:'Nano Banana Edit', type:'image', subtype:'image_edit', s:'Фото · редактирование', subtitle:'Фото · редактирование'},
  {id:'fast', code:'flux_schnell', t:'Fast Image', title:'Fast Image', type:'image', s:'Фото · быстро', subtitle:'Фото · быстро'},
  {id:'seedream', code:'seedream', t:'Seedream', title:'Seedream', type:'image', s:'Фото · реализм', subtitle:'Фото · реализм'},
  {id:'zimage', code:'z_image', t:'Z-Image', title:'Z-Image', type:'image', s:'Фото · turbo', subtitle:'Фото · turbo'},
  {id:'seedance-t2v', code:'seedance_2_t2v', t:'Seedance T2V', title:'Seedance T2V', type:'video', subtype:'text_to_video', s:'Видео · текст в видео', subtitle:'Видео · текст в видео'},
  {id:'seedance-i2v-fast', code:'seedance_2_i2v_fast', t:'Seedance I2V Fast', title:'Seedance I2V Fast', type:'video', subtype:'image_to_video', s:'Видео · быстрое оживление', subtitle:'Видео · быстрое оживление'},
  {id:'seedance-i2v', code:'seedance_2_i2v', t:'Seedance I2V', title:'Seedance I2V', type:'video', subtype:'image_to_video', s:'Видео · качественное оживление', subtitle:'Видео · качественное оживление'},
  {id:'kling-i2v', code:'kling_21_i2v', t:'Kling I2V', title:'Kling I2V', type:'video', subtype:'image_to_video', s:'Видео · image-to-video', subtitle:'Видео · image-to-video'},
  {id:'chat', code:'ai_chat', t:'AI Chat', title:'AI Chat', type:'text', s:'Текст · чат', subtitle:'Текст · чат'},
  {id:'prompt-helper', code:'prompt_helper', t:'Prompt Helper', title:'Prompt Helper', type:'text', s:'Текст · промпты', subtitle:'Текст · промпты'},
];
const MIRA_MODELS = MODELS;
const modelByCode = (code)=>MODELS.find(m=>m.code===code || m.id===code);
const modelsByType = (type)=>MODELS.filter(m=>m.type===type);
const defaultModelForMode = (mode)=>modelByCode(mode==='video' ? 'seedance_2_t2v' : mode==='text' ? 'ai_chat' : 'nano_banana_2') || MODELS[0];
const modelTypeForMode = (mode)=>mode==='video' ? 'video' : mode==='text' ? 'text' : 'image';
const isModelAllowedForMode = (model, mode)=>!!model && model.type===modelTypeForMode(mode);
const ASPECTS = [
  {id:'1:1', t:'1:1', s:'Квадрат'},
  {id:'2:3', t:'2:3', s:'Портрет'},
  {id:'3:2', t:'3:2', s:'Альбом'},
  {id:'9:16', t:'9:16', s:'Сторис'},
  {id:'16:9', t:'16:9', s:'Широкий'},
];

window.MiraCore = { Ic, Star, TokenBadge, BottomNav, HERO, TEMPLATES, CREATE_TPL, MODELS, MIRA_MODELS, ASPECTS, modelByCode, modelsByType, defaultModelForMode, modelTypeForMode, isModelAllowedForMode };
