/* ============ Integrated Hubicx landing for public browser users ============ */
const lpUseState = React.useState;
const lpUseEffect = React.useEffect;
const lpUseRef = React.useRef;
window.HBX = window.HBX || {};

/* ============ Hubicx desktop — inline icon set ============ */


function LandingIc({ n, s = 22, c = "currentColor", sw = 1.9 }) {
  const p = {
    home:<g><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></g>,
    wand:<g><path d="M15 4V2M19 8h2M17 5l1.5-1.5M3 21l11-11"/><path d="M13 7l4 4"/><path d="M19 14l.6 1.6L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.4z"/></g>,
    image:<g><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 21"/></g>,
    video:<g><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/></g>,
    history:<g><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></g>,
    chat:<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>,
    user:<g><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></g>,
    chev:<path d="M9 6l6 6-6 6"/>,
    back:<path d="M15 5l-7 7 7 7"/>,
    search:<g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></g>,
    bell:<g><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></g>,
    plus:<path d="M12 5v14M5 12h14"/>,
    check:<path d="M5 12.5l4.5 4.5L19 6.5"/>,
    download:<g><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/></g>,
    send:<path d="M4 12l16-7-7 16-2-7-7-2z"/>,
    model:<g><circle cx="12" cy="12" r="2.4"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/></g>,
    aspect:<rect x="6" y="4" width="12" height="16" rx="2.5"/>,
    refresh:<g><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 20v-4h4"/></g>,
    close:<path d="M6 6l12 12M18 6L6 18"/>,
    settings:<g><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></g>,
    upscale:<g><path d="M3 9V3h6"/><path d="M21 15v6h-6"/><path d="M3 3l7 7M21 21l-7-7"/></g>,
    copy:<g><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></g>,
    sparkle:<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>,
    layers:<g><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></g>,
    grid:<g><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></g>,
    addimg:<g><rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 15l5-4 4 3 3-2 6 4"/><circle cx="8.5" cy="9" r="1.5"/><path d="M19 2v6M16 5h6"/></g>,
    play:<path d="M7 4l13 8-13 8z"/>,
    eye:<g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>,
    arrow:<path d="M5 12h14M13 6l6 6-6 6"/>,
    tg:<path d="M21.5 4.5L2.5 11.8c-.8.3-.8 1.4.1 1.6l4.8 1.5 1.8 5.6c.2.7 1.1.9 1.6.3l2.6-2.7 4.9 3.6c.6.4 1.4.1 1.6-.6L23 5.6c.2-.9-.7-1.5-1.5-1.1z"/>,
    menu:<path d="M3 6h18M3 12h18M3 18h18"/>,
    lock:<g><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></g>,
    mail:<g><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></g>,
    bolt:<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>,
    shield:<g><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></g>,
    infinity:<path d="M6 9a3 3 0 1 0 0 6c2 0 3-1.5 6-3s4-3 6-3a3 3 0 1 1 0 6c-2 0-3-1.5-6-3S8 9 6 9z"/>,
    x:<path d="M4 4l16 16M20 4L4 20"/>,
    yt:<g><rect x="2.5" y="6" width="19" height="12" rx="3.5"/><path d="M10 9l5 3-5 3z"/></g>,
    ig:<g><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/></g>,
    dc:<g><path d="M8 12a1 1 0 1 0 .01 0M16 12a1 1 0 1 0 .01 0"/><path d="M7 18l-1 3s-3-1.5-4-4c0-4 1-8 2.5-10C6 6 8 5.5 8 5.5L9 7h6l1-1.5s2 .5 3.5 1.5C21 9 22 13 22 17c-1 2.5-4 4-4 4l-1-3"/></g>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[n]}</svg>;
}

function LandingStar({ s = 16, c = "#c2a93f" }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 2l2.4 6.4L21 9l-5 4.2L17.4 21 12 17.3 6.6 21 8 13.2 3 9l6.6-.6z"/>
  </svg>;
}

window.HBX = window.HBX || {};
window.HBX.Ic = LandingIc;
window.HBX.Star = LandingStar;

/* ============ Hubicx landing — premium sections (v2) ============ */
const { useState:uS2, useEffect:uE2, useRef:uR2 } = React;
const Gg = (n)=> 'assets/g/r'+n+'.png';

/* ---- Before / After draggable slider ---- */
function BeforeAfter({ before, after, label }){
  const { Ic } = window.HBX;
  const wrapRef = uR2(null);
  const [pos,setPos] = uS2(58);
  const drag = uR2(false);

  const move = (clientX)=>{
    const el = wrapRef.current; if(!el) return;
    const r = el.getBoundingClientRect();
    let p = ((clientX - r.left) / r.width) * 100;
    p = Math.max(2, Math.min(98, p));
    setPos(p);
  };
  uE2(()=>{
    const up = ()=> drag.current=false;
    const mv = (e)=>{ if(drag.current) move(e.touches?e.touches[0].clientX:e.clientX); };
    window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
    return ()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
  },[]);

  return <div className="lp-ba" ref={wrapRef}
      onPointerDown={(e)=>{ drag.current=true; move(e.clientX); }}>
    <img className="lp-ba-img" src={after} alt="" draggable="false"/>
    <div className="lp-ba-before" style={{width:pos+'%'}}>
      <img src={before} alt="" draggable="false" style={{width:(wrapRef.current?wrapRef.current.offsetWidth:600)+'px'}}/>
    </div>
    <span className="lp-ba-tag l">Фото</span>
    <span className="lp-ba-tag r">AI-результат</span>
    <div className="lp-ba-handle" style={{left:pos+'%'}}>
      <span className="lp-ba-knob"><Ic n="arrow" s={15} c="#1c1c1a"/><Ic n="arrow" s={15} c="#1c1c1a"/></span>
    </div>
  </div>;
}

