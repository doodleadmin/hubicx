/* ============ Hubicx landing — v3 (new design 2026-06-22) ============ */
const { useState: uS, useEffect: uE, useRef: uR, useCallback: uC, useMemo: uM } = React;

/* ============ Helpers ============ */
const Gg = (n) => 'assets/g/r' + n + '.png';
const G = Gg;

/* ============ Data ============ */
const SHOW_A = [
  { n: 7, l: 'Портрет' },
  { n: 1, l: 'Кинокадр', vid: true, dur: '0:08' },
  { n: 11, l: 'Неон-сити', cls: 't-w', vid: true, dur: '0:12' },
  { n: 9, l: 'Портрет' },
  { n: 5, l: 'Космос', cls: 't-sq' },
  { n: 13, l: 'Флюид', vid: true, dur: '0:06' },
];

const SHOW_B = [
  { n: 10, l: 'Портрет' },
  { n: 17, l: 'Закат', cls: 't-w', vid: true, dur: '0:10' },
  { n: 12, l: 'Неон' },
  { n: 6, l: '3D-герой', vid: true, dur: '0:07' },
  { n: 3, l: 'Пастель' },
  { n: 16, l: 'Пейзаж', cls: 't-sq' },
];

const DK_CARDS = [
  { n: 7, t: 'Аниме-портрет' },
  { n: 2, t: 'Танцующий аватар', isVideo: true, dur: '0:06' },
  { n: 3, t: 'Товарное фото' },
  { n: 11, t: 'Киберпанк-сити', tr: true },
  { n: 9, t: 'Хедшот' },
  { n: 6, t: 'Пластилин', tr: true },
];

const TPL = [
  { n: 7, t: 'Аниме-портрет', c: 'Фото' },
  { n: 2, t: 'Танцующий аватар', c: 'Видео', isVideo: true, dur: '0:06' },
  { n: 3, t: 'Товарное фото', c: 'Фото' },
  { n: 11, t: 'Киберпанк-сити', c: 'Тренд', tr: true },
  { n: 9, t: 'Хедшот для резюме', c: 'Фото' },
  { n: 6, t: 'Пластилиновый мир', c: 'Тренд', tr: true },
  { n: 13, t: 'Говорящий аватар', c: 'Видео', isVideo: true, dur: '0:10' },
  { n: 10, t: 'Реставрация фото', c: 'Фото' },
];

const TPL_TABS = ['Все', 'Фото', 'Видео', 'Тренд'];

const MODELS = [
  { n: 9, name: 'Nano Banana Pro', tag: 'Фото', d: 'Максимальное качество и точность' },
  { n: 7, name: 'Seedream', tag: 'Фото', d: 'Фотореализм и портреты' },
  { n: 13, name: 'Flux', tag: 'Фото', d: 'Арт и стилизация' },
  { n: 5, name: 'Z-Image', tag: 'Фото', d: 'Turbo-генерация за секунды' },
  { n: 3, name: 'Midjourney v7', tag: 'Фото', d: 'Эстетика и иллюстрации' },
  { n: 10, name: 'Recraft v3', tag: 'Фото', d: 'Логотипы, вектор, дизайн' },
  { n: 2, name: 'Seedance 2.0', tag: 'Видео', d: 'Кинематографичные ролики' },
  { n: 11, name: 'Kling 2.1', tag: 'Видео', d: 'Оживление фото в движение' },
  { n: 1, name: 'Veo 3', tag: 'Видео', d: 'Видео со звуком из текста' },
  { n: 6, name: 'Runway Gen-4', tag: 'Видео', d: 'Контроль камеры и сцены' },
  { n: 16, name: 'Hailuo 02', tag: 'Видео', d: 'Плавная анимация и движение' },
  { n: 12, name: 'Wan 2.5', tag: 'Видео', d: 'Длинные ролики в HD' },
];

const SUBS = [
  { n: 'Шаблоны Mini', p: '790', py: '632', t: '800 токенов / месяц', badge: 'Старт', best: false, core: true,
    f: ['Базовые шаблоны', 'Фото-шаблоны', 'Стартовый пакет токенов'] },
  { n: 'Creator', p: '1 490', py: '1 192', t: '1 800 токенов / месяц', badge: 'Личный', best: false, core: false,
    f: ['Фото и видео', 'Базовые модели', 'История генераций'] },
  { n: 'Шаблоны Plus', p: '2 590', py: '2 072', t: '3 500 токенов / месяц', badge: 'Для контента', best: false, core: false,
    f: ['Все шаблоны', 'Видео-шаблоны', 'Больше токенов'] },
  { n: 'Creator Pro', p: '3 990', py: '3 192', t: '6 500 токенов / месяц', badge: 'Популярный', best: true, core: true,
    f: ['Все основные модели', 'Премиум-шаблоны', 'Регулярный контент'] },
  { n: 'Studio', p: '9 900', py: '7 920', t: '18 000 токенов / месяц', badge: 'Для бизнеса', best: false, core: true,
    f: ['Командная работа', 'Большой объём токенов', 'Студийные сценарии'] },
];

const PACKS = [
  { n: '300 токенов', p: '249', t: '0,83 ₽ за токен', best: false,
    f: ['Разовое пополнение', 'Все базовые модели', 'AI-чат', 'Токены не сгорают'] },
  { n: '1 000 токенов', p: '790', t: '0,79 ₽ за токен', badge: 'Выгодно', best: true,
    f: ['Разовое пополнение', 'Все модели', 'Выгоднее для задач', 'Токены не сгорают'] },
  { n: '3 000 токенов', p: '1 990', t: '0,66 ₽ за токен', best: false,
    f: ['Разовое пополнение', 'Большой объём', 'Все Pro-модели', 'Токены не сгорают'] },
  { n: '10 000 токенов', p: '5 990', t: '0,60 ₽ за токен', best: false,
    f: ['Максимальная выгода', 'Для активной работы', 'Все форматы и модели', 'Токены не сгорают'] },
];

const FAQ = [
  ['Нужен ли VPN для работы?', 'Нет. Hubicx работает напрямую в Telegram и в браузере — все зарубежные модели доступны без VPN и сторонних настроек.'],
  ['Токены сгорают?', 'Нет. Купленные токены остаются на балансе бессрочно и расходуются только когда вы что-то генерируете.'],
  ['Какие модели доступны?', 'Топовые модели для фото и видео: Nano Banana Pro, Seedream, Flux, Seedance 2.0, Kling, Z-Image и другие. Список постоянно пополняется.'],
  ['Сколько стоит одна генерация?', 'Фото — от 1–2 токенов, видео — от 15. Точная стоимость показывается перед запуском, без скрытых списаний.'],
  ['Можно ли использовать результаты коммерчески?', 'Да. На тарифах Про и Макс доступна коммерческая лицензия на созданный контент.'],
  ['Как оплатить?', 'Картой российского банка через защищённую оплату. Чек приходит автоматически.'],
];

