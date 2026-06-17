/* ============ Generation screen ============ */
function GenerationScreen({ tokens, onTopup, onCreatePhoto, onCreateVideo, onTemplate, onTab }) {
  const { Ic, Star, TopNav, TEMPLATES } = window.MiraCore;
  var pickedK = Math.floor(Math.random() * 6) + 1;
  var pickedS = Math.floor(Math.random() * 5) + 1;
  var pickedH = Math.floor(Math.random() * 4) + 1;
  var klingSrc = 'assets/video/kling/' + pickedK + '.mp4';
  var seedanceSrc = 'assets/video/seedance/' + (pickedS === 4 ? '5.MP4' : pickedS === 5 ? '6.MP4' : pickedS + '.mp4');
  var happyHorseExt = pickedH <= 2 ? '.mov' : '.mp4';
  var happyHorseSrc = 'assets/video/happyhorse/' + pickedH + happyHorseExt;

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
        {/* Kling */}
        <div className="model-promo" style={{ background:'#171b2b', color:'#dfe7ff' }}
          onClick={() => onCreateVideo && onCreateVideo('kling_21_i2v')}>
          <video className="promo-video" src={klingSrc} muted autoPlay playsInline loop
            preload="none" poster="" style={{ pointerEvents:'none' }}/>
          <div className="model-promo-t">Kling</div>
          <div className="model-promo-s">Киношное движение из фото</div>
        </div>

        {/* Seedance */}
        <div className="model-promo" style={{ background:'#1c302a', color:'#e5fff4' }}
          onClick={() => onCreateVideo && onCreateVideo('seedance_2_i2v')}>
          <video className="promo-video" src={seedanceSrc} muted autoPlay playsInline loop
            preload="none" poster="" style={{ pointerEvents:'none' }}/>
          <div className="model-promo-t">Seedance 2.0</div>
          <div className="model-promo-s">Быстрое AI-видео нового поколения</div>
        </div>

        {/* Happy Horse */}
        <div className="model-promo" style={{ background:'#1a1b2e', color:'#e8e0ff' }}
          onClick={() => onCreateVideo && onCreateVideo('happy_horse_i2v')}>
          <video className="promo-video" src={happyHorseSrc} muted autoPlay playsInline loop
            preload="none" poster="" style={{ pointerEvents:'none' }}/>
          <div className="model-promo-t">Happy Horse</div>
          <div className="model-promo-s">1080p видео от Alibaba со звуком и lip-sync</div>
        </div>
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
      <div className="tpl-filter">
        <div className="seg">
          {[['all','Все'],['photo','Фото'],['video','Видео']].map(function(f) {
            return <button key={f[0]} className={filter === f[0] ? 'on' : ''} onClick={() => setFilter(f[0])}>{f[1]}</button>;
          })}
        </div>
      </div>
      {list.length > 0
        ? <div className="tpl-page-grid">
            {list.map(function(t, i) {
              return <div className="thumb" key={i} onClick={() => onTemplate(t)}
                style={{ aspectRatio:'0.82', cursor:'pointer' }}>
                <img src={t.img} alt="" loading="lazy" decoding="async"/>
                <div className="shade"></div>
                <div className="lbl">{t.t}</div>
              </div>;
            })}
          </div>
        : <div className="card" style={{ padding:'24px 18px', textAlign:'center', marginTop:14 }}>
            <div style={{ fontSize:30 }}>📂</div>
            <div style={{ fontWeight:800, fontSize:15, marginTop:6 }}>Нет шаблонов</div>
            <div className="muted" style={{ fontSize:13, marginTop:4 }}>Для этого фильтра пока нет шаблонов</div>
          </div>}
      <div style={{ height:8 }}/>
    </div>
  </div>;
}
window.TemplatesScreen = TemplatesScreen;
