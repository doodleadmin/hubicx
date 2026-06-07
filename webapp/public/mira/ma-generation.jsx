/* ============ Generation screen ============ */
function GenerationScreen({ tokens, authHint, onTopup, onCreatePhoto, onCreateVideo, onTemplate, history=[], historyHint='', onRefreshHistory, onBalanceRefresh }){
  const { Ic, Star, TEMPLATES } = window.MiraCore;
  useEffect(()=>{ if(onRefreshHistory) onRefreshHistory(); }, []);
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
    <HistoryBlock items={history} hint={historyHint} onRefresh={onRefreshHistory} onBalanceRefresh={onBalanceRefresh}/>
  </div>;
}
window.GenerationScreen = GenerationScreen;

function taskKind(t){
  const code = String(t.model_code || '');
  if((t.task_type||'').includes('video') || code.includes('video') || code.includes('seedance') || code.includes('kling')) return 'video';
  if(code==='ai_chat' || code==='prompt_helper' || t.output_text) return 'text';
  return 'image';
}
function taskUrl(t){ return t.output_file_url || (t.params && (t.params.output_file_url || t.params.url)); }
function taskDate(t){ try{ return new Date(t.created_at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
function HistoryBlock({ items=[], hint='', onRefresh, onBalanceRefresh }){
  const [msg, setMsg] = useState('');
  async function send(t){
    if(!window.HubicxApi || t.status!=='completed') return;
    setMsg('Отправляю…');
    try{ await window.HubicxApi.sendToTelegram(t.id); setMsg('Отправлено в Telegram'); if(onBalanceRefresh) onBalanceRefresh(); }
    catch(err){ setMsg((err && err.message) || 'Не удалось отправить в Telegram'); }
  }
  return <div style={{marginTop:22}}>
    <div className="sec-h" style={{marginBottom:10}}><h2>Последние результаты</h2><span className="all" onClick={onRefresh}>Обновить</span></div>
    {hint && <div className="muted" style={{fontSize:12,marginBottom:8}}>{hint}</div>}
    <div className="history-list">
      {items.length===0 && <div className="card" style={{padding:14}}><div className="muted" style={{fontSize:14}}>История появится после генераций.</div></div>}
      {items.slice(0,10).map(t=>{
        const url = taskUrl(t), kind = taskKind(t);
        return <div className="history-item" key={t.id} onClick={()=>{ if(url) window.open(url, '_blank'); }}>
          {url && kind==='image' ? <img className="history-thumb" src={url} alt=""/> : <div className={'history-kind '+kind}>{kind}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div className="history-title">{t.title || t.model_code || 'Задача'} · #{t.id}</div>
            <div className="muted" style={{fontSize:12}}>{kind} · {t.status} · {t.cost_credits||0} кр · {taskDate(t)}</div>
            {t.status==='failed' && <div className="muted" style={{fontSize:12,color:'#ffb4b4'}}>{t.error_message || 'Ошибка генерации'}</div>}
          </div>
          {t.status==='completed' && <button className="history-send" onClick={e=>{ e.stopPropagation(); send(t); }}>TG</button>}
        </div>;
      })}
    </div>
    {msg && <div className="muted" style={{fontSize:13,marginTop:8}}>{msg}</div>}
  </div>;
}
window.HistoryBlock = HistoryBlock;
