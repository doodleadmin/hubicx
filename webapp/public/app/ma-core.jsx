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
function TopNav({ active, onTab }) {
  if (window.DESKTOP_MODE) return null;
  const icon = active === 'gen' ? 'sliders' : active === 'profile' ? 'gear' : 'bell';
  return <div className="topnav">
    <div className="tn-seg">
      {[['agent','Агент'],['gen','Генерация'],['profile','Профиль']].map(([id,l]) => (
        <div key={id} className={'tn-item' + (active === id ? ' on' : '')} onClick={() => onTab(id)}>{l}</div>
      ))}
    </div>
    <div className="tn-icon">
      <Ic n={icon} s={20}/>
      {active === 'agent' && <span className="tn-dot"></span>}
    </div>
  </div>;
}

/* ---- data ---- */
const HERO = [
  { img:'assets/cov/hero1.png' },
  { img:'assets/cov/hero2.png' },
  { img:'assets/cov/hero3.png' },
];
const TEMPLATES = [
  { t:'Ты из MadMax', img:'assets/cov/m1.png' },
  { t:'Полет в доспехах', img:'assets/cov/m2.png' },
  { t:'Мой день за 15 сек', img:'assets/cov/m3.png' },
  { t:'Скетч-шарж', img:'assets/cov/m4.png' },
  { t:'Пластилиновый мир', img:'assets/cov/m5.png' },
  { t:'Анти-стресс открытка', img:'assets/cov/m6.png' },
];
const CREATE_TPL = [
  { t:'Скетч-шарж', img:'assets/cov/m4.png' },
  { t:'Анти-стресс открытка', img:'assets/cov/m6.png' },
  { t:'Гадание по ладони', img:'assets/cov/m7.png' },
  { t:'Мой день за 15 сек', img:'assets/cov/m3.png' },
];
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
  { id:'3:2', t:'3:2', s:'Альбом' },
  { id:'9:16', t:'9:16', s:'Сторис' },
  { id:'16:9', t:'16:9', s:'Широкий' },
];

window.MiraCore = { Ic, Star, TokenBadge, TopNav, HERO, TEMPLATES, CREATE_TPL, MODELS, ASPECTS };