/* ---- Interactive hero prompt ---- */
function HeroPrompt({ onLaunch }){
  const { Ic } = window.HBX;
  const ideas = ['неоновый портрет, киберпанк, дождь','закат над горами, 35mm','пластилиновый герой, студийный свет','город будущего ночью'];
  const [val,setVal] = uS2('');
  const [ph,setPh] = uS2('');
  const [ix,setIx] = uS2(0);
  // typing placeholder when empty
  uE2(()=>{
    if(val) return;
    let i=0, txt=ideas[ix], dir=1, hold=0;
    const iv=setInterval(()=>{
      if(dir>0){ i++; setPh(txt.slice(0,i)); if(i>=txt.length){ hold++; if(hold>16){dir=-1;hold=0;} } }
      else { i--; setPh(txt.slice(0,i)); if(i<=0){ dir=1; setIx(p=>(p+1)%ideas.length); } }
    }, 55);
    return ()=>clearInterval(iv);
  },[ix,val]);

  return <div className="lp-hp">
    <form className="lp-hp-bar" onSubmit={(e)=>{ e.preventDefault(); onLaunch(); }}>
      <span className="lp-hp-ic"><Ic n="sparkle" s={20} c="#7faa9d"/></span>
      <input className="lp-hp-in" value={val} onChange={e=>setVal(e.target.value)}
        placeholder={val?'':('Опишите идею: «'+ph+'»')}/>
      <button className="lp-btn lp-btn-grad lp-hp-go" type="submit">Сгенерировать <Ic n="arrow" s={17}/></button>
    </form>
    <div className="lp-hp-chips">
      <span className="lp-hp-lbl">Попробуйте:</span>
      {ideas.slice(0,3).map(t=><button key={t} className="lp-hp-chip" onClick={()=>setVal(t)}>{t}</button>)}
    </div>
  </div>;
}