const CMP_ROWS_DATA = [
  'Все топовые модели в одном месте',
  'Оплата в рублях, без зарубежных карт',
  'Работает без VPN',
  'Прямо в Telegram и в браузере',
  'Единый баланс токенов',
  'Поддержка на русском 24/7',
];

const HOW_DATA = [
  { k: '01', t: 'Опишите идею', d: 'Напишите промпт своими словами или выберите готовый шаблон. Мы подскажем и улучшим формулировку.' },
  { k: '02', t: 'Модель рендерит', d: 'Лучшая нейросеть под задачу собирает кадр. Обычно 10–20 секунд для фото.' },
  { k: '03', t: 'Готовый результат', d: 'Скачивайте в высоком качестве, отправляйте в Telegram или продолжайте в чате с агентом.' },
];

const PH_SHOTS = [
  { p: 'неоновый портрет, киберпанк, дождь', m: 'Seedream', t: '14 сек', n: 8 },
  { p: 'закат над горами, киноосвещение, 35mm', m: 'Nano Banana Pro', t: '12 сек', n: 1 },
  { p: 'пластилиновый герой, студийный свет', m: 'Flux', t: '9 сек', n: 6 },
  { p: 'космическая туманность, звёздная пыль', m: 'Seedance 2.0', t: '16 сек', n: 5 },
];

const HERO_IDEAS = [
  'неоновый портрет, киберпанк, дождь',
  'закат над горами, 35mm',
  'пластилиновый герой, студийный свет',
  'город будущего ночью',
];

const STATS_DATA = [
  { to: 120, suffix: ' тыс.', label: 'Создателей' },
  { to: 18, suffix: '+', label: 'AI-моделей' },
  { to: 2, suffix: ' млн', label: 'Генераций' },
  { to: 15, suffix: ' сек', label: 'Средняя скорость' },
];

const DK_NAV = [
  { ic: 'grid', t: 'Шаблоны', on: true },
  { ic: 'wand', t: 'Генерация', on: false },
  { ic: 'video', t: 'Видео', on: false },
  { ic: 'history', t: 'История', on: false },
  { ic: 'chat', t: 'Чат', on: false },
];

/* ============ Icon component ============ */
function LandingIc({ n, s = 22, c = 'currentColor', sw = 1.9 }) {
  const p = {
    home: <g><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></g>,
    wand: <g><path d="M15 4V2M19 8h2M17 5l1.5-1.5M3 21l11-11" /><path d="M13 7l4 4" /><path d="M19 14l.6 1.6L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.4z" /></g>,
    image: <g><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5L5 21" /></g>,
    video: <g><rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="M16 10l5-3v10l-5-3z" /></g>,
    history: <g><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4M12 8v4l3 2" /></g>,
    chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z" />,
    user: <g><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></g>,
    chev: <path d="M9 6l6 6-6 6" />,
    back: <path d="M15 5l-7 7 7 7" />,
    search: <g><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></g>,
    bell: <g><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></g>,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="M5 12.5l4.5 4.5L19 6.5" />,
    download: <g><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 21h16" /></g>,
    send: <path d="M4 12l16-7-7 16-2-7-7-2z" />,
    model: <g><circle cx="12" cy="12" r="2.4" /><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" /></g>,
    aspect: <rect x="6" y="4" width="12" height="16" rx="2.5" />,
    refresh: <g><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4" /></g>,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    settings: <g><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></g>,
    upscale: <g><path d="M3 9V3h6" /><path d="M21 15v6h-6" /><path d="M3 3l7 7M21 21l-7-7" /></g>,
    copy: <g><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></g>,
    sparkle: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />,
    layers: <g><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></g>,
    grid: <g><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></g>,
    addimg: <g><rect x="3" y="4" width="18" height="14" rx="3" /><path d="M3 15l5-4 4 3 3-2 6 4" /><circle cx="8.5" cy="9" r="1.5" /><path d="M19 2v6M16 5h6" /></g>,
    play: <path d="M7 4l13 8-13 8z" />,
    eye: <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></g>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    tg: <path d="M21.5 4.5L2.5 11.8c-.8.3-.8 1.4.1 1.6l4.8 1.5 1.8 5.6c.2.7 1.1.9 1.6.3l2.6-2.7 4.9 3.6c.6.4 1.4.1 1.6-.6L23 5.6c.2-.9-.7-1.5-1.5-1.1z" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    lock: <g><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></g>,
    mail: <g><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></g>,
    bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
    shield: <g><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></g>,
    infinity: <path d="M6 9a3 3 0 1 0 0 6c2 0 3-1.5 6-3s4-3 6-3a3 3 0 1 1 0 6c-2 0-3-1.5-6-3S8 9 6 9z" />,
    x: <path d="M4 4l16 16M20 4L4 20" />,
    yt: <g><rect x="2.5" y="6" width="19" height="12" rx="3.5" /><path d="M10 9l5 3-5 3z" /></g>,
    ig: <g><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1" /></g>,
    dc: <g><path d="M8 12a1 1 0 1 0 .01 0M16 12a1 1 0 1 0 .01 0" /><path d="M7 18l-1 3s-3-1.5-4-4c0-4 1-8 2.5-10C6 6 8 5.5 8 5.5L9 7h6l1-1.5s2 .5 3.5 1.5C21 9 22 13 22 17c-1 2.5-4 4-4 4l-1-3" /></g>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {p[n]}
    </svg>
  );
}

function LandingStar({ s = 16, c = '#c2a93f' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M12 2l2.4 6.4L21 9l-5 4.2L17.4 21 12 17.3 6.6 21 8 13.2 3 9l6.6-.6z" />
    </svg>
  );
}

