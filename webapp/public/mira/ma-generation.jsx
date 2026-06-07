/* ============ Generation screen ============ */
function GenerationScreen({ tokens, authHint, onTopup, onCreatePhoto, onCreateVideo, onTemplate }){
  const { Ic, Star, TEMPLATES } = window.MiraCore;
  return <div className="screen scr-enter">
    <div style={{height:8}}/>
    <div className="card" style={{display:'flex',alignItems:'center',padding:'16px 16px',marginTop:8}}>
      <div>
        <div className="muted" style={{fontSize:13,marginBottom:4}}>мои токены</div>
        <div style={{display:'flex',alignItems:'center',gap:7,fontSize:20,fontWeight:800}}>
          <Star s={18} c="#3e92f0"/> {tokens}
        </div>
      </div>
      <button className="btn-blue" style={{marginLeft:'auto'}} onClick={onTopup}>Пополнить</button>
    </div>
    {authHint && <div className="muted" style={{fontSize:12,marginTop:8,textAlign:'center'}}>{authHint}</div>}

    <div className="card" style={{marginTop:14,overflow:'hidden'}}>
      <div className="row-link" onClick={onCreatePhoto}>
        <Ic n="image" s={23} c="#cfe0ff"/>
        <span style={{fontWeight:600,fontSize:16}}>Создать фото</span>
        <span className="chev" style={{marginLeft:'auto',display:'flex'}}><Ic n="chev" s={20}/></span>
      </div>
      <div className="divider"></div>
      <div className="row-link" onClick={onCreateVideo}>
        <Ic n="video" s={23} c="#cfe0ff"/>
        <span style={{fontWeight:600,fontSize:16}}>Создать видео</span>
        <span className="chev" style={{marginLeft:'auto',display:'flex'}}><Ic n="chev" s={20}/></span>
      </div>
    </div>

    <div className="sec-h">
      <h2>Шаблоны</h2>
      <span className="all">Показать все</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
      {TEMPLATES.map((t,i)=>(
        <div className="thumb" key={i} style={{aspectRatio:'0.78',cursor:'pointer'}} onClick={()=>onTemplate(t)}>
          <img src={t.img} alt=""/>
          <div className="shade"></div>
          <div className="lbl">{t.t}</div>
        </div>
      ))}
    </div>
  </div>;
}
window.GenerationScreen = GenerationScreen;
