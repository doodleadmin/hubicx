/* ============ Agent (home) screen ============ */
function LazyPromoVideo({ src }) {
  const ref = React.useRef(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(function() {
    var node = ref.current;
    if (!node || active) return;
    if (!('IntersectionObserver' in window)) {
      var timer = setTimeout(function() { setActive(true); }, 1800);
      return function() { clearTimeout(timer); };
    }
    var io = new IntersectionObserver(function(entries) {
      if (entries.some(function(entry) { return entry.isIntersecting || entry.intersectionRatio > 0; })) {
        setActive(true);
        io.disconnect();
      }
    }, { rootMargin: '80px 0px' });
    io.observe(node);
    return function() { io.disconnect(); };
  }, [active]);

  return <video ref={ref} className="promo-video" src={active ? src : undefined} muted autoPlay playsInline loop
    preload="none" poster="" style={{ pointerEvents:'none' }}/>;
}

function AgentScreen({ tokens, onBuyPro, onCreatePhoto, onCreateVideo, onTopup,
  onStartChat, chats, onOpenChat, onDeleteChat, onTab, onTemplate, onTemplates }) {
  const { Ic, Star, TopNav, TEMPLATES, TemplateMedia } = window.MiraCore;
  var pickedK = Math.floor(Math.random() * 6) + 1;
  var pickedS = Math.floor(Math.random() * 5) + 1;
  var pickedH = Math.floor(Math.random() * 4) + 1;
  var klingSrc = 'assets/video/kling/' + pickedK + '.mp4';
  var seedanceSrc = 'assets/video/seedance/' + (pickedS === 4 ? '5.MP4' : pickedS === 5 ? '6.MP4' : pickedS + '.mp4');
  var happyHorseExt = pickedH <= 2 ? '.mov' : '.mp4';
  var happyHorseSrc = 'assets/video/happyhorse/' + pickedH + happyHorseExt;

  const acts = [
    { t:"Создать фото", s:"Из описания или фото", ic:"image", bg:"#e6efe9", c:"#5f9184", go: onCreatePhoto },
    { t:"Создать видео", s:"Оживить изображение",  ic:"video", bg:"#eae8fb", c:"#6f6cc8", go: onCreateVideo },
    { t:"Написать в чат", s:"AI-помощник",          ic:"chat",  bg:"#e4eef4", c:"#5b8fb0", go: () => onStartChat(null) },
    { t:"Шаблоны",        s:"Готовые стили",         ic:"sparkle",bg:"#fbeede",c:"#c98a4e", go: onTemplates },
  ];
  const ideas = [
    { bg:"#dde9e2", c:"#4f8174", ic:"chat",    l:"Идеи для поста" },
    { bg:"#e6e3f7", c:"#6360be", ic:"plus",    l:"План на день" },
    { bg:"#fbe6d2", c:"#c47e44", ic:"image",   l:"Создать фото" },
    { bg:"#f8e1ec", c:"#c45c92", ic:"wand",    l:"Помочь с текстом" },
  ];
  function uniqTemplates(list) {
    var seen = {};
    return list.filter(function(t) {
      var key = t && (t.code || t.t);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }
  function byCodes(codes) {
    return uniqTemplates(codes.map(function(code) {
      return TEMPLATES.find(function(t) { return t.code === code || t.t === code; });
    }).filter(Boolean));
  }
  function byCategory(names, limit) {
    var set = {};
    names.forEach(function(n) { set[n] = true; });
    return TEMPLATES.filter(function(t) { return set[t.category] || (names.indexOf('Видео') !== -1 && t.type === 'video'); }).slice(0, limit || 6);
  }
  function renderTemplateRail(list, label) {
    if (!list || !list.length) return null;
    var codes = list.map(function(t) { return t && (t.code || t.t); }).filter(Boolean);
    return <div className="home-template-strip">
      <div className="home-strip-head">
        <span>{label}</span>
        <button onClick={() => onTemplates && onTemplates({ title: label, codes: codes })}>Все</button>
      </div>
      <div className="home-strip-rail">
        {list.map(function(t, i) {
          return <div className="home-mini-tpl" key={(t.code || t.t) + i} onClick={() => onTemplate ? onTemplate(t) : onTemplates()}>
            <TemplateMedia t={t} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'}/>
            <div className="shade"></div>
            <div className="home-mini-name">{t.t}</div>
          </div>;
        })}
      </div>
    </div>;
  }
  var trendTemplates = byCodes(['Полароид с вечеринки','Камера G7X','Аниме-кадр','Пластилин','Нео-нуар']);
  var portraitTemplates = byCodes(['Кино-портрет','Лента возраста','Метро','Волк','Розы']);
  var videoTemplates = byCategory(['Видео'], 6);

  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <TopNav active="agent" onTab={onTab}/>
    <div className="screen scr-enter">

      <div className="rise" style={{ '--d':'.04s' }}>
        <h1 className="greeting" data-onb="mob-hero">Привет! Я здесь,<br/><span className="grad">чтобы помочь вам</span> ✨</h1>
      </div>

      <div className="act-grid rise" data-onb="mob-actions" style={{ '--d':'.1s' }}>
        {acts.map((a, i) => (
          <div key={i} className="act-card" onClick={a.go}>
            <div className="ic" style={{ background:a.bg }}><Ic n={a.ic} s={21} c={a.c}/></div>
            <div><div className="t">{a.t}</div><div className="s">{a.s}</div></div>
          </div>
        ))}
      </div>

      <div className="sec-h rise" style={{ '--d':'.16s', marginTop:22 }}>
        <h2>Популярные шаблоны</h2>
        <span className="all" onClick={onTemplates}>Все</span>
      </div>
      <div className="tpl-rail rise" data-onb="mob-templates" style={{ '--d':'.2s' }}>
        {TEMPLATES.slice(0, 6).map(function(t, i) {
          return <div className="thumb tpl-card" key={(t.code || t.t) + '-' + i} onClick={() => onTemplate ? onTemplate(t) : onTemplates()}>
            <TemplateMedia t={t} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}/>
            <div className="shade"></div>
            <div className="lbl">{t.t}</div>
          </div>;
        })}
      </div>

      {renderTemplateRail(trendTemplates, 'Тренды сейчас')}

      <div className="sec-h rise" style={{ '--d':'.24s', marginTop:22, marginBottom:12 }}>
        <h2>Быстрые идеи</h2>
        <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid var(--faint)' }}></div>
      </div>
      <div className="idea-grid rise" style={{ '--d':'.28s' }}>
        {ideas.map((t, i) => (
          <div key={i} className="idea-tile" style={{ background:t.bg }}
            onClick={() => onStartChat(t.l)}>
            <div className="ic" style={{ background:'rgba(255,255,255,.55)' }}><Ic n={t.ic} s={16} c={t.c}/></div>
            <div className="l" style={{ color:'#1c1c1a' }}>{t.l}</div>
          </div>
        ))}
      </div>

      <div className="model-promo-list rise" style={{ '--d':'.32s', marginTop:18 }}>
        <div className="model-promo" style={{ background:'#171b2b', color:'#dfe7ff' }}
          onClick={() => onCreateVideo && onCreateVideo('kling_21_i2v')}>
          <LazyPromoVideo src={klingSrc}/>
          <div className="model-promo-t">Kling</div>
          <div className="model-promo-s">Киношное движение из фото</div>
        </div>
        {renderTemplateRail(portraitTemplates, 'Портрет и стиль')}
        <div className="model-promo" style={{ background:'#1c302a', color:'#e5fff4' }}
          onClick={() => onCreateVideo && onCreateVideo('seedance_2_auto')}>
          <LazyPromoVideo src={seedanceSrc}/>
          <div className="model-promo-t">Seedance 2.0</div>
          <div className="model-promo-s">Топовое качество · сам выберет text/image/reference</div>
        </div>
        {renderTemplateRail(videoTemplates, 'Видео-сцены')}
        <div className="model-promo" style={{ background:'#1a1b2e', color:'#e8e0ff' }}
          onClick={() => onCreateVideo && onCreateVideo('happy_horse_i2v')}>
          <LazyPromoVideo src={happyHorseSrc}/>
          <div className="model-promo-t">Happy Horse</div>
          <div className="model-promo-s">1080p видео от Alibaba со звуком и lip-sync</div>
        </div>
      </div>
    </div>
  </div>;
}
window.AgentScreen = AgentScreen;
