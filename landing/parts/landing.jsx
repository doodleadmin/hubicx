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
function useScrollReveal(dep){
  useEffect(()=>{
    const io = new IntersectionObserver((es)=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    document.querySelectorAll('.reveal:not(.in)').forEach(n=>io.observe(n));
    return ()=>io.disconnect();
  }, [dep]);
}

/* ---- count-up stat ---- */
function StatNum({ to, suffix='' }){
  const ref = useRef(null);
  const [v,setV] = useState(0);
  useEffect(()=>{
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
  const [idx,setIdx] = useState(0);
  const [loading,setLoading] = useState(true);
  const cur = LIVE[idx];

  useEffect(()=>{
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
function App(){
  const { Ic } = window.HBX;
  const [auth,setAuth] = useState(null);     // 'login' | 'register' | null
  const [scrolled,setScrolled] = useState(false);
  const [cat,setCat] = useState('Все');
  const [menu,setMenu] = useState(false);
  useScrollReveal(cat);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>16);
    window.addEventListener('scroll',h,{passive:true}); h();
    return ()=>window.removeEventListener('scroll',h);
  },[]);

  // cursor-driven interactions (desktop only)
  useEffect(()=>{
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
  },[]);

  const heroWords = 'Создавай фото, видео и тексты'.split(' ');
  const filtered = cat==='Все' ? GALLERY : GALLERY.filter(g=>g.c===cat);
  const navLinks=[['#features','Возможности'],['#templates','Шаблоны'],['#live','Как это работает'],['#models','Модели'],['#pricing','Тарифы']];

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
              <div className="lp-stat-n"><StatNum to={s[0]} suffix={s[1]}/></div>
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

    {auth && <window.HBX.AuthModal initial={auth} onClose={()=>setAuth(null)}/>}
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
