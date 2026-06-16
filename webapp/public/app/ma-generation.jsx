/* ============ Generation screen ============ */
function GenerationScreen({ tokens, onTopup, onCreatePhoto, onCreateVideo, onTemplate, onTab }) {
  const { Ic, Star, TopNav, TEMPLATES } = window.MiraCore;
  const promos = [
    { t:'Kling', s:'Киношное движение из фото', model:'kling_21_i2v', bg:'#171b2b', c:'#dfe7ff' },
    { t:'Seedance 2.0', s:'Быстрое AI-видео нового поколения', model:'seedance_2_i2v', bg:'#1c302a', c:'#e5fff4' },
  ];
  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <TopNav active="gen" onTab={onTab}/>
    <div className="screen scr-enter">
      <div style={{ height:8 }}/>

      <div className="bal-card rise" style={{ '--d':'.04s' }}>
        <div>
          <div className="bk">Мои токены</div>
          <div className="bn"><Star s={20} c="#c9c7f4"/> {tokens}</div>
        </div>
        <button className="bb" onClick={onTopup}>Пополнить</button>
      </div>

      <div className="card" style={{ marginTop:14, overflow:'hidden' }}>
        <div className="row-link" onClick={onCreatePhoto}>
          <div style={{ width:42, height:42, borderRadius:13, background:'#e6efe9', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="image" s={21} c="#5f9184"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15.5 }}>Создать фото</div>
            <div className="muted" style={{ fontSize:12.5, marginTop:1 }}>Из текста или фото</div>
          </div>
          <span className="chev"><Ic n="chev" s={20}/></span>
        </div>
        <div className="divider" style={{ marginLeft:0 }}></div>
        <div className="row-link" onClick={onCreateVideo}>
          <div style={{ width:42, height:42, borderRadius:13, background:'#eae8fb', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="video" s={21} c="#6f6cc8"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15.5 }}>Создать видео</div>
            <div className="muted" style={{ fontSize:12.5, marginTop:1 }}>Оживить фото движением</div>
          </div>
          <span className="chev"><Ic n="chev" s={20}/></span>
        </div>
      </div>

      <div className="sec-h rise" style={{ '--d':'.12s', marginTop:22 }}>
        <h2>Выберите шаблон</h2>
        <span className="all" onClick={() => onTab && onTab('templates')}>Показать все</span>
      </div>
      <div className="tpl-rail">
        {TEMPLATES.map(function(t, i) {
          return <div className="thumb tpl-card" key={i} onClick={() => onTemplate(t)}>
            <img src={t.img} alt="" loading={i < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}/>
            <div className="shade"></div>
            <div className="lbl">{t.t}</div>
          </div>;
        })}
      </div>
      <div className="sec-h rise" style={{ '--d':'.16s', marginTop:22 }}>
        <h2>Видео-модели</h2>
      </div>
      <div className="model-promo-list">
        {promos.map(function(p) { return <div key={p.model} className="model-promo" style={{ background:p.bg, color:p.c }}
          onClick={() => onCreateVideo && onCreateVideo(p.model)}>
          <div className="model-promo-k">Скоро баннер</div>
          <div className="model-promo-t">{p.t}</div>
          <div className="model-promo-s">{p.s}</div>
        </div>; })}
      </div>
      <div style={{ height:8 }}/>
    </div>
  </div>;
}
window.GenerationScreen = GenerationScreen;

function TemplatesScreen({ onBack, onTemplate }) {
  const { Ic, TopNav, TEMPLATES } = window.MiraCore;
  const [filter, setFilter] = useState('all');
  var list = TEMPLATES.filter(function(t) {
    if (filter === 'all') return true;
    if (filter === 'video') return t.type === 'video';
    return t.type !== 'video';
  });
  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <div className="cr-head">
      <div className="cr-back" onClick={onBack}><Ic n="back" s={20}/></div>
      <div className="cr-title">Шаблоны</div>
    </div>
    <div className="screen scr-enter" style={{ paddingTop:14 }}>
      <div className="seg tpl-filter">
        {[['all','Все'],['photo','Фото'],['video','Видео']].map(function(f) {
          return <button key={f[0]} className={filter === f[0] ? 'on' : ''} onClick={() => setFilter(f[0])}>{f[1]}</button>;
        })}
      </div>
      <div className="tpl-page-grid">
        {list.map(function(t, i) {
          return <div className="thumb" key={i} style={{ aspectRatio:'0.82', cursor:'pointer' }} onClick={() => onTemplate(t)}>
            <img src={t.img} alt="" loading={i < 6 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}/>
            <div className="shade"></div>
            <div className="lbl">{t.t}</div>
          </div>;
        })}
        {list.length === 0 && <div className="card" style={{ gridColumn:'1 / -1', padding:22, textAlign:'center' }}>
          <div style={{ fontWeight:800 }}>Пока нет шаблонов</div>
          <div className="muted" style={{ fontSize:13, marginTop:4 }}>Скоро добавим новые варианты</div>
        </div>}
      </div>
    </div>
  </div>;
}
window.TemplatesScreen = TemplatesScreen;
