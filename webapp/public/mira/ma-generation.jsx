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
function taskText(t){ return t.output_text || (t.params && (t.params.output_text || t.params.text)) || ''; }
function taskDate(t){ try{ return new Date(t.created_at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
function taskTitle(t){ return t.title || t.model_code || 'Задача'; }
function statusLabel(st){
  if(st==='completed') return 'готово';
  if(st==='failed' || st==='error') return 'ошибка';
  if(st==='refunded') return 'возврат';
  if(st==='processing' || st==='running') return 'выполняется';
  if(st==='queued' || st==='pending') return 'в очереди';
  return st || 'статус';
}
function HistoryBlock({ items=[], hint='', onRefresh, onBalanceRefresh }){
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState(null);
  const [copyMsg, setCopyMsg] = useState('');
  async function send(t){
    if(!window.HubicxApi || t.status!=='completed') return;
    setMsg('Отправляю…');
    try{ await window.HubicxApi.sendToTelegram(t.id); setMsg('Отправлено в Telegram'); if(onBalanceRefresh) onBalanceRefresh(); }
    catch(err){ setMsg((err && err.message) || 'Не удалось отправить в Telegram'); }
  }
  async function copyText(t){
    const text = taskText(t);
    if(!text) return;
    try{ await navigator.clipboard.writeText(text); setCopyMsg('Скопировано'); }
    catch(e){ setCopyMsg('Не удалось скопировать'); }
  }
  return <div style={{marginTop:22}}>
    <div className="sec-h" style={{marginBottom:10}}><h2>Последние результаты</h2><span className="all" onClick={onRefresh}>Обновить</span></div>
    {hint && <div className="muted" style={{fontSize:12,marginBottom:8}}>{hint}</div>}
    <div className="history-list">
      {items.length===0 && <div className="card" style={{padding:14}}><div className="muted" style={{fontSize:14}}>История появится после генераций.</div></div>}
      {items.slice(0,10).map(t=>{
        const url = taskUrl(t), text = taskText(t), kind = taskKind(t);
        return <div className="history-item" key={t.id} onClick={()=>{ setDetail(t); setCopyMsg(''); }}>
          {url && kind==='image' ? <img className="history-thumb" src={url} alt=""/> : <div className={'history-kind '+kind}>{kind}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div className="history-title">{taskTitle(t)} · #{t.id}</div>
            <div className="muted" style={{fontSize:12}}>{kind} · {statusLabel(t.status)} · {t.cost_credits||0} кр · {taskDate(t)}</div>
            {text && <div className="history-preview">{text}</div>}
            {t.status==='failed' && <div className="muted" style={{fontSize:12,color:'#ffb4b4'}}>{t.error_message || 'Ошибка генерации'}</div>}
          </div>
          {t.status==='completed' && <button className="history-send" onClick={e=>{ e.stopPropagation(); send(t); }}>TG</button>}
        </div>;
      })}
    </div>
    {msg && <div className="muted" style={{fontSize:13,marginTop:8}}>{msg}</div>}
    {detail && <ResultDetailSheet task={detail} onClose={()=>setDetail(null)} onSend={send} onCopy={copyText} copyMsg={copyMsg} sendMsg={msg}/>} 
  </div>;
}
window.HistoryBlock = HistoryBlock;

function ResultDetailSheet({ task, onClose, onSend, onCopy, copyMsg, sendMsg }){
  const url = taskUrl(task), text = taskText(task), kind = taskKind(task);
  const completed = task.status==='completed';
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card result-detail">
        <div className="sheet-grab"></div>
        <div className="sheet-title">Последние результаты</div>
        <div className="muted" style={{fontSize:13,marginTop:4,marginBottom:10}}>
          #{task.id} · {kind} · {statusLabel(task.status)} · {task.cost_credits||0} кр · {taskDate(task)}
        </div>
        <div style={{fontWeight:800,marginBottom:10}}>{taskTitle(task)}</div>
        {url && kind==='image' && <img className="result-img" src={url} alt="Результат"/>}
        {text && <div className="result-text">{text}</div>}
        {(task.status==='failed' || task.status==='error' || task.status==='refunded') && <div className="muted" style={{fontSize:14,color:'#ffb4b4'}}>{task.error_message || 'Задача завершилась ошибкой'}</div>}
        <div className="result-actions">
          {url && <a className="pill" href={url} target="_blank" rel="noreferrer">Открыть</a>}
          {text && <button className="pill" onClick={()=>onCopy(task)}>Скопировать</button>}
          {completed && <button className="pill" onClick={()=>onSend(task)}>Отправить в Telegram</button>}
          <button className="pill" onClick={onClose}>Закрыть</button>
        </div>
        {sendMsg && <div className="muted" style={{fontSize:13,marginTop:8}}>{sendMsg}</div>}
        {copyMsg && <div className="muted" style={{fontSize:13,marginTop:8}}>{copyMsg}</div>}
      </div>
    </div>
  </div>;
}
