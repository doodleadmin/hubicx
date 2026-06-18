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
        setStep(Math.min(HOW.length-1, Math.floor(p*HOW.length*0.999)));
      });
    };
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    return ()=>{ window.removeEventListener('scroll',onScroll); cancelAnimationFrame(raf); };
  },[]);

  const typed = 'неоновый портрет в стиле киберпанк, дождь, боке';
  const tlen = step===0 ? Math.round(Math.min(1,(prog*HOW.length))*typed.length) : typed.length;

  return <section className="lp-how" id="live" ref={secRef}>
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