/* ============ Before / After slider (keep) ============ */
function BeforeAfter({ before, after, label }) {
  const { Ic } = window.HBX;
  const wrapRef = uR(null);
  const [pos, setPos] = uS(58);
  const drag = uR(false);
  const move = (clientX) => {
    const el = wrapRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    let p = ((clientX - r.left) / r.width) * 100;
    p = Math.max(2, Math.min(98, p));
    setPos(p);
  };
  uE(() => {
    const up = () => drag.current = false;
    const mv = (e) => { if (drag.current) move(e.touches ? e.touches[0].clientX : e.clientX); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
  }, []);
  return (
    <div className="lp-ba" ref={wrapRef} onPointerDown={(e) => { drag.current = true; move(e.clientX); }}>
      <img className="lp-ba-img" src={after} alt="Результат AI-генерации" draggable="false" />
      <div className="lp-ba-before" style={{ width: pos + '%' }}>
        <img src={before} alt="Исходное фото" draggable="false" style={{ width: (wrapRef.current ? wrapRef.current.offsetWidth : 600) + 'px' }} />
      </div>
      <span className="lp-ba-tag l">Фото</span>
      <span className="lp-ba-tag r">AI-результат</span>
      <div className="lp-ba-handle" style={{ left: pos + '%' }}>
        <span className="lp-ba-knob"><Ic n="arrow" s={15} c="#1c1c1a" /><Ic n="arrow" s={15} c="#1c1c1a" /></span>
      </div>
    </div>
  );
}

/* ============ Auth Modal (updated with Telegram button) ============ */
function LandingAuthModal({ initial = 'register', onClose, onAuthed }) {
  const Ic = LandingIc;
  const [tab, setTab] = React.useState(initial);
  const [vals, setVals] = React.useState({ name: '', email: '', pass: '' });
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }));
  const isReg = tab === 'register';
  const valid = vals.email.includes('@') && vals.pass.length >= 6 && (!isReg || vals.name.trim());

  function submit() {
    if (!valid || busy) return;
    if (!window.HubicxApi) { setErr('API не загружен, обновите страницу'); return; }
    setBusy(true); setErr('');
    const email = vals.email.trim();
    const p = isReg
      ? window.HubicxApi.register(email, vals.pass, vals.name.trim())
      : window.HubicxApi.login(email, vals.pass);
    p.then(function (data) {
      setBusy(false);
      if (onAuthed) onAuthed(data && data.user);
      if (onClose) onClose();
    }).catch(function (e) {
      setBusy(false);
      setErr((e && e.message) || 'Не удалось войти');
    });
  }

  return (
    <div className="lp-ov" onClick={onClose}>
      <div className="lp-auth" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Вход и регистрация">
        <button className="lp-auth-x" aria-label="Закрыть" onClick={onClose}><Ic n="close" s={17} /></button>
        <div className="lp-auth-brand">
          <span className="lp-logo" style={{ width: 30, height: 30, borderRadius: 9, overflow: 'hidden', boxShadow: '0 0 0 1px var(--line)' }}>
            <img src="assets/logo.jpg" alt="" />
          </span>
          <b style={{ fontSize: 18, letterSpacing: '-.03em' }}>Hubicx</b>
        </div>
        <div className="lp-auth-h">{isReg ? 'Создайте аккаунт' : 'Войти в аккаунт'}</div>
        <div className="lp-auth-s">{isReg ? 'Старт бесплатный — токены в подарок' : 'Рады видеть вас снова'}</div>

        <button className="lp-btn lp-btn-tg lp-btn-lg" style={{ width: '100%', marginTop: 20 }}
          onClick={() => { window.location.href = 'https://t.me/hubicx_bot'; }}>
          <Ic n="tg" s={19} c="#fff" /> Продолжить через Telegram
        </button>
        <div className="lp-auth-sep">или по email</div>

        <div className="lp-auth-tabs">
          <button className={!isReg ? 'on' : ''} onClick={() => { setTab('login'); setErr(''); }}>Вход</button>
          <button className={isReg ? 'on' : ''} onClick={() => { setTab('register'); setErr(''); }}>Регистрация</button>
        </div>

        {isReg && (
          <div className="lp-field">
            <label>Имя</label>
            <input className="lp-input" placeholder="Как к вам обращаться" value={vals.name} onChange={set('name')} />
          </div>
        )}
        <div className="lp-field">
          <label>Email</label>
          <input className="lp-input" type="email" autoComplete="email" placeholder="you@example.com" value={vals.email} onChange={set('email')} />
        </div>
        <div className="lp-field">
          <label>Пароль</label>
          <input className="lp-input" type="password" autoComplete={isReg ? 'new-password' : 'current-password'} placeholder="Минимум 8 символов" value={vals.pass} onChange={set('pass')}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
        </div>

        {err && <div className="dk-pay-err" style={{ textAlign: 'left', margin: '8px 0 0' }}>{err}</div>}
        <button className="lp-btn lp-btn-white lp-btn-lg" disabled={busy}
          style={{ width: '100%', marginTop: 10, opacity: valid && !busy ? 1 : .55 }}
          onClick={submit}>
          {busy ? 'Подождите…' : isReg ? 'Создать аккаунт' : 'Войти'} <Ic n="arrow" s={18} />
        </button>

        <div className="lp-auth-foot">
          {isReg
            ? <>Уже есть аккаунт? <b onClick={() => { setTab('login'); setErr(''); }}>Войти</b></>
            : <>Нет аккаунта? <b onClick={() => { setTab('register'); setErr(''); }}>Создать</b></>}
        </div>
        <div className="lp-auth-note">Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности Hubicx.</div>
      </div>
    </div>
  );
}

