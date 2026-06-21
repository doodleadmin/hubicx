/* ============ Generation screen ============ */
function GenerationScreen({ tokens, onTopup, onCreatePhoto, onCreateVideo, onTemplate, onTab }) {
  const { Ic, Star, TopNav, TEMPLATES, TemplateMedia, tplKey, readFavTemplateKeys, writeFavTemplateKeys } = window.MiraCore;
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  var favSet = new Set(favTplKeys);
  var toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  var videoTpls = TEMPLATES.filter(function(t) { return t.type === 'video'; });
  var photoTpls = TEMPLATES.filter(function(t) { return t.type !== 'video'; });
  function renderTplRail(list, emptyText) {
    return <div className="tpl-rail">
      {list.length === 0
        ? <div className="card" style={{ padding:'16px', textAlign:'center', width:'100%' }}>
            <div className="muted" style={{ fontSize:13 }}>{emptyText}</div>
            <div className="muted" style={{ fontSize:11.5, marginTop:4 }}>Нажмите ★ на шаблоне, чтобы добавить в избранное</div>
          </div>
        : list.map(function(t, i) {
          var isFav = favSet.has(tplKey(t));
          return <div className="thumb tpl-card" key={tplKey(t) || i} onClick={() => onTemplate(t)} style={{ position:'relative' }}>
            <TemplateMedia t={t} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}/>
            <button className={'mob-tpl-fav' + (isFav ? ' on' : '')} title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
              onClick={function(e) { e.stopPropagation(); toggleFavTpl(t); }}
              style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,.5)', border:'none', borderRadius:8, padding:'4px 6px', display:'flex', cursor:'pointer', zIndex:2 }}>
              <Ic n="star" s={18} c={isFav ? '#f5c542' : '#ffffff'}/>
            </button>
            <div className="shade"></div>
            <div className="lbl">{t.t}</div>
          </div>;
        })}
    </div>;
  }

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
        <h2>Видео шаблоны</h2>
        <span className="all" onClick={() => onTab && onTab('templates')}>Показать все</span>
      </div>
      {renderTplRail(videoTpls, 'Нет видео-шаблонов')}
      <div className="sec-h rise" style={{ '--d':'.16s', marginTop:22 }}>
        <h2>Фото шаблоны</h2>
      </div>
      {renderTplRail(photoTpls, 'Нет фото-шаблонов')}
      <div style={{ height:8 }}/>
    </div>
  </div>;
}
window.GenerationScreen = GenerationScreen;

function TemplatesScreen({ onBack, onTemplate }) {
  const { Ic, TopNav, TEMPLATES, TemplateMedia, tplKey, readFavTemplateKeys, writeFavTemplateKeys } = window.MiraCore;
  const [filter, setFilter] = useState('all');
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  var favSet = new Set(favTplKeys);
  var toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
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
              var isFav = favSet.has(tplKey(t));
              return <div className="thumb" key={i} onClick={() => onTemplate(t)}
                style={{ aspectRatio:'0.82', cursor:'pointer', position:'relative' }}>
                <TemplateMedia t={t} loading="lazy" decoding="async"/>
                <button className="mob-tpl-fav" title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                  onClick={function(e) { e.stopPropagation(); toggleFavTpl(t); }}
                  style={{ position:'absolute', top:6, right:6, background:isFav ? 'rgba(0,0,0,.5)' : 'rgba(0,0,0,.35)', border:'none', borderRadius:8, padding:'4px 6px', display:'flex', cursor:'pointer', zIndex:2 }}>
                  <Ic n="star" s={18} c={isFav ? '#f5c542' : '#fff'}/>
                </button>
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
