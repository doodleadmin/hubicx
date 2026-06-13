/* ============ Generation screen ============ */
function GenerationScreen({ tokens, onTopup, onCreatePhoto, onCreateVideo, onTemplate, onTab }) {
  const { Ic, Star, TopNav, TEMPLATES } = window.MiraCore;
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
            <div className="muted" style={{ fontSize:12.5, marginTop:1 }}>Из текста или фото · 5 моделей</div>
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
        <h2>Шаблоны</h2>
        <span className="all">Показать все</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {TEMPLATES.map((t, i) => (
          <div className="thumb" key={i} style={{ aspectRatio:'0.82', cursor:'pointer' }}
            onClick={() => onTemplate(t)}>
            <img src={t.img} alt=""/>
            <div className="shade"></div>
            <div className="lbl">{t.t}</div>
          </div>
        ))}
      </div>
      <div style={{ height:8 }}/>
    </div>
  </div>;
}
window.GenerationScreen = GenerationScreen;