/* ============ Count-up stat ============ */
function LandingStatNum({ to, suffix = '' }) {
  const ref = uR(null);
  const [v, setV] = uS(0);
  uE(() => {
    let started = false;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !started) {
        started = true;
        const t0 = performance.now(), dur = 1400;
        const tick = (now) => { const p = Math.min(1, (now - t0) / dur); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <span ref={ref}>{v.toLocaleString('ru-RU')}{suffix}</span>;
}

/* ============ Logo SVG (inline, replaces img where needed) ============ */
function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <rect width="34" height="34" rx="10" fill="#2f80ed" />
      <path d="M10 23c0-5 1.6-9 3-9s2 3.4 3.6 3.4S19 11 20.6 11 23 15 24 15" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ============ Desktop App Mockup ============ */
function DesktopMock() {
  const Ic = LandingIc;
  return (
    <div className="dk-win reveal">
      <div className="dk-bar">
        <div className="dk-lights"><span style={{ background: '#f0a8a0' }}></span><span style={{ background: '#f0d28a' }}></span><span style={{ background: '#a8d8a0' }}></span></div>
        <div className="dk-url"><Ic n="shield" s={13} c="#7faa9d" /> hubicx.ru</div>
        <div style={{ width: 54 }}></div>
      </div>
      <div className="dk-app">
        <aside className="dk-side">
          <div className="dk-brand"><span className="dk-logo"><LogoMark size={28} /></span> Hubicx</div>
          <div className="dk-nav">
            {DK_NAV.map(i => (
              <div className={'dk-nav-i' + (i.on ? ' on' : '')} key={i.t}>
                <Ic n={i.ic} s={18} c={i.on ? '#1c1c1a' : '#8d8d87'} /> {i.t}
              </div>
            ))}
          </div>
          <div className="dk-side-foot">
            <div className="dk-tok"><span><Ic n="sparkle" s={14} c="#7faa9d" /> Токены</span><b>248</b></div>
            <div className="dk-user"><span className="dk-ava" style={{ backgroundImage: 'url(' + Gg(8) + ')' }}></span> Алекс М.</div>
          </div>
        </aside>
        <main className="dk-main">
          <div className="dk-top">
            <div className="dk-tabs"><span className="on">Все</span><span>Фото</span><span>Видео</span><span>Тренды</span></div>
            <div className="dk-search"><Ic n="search" s={15} c="#b6b6af" /> Поиск шаблона</div>
            <div className="dk-create"><Ic n="plus" s={16} c="#1c1c1a" /> Создать</div>
          </div>
          <div className="dk-grid">
            {DK_CARDS.map((c, i) => (
              <div className="dk-card" key={i}>
                <div className="dk-card-th"><img src={Gg(c.n)} alt={c.t} />
                  {c.isVideo && <span className="dk-card-v"><Ic n="play" s={10} c="#fff" /> {c.dur}</span>}
                  {c.tr && <span className="dk-card-tr"><Ic n="bolt" s={10} c="#1c1c1a" /> Тренд</span>}
                </div>
                <div className="dk-card-n">{c.t}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============ Main Landing Page ============ */
function LandingPage({ onAuthed, initialAuth = null }) {
  const Ic = LandingIc;

  /* ---- CSS loading ---- */
  const [cssReady, setCssReady] = uS(() => !!document.getElementById('ma-landing-css'));

  uE(() => {
    document.documentElement.classList.add('lp-active');
    document.body.classList.add('lp-active');
    let alive = true;
    let link = document.getElementById('ma-landing-css');
    if (!link) {
      link = document.createElement('link');
      link.id = 'ma-landing-css';
      link.rel = 'stylesheet';
      link.href = '/app/ma-landing.css?v=20260622-v3';
      document.head.appendChild(link);
    }
    const markReady = () => { if (alive) setCssReady(true); };
    if (link.sheet) markReady();
    else {
      link.addEventListener('load', markReady, { once: true });
      setTimeout(markReady, 700);
    }
    return () => {
      alive = false;
      link.removeEventListener('load', markReady);
      document.documentElement.classList.remove('lp-active');
      document.body.classList.remove('lp-active');
      const l = document.getElementById('ma-landing-css');
      if (l) l.remove();
    };
  }, []);

  /* ---- State ---- */
  const [auth, setAuth] = uS(initialAuth);
  const [scrolled, setScrolled] = uS(false);
  const [menu, setMenu] = uS(false);
  const [sticky, setSticky] = uS(false);
  const [tplTab, setTplTab] = uS('Все');
  const [priceTab, setPriceTab] = uS('subs');
  const [billing, setBilling] = uS('month');
  const [subsExpanded, setSubsExpanded] = uS(false);
  const [faqOpen, setFaqOpen] = uS(-1);
  const [howStep, setHowStep] = uS(0);

  /* ---- Hero prompt state ---- */
  const [heroVal, setHeroVal] = uS('');
  const [heroPh, setHeroPh] = uS('');
  const [heroIx, setHeroIx] = uS(0);

  /* ---- Phone mock state ---- */
  const [phIdx, setPhIdx] = uS(0);
  const [phStep, setPhStep] = uS(0);
  const [phTyped, setPhTyped] = uS('');
  const [phProg, setPhProg] = uS(0);

  /* ---- Scroll reveal ---- */
  const runReveal = uC(() => {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal:not(.in)').forEach(n => io.observe(n));
    return io;
  }, []);

  uE(() => {
    const io = runReveal();
    return () => io.disconnect();
  }, [cssReady, tplTab, priceTab, billing, subsExpanded]);

  /* ---- Scroll handlers ---- */
  uE(() => {
    const h = () => {
      setScrolled(window.scrollY > 16);
      setSticky(window.scrollY > 820);
    };
    window.addEventListener('scroll', h, { passive: true }); h();
    return () => window.removeEventListener('scroll', h);
  }, []);

  /* ---- Hero placeholder typing animation ---- */
  uE(() => {
    if (heroVal) return;
    const txt = HERO_IDEAS[heroIx];
    let i = 0, dir = 1, hold = 0;
    const iv = setInterval(() => {
      if (dir > 0) {
        i++;
        setHeroPh(txt.slice(0, i));
        if (i >= txt.length) { hold++; if (hold > 16) { dir = -1; hold = 0; } }
      } else {
        i--;
        setHeroPh(txt.slice(0, i));
        if (i <= 0) { dir = 1; setHeroIx(p => (p + 1) % HERO_IDEAS.length); }
      }
    }, 55);
    return () => clearInterval(iv);
  }, [heroIx, heroVal]);

  /* ---- Phone animation cycle ---- */
  uE(() => {
    let timers = []; let raf = 0;
    setPhStep(0); setPhTyped(''); setPhProg(0);
    const cur = PH_SHOTS[phIdx];
    const full = cur.p; let i = 0;
    const typeIv = setInterval(() => { i++; setPhTyped(full.slice(0, i)); if (i >= full.length) clearInterval(typeIv); }, 42);
    const tGen = setTimeout(() => {
      setPhStep(1);
      const t0 = performance.now(), dur = 2000;
      const tick = (now) => { const p = Math.min(1, (now - t0) / dur); setPhProg(Math.round(p * 100)); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, full.length * 42 + 350);
    const tDone = setTimeout(() => setPhStep(2), full.length * 42 + 350 + 2100);
    const tNext = setTimeout(() => setPhIdx(p => (p + 1) % PH_SHOTS.length), full.length * 42 + 350 + 2100 + 2400);
    timers = [typeIv, tGen, tDone, tNext];
    return () => { timers.forEach(clearTimeout); clearInterval(typeIv); cancelAnimationFrame(raf); };
  }, [phIdx]);

  /* ---- 3D tilt and magnetic effects ---- */
  uE(() => {
    if (!cssReady) return;
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const cleanups = [];
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'transform .08s linear';
        el.style.transform = `perspective(820px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
      };
      const leave = () => { el.style.transition = 'transform .45s var(--ease)'; el.style.transform = ''; };
      el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
      cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
    });
    document.querySelectorAll('[data-mag]').forEach(el => {
      const move = (e) => { const r = el.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; el.style.transform = `translate(${(x * .3).toFixed(1)}px,${(y * .4).toFixed(1)}px)`; };
      const leave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
      cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
    });
    return () => cleanups.forEach(fn => fn());
  }, [cssReady]);

  /* ---- Nav ---- */
  const curPhone = PH_SHOTS[phIdx];
  const navLinks = [
    ['#features', 'Возможности'],
    ['#templates', 'Шаблоны'],
    ['#how', 'Как это работает'],
    ['#models', 'Модели'],
    ['#pricing', 'Тарифы'],
  ];
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const filteredTpl = tplTab === 'Все' ? TPL : TPL.filter(t => t.c === tplTab);
  const visibleSubs = subsExpanded ? SUBS : SUBS.filter(p => p.core);

  if (!cssReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(127,170,157,.22)', borderTopColor: '#7faa9d', animation: 'lp-spin .8s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="lp-wrap">
      <div className="lp-aurora"><i className="a1"></i><i className="a2"></i><i className="a3"></i></div>

      {/* Nav */}
      <nav className={'lp-nav' + (scrolled ? ' scrolled' : '')}>
        <a href="#top" className="lp-brand" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="lp-logo"><LogoMark size={34} /></span> Hubicx
        </a>
        <div className="lp-nav-links">
          {navLinks.map(l => (
            <a key={l[0]} href={l[0]} onClick={e => { e.preventDefault(); scrollTo(l[0].slice(1)); }}>{l[1]}</a>
          ))}
          <a href="/blog/">Блог</a>
        </div>
        <div className="lp-nav-cta">
          <button className="lp-btn lp-btn-ghost" onClick={() => setAuth('login')}>Войти</button>
          <button className="lp-btn lp-btn-white" onClick={() => setAuth('register')} data-mag>Начать бесплатно</button>
          <button className="lp-burger" aria-label="Открыть меню" onClick={() => setMenu(true)}><Ic n="menu" s={20} /></button>
        </div>
      </nav>

      {/* Mobile nav */}
      {menu && (
        <div className="lp-mobnav">
          <button className="lp-auth-x" style={{ position: 'absolute', top: 20, right: 20 }} onClick={() => setMenu(false)}><Ic n="close" s={18} /></button>
          {navLinks.map(l => (
            <a key={l[0]} href={l[0]} onClick={e => { e.preventDefault(); setMenu(false); scrollTo(l[0].slice(1)); }}>{l[1]}</a>
          ))}
          <a href="/blog/">Блог</a>
          <button className="lp-btn lp-btn-white lp-btn-lg" onClick={() => { setMenu(false); setAuth('register'); }}>Начать бесплатно</button>
        </div>
      )}

      <main className="lp-main" id="top">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Hubicx',
          description: 'AI-хаб для генерации фото, видео и текстов. Одна подписка на лучшие AI-модели без VPN — прямо в Telegram и в браузере.',
          applicationCategory: 'Multimedia',
          operatingSystem: 'Web, Telegram',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB', description: 'Бесплатный старт с 50 токенами в подарок' }
        }) }}></script>

        {/* ========== 1. HERO (split) ========== */}
        <section className="lp-hero-split">
          <div className="lp-hero-l">
            <span className="lp-kicker" style={{ marginBottom: 16 }}>AI-хаб прямо в Telegram</span>
            <h1>
              <span className="word" style={{ animationDelay: '.12s', marginRight: '.22em' }}>Создавай</span>
              <span className="word" style={{ animationDelay: '.19s', marginRight: '.22em' }}>фото,</span>
              <span className="word" style={{ animationDelay: '.26s', marginRight: '.22em' }}>видео</span>
              <span className="word" style={{ animationDelay: '.33s', marginRight: '.22em' }}>и</span>
              <span className="word lp-grad-tx" style={{ animationDelay: '.4s', marginRight: '.22em' }}>тексты</span>
              <span className="word lp-grad-tx" style={{ animationDelay: '.5s' }}>силой&nbsp;ИИ</span>
            </h1>
            <p className="lp-hero-sub">Одна подписка на лучшие AI-модели для фото, видео, чата и промптов. Без VPN и сложных настроек — всё в привычном Telegram и в браузере.</p>

            <div className="lp-hp">
              <form className="lp-hp-bar" onSubmit={e => { e.preventDefault(); setAuth('register'); }}>
                <span className="lp-hp-ic"><Ic n="sparkle" s={20} c="#7faa9d" /></span>
                <input className="lp-hp-in" value={heroVal}
                  onChange={e => setHeroVal(e.target.value)}
                  placeholder={heroVal ? '' : ('Опишите идею: «' + heroPh + '»')} />
                <button className="lp-btn lp-btn-grad lp-hp-go" type="submit">Сгенерировать <Ic n="arrow" s={17} /></button>
              </form>
              <div className="lp-hp-chips">
                <span className="lp-hp-lbl">Попробуйте:</span>
                {HERO_IDEAS.slice(0, 3).map(t => (
                  <button key={t} className="lp-hp-chip" onClick={() => setHeroVal(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div className="lp-hero-meta">
              <span><Ic n="check" s={15} c="#7faa9d" /> 50 токенов в подарок</span>
              <span><Ic n="bolt" s={15} c="#7faa9d" /> Результат за секунды</span>
              <span><Ic n="shield" s={15} c="#7faa9d" /> Без VPN</span>
            </div>
            <div className="lp-hero-meta" style={{ marginTop: 12 }}>
              <span>🎁 50 токенов сразу + до 140 за простые задания</span>
            </div>
          </div>

          <div className="lp-hero-r">
            <div className="lp-phone">
              <div className="lp-phone-scr">
                <div className="pm-notch"></div>
                <div className="pm-top">
                  <span className="pm-logo"><LogoMark size={26} /></span>
                  <span className="pm-name">Hubicx</span>
                  <span className="pm-tok"><Ic n="sparkle" s={13} c="#7faa9d" /> 248</span>
                </div>
                <div className="pm-canvas">
                  <img className={'pm-shot' + (phStep >= 2 ? ' in' : '')} src={Gg(curPhone.n)} alt={'Пример AI-генерации: ' + curPhone.p} />
                  {phStep === 0 && (
                    <div className="pm-overlay pm-type">
                      <span className="ic"><Ic n="wand" s={18} c="#7faa9d" /></span>
                      <div className="tx">{phTyped}<span className="lp-cur"></span></div>
                    </div>
                  )}
                  {phStep === 1 && (
                    <div className="pm-overlay pm-gen">
                      <span className="lp-load-ring"></span>
                      <div className="pm-prog"><i style={{ width: phProg + '%' }}></i></div>
                      <div className="pm-gen-t">Генерация… {phProg}%</div>
                    </div>
                  )}
                  <div className={'pm-badge' + (phStep >= 2 ? ' show' : '')}>
                    <Ic n="check" s={12} c="#1c1c1a" sw={2.8} /> {curPhone.m} · {curPhone.t}
                  </div>
                </div>
                <div className="pm-bar">
                  <div className="pm-input">{phStep === 0 ? (phTyped || 'Опишите идею…') : curPhone.p}</div>
                  <span className="pm-send"><Ic n="arrow" s={18} c="#1c1c1a" /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 2. SHOWCASE MARQUEE ========== */}
        <div className="lp-show">
          <div className="lp-row">
            {[...SHOW_A, ...SHOW_A].map((t, i) => (
              <div className={'lp-tile' + (t.cls ? ' ' + t.cls : '')} key={'a' + i}>
                <img src={Gg(t.n)} alt={t.l} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="lp-tile-sh"></div>
                {t.vid && <span className="lp-tile-play"><svg width="18" height="18" viewBox="0 0 24 24" fill="#1c1c1a"><path d="M7 4l13 8-13 8z" /></svg></span>}
                {t.vid && <span className="lp-tile-dur"><svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z" /></svg> {t.dur}</span>}
                <div className="lp-tile-l">{t.l}</div>
              </div>
            ))}
          </div>
          <div className="lp-row rev">
            {[...SHOW_B, ...SHOW_B].map((t, i) => (
              <div className={'lp-tile' + (t.cls ? ' ' + t.cls : '')} key={'b' + i}>
                <img src={Gg(t.n)} alt={t.l} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="lp-tile-sh"></div>
                {t.vid && <span className="lp-tile-play"><svg width="18" height="18" viewBox="0 0 24 24" fill="#1c1c1a"><path d="M7 4l13 8-13 8z" /></svg></span>}
                {t.vid && <span className="lp-tile-dur"><svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z" /></svg> {t.dur}</span>}
                <div className="lp-tile-l">{t.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== 3. TRUST BAR ========== */}
        <div className="lp-trust reveal">
          <div className="lp-ava-stack">
            {[7, 9, 8, 10, 6].map(n => (
              <span key={n} style={{ backgroundImage: 'url(' + Gg(n) + ')', width: 36, height: 36, marginLeft: -9, border: '2px solid var(--bg)', borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover', boxShadow: 'var(--shadow-sm)' }}></span>
            ))}
          </div>
          <span>Более <b style={{ color: 'var(--ink)' }}>120 000</b> создателей уже с Hubicx</span>
        </div>

        {/* ========== 4. FEATURES (Bento grid) ========== */}
        <section className="lp-sec" id="features">
          <div className="lp-sec-head">
            <span className="lp-kicker reveal">Возможности</span>
            <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>Всё, что нужно для контента —<br /><span className="lp-grad-tx">в одном хабе</span></h2>
            <p className="lp-sub reveal" style={{ '--d': '120ms' }}>Не нужно собирать зоопарк из подписок. Hubicx объединяет топовые модели под одной крышей.</p>
          </div>
          <div className="lp-feat-grid">
            {/* Photo — large */}
            <div className="lp-feat lp-feat-lg reveal">
              <div className="lp-feat-ic"><Ic n="image" s={24} c="#7faa9d" /></div>
              <div className="lp-feat-t">Фото</div>
              <div className="lp-feat-s">Генерируйте изображения по тексту, оживляйте селфи и редактируйте кадры лучшими моделями.</div>
              <div className="lp-feat-chips">
                <span className="lp-feat-chip">Портрет</span>
                <span className="lp-feat-chip">Кино</span>
                <span className="lp-feat-chip">Неон</span>
                <span className="lp-feat-chip">Товарное</span>
              </div>
              <div className="lp-feat-thumb"><img src={Gg(9)} alt="Фото" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            </div>
            {/* Video — wide */}
            <div className="lp-feat lp-feat-w reveal" style={{ '--d': '80ms' }}>
              <div className="lp-feat-ic"><Ic n="video" s={24} c="#7faa9d" /></div>
              <div className="lp-feat-t">Видео</div>
              <div className="lp-feat-s">Из текста или фото — кинематографичные ролики с движением камеры и звуком.</div>
              <div className="lp-feat-thumb vid">
                <img src={Gg(2)} alt="Видео" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="lp-feat-play"><svg width="18" height="18" viewBox="0 0 24 24" fill="#1c1c1a"><path d="M7 4l13 8-13 8z" /></svg></span>
                <span className="lp-feat-dur"><svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z" /></svg> 0:08</span>
              </div>
            </div>
            {/* AI Chat */}
            <div className="lp-feat reveal" style={{ '--d': '160ms' }}>
              <div className="lp-feat-ic"><Ic n="chat" s={24} c="#7faa9d" /></div>
              <div className="lp-feat-t">AI-чат</div>
              <div className="lp-feat-s">Умный ассистент: идеи, тексты, сценарии и помощь в любой задаче — 24/7.</div>
              <div className="lp-feat-chat">
                <div className="lp-feat-bub u">Придумай 5 идей для рилса про кофейню</div>
                <div className="lp-feat-bub a">Готово! Вот цепляющие сценарии под Reels 👇</div>
                <div className="lp-feat-bub a"><span className="tw"><i></i><i></i><i></i></span></div>
              </div>
            </div>
            {/* Prompts */}
            <div className="lp-feat reveal" style={{ '--d': '240ms' }}>
              <div className="lp-feat-ic"><Ic n="wand" s={24} c="#7faa9d" /></div>
              <div className="lp-feat-t">Промпты</div>
              <div className="lp-feat-s">Готовые шаблоны и улучшение промптов в один тап — результат с первого раза.</div>
              <div className="lp-feat-prompt">
                <div className="lp-feat-pbar">
                  <span className="lp-feat-ptx">портрет в стиле киберпанк, неон…</span>
                  <span className="lp-feat-pgo"><Ic n="sparkle" s={15} c="#1c1c1a" sw={2} /></span>
                </div>
                <div className="lp-feat-psug"><span>+ детализация</span><span>+ 8K</span><span>+ киносвет</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 5. HOW IT WORKS (compact) ========== */}
        <section className="lp-how" id="how">
          <div className="lp-how-grid">
            <div className="lp-how-text">
              <span className="lp-kicker reveal">Как это работает</span>
              <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>От идеи до кадра —<br /><span className="lp-grad-tx">за три шага</span></h2>
              <div className="lp-how-steps">
                {HOW_DATA.map((s, i) => (
                  <div className={'lp-how-step' + (howStep === i ? ' on' : '')} key={s.k}
                    onClick={() => setHowStep(i)}>
                    <span className="lp-how-num">{s.k}</span>
                    <div><div className="lp-how-t">{s.t}</div><div className="lp-how-d">{s.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-how-visual">
              <div className="lp-how-frame">
                <img src={Gg(8)} alt="Результат генерации" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="lp-how-badge"><Ic n="check" s={14} c="#1c1c1a" sw={2.6} /> Готово · 14 сек</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 6. TEMPLATES ========== */}
        <section className="lp-sec" id="templates">
          <div className="lp-sec-head">
            <span className="lp-kicker reveal">Шаблоны и тренды</span>
            <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>Сотни готовых шаблонов —<br /><span className="lp-grad-tx">для фото и видео</span></h2>
            <p className="lp-sub reveal" style={{ '--d': '120ms' }}>Не нужно придумывать промпт с нуля. Выберите шаблон или вирусный тренд, добавьте своё фото — и получите результат в один тап. Библиотека обновляется каждую неделю.</p>
          </div>

          <DesktopMock />

          <div className="lp-tpl-bar reveal">
            <div className="lp-tpl-tabs">
              {TPL_TABS.map(t => (
                <button key={t} className={'lp-chip' + (tplTab === t ? ' on' : '')}
                  onClick={() => setTplTab(t)}>{t === 'Тренд' ? 'Тренды' : t}</button>
              ))}
            </div>
            <div className="lp-tpl-count"><b>180+</b> шаблонов · обновляем еженедельно</div>
          </div>

          <div className="lp-tpl-grid">
            {filteredTpl.map((t, i) => (
              <div className="lp-tpl" key={t.t} style={{ '--d': (i % 8 * 40) + 'ms' }}
                onClick={() => setAuth('register')}>
                <div className="lp-tpl-thumb">
                  <img src={Gg(t.n)} alt={'Шаблон: ' + t.t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {t.isVideo && <span className="lp-tpl-v"><Ic n="play" s={11} c="#fff" /> {t.dur}</span>}
                  {t.tr && <span className="lp-tpl-tr"><Ic n="bolt" s={11} c="#1c1c1a" /> В тренде</span>}
                  <span className="lp-tpl-use"><Ic n="wand" s={15} c="#1c1c1a" /> Использовать</span>
                </div>
                <div className="lp-tpl-b"><span className="lp-tpl-n">{t.t}</span><span className="lp-tpl-tag">{t.c}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 7. MODELS ========== */}
        <section className="lp-sec" id="models">
          <div className="lp-sec-head">
            <span className="lp-kicker reveal">Модели</span>
            <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>Лучшие модели — <span className="lp-grad-tx">всегда под рукой</span></h2>
            <p className="lp-sub reveal" style={{ '--d': '120ms' }}>Мы подключаем топовые нейросети и обновляем их за вас. Платите токенами — без отдельных подписок.</p>
          </div>
          <div className="lp-models reveal">
            {MODELS.map(m => (
              <div className="lp-model" key={m.name} onClick={() => setAuth('register')} data-tilt>
                <div className="lp-model-img">
                  <img src={Gg(m.n)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="lp-model-tag">{m.tag}</span>
                </div>
                <div className="lp-model-b"><div className="lp-model-n">{m.name}</div><div className="lp-model-d">{m.d}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 8. WHY HUBICX (comparison) ========== */}
        <section className="lp-sec" id="why">
          <div className="lp-sec-head">
            <span className="lp-kicker reveal">Почему Hubicx</span>
            <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>Один хаб вместо <span className="lp-grad-tx">зоопарка подписок</span></h2>
            <p className="lp-sub reveal" style={{ '--d': '120ms' }}>Перестаньте платить за пять сервисов, прыгать между приложениями и искать рабочий VPN.</p>
          </div>
          <div className="lp-cmp reveal">
            <div className="lp-cmp-head">
              <div className="lp-cmp-feat"></div>
              <div className="lp-cmp-col best"><span className="lp-cmp-logo"><LogoMark size={24} /></span> Hubicx</div>
              <div className="lp-cmp-col">Отдельные подписки</div>
            </div>
            {CMP_ROWS_DATA.map((r, i) => (
              <div className="lp-cmp-row" key={i}>
                <div className="lp-cmp-feat">{r}</div>
                <div className="lp-cmp-cell best"><span className="lp-cmp-yes"><Ic n="check" s={17} c="#fff" sw={2.8} /></span></div>
                <div className="lp-cmp-cell"><span className="lp-cmp-no"><Ic n="x" s={15} /></span></div>
              </div>
            ))}
          </div>
          <div className="lp-cmp-sum reveal">
            <div className="lp-cmp-sum-l">
              <span className="lp-cmp-sum-strike">Midjourney ~1 500 ₽ + Kling ~1 800 ₽ + ChatGPT Plus ~2 000 ₽ + VPN ~300 ₽</span>
              <b>≈ 5 600 ₽ в месяц за зоопарк подписок</b>
            </div>
            <div className="lp-cmp-sum-vs"><Ic n="arrow" s={18} c="#fff" /></div>
            <div className="lp-cmp-sum-r">
              <span>Один Hubicx</span>
              <b>от 790 ₽ / мес</b>
            </div>
          </div>
        </section>

        {/* ========== 9. STATS ========== */}
        <section className="lp-sec">
          <div className="lp-stats">
            {STATS_DATA.map((s, i) => (
              <div className="lp-stat reveal" key={i} style={{ '--d': (i * 70) + 'ms' }}>
                <div className="lp-stat-n"><LandingStatNum to={s.to} suffix={s.suffix} /></div>
                <div className="lp-stat-l">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 10. PRICING ========== */}
        <section className="lp-sec" id="pricing">
          <div className="lp-sec-head" style={{ alignItems: 'center', textAlign: 'center' }}>
            <span className="lp-kicker reveal">Тарифы</span>
            <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>Выберите формат — <span className="lp-grad-tx">подписка или токены</span></h2>
            <p className="lp-sub reveal" style={{ '--d': '120ms', margin: '0 auto' }}>Подписки — для регулярного контента, разовые пакеты — когда нужно пополнить баланс. Токены тратятся только на генерации.</p>
            <p className="lp-sub reveal" style={{ '--d': '150ms', margin: '8px auto 0', fontSize: 15 }}>Можно начать бесплатно: 50 токенов после регистрации.</p>
          </div>

          <div className="lp-price-toggle reveal">
            <div className="lp-price-seg">
              <button className={priceTab === 'subs' ? 'on' : ''} onClick={() => setPriceTab('subs')}>Подписки</button>
              <button className={priceTab === 'packs' ? 'on' : ''} onClick={() => setPriceTab('packs')}>Пакеты токенов</button>
            </div>
          </div>

          {/* Subscriptions */}
          {priceTab === 'subs' && (
            <>
              <div className="lp-bill reveal">
                <div className="lp-bill-seg">
                  <button className={billing === 'month' ? 'on' : ''} onClick={() => setBilling('month')}>Месяц</button>
                  <button className={billing === 'year' ? 'on' : ''} onClick={() => setBilling('year')}>
                    Год <span className="lp-bill-save">−20%</span>
                  </button>
                </div>
              </div>
              <div className={'lp-price' + (subsExpanded ? ' cols-5' : ' cols-3')}>
                {visibleSubs.map((pl, i) => (
                  <div className={'lp-plan reveal' + (pl.best ? ' best' : '')} key={pl.n} style={{ '--d': (i * 80) + 'ms' }}>
                    {pl.badge && <span className="lp-plan-badge">{pl.badge}</span>}
                    <div className="lp-plan-n">{pl.n}</div>
                    <div className="lp-plan-p">{billing === 'year' ? pl.py : pl.p} <span>₽</span></div>
                    <div className="lp-plan-per">{billing === 'year' ? 'в месяц · оплата за год' : 'в месяц'}</div>
                    <div className="lp-plan-tok">{pl.t}</div>
                    <ul className="lp-plan-feats">
                      {pl.f.map(f => <li key={f}><i><Ic n="check" s={16} sw={2.4} /></i>{f}</li>)}
                    </ul>
                    <button className={'lp-btn lp-btn-lg ' + (pl.best ? 'lp-btn-grad' : 'lp-btn-ghost')}
                      onClick={() => setAuth('register')}>Выбрать</button>
                  </div>
                ))}
              </div>
              <div className="lp-subs-more">
                <button className="lp-btn lp-btn-ghost" onClick={() => setSubsExpanded(!subsExpanded)}>
                  {subsExpanded ? 'Свернуть тарифы' : 'Все подписки'}
                </button>
              </div>
            </>
          )}

          {/* Packs */}
          {priceTab === 'packs' && (
            <>
              <div className="lp-price-label reveal" style={{ marginTop: 4 }}>Разовые пакеты токенов</div>
              <div className="lp-price lp-price-packs">
                {PACKS.map((pl, i) => (
                  <div className={'lp-plan reveal' + (pl.best ? ' best' : '')} key={pl.n} style={{ '--d': (i * 70) + 'ms' }}>
                    {pl.badge && <span className="lp-plan-badge">{pl.badge}</span>}
                    <div className="lp-plan-n">{pl.n}</div>
                    <div className="lp-plan-p">{pl.p} <span>₽</span></div>
                    <div className="lp-plan-tok">{pl.t}</div>
                    <ul className="lp-plan-feats">
                      {pl.f.map(f => <li key={f}><i><Ic n="check" s={16} sw={2.4} /></i>{f}</li>)}
                    </ul>
                    <button className={'lp-btn lp-btn-lg ' + (pl.best ? 'lp-btn-grad' : 'lp-btn-ghost')}
                      onClick={() => setAuth('register')}>Пополнить</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ========== 11. FAQ ========== */}
        <section className="lp-sec" id="faq">
          <div className="lp-sec-head" style={{ alignItems: 'center', textAlign: 'center' }}>
            <span className="lp-kicker reveal">Вопросы</span>
            <h2 className="lp-h2 reveal" style={{ '--d': '60ms' }}>Частые вопросы</h2>
          </div>
          <div className="lp-faq reveal">
            {FAQ.map((f, i) => (
              <div className={'lp-faq-item' + (faqOpen === i ? ' open' : '')} key={i}>
                <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>
                  <span>{f[0]}</span>
                  <span className="lp-faq-ic"><Ic n="plus" s={18} /></span>
                </button>
                <div className="lp-faq-a"><div className="lp-faq-a-in">{f[1]}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 12. FINAL CTA ========== */}
        <section className="lp-sec" style={{ paddingTop: 0 }}>
          <div className="lp-cta reveal">
            <h2>Начните создавать<br /><span className="lp-grad-tx">уже сегодня</span></h2>
            <p>50 токенов в подарок при регистрации. Карта не нужна.</p>
            <div className="lp-cta-row">
              <button className="lp-btn lp-btn-white lp-btn-lg" onClick={() => setAuth('register')}>
                Начать бесплатно <Ic n="arrow" s={18} />
              </button>
              <button className="lp-btn lp-btn-tg lp-btn-lg" onClick={() => setAuth('register')}>
                <Ic n="tg" s={18} c="#fff" /> Открыть в Telegram
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ========== 13. FOOTER ========== */}
      <footer className="lp-foot">
        <div className="lp-foot-in">
          <div className="lp-foot-brand">
            <div className="lp-brand"><span className="lp-logo"><img src="assets/logo.jpg" alt="Hubicx" width="34" height="34" style={{borderRadius:10}} /></span> Hubicx</div>
            <p style={{ color: 'var(--mut)', fontSize: 14, lineHeight: 1.55 }}>Ваш AI-хаб для фото, видео, чата и промптов. Прямо в Telegram и в браузере.</p>
            <div className="lp-socials">
              {['tg', 'x', 'yt', 'ig'].map(s => <a className="lp-soc" key={s} href="#" onClick={e => e.preventDefault()}><Ic n={s} s={18} /></a>)}
            </div>
          </div>
          {[
            ['Продукт', [['/#features','Возможности'], ['/#models','Модели'], ['/#pricing','Тарифы'], ['/#templates','Примеры']]],
            ['Компания', [['#','О нас'], ['/blog/','Блог'], ['/pages/contacts','Контакты']]],
            ['Поддержка', [['/pages/help','Помощь'], ['/pages/docs','Документация'], ['/pages/terms','Оферта'], ['/pages/privacy','Конфиденциальность'], ['/pages/personal-data-consent','Согласие на ПД']]],
          ].map(col => (
            <div className="lp-foot-col" key={col[0]}>
              <h4>{col[0]}</h4>
              {col[1].map(l => <a key={l[0]} href={l[0]}>{l[1]}</a>)}
            </div>
          ))}
        </div>
        <div className="lp-foot-bot">
          <span>© 2026 Hubicx. Все права защищены.</span>
          <span>Сделано с ИИ и любовью</span>
        </div>
      </footer>

      {/* ========== 14. STICKY CTA ========== */}
      <div className={'lp-sticky' + (sticky ? ' show' : '')}>
        <div className="lp-sticky-in">
          <span className="lp-sticky-tx"><b>50 токенов в подарок</b> — попробуйте без карты, прямо сейчас</span>
          <button className="lp-btn lp-btn-white" onClick={() => setAuth('register')}>Начать бесплатно</button>
        </div>
      </div>

      {/* ========== 15. AUTH MODAL ========== */}
      {auth && <LandingAuthModal initial={auth} onClose={() => setAuth(null)} onAuthed={onAuthed} />}
    </div>
  );
}

/* ============ Exports ============ */
window.HBX = window.HBX || {};
window.HBX.Ic = LandingIc;
window.HBX.Star = LandingStar;
window.HBX.BeforeAfter = BeforeAfter;
window.HBX.LandingAuthModal = LandingAuthModal;
window.HBX.LandingPage = LandingPage;
window.Landing = LandingPage;