/* ---- Sticky scroll-driven "How it works" ---- */
const HOW = [
  {k:'01', t:'Опишите идею', d:'Напишите промпт своими словами или выберите готовый шаблон. Мы подскажем и улучшим формулировку.'},
  {k:'02', t:'Модель рендерит', d:'Лучшая нейросеть под задачу собирает кадр. Обычно 10–20 секунд для фото.'},
  {k:'03', t:'Готовый результат', d:'Скачивайте в высоком качестве, отправляйте в Telegram или продолжайте в чате с агентом.'},
];
function StickyHow(){
  const { Ic } = window.HBX;
  const secRef = uR2(null);
  const [step,setStep] = uS2(0);
  const [prog,setProg] = uS2(0);
  const [pin,setPin] = uS2('before');

  uE2(()=>{
    let raf=0;
    const onScroll=()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const el=secRef.current; if(!el) return;
        const r=el.getBoundingClientRect();
        const total=el.offsetHeight - window.innerHeight;
        const passed=Math.min(Math.max(-r.top,0),total);
        const p= total>0 ? passed/total : 0;
        setProg(p);
        setPin(passed<=0 ? 'before' : (passed>=total ? 'after' : 'pinned'));
        setStep(p>=0.9 ? 2 : (p>=0.48 ? 1 : 0));
      });
    };
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    return ()=>{ window.removeEventListener('scroll',onScroll); cancelAnimationFrame(raf); };
  },[]);

  const typed = 'неоновый портрет в стиле киберпанк, дождь, боке';
  const tlen = step===0 ? Math.round(Math.min(1,(prog/0.48))*typed.length) : typed.length;

  return <section className={'lp-how is-'+pin} id="live" ref={secRef}>
    <div className="lp-how-sticky">
      <div className="lp-how-grid">
        <div className="lp-how-text">
          <span className="lp-kicker">Как это работает</span>
          <h2 className="lp-h2">От идеи до кадра —<br/><span className="lp-grad-tx">за три шага</span></h2>
          <div className="lp-how-steps">
            {HOW.map((s,i)=>(
              <div className={'lp-how-step'+(i===step?' on':'')+(i<step?' done':'')} key={s.k}>
                <span className="lp-how-num">{i<step ? <Ic n="check" s={18} c="#fff" sw={2.6}/> : s.k}</span>
                <div className="lp-how-body"><div className="lp-how-t">{s.t}</div><div className="lp-how-d">{s.d}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-how-visual">
          <div className="lp-how-frame">
            {/* result image — fades in on step 3 */}
            <img className={'lp-how-shot'+(step>=2?' in':'')} src={Gg(8)} alt=""/>
            {/* loader — step 2 */}
            {step===1 && <div className="lp-how-load"><span className="lp-load-ring"></span><span className="lp-load-t">Генерация…</span></div>}
            {/* prompt typing — step 1 */}
            {step===0 && <div className="lp-how-type">
              <span className="lp-how-type-ic"><Ic n="wand" s={22} c="#7faa9d"/></span>
              <div className="lp-how-type-tx">{typed.slice(0,tlen)}<span className="lp-cur"></span></div>
            </div>}
            <div className={'lp-how-badge'+(step>=2?' show':'')}><Ic n="check" s={14} c="#1c1c1a" sw={2.6}/> Готово · 14 сек</div>
          </div>
          <div className="lp-how-dots">{HOW.map((s,i)=><span key={i} className={i===step?'on':''}></span>)}</div>
        </div>
      </div>
    </div>
  </section>;
}

/* ---- Comparison: Hubicx vs scattered subscriptions ---- */
const CMP_ROWS = [
  ['Все топовые модели в одном месте', true, false],
  ['Оплата в рублях, без зарубежных карт', true, false],
  ['Работает без VPN', true, false],
  ['Прямо в Telegram и в браузере', true, false],
  ['Единый баланс токенов', true, false],
  ['Поддержка на русском 24/7', true, false],
];
function Comparison(){
  const { Ic } = window.HBX;
  return <section className="lp-sec" id="why">
    <div className="lp-sec-head">
      <span className="lp-kicker reveal">Почему Hubicx</span>
      <h2 className="lp-h2 reveal" style={{'--d':'60ms'}}>Один хаб вместо <span className="lp-grad-tx">зоопарка подписок</span></h2>
      <p className="lp-sub reveal" style={{'--d':'120ms'}}>Перестаньте платить за пять сервисов, прыгать между приложениями и искать рабочий VPN.</p>
    </div>
    <div className="lp-cmp reveal">
      <div className="lp-cmp-head">
        <div className="lp-cmp-feat"></div>
        <div className="lp-cmp-col best"><span className="lp-cmp-logo"><img src="assets/logo.jpg" alt=""/></span> Hubicx</div>
        <div className="lp-cmp-col">Отдельные подписки</div>
      </div>
      {CMP_ROWS.map((r,i)=>(
        <div className="lp-cmp-row" key={i}>
          <div className="lp-cmp-feat">{r[0]}</div>
          <div className="lp-cmp-cell best">{r[1] ? <span className="lp-cmp-yes"><Ic n="check" s={17} c="#fff" sw={2.8}/></span> : <span className="lp-cmp-no"><Ic n="x" s={15}/></span>}</div>
          <div className="lp-cmp-cell">{r[2] ? <span className="lp-cmp-yes"><Ic n="check" s={17} c="#fff" sw={2.8}/></span> : <span className="lp-cmp-no"><Ic n="x" s={14}/></span>}</div>
        </div>
      ))}
    </div>
  </section>;
}

/* ---- FAQ accordion ---- */
const FAQ = [
  ['Нужен ли VPN для работы?','Нет. Hubicx работает напрямую в Telegram и в браузере — все зарубежные модели доступны без VPN и сторонних настроек.'],
  ['Токены сгорают?','Нет. Купленные токены остаются на балансе бессрочно и расходуются только когда вы что-то генерируете.'],
  ['Какие модели доступны?','Топовые модели для фото и видео: Nano Banana Pro, Seedream, Flux, Seedance 2.0, Kling, Z-Image и другие. Список постоянно пополняется.'],
  ['Сколько стоит одна генерация?','Фото — от 1–2 токенов, видео — от 15. Точная стоимость показывается перед запуском, без скрытых списаний.'],
  ['Можно ли использовать результаты коммерчески?','Да. На тарифах Про и Макс доступна коммерческая лицензия на созданный контент.'],
  ['Как оплатить?','Картой российского банка через защищённую оплату. Чек приходит автоматически.'],
];
function FaqList(){
  const { Ic } = window.HBX;
  const [open,setOpen] = uS2(0);
  return <section className="lp-sec" id="faq">
    <div className="lp-sec-head">
      <span className="lp-kicker reveal">Вопросы</span>
      <h2 className="lp-h2 reveal" style={{'--d':'60ms'}}>Частые вопросы</h2>
    </div>
    <div className="lp-faq reveal">
      {FAQ.map((f,i)=>(
        <div className={'lp-faq-item'+(open===i?' open':'')} key={i}>
          <button className="lp-faq-q" onClick={()=>setOpen(open===i?-1:i)}>
            <span>{f[0]}</span>
            <span className="lp-faq-ic"><Ic n="plus" s={18}/></span>
          </button>
          <div className="lp-faq-a"><div className="lp-faq-a-in">{f[1]}</div></div>
        </div>
      ))}
    </div>
  </section>;
}

Object.assign(window.HBX, { BeforeAfter, HeroPrompt, StickyHow, Comparison, FaqList, PhoneMock, Templates });

/* ---- Desktop app window mockup (templates library UI) ---- */
function DesktopMock(){
  const { Ic } = window.HBX;
  const nav = [['grid','Шаблоны',true],['wand','Генерация',false],['video','Видео',false],['history','История',false],['chat','Чат',false]];
  const cards = [
    {n:7,t:'Аниме-портрет'},{n:2,t:'Танцующий аватар',v:'0:06'},{n:3,t:'Товарное фото'},
    {n:11,t:'Киберпанк-сити',tr:true},{n:9,t:'Хедшот'},{n:6,t:'Пластилин',tr:true},
  ];
  return <div className="dk-win" data-reveal>
    <div className="dk-bar">
      <div className="dk-lights"><span style={{background:'#f0a8a0'}}></span><span style={{background:'#f0d28a'}}></span><span style={{background:'#a8d8a0'}}></span></div>
      <div className="dk-url"><Ic n="shield" s={13} c="#7faa9d"/> app.hubicx.ai</div>
      <div style={{width:54}}></div>
    </div>
    <div className="dk-app">
      <aside className="dk-side">
        <div className="dk-brand"><span className="dk-logo"><img src="assets/logo.jpg" alt=""/></span> Hubicx</div>
        <div className="dk-nav">
          {nav.map(i=>(
            <div className={'dk-nav-i'+(i[2]?' on':'')} key={i[1]}><Ic n={i[0]} s={18} c={i[2]?'#1c1c1a':'#8d8d87'}/> {i[1]}</div>
          ))}
        </div>
        <div className="dk-side-foot">
          <div className="dk-tok"><span><Ic n="sparkle" s={14} c="#7faa9d"/> Токены</span><b>248</b></div>
          <div className="dk-user"><span className="dk-ava" style={{backgroundImage:'url(assets/g/r8.png)'}}></span> Алекс М.</div>
        </div>
      </aside>
      <main className="dk-main">
        <div className="dk-top">
          <div className="dk-tabs"><span className="on">Все</span><span>Фото</span><span>Видео</span><span>Тренды</span></div>
          <div className="dk-search"><Ic n="search" s={15} c="#b6b6af"/> Поиск шаблона</div>
          <div className="dk-create"><Ic n="plus" s={16} c="#1c1c1a"/> Создать</div>
        </div>
        <div className="dk-grid">
          {cards.map((c,i)=>(
            <div className="dk-card" key={i}>
              <div className="dk-card-th"><img src={'assets/g/r'+c.n+'.png'} alt=""/>
                {c.v && <span className="dk-card-v"><Ic n="play" s={10} c="#fff"/> {c.v}</span>}
                {c.tr && <span className="dk-card-tr"><Ic n="bolt" s={10} c="#1c1c1a"/> Тренд</span>}
              </div>
              <div className="dk-card-n">{c.t}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  </div>;
}

/* ---- Templates & trends section (interactive tabs) ---- */
const TPL = [
  {n:7, t:'Аниме-портрет', c:'Фото'},
  {n:2, t:'Танцующий аватар', c:'Видео', dur:'0:06'},
  {n:3, t:'Товарное фото', c:'Фото'},
  {n:11,t:'Киберпанк-сити', c:'Тренд', tr:true},
  {n:9, t:'Хедшот для резюме', c:'Фото'},
  {n:6, t:'Пластилиновый мир', c:'Тренд', tr:true},
  {n:13,t:'Говорящий аватар', c:'Видео', dur:'0:10'},
  {n:10,t:'Реставрация фото', c:'Фото'},
  {n:4, t:'Клип из текста', c:'Видео', dur:'0:08'},
  {n:5, t:'Фигурка-коллекционка', c:'Тренд', tr:true},
  {n:8, t:'Винтаж 90-х', c:'Фото'},
  {n:1, t:'Оживить пейзаж', c:'Видео', dur:'0:05'},
];
const TPL_TABS = ['Все','Фото','Видео','Тренд'];
function Templates({ onPick }){
  const { Ic } = window.HBX;
  const [tab,setTab] = uS2('Все');
  const list = tab==='Все' ? TPL : TPL.filter(t=>t.c===tab);
  return <section className="lp-sec" id="templates">
    <div className="lp-sec-head">
      <span className="lp-kicker reveal">Шаблоны и тренды</span>
      <h2 className="lp-h2 reveal" style={{'--d':'60ms'}}>Сотни готовых шаблонов —<br/><span className="lp-grad-tx">для фото и видео</span></h2>
      <p className="lp-sub reveal" style={{'--d':'120ms'}}>Не нужно придумывать промпт с нуля. Выберите шаблон или вирусный тренд, добавьте своё фото — и получите результат в один тап. Библиотека обновляется каждую неделю.</p>
    </div>

    <div className="reveal"><DesktopMock/></div>

    <div className="lp-tpl-bar reveal">
      <div className="lp-tpl-tabs">
        {TPL_TABS.map(t=><button key={t} className={'lp-chip'+(tab===t?' on':'')} onClick={()=>setTab(t)}>{t==='Тренд'?'Тренды':t}</button>)}
      </div>
      <div className="lp-tpl-count"><b>180+</b> шаблонов · обновляем еженедельно</div>
    </div>

    <div className="lp-tpl-grid">
      {list.map((t,i)=>(
        <div className="lp-tpl" key={t.t} onClick={onPick} style={{'--d':(i%8*40)+'ms'}}>
          <div className="lp-tpl-thumb">
            <img src={'assets/g/r'+t.n+'.png'} alt=""/>
            {t.c==='Видео' && <span className="lp-tpl-v"><Ic n="play" s={11} c="#fff"/> {t.dur}</span>}
            {t.tr && <span className="lp-tpl-tr"><Ic n="bolt" s={11} c="#1c1c1a"/> В тренде</span>}
            <span className="lp-tpl-use"><Ic n="wand" s={15} c="#fff"/> Использовать</span>
          </div>
          <div className="lp-tpl-b"><span className="lp-tpl-n">{t.t}</span><span className="lp-tpl-tag">{t.c}</span></div>
        </div>
      ))}
    </div>
  </section>;
}

/* ---- Animated product mockup (phone running a generation) ---- */
function PhoneMock(){
  const { Ic } = window.HBX;
  const SHOTS = [
    {n:8, p:'неоновый портрет, киберпанк, дождь', m:'Seedream', t:'14 сек'},
    {n:1, p:'закат над горами, киноосвещение, 35mm', m:'Nano Banana Pro', t:'12 сек'},
    {n:6, p:'пластилиновый герой, студийный свет', m:'Flux', t:'9 сек'},
    {n:5, p:'космическая туманность, звёздная пыль', m:'Seedance 2.0', t:'16 сек'},
  ];
  const [idx,setIdx] = uS2(0);
  const [step,setStep] = uS2(0);     // 0 typing · 1 generating · 2 done
  const [typed,setTyped] = uS2('');
  const [prog,setProg] = uS2(0);
  const cur = SHOTS[idx];

  uE2(()=>{
    let timers=[]; let raf=0;
    setStep(0); setTyped(''); setProg(0);
    const full = cur.p; let i=0;
    const typeIv = setInterval(()=>{ i++; setTyped(full.slice(0,i)); if(i>=full.length) clearInterval(typeIv); }, 42);
    const tGen = setTimeout(()=>{
      setStep(1);
      const t0=performance.now(), dur=2200;
      const tick=(now)=>{ const p=Math.min(1,(now-t0)/dur); setProg(Math.round(p*100)); if(p<1) raf=requestAnimationFrame(tick); };
      raf=requestAnimationFrame(tick);
    }, full.length*42 + 350);
    const tDone = setTimeout(()=> setStep(2), full.length*42 + 350 + 2300);
    const tNext = setTimeout(()=> setIdx(p=>(p+1)%SHOTS.length), full.length*42 + 350 + 2300 + 2200);
    timers=[typeIv,tGen,tDone,tNext];
    return ()=>{ timers.forEach(clearTimeout); clearInterval(typeIv); cancelAnimationFrame(raf); };
  }, [idx]);

  return <div className="lp-phone">
    <div className="lp-phone-scr">
      <div className="pm-notch"></div>
      <div className="pm-top">
        <span className="pm-logo"><img src="assets/logo.jpg" alt=""/></span>
        <span className="pm-name">Hubicx</span>
        <span className="pm-tok"><Ic n="sparkle" s={13} c="#7faa9d"/> 248</span>
      </div>
      <div className="pm-canvas">
        <img className={'pm-shot'+(step>=2?' in':'')} src={Gg(cur.n)} alt=""/>
        {step===0 && <div className="pm-type">
          <span className="ic"><Ic n="wand" s={18} c="#7faa9d"/></span>
          <div className="tx">{typed}<span className="lp-cur"></span></div>
        </div>}
        {step===1 && <div className="pm-gen">
          <span className="lp-load-ring"></span>
          <div className="pm-prog"><i style={{width:prog+'%'}}></i></div>
          <div className="pm-gen-t">Генерация… {prog}%</div>
        </div>}
        <div className={'pm-badge'+(step>=2?' show':'')}><Ic n="check" s={12} c="#1c1c1a" sw={2.8}/> {cur.m} · {cur.t}</div>
      </div>
      <div className="pm-bar">
        <div className="pm-input">{step===0 ? (typed||'Опишите идею…') : cur.p}</div>
        <span className="pm-send"><Ic n="arrow" s={18} c="#1c1c1a"/></span>
      </div>
    </div>
  </div>;
}


/* ============ Real auth modal for integrated landing ============ */
function LandingAuthModal({ initial='register', onClose, onAuthed }){
  const { Ic } = window.HBX;
  const [tab,setTab] = React.useState(initial);
  const [vals,setVals] = React.useState({ name:'', email:'', pass:'' });
  const [busy,setBusy] = React.useState(false);
  const [err,setErr] = React.useState('');
  const set = (k)=>(e)=>setVals(v=>({...v,[k]:e.target.value}));
  const isReg = tab==='register';
  const valid = vals.email.includes('@') && vals.pass.length>=6 && (!isReg || vals.name.trim());

  function submit(){
    if(!valid || busy) return;
    if(!window.HubicxApi){ setErr('API не загружен, обновите страницу'); return; }
    setBusy(true); setErr('');
    const email = vals.email.trim();
    const p = isReg
      ? window.HubicxApi.register(email, vals.pass, vals.name.trim())
      : window.HubicxApi.login(email, vals.pass);
    p.then(function(data){
      setBusy(false);
      if(onAuthed) onAuthed(data && data.user);
      if(onClose) onClose();
    }).catch(function(e){
      setBusy(false);
      setErr((e && e.message) || 'Не удалось войти');
    });
  }

  return <div className="lp-ov" onClick={onClose}>
    <div className="lp-auth" onClick={e=>e.stopPropagation()}>
      <button className="lp-auth-x" onClick={onClose}><Ic n="close" s={17}/></button>
      <div className="lp-auth-brand">
        <span className="lp-logo" style={{width:30,height:30,borderRadius:9,overflow:'hidden',boxShadow:'0 0 0 1px var(--line)'}}><img src="assets/logo.jpg" alt=""/></span>
        <b style={{fontSize:18,letterSpacing:'-.03em'}}>Hubicx</b>
      </div>
      <div className="lp-auth-h">{isReg?'Создайте аккаунт':'Войти в аккаунт'}</div>
      <div className="lp-auth-s">{isReg?'Старт бесплатный — токены в подарок':'Рады видеть вас снова'}</div>

      <button className="lp-btn lp-btn-tg lp-btn-lg" style={{width:'100%',marginTop:20}} onClick={()=>{ window.location.href='https://t.me/hubicx_bot'; }}>
        <Ic n="tg" s={19} c="#fff"/> Продолжить через Telegram
      </button>
      <div className="lp-auth-sep">или по email</div>

      <div className="lp-auth-tabs">
        <button className={!isReg?'on':''} onClick={()=>{setTab('login');setErr('');}}>Вход</button>
        <button className={isReg?'on':''} onClick={()=>{setTab('register');setErr('');}}>Регистрация</button>
      </div>

      {isReg && <div className="lp-field">
        <label>Имя</label>
        <input className="lp-input" placeholder="Как к вам обращаться" value={vals.name} onChange={set('name')}/>
      </div>}
      <div className="lp-field">
        <label>Email</label>
        <input className="lp-input" type="email" autoComplete="email" placeholder="you@example.com" value={vals.email} onChange={set('email')}/>
      </div>
      <div className="lp-field">
        <label>Пароль</label>
        <input className="lp-input" type="password" autoComplete={isReg?'new-password':'current-password'} placeholder="Минимум 6 символов" value={vals.pass} onChange={set('pass')}
          onKeyDown={e=>{ if(e.key==='Enter') submit(); }}/>
      </div>

      {err && <div className="dk-pay-err" style={{textAlign:'left',margin:'8px 0 0'}}>{err}</div>}
      <button className="lp-btn lp-btn-white lp-btn-lg" disabled={busy} style={{width:'100%',marginTop:10,opacity:valid&&!busy?1:.55}} onClick={submit}>
        {busy ? 'Подождите…' : isReg?'Создать аккаунт':'Войти'} <Ic n="arrow" s={18}/>
      </button>

      <div className="lp-auth-foot">
        {isReg ? <>Уже есть аккаунт? <b onClick={()=>{setTab('login');setErr('');}}>Войти</b></>
               : <>Нет аккаунта? <b onClick={()=>{setTab('register');setErr('');}}>Создать</b></>}
      </div>
      <div className="lp-auth-note">Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности Hubicx.</div>
    </div>
  </div>;
}

/* ============ Hubicx landing — sections + interactions ============ */
const G = (n)=> 'assets/g/r'+n+'.png';

const SHOW_A = [
  {n:7,l:'Портрет'},{n:1,l:'Кинокадр'},{n:11,l:'Неон-сити'},{n:9,l:'Портрет'},
  {n:5,l:'Космос'},{n:13,l:'Флюид'},{n:8,l:'Портрет'},{n:2,l:'Неон'},
];
const SHOW_B = [
  {n:10,l:'Портрет'},{n:17,l:'Закат'},{n:12,l:'Неон'},{n:6,l:'3D-герой'},
  {n:3,l:'Пастель'},{n:16,l:'Пейзаж'},{n:14,l:'Флюид'},{n:4,l:'Озеро'},
];

const FEATURES = [
  {ic:'image', t:'Фото',    s:'Генерируйте изображения по тексту, оживляйте селфи и редактируйте кадры лучшими моделями.', img:9},
  {ic:'video', t:'Видео',   s:'Из текста или фото — кинематографичные ролики с движением камеры и звуком.', img:2},
  {ic:'chat',  t:'AI-чат',  s:'Умный ассистент: идеи, тексты, сценарии и помощь в любой задаче — 24/7.', img:13},
  {ic:'wand',  t:'Промпты', s:'Готовые шаблоны и улучшение промптов в один тап — результат с первого раза.', img:3},
];

const GALLERY = [
  {n:7, t:'Неоновый портрет', c:'Портрет', m:'Seedream'},
  {n:1, t:'Закат в горах', c:'Кино', m:'Nano Banana Pro'},
  {n:13,t:'Жидкий хром', c:'Арт', m:'Flux'},
  {n:11,t:'Город будущего', c:'Неон', m:'Seedance 2.0'},
  {n:9, t:'Золотой час', c:'Портрет', m:'Nano Banana Pro'},
  {n:5, t:'Туманность', c:'Фэнтези', m:'Seedream'},
  {n:4, t:'Горное озеро', c:'Природа', m:'Seedance 2.0'},
  {n:8, t:'Cyan dream', c:'Портрет', m:'Z-Image'},
  {n:15,t:'Закатный флюид', c:'Арт', m:'Flux'},
  {n:2, t:'Дождливый неон', c:'Неон', m:'Seedance 2.0'},
  {n:6, t:'Пластилиновый мир', c:'3D', m:'Nano Banana Pro'},
  {n:17,t:'Багровый рассвет', c:'Природа', m:'Seedance 2.0'},
  {n:10,t:'Изумрудный свет', c:'Портрет', m:'Seedream'},
  {n:14,t:'Аврора', c:'Арт', m:'Flux'},
  {n:3, t:'Пастельный сад', c:'Фэнтези', m:'Nano Banana Pro'},
  {n:16,t:'Голубой час', c:'Природа', m:'Seedance 2.0'},
];
const CATS = ['Все','Портрет','Кино','Неон','Природа','Арт','Фэнтези','3D'];

const MODELS = [
  {n:9, name:'Nano Banana Pro', tag:'Фото', d:'Максимальное качество и точность'},
  {n:2, name:'Seedance 2.0', tag:'Видео', d:'Кинематографичные ролики'},
  {n:11,name:'Kling 2.1', tag:'Видео', d:'Оживление фото в движение'},
  {n:7, name:'Seedream', tag:'Фото', d:'Фотореализм и портреты'},
  {n:13,name:'Flux', tag:'Фото', d:'Арт и стилизация'},
  {n:5, name:'Z-Image', tag:'Фото', d:'Turbo-генерация за секунды'},
];

const LIVE = [
  {p:'неоновый портрет в стиле киберпанк, дождь, боке', n:8},
  {p:'закат над горами, киноосвещение, 35mm', n:1},
  {p:'пластилиновый герой, студийный свет', n:6},
  {p:'космическая туманность, звёздная пыль', n:5},
];

/* ---- scroll reveal: observe .reveal nodes ---- */
function lpUseScrollReveal(dep){
  lpUseEffect(()=>{
    const io = new IntersectionObserver((es)=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    document.querySelectorAll('.reveal:not(.in)').forEach(n=>io.observe(n));
    return ()=>io.disconnect();
  }, [dep]);
}

/* ---- count-up stat ---- */
function LandingStatNum({ to, suffix='' }){
  const ref = lpUseRef(null);
  const [v,setV] = lpUseState(0);
  lpUseEffect(()=>{
    let started=false;
    const io = new IntersectionObserver((es)=>{
      if(es[0].isIntersecting && !started){ started=true;
        const t0=performance.now(), dur=1500;
        const tick=(now)=>{ const p=Math.min(1,(now-t0)/dur); setV(Math.round(to*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    },{threshold:0.5});
    if(ref.current) io.observe(ref.current);
    return ()=>io.disconnect();
  },[]);
  return <span ref={ref}>{v.toLocaleString('ru-RU')}{suffix}</span>;
}

/* ---- live generation showcase (legacy, unused) ---- */
function LiveGen_unused(){
  const { Ic } = window.HBX;
  const [idx,setIdx] = lpUseState(0);
  const [loading,setLoading] = lpUseState(true);
  const cur = LIVE[idx];

  lpUseEffect(()=>{
    setLoading(true);
    const t1 = setTimeout(()=> setLoading(false), 1500);
    const t2 = setTimeout(()=> setIdx(p=>(p+1)%LIVE.length), 4400);
    return ()=>{ clearTimeout(t1); clearTimeout(t2); };
  }, [idx]);

  return <div className="lp-live-stage">
    <div className="lp-frame">
      <img key={idx} className={'lp-shot'+(loading?'':' in')} src={G(cur.n)} alt=""/>
      {loading && <div className="lp-load"><span className="lp-load-ring"></span><span className="lp-load-t">Генерация…</span></div>}
    </div>
    <div className="lp-promptbar">
      <span style={{display:'flex'}}><Ic n="sparkle" s={18} c="#7faa9d"/></span>
      <span className="tx"><b>{cur.p}</b></span>
      <span className="go"><Ic n="arrow" s={17} c="#1c1c1a"/></span>
    </div>
  </div>;
}

/* ================= App ================= */
function LandingPage({ onAuthed, initialAuth=null }){
  const { Ic } = window.HBX;
  const [auth,setAuth] = lpUseState(initialAuth);     // 'login' | 'register' | null
  const [scrolled,setScrolled] = lpUseState(false);
  const [cat,setCat] = lpUseState('Все');
  const [menu,setMenu] = lpUseState(false);
  const [cssReady,setCssReady] = lpUseState(()=>!!document.getElementById('ma-landing-css'));
  lpUseScrollReveal(cat + ':' + (cssReady ? 'ready' : 'loading'));

  lpUseEffect(()=>{
    document.documentElement.classList.add('lp-active');
    document.body.classList.add('lp-active');
    let alive = true;
    let link = document.getElementById('ma-landing-css');
    if(!link){
      link = document.createElement('link');
      link.id = 'ma-landing-css';
      link.rel = 'stylesheet';
      link.href = '/app/ma-landing.css?v=20260616-stickyhold1';
      document.head.appendChild(link);
    }
    const markReady = ()=>{ if(alive) setCssReady(true); };
    if(link.sheet) markReady();
    else {
      link.addEventListener('load',markReady,{once:true});
      setTimeout(markReady,700);
    }
    return ()=>{
      alive = false;
      link.removeEventListener('load',markReady);
      document.documentElement.classList.remove('lp-active');
      document.body.classList.remove('lp-active');
      const l = document.getElementById('ma-landing-css');
      if(l) l.remove();
    };
  },[]);

  lpUseEffect(()=>{
    const h=()=>setScrolled(window.scrollY>16);
    window.addEventListener('scroll',h,{passive:true}); h();
    return ()=>window.removeEventListener('scroll',h);
  },[]);

  // cursor-driven interactions (desktop only)
  lpUseEffect(()=>{
    if(!cssReady) return;
    if(window.matchMedia('(pointer:coarse)').matches) return;
    const cleanups=[];

    // 3D tilt on cards
    document.querySelectorAll('[data-tilt]').forEach(el=>{
      const move=(e)=>{ const r=el.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        el.style.transition='transform .08s linear';
        el.style.transform=`perspective(820px) rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*8).toFixed(2)}deg) translateY(-6px)`; };
      const leave=()=>{ el.style.transition='transform .45s var(--ease)'; el.style.transform=''; };
      el.addEventListener('mousemove',move); el.addEventListener('mouseleave',leave);
      cleanups.push(()=>{ el.removeEventListener('mousemove',move); el.removeEventListener('mouseleave',leave); });
    });

    // magnetic buttons
    document.querySelectorAll('[data-mag]').forEach(el=>{
      const move=(e)=>{ const r=el.getBoundingClientRect(); const x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
        el.style.transform=`translate(${(x*.3).toFixed(1)}px,${(y*.4).toFixed(1)}px)`; };
      const leave=()=>{ el.style.transform=''; };
      el.addEventListener('mousemove',move); el.addEventListener('mouseleave',leave);
      cleanups.push(()=>{ el.removeEventListener('mousemove',move); el.removeEventListener('mouseleave',leave); });
    });

    // hero spotlight + side-column parallax
    const hero=document.querySelector('.lp-hero');
    const spot=document.querySelector('.lp-hero-spot');
    const sides=document.querySelector('.lp-hero-sides');
    if(hero){
      const move=(e)=>{ const r=hero.getBoundingClientRect();
        if(spot){ spot.style.left=(e.clientX-r.left)+'px'; spot.style.top=(e.clientY-r.top)+'px'; }
        const dx=(e.clientX/window.innerWidth-.5), dy=(e.clientY/window.innerHeight-.5);
        if(sides) sides.style.transform=`translate(${(dx*-20).toFixed(1)}px,${(dy*-12).toFixed(1)}px)`; };
      hero.addEventListener('mousemove',move);
      cleanups.push(()=>hero.removeEventListener('mousemove',move));
    }

    return ()=>cleanups.forEach(fn=>fn());
  },[cssReady]);

  const heroWords = 'Создавай фото, видео и тексты'.split(' ');
  const filtered = cat==='Все' ? GALLERY : GALLERY.filter(g=>g.c===cat);
  const navLinks=[['#features','Возможности'],['#templates','Шаблоны'],['#live','Как это работает'],['#models','Модели'],['#pricing','Тарифы']];

  if(!cssReady){
    return <div style={{minHeight:'100vh',background:'#f3f2ee',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid rgba(127,170,157,.22)',borderTopColor:'#7faa9d',animation:'lp-spin .8s linear infinite'}}></div>
    </div>;
  }

  return <div className="lp-wrap">
    <div className="lp-aurora"><i className="a1"></i><i className="a2"></i><i className="a3"></i></div>

    {/* nav */}
    <nav className={'lp-nav'+(scrolled?' scrolled':'')}>
      <a href="#top" className="lp-brand"><span className="lp-logo"><img src="assets/logo.jpg" alt=""/></span> Hubicx</a>
      <div className="lp-nav-links">{navLinks.map(l=><a key={l[0]} href={l[0]}>{l[1]}</a>)}</div>
      <div className="lp-nav-cta">
        <button className="lp-btn lp-btn-ghost" onClick={()=>setAuth('login')}>Войти</button>
        <button className="lp-btn lp-btn-white" onClick={()=>setAuth('register')} data-mag>Начать бесплатно</button>
        <button className="lp-burger" onClick={()=>setMenu(true)}><Ic n="menu" s={20}/></button>
      </div>
    </nav>

    {menu && <div className="lp-mobnav">
      <button className="lp-auth-x" style={{position:'absolute',top:20,right:20}} onClick={()=>setMenu(false)}><Ic n="close" s={18}/></button>
      {navLinks.map(l=><a key={l[0]} href={l[0]} onClick={()=>setMenu(false)}>{l[1]}</a>)}
      <button className="lp-btn lp-btn-ghost lp-btn-lg" onClick={()=>{setMenu(false);setAuth('login');}}>Войти</button>
      <button className="lp-btn lp-btn-white lp-btn-lg" onClick={()=>{setMenu(false);setAuth('register');}}>Начать бесплатно</button>
    </div>}

    <main className="lp-main" id="top">
      {/* hero — asymmetric split (text + product mockup) */}
      <section className="lp-hero lp-hero-split">
        <div className="lp-hero-clip" aria-hidden="true"><div className="lp-hero-spot"></div></div>
        <div className="lp-hero-l">
          <span className="lp-kicker">AI-хаб прямо в Telegram</span>
          <h1>{heroWords.map((w,i)=><span className="word" key={i} style={{animationDelay:(0.12+i*0.07)+'s',marginRight:'0.22em'}}>
            {w==='тексты' ? <span className="lp-grad-tx">тексты</span> : w}</span>)}<span className="word lp-grad-tx" style={{animationDelay:'0.6s'}}>силой ИИ</span>
          </h1>
          <p className="lp-hero-sub">Одна подписка на лучшие AI-модели для фото, видео, чата и промптов. Без VPN и сложных настроек — всё в привычном Telegram и в браузере.</p>
          <window.HBX.HeroPrompt onLaunch={()=>setAuth('register')}/>
          <div className="lp-hero-meta">
            <span><Ic n="check" s={15} c="#7faa9d"/> 20 токенов в подарок</span>
            <span><Ic n="bolt" s={15} c="#7faa9d"/> Результат за секунды</span>
            <span><Ic n="shield" s={15} c="#7faa9d"/> Без VPN</span>
          </div>
        </div>
        <div className="lp-hero-r">
          <window.HBX.PhoneMock/>
        </div>
      </section>

      {/* showcase marquees */}
      <div className="lp-show">
        <div className="lp-row">{[...SHOW_A,...SHOW_A].map((t,i)=>(
          <div className={'lp-tile'+([5].includes(t.n)?' t-sq':[]) } key={'a'+i}><img src={G(t.n)} alt=""/><div className="lp-tile-sh"></div><div className="lp-tile-l">{t.l}</div></div>
        ))}</div>
        <div className="lp-row rev">{[...SHOW_B,...SHOW_B].map((t,i)=>(
          <div className={'lp-tile'+([4,16,17].includes(t.n)?' t-w':[14].includes(t.n)?' t-sq':'')} key={'b'+i}><img src={G(t.n)} alt=""/><div className="lp-tile-sh"></div><div className="lp-tile-l">{t.l}</div></div>
        ))}</div>
      </div>

      <div className="lp-trust reveal">
        <div className="lp-ava-stack">{[7,9,8,10,6].map(n=><span key={n} style={{backgroundImage:'url('+G(n)+')'}}></span>)}</div>
        <span>Более <b style={{color:'var(--ink)'}}>120 000</b> создателей уже с Hubicx</span>
      </div>

      {/* features */}
      <section className="lp-sec" id="features">
        <div className="lp-sec-head">
          <span className="lp-kicker reveal">Возможности</span>
          <h2 className="lp-h2 reveal" style={{'--d':'60ms'}}>Всё, что нужно для контента —<br/><span className="lp-grad-tx">в одном хабе</span></h2>
          <p className="lp-sub reveal" style={{'--d':'120ms'}}>Не нужно собирать зоопарк из подписок. Hubicx объединяет топовые модели под одной крышей.</p>
        </div>
        <div className="lp-feat-grid">
          {FEATURES.map((f,i)=>(
            <div className="lp-feat reveal" key={f.t} style={{'--d':(i*80)+'ms'}} data-tilt>
              <div className="lp-feat-ic"><Ic n={f.ic} s={24} c="#7faa9d"/></div>
              <div className="lp-feat-t">{f.t}</div>
              <div className="lp-feat-s">{f.s}</div>
              <div className="lp-feat-thumb"><img src={G(f.img)} alt=""/></div>
            </div>
          ))}
        </div>
      </section>

      {/* how it works — sticky scroll-driven */}
      <window.HBX.StickyHow/>

      {/* templates & trends — desktop demo + interactive grid */}
      <window.HBX.Templates onPick={()=>setAuth('register')}/>

      {/* comparison */}
      <window.HBX.Comparison/>

      {/* models */}
      <section className="lp-sec" id="models">
        <div className="lp-sec-head">
          <span className="lp-kicker reveal">Модели</span>
          <h2 className="lp-h2 reveal" style={{'--d':'60ms'}}>Лучшие модели — <span className="lp-grad-tx">всегда под рукой</span></h2>
          <p className="lp-sub reveal" style={{'--d':'120ms'}}>Мы подключаем топовые нейросети и обновляем их за вас. Платите токенами — без отдельных подписок.</p>
        </div>
        <div className="lp-models reveal">
          {MODELS.map(m=>(
            <div className="lp-model" key={m.name} onClick={()=>setAuth('register')} data-tilt>
              <div className="lp-model-img"><img src={G(m.n)} alt=""/><span className="lp-model-tag">{m.tag}</span></div>
              <div className="lp-model-b"><div className="lp-model-n">{m.name}</div><div className="lp-model-d">{m.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* how + stats */}
      <section className="lp-sec">
        <div className="lp-stats" style={{marginTop:0}}>
          {[[120,' тыс.','Создателей'],[18,'+','AI-моделей'],[2,' млн','Генераций'],[15,' сек','Средняя скорость']].map((s,i)=>(
            <div className="lp-stat reveal" key={i} style={{'--d':(i*70)+'ms'}}>
              <div className="lp-stat-n"><LandingStatNum to={s[0]} suffix={s[1]}/></div>
              <div className="lp-stat-l">{s[2]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section className="lp-sec" id="pricing">
        <div className="lp-sec-head">
          <span className="lp-kicker reveal">Тарифы</span>
          <h2 className="lp-h2 reveal" style={{'--d':'60ms'}}>Платите за токены — <span className="lp-grad-tx">без подписок</span></h2>
          <p className="lp-sub reveal" style={{'--d':'120ms'}}>1 ₽ = 1 токен. Чем больше пакет — тем выгоднее. Токены не сгорают.</p>
        </div>
        <div className="lp-price">
          {[{n:'Старт',p:'149',t:'160 токенов',best:false,f:['~80 фото','Все базовые модели','AI-чат','Без VPN']},
            {n:'Про',p:'849',t:'1000 токенов',best:true,f:['~500 фото или 70 видео','Все модели, включая Pro','Приоритетная очередь','Поддержка 24/7']},
            {n:'Макс',p:'1690',t:'2200 токенов',best:false,f:['Максимальная выгода','+510 бонусных токенов','Ранний доступ к новинкам','Коммерческая лицензия']}].map((pl,i)=>(
            <div className={'lp-plan reveal'+(pl.best?' best':'')} key={pl.n} style={{'--d':(i*80)+'ms'}}>
              {pl.best && <span className="lp-plan-badge">Популярный</span>}
              <div className="lp-plan-n">{pl.n}</div>
              <div className="lp-plan-p">{pl.p} <span>₽</span></div>
              <div className="lp-plan-n" style={{color:'var(--sage)',fontWeight:700}}>{pl.t}</div>
              <ul className="lp-plan-feats">{pl.f.map(f=><li key={f}><i><Ic n="check" s={17} sw={2.4}/></i>{f}</li>)}</ul>
              <button className={'lp-btn lp-btn-lg '+(pl.best?'lp-btn-grad':'lp-btn-ghost')} onClick={()=>setAuth('register')}>Выбрать</button>
            </div>
          ))}
        </div>
      </section>

      {/* faq */}
      <window.HBX.FaqList/>

      {/* final cta */}
      <section className="lp-sec" style={{paddingTop:0}}>
        <div className="lp-cta reveal">
          <h2>Начните создавать<br/><span className="lp-grad-tx">уже сегодня</span></h2>
          <p>20 токенов в подарок при регистрации. Карта не нужна.</p>
          <div className="lp-hero-cta">
            <button className="lp-btn lp-btn-white lp-btn-lg" onClick={()=>setAuth('register')}>Начать бесплатно <Ic n="arrow" s={18}/></button>
            <button className="lp-btn lp-btn-tg lp-btn-lg" onClick={()=>setAuth('register')}><Ic n="tg" s={18} c="#fff"/> Открыть в Telegram</button>
          </div>
        </div>
      </section>
    </main>

    {/* footer */}
    <footer className="lp-foot">
      <div className="lp-foot-in">
        <div className="lp-foot-brand">
          <a href="#top" className="lp-brand"><span className="lp-logo"><img src="assets/logo.jpg" alt=""/></span> Hubicx</a>
          <p style={{color:'var(--mut)',fontSize:14,lineHeight:1.55}}>Ваш AI-хаб для фото, видео, чата и промптов. Прямо в Telegram и в браузере.</p>
          <div className="lp-socials">
            {['tg','x','yt','ig','dc'].map(s=><a className="lp-soc" key={s} href="#top"><Ic n={s} s={18}/></a>)}
          </div>
        </div>
        {[['Продукт',['Возможности','Модели','Тарифы','Примеры']],
          ['Компания',['О нас','Блог','Контакты','Вакансии']],
          ['Поддержка',['Помощь','Документация','Условия','Конфиденциальность']]].map(col=>(
          <div className="lp-foot-col" key={col[0]}><h4>{col[0]}</h4>{col[1].map(l=><a key={l} href="#top">{l}</a>)}</div>
        ))}
      </div>
      <div className="lp-foot-bot">
        <span>© 2026 Hubicx. Все права защищены.</span>
        <span>Сделано с ИИ и любовью</span>
      </div>
    </footer>

    {auth && <LandingAuthModal initial={auth} onClose={()=>setAuth(null)} onAuthed={onAuthed}/>}
  </div>;
}

window.HBX = window.HBX || {};
window.HBX.LandingPage = LandingPage;
