/* ============ Generation screen ============ */
function GenerationScreen({ tokens, onTopup, onCreatePhoto, onCreateVideo, onTemplate, onTab }) {
  const { Ic, Star, TopNav, TEMPLATES } = window.MiraCore;
  const [history, setHistory] = useState([]);
  const [histLoaded, setHistLoaded] = useState(false);
  const [viewTask, setViewTask] = useState(null);

  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) { setHistLoaded(true); return; }
    window.HubicxApi.history().then(function(items) {
      if (Array.isArray(items)) setHistory(items);
      setHistLoaded(true);
    }).catch(function() { setHistLoaded(true); });
  }, []);

  // Live-refresh while any task is still in progress (e.g. a minimized generation)
  var hasPending = history.some(function(item) {
    return item.status === 'queued' || item.status === 'created' || item.status === 'processing';
  });
  useEffect(function() {
    if (!hasPending || !window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    var timer = setInterval(function() {
      window.HubicxApi.history().then(function(items) {
        if (Array.isArray(items)) setHistory(items);
      }).catch(function() {});
    }, 5000);
    return function() { clearInterval(timer); };
  }, [hasPending]);

  if (viewTask) {
    const isVideo = viewTask.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(viewTask.output_file_url || '');
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <TopNav active="gen" onTab={onTab}/>
      <div className="screen scr-enter" style={{ paddingTop:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ cursor:'pointer', padding:'4px 6px' }} onClick={() => setViewTask(null)}>
            <Ic n="back" s={22}/>
          </div>
          <div style={{ fontWeight:800, fontSize:17, flex:1 }}>{viewTask.title || 'Результат'}</div>
        </div>
        {isVideo
          ? <video src={viewTask.output_file_url} controls playsInline
              style={{ width:'100%', maxHeight:340, borderRadius:18, objectFit:'cover', background:'#000' }}/>
          : <img src={viewTask.output_file_url} alt="Результат"
              style={{ width:'100%', maxHeight:400, borderRadius:18, objectFit:'cover' }}/>}
        {viewTask.prompt && <div className="muted" style={{ fontSize:13, marginTop:10 }}>{viewTask.prompt}</div>}
        <div style={{ marginTop:16, display:'flex', gap:10 }}>
          <button className="btn-secondary" style={{ flex:1 }} onClick={function() {
            if (window.HubicxApi) window.HubicxApi.sendToChat(viewTask.id).catch(function() {});
          }}>📤 В Telegram</button>
          <button className="btn-primary" style={{ flex:1 }} onClick={() => setViewTask(null)}>Назад</button>
        </div>
      </div>
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

      {/* History */}
      {histLoaded && history.length > 0 && <>
        <div className="sec-h rise" style={{ '--d':'.10s', marginTop:22 }}>
          <h2>История генераций</h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {history.slice(0, 8).map(function(item) {
            var isCompleted = item.status === 'completed';
            var isFailed = item.status === 'refunded';
            return <div key={item.id} className="chat-plate" style={{ alignItems:'center' }}
              onClick={() => isCompleted && item.output_file_url && setViewTask(item)}>
              <div style={{ width:46, height:46, borderRadius:12, overflow:'hidden', flex:'0 0 auto',
                background:'var(--faint)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {isCompleted && item.output_file_url
                  ? <img src={item.output_file_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <Ic n={isFailed ? 'close' : 'sparkle'} s={20} c={isFailed ? '#c0473e' : 'var(--muted)'}/>}
              </div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {item.title || item.prompt || 'Генерация'}
                </div>
                <div className="muted" style={{ fontSize:12.5 }}>
                  {isFailed ? '✗ Ошибка · возврат токенов'
                    : isCompleted ? '✓ Готово · ' + item.cost_credits + ' ★'
                    : '⏳ ' + (item.status === 'queued' ? 'В очереди' : 'Генерация…')}
                </div>
              </div>
              {isCompleted && item.output_file_url && <span className="chev"><Ic n="chev" s={18}/></span>}
            </div>;
          })}
        </div>
      </>}

      {/* Empty state — no generations yet */}
      {histLoaded && history.length === 0 && <>
        <div className="sec-h rise" style={{ '--d':'.10s', marginTop:22 }}>
          <h2>История генераций</h2>
        </div>
        <div className="card rise" style={{ '--d':'.12s', display:'flex', flexDirection:'column',
          alignItems:'center', gap:8, padding:'28px 20px', textAlign:'center' }}>
          <div style={{ fontSize:34 }}>✨</div>
          <div style={{ fontWeight:700, fontSize:15 }}>Здесь появятся ваши работы</div>
          <div className="muted" style={{ fontSize:13, maxWidth:230 }}>
            Создайте первое фото или видео — результат сохранится в истории
          </div>
        </div>
      </>}

      <div className="sec-h rise" style={{ '--d':'.12s', marginTop:22 }}>
        <h2>Шаблоны</h2>
        <span className="all">Показать все</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {TEMPLATES.map(function(t, i) {
          return <div className="thumb" key={i} style={{ aspectRatio:'0.82', cursor:'pointer' }}
            onClick={() => onTemplate(t)}>
            <img src={t.img} alt=""/>
            <div className="shade"></div>
            <div className="lbl">{t.t}</div>
          </div>;
        })}
      </div>
      <div style={{ height:8 }}/>
    </div>
  </div>;
}
window.GenerationScreen = GenerationScreen;
