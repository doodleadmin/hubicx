/* ============ Create photo/video screen ============ */

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 230; // ~11.5 min — must exceed backend FAL_TASK_TIMEOUT (10 min)

function pollTask(taskId, onUpdate, onDone, onError) {
  var cancelled = false;
  var attempts = 0;
  function check() {
    if (cancelled) return;
    window.HubicxApi.getTask(taskId).then(function(task) {
      if (cancelled) return;
      onUpdate(task);
      if (task.status === 'completed') { onDone(task); return; }
      if (task.status === 'refunded') {
        onError(task.error_message || 'Произошла ошибка генерации');
        return;
      }
      attempts++;
      if (attempts >= POLL_MAX_ATTEMPTS) { onError('Генерация занимает дольше обычного. Результат появится в разделе «Генерация» → История, как только будет готов.'); return; }
      setTimeout(check, POLL_INTERVAL_MS);
    }).catch(function(err) {
      if (cancelled) return;
      onError((err && err.message) || 'Ошибка запроса');
    });
  }
  check();
  return function() { cancelled = true; };
}

function GenResult({ task, tokens, onNewGeneration }) {
  const { Ic } = window.MiraCore;
  const isVideo = task.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(task.output_file_url || '');
  const [sendState, setSendState] = useState('idle'); // idle | sending | done | error

  const handleSendToChat = function() {
    if (sendState !== 'idle' || !window.HubicxApi) return;
    setSendState('sending');
    window.HubicxApi.sendToChat(task.id).then(function() {
      setSendState('done');
    }).catch(function() {
      setSendState('error');
    });
  };

  return <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
    {isVideo
      ? <video src={task.output_file_url} controls autoPlay playsInline
          style={{ width:'100%', maxHeight:340, borderRadius:18, objectFit:'cover', background:'#000' }}/>
      : <img src={task.output_file_url} alt="Результат"
          style={{ width:'100%', maxHeight:400, borderRadius:18, objectFit:'cover' }}/>}

    {task.prompt && <div className="muted" style={{ fontSize:13, paddingHorizontal:2 }}>{task.prompt}</div>}

    <div style={{ display:'flex', gap:10 }}>
      <button className="btn-secondary" style={{ flex:1 }} onClick={handleSendToChat}
        disabled={sendState === 'sending' || sendState === 'done'}>
        {sendState === 'done' ? '✓ Отправлено' : sendState === 'sending' ? 'Отправка…' : sendState === 'error' ? 'Ошибка' : '📤 В Telegram'}
      </button>
      <button className="btn-primary" style={{ flex:1 }} onClick={onNewGeneration}>Ещё раз</button>
    </div>
  </div>;
}

function CreateScreen({ tokens, mode, setMode, preset, onBack, refreshBalance }) {
  const { Ic, Star, ASPECTS, CREATE_TPL } = window.MiraCore;

  // Models from API
  const [apiModels, setApiModels] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [selectedModelCode, setSelectedModelCode] = useState(null);

  // Aspect ratio
  const [selectedAspect, setSelectedAspect] = useState(ASPECTS[1]);

  // Pickers
  const [picker, setPicker] = useState(null); // 'model' | 'aspect'

  // Content
  const [tab, setTab] = useState('tpl');
  const [selTpl, setSelTpl] = useState(preset ? preset.t : null);
  const [prompt, setPrompt] = useState('');

  // File upload
  const [uploadedFile, setUploadedFile] = useState(null); // {url, file_id, preview}
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Generation state
  const [genState, setGenState] = useState('idle'); // idle | generating | done | error
  const [currentTask, setCurrentTask] = useState(null);
  const [genError, setGenError] = useState(null);
  const pollCancelRef = useRef(null);

  // Load models on mount
  useEffect(function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) {
      setModelsLoaded(true);
      return;
    }
    window.HubicxApi.models().then(function(models) {
      if (Array.isArray(models)) setApiModels(models);
      setModelsLoaded(true);
    }).catch(function() { setModelsLoaded(true); });
  }, []);

  // Cancel polling on unmount
  useEffect(function() {
    return function() { if (pollCancelRef.current) pollCancelRef.current(); };
  }, []);

  // Filter models by current mode
  const filteredModels = apiModels.filter(function(m) {
    if (mode === 'video') return m.category === 'video' || m.task_type === 'video';
    return m.category !== 'video' && m.task_type !== 'video';
  });

  // Picker-compatible model options
  const modelOptions = filteredModels.map(function(m) {
    return { id: m.code, t: m.title, s: (m.description || m.category || '') + ' · ' + m.price_credits + ' ★' };
  });

  // Resolve current model
  var currentModelCode = selectedModelCode || (filteredModels[0] && filteredModels[0].code);
  var currentModelFull = filteredModels.find(function(m) { return m.code === currentModelCode; }) || filteredModels[0];
  var currentModelOpt = modelOptions.find(function(m) { return m.id === currentModelCode; }) || modelOptions[0];
  var currentPrice = currentModelFull ? currentModelFull.price_credits : (mode === 'video' ? 5 : 2);

  // File upload handler
  var handleFile = function(file) {
    if (!file || uploading) return;
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    setUploading(true);
    var previewUrl = URL.createObjectURL(file);
    window.HubicxApi.uploadFile(file).then(function(data) {
      setUploadedFile({ url: data.url, file_id: data.file_id, preview: previewUrl });
      setUploading(false);
    }).catch(function(err) {
      setUploading(false);
      setUploadedFile(null);
      alert((err && err.message) || 'Ошибка загрузки файла');
    });
  };

  // Start generation
  var startGeneration = function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    if (!currentModelFull) { alert('Модели не загружены, попробуйте позже'); return; }

    var inputs = {};
    if (selectedAspect) inputs.aspect_ratio = selectedAspect.id;
    if (uploadedFile) inputs.image_url = uploadedFile.url;

    var payload = {
      model_code: currentModelFull.code,
      prompt: (tab === 'prompt' ? prompt.trim() : selTpl) || null,
      input_file_url: uploadedFile ? uploadedFile.url : null,
      inputs: inputs,
    };

    setGenState('generating');
    setGenError(null);
    setCurrentTask(null);

    window.HubicxApi.createGeneration(payload).then(function(data) {
      var cancel = pollTask(
        data.task_id,
        function(task) { setCurrentTask(task); },
        function(task) { setCurrentTask(task); setGenState('done'); if (refreshBalance) refreshBalance(); },
        function(errMsg) { setGenState('error'); setGenError(errMsg); if (refreshBalance) refreshBalance(); }
      );
      pollCancelRef.current = cancel;
    }).catch(function(err) {
      setGenState('error');
      setGenError((err && err.message) || 'Ошибка создания задачи');
    });
  };

  var resetGen = function() {
    if (pollCancelRef.current) { pollCancelRef.current(); pollCancelRef.current = null; }
    setGenState('idle');
    setCurrentTask(null);
    setGenError(null);
  };

  // Video "оживить фото": an uploaded image alone is enough — prompt is optional.
  var hasTextInput = (tab === 'tpl' && selTpl) || (tab === 'prompt' && prompt.trim().length > 0);
  var ready = hasTextInput || (mode === 'video' && !!uploadedFile);

  // ── Generating view ──
  if (genState === 'generating') {
    var statusLabel = 'В очереди…';
    if (currentTask && (currentTask.status === 'processing' || currentTask.status === 'running')) statusLabel = 'Генерация…';
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="cr-head">
        <div className="cr-back" onClick={resetGen}><Ic n="back" s={20}/></div>
        <div className="cr-title">Создание…</div>
        <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
      </div>
      <div className="screen" style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', gap:18, minHeight:0 }}>
        <div className="gen-spinner"></div>
        <div style={{ fontWeight:700, fontSize:17 }}>{statusLabel}</div>
        <div className="muted" style={{ fontSize:13.5, textAlign:'center', maxWidth:240 }}>
          {mode === 'video' ? 'Видео генерируется 2–3 минуты — не закрывайте приложение' : 'Обычно занимает 15–40 секунд'}
        </div>
        <button style={{ marginTop:4, fontSize:14, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', padding:'8px 16px' }}
          onClick={resetGen}>Отменить</button>
      </div>
    </div>;
  }

  // ── Result view ──
  if (genState === 'done' && currentTask) {
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="cr-head">
        <div className="cr-back" onClick={onBack}><Ic n="back" s={20}/></div>
        <div className="cr-title">Готово ✨</div>
        <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
      </div>
      <div className="screen scr-enter" style={{ paddingTop:14 }}>
        <GenResult task={currentTask} tokens={tokens} onNewGeneration={resetGen}/>
      </div>
    </div>;
  }

  // ── Error view ──
  if (genState === 'error') {
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="cr-head">
        <div className="cr-back" onClick={resetGen}><Ic n="back" s={20}/></div>
        <div className="cr-title">Ошибка</div>
        <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
      </div>
      <div className="screen" style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', gap:14, minHeight:0 }}>
        <div style={{ fontSize:42 }}>⚠️</div>
        <div style={{ fontWeight:700, fontSize:16, textAlign:'center', maxWidth:260 }}>{genError}</div>
        <button className="btn-primary" onClick={resetGen} style={{ marginTop:4 }}>Попробовать снова</button>
      </div>
    </div>;
  }

  // ── Main form ──
  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <div className="cr-head">
      <div className="cr-back" onClick={onBack}><Ic n="back" s={20}/></div>
      <div className="cr-title">{mode === 'photo' ? 'Создать фото' : 'Создать видео'}</div>
      <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
    </div>

    <div className="screen scr-enter" style={{ paddingTop:14 }}>
      {/* Mode switcher */}
      <div className="seg">
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setSelectedModelCode(null); }}>
          <Ic n="image" s={18}/> Фото
        </button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setSelectedModelCode(null); }}>
          <Ic n="video" s={18}/> Видео
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display:'none' }}
        onChange={function(e) { handleFile(e.target.files && e.target.files[0]); e.target.value = ''; }}/>

      {/* Drop-zone / upload preview */}
      {uploadedFile
        ? <div className="drop-zone" style={{ position:'relative', overflow:'hidden' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <img src={uploadedFile.preview} alt="" style={{
              position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.5 }}/>
            <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div className="di"><Ic n="check" s={24} c="#5f9184"/></div>
              <div className="dt">Файл загружен</div>
              <div className="ds">Нажмите, чтобы заменить</div>
            </div>
            <button style={{ position:'absolute', top:8, right:10, background:'rgba(0,0,0,.45)',
              border:'none', borderRadius:20, color:'#fff', fontSize:11, fontWeight:700, padding:'3px 9px', cursor:'pointer', zIndex:2 }}
              onClick={function(e) { e.stopPropagation(); setUploadedFile(null); }}>✕</button>
          </div>
        : <div className="drop-zone" onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}>
            {uploading
              ? <><div className="di"><div className="gen-spinner" style={{ width:28, height:28 }}></div></div>
                  <div className="dt">Загружаю…</div></>
              : <><div className="di"><Ic n="addimg" s={24} c="var(--ink)"/></div>
                  <div className="dt">{mode === 'photo' ? 'Загрузить селфи или фото' : 'Загрузить фото для видео'}</div>
                  <div className="ds">Нажмите или перетащите файл</div></>}
          </div>}

      {/* Content tabs */}
      <div className="seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={() => setTab('prompt')}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <div className="rail" style={{ marginTop:14 }}>
            {CREATE_TPL.map(function(t, i) {
              return <div className="thumb" key={i} onClick={() => setSelTpl(t.t)}
                style={{ width:120, height:148, scrollSnapAlign:'start', cursor:'pointer',
                  outline: selTpl === t.t ? '2.5px solid var(--ink)' : 'none', outlineOffset:-1 }}>
                <img src={t.img} alt=""/>
                <div className="shade"></div>
                <div className="lbl" style={{ fontSize:13 }}>{t.t}</div>
              </div>;
            })}
          </div>
        : <textarea value={prompt} onChange={function(e) { setPrompt(e.target.value); }}
            placeholder="Опишите, что хотите сгенерировать…"
            style={{ width:'100%', marginTop:14, height:120, resize:'none', background:'var(--card)',
              border:'1px solid var(--line)', borderRadius:16, padding:16, color:'var(--ink)',
              fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>}

      {/* Details: model + aspect */}
      <div className="label-sec" style={{ marginTop:20, marginBottom:8 }}>Детали</div>
      <div className="card" style={{ overflow:'hidden' }}>
        <div className="row-link" onClick={() => modelOptions.length > 1 && setPicker('model')}>
          <div style={{ width:42, height:42, borderRadius:13, background:'#f1f0ea',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="model" s={21} c="var(--ink)"/>
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div className="muted" style={{ fontSize:12 }}>Модель</div>
            <div style={{ fontWeight:700, fontSize:15 }}>
              {!modelsLoaded ? 'Загрузка…'
                : currentModelOpt ? currentModelOpt.t + ' · ' + currentPrice + ' ★'
                : 'Нет доступных моделей'}
            </div>
          </div>
          {modelOptions.length > 1 && <span className="chev"><Ic n="chev" s={20}/></span>}
        </div>
        <div className="divider"></div>
        <div className="row-link" onClick={() => setPicker('aspect')}>
          <div style={{ width:42, height:42, borderRadius:13, background:'#f1f0ea',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="aspect" s={21} c="var(--ink)"/>
          </div>
          <div>
            <div className="muted" style={{ fontSize:12 }}>Соотношение сторон</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{selectedAspect.t} · {selectedAspect.s}</div>
          </div>
          <span className="chev"><Ic n="chev" s={20}/></span>
        </div>
      </div>

      <div style={{ height:20 }}/>
      <button className="btn-primary"
        disabled={!ready || uploading || !modelsLoaded || !currentModelFull}
        onClick={startGeneration}>
        {!modelsLoaded ? 'Загрузка…'
          : !ready ? (mode === 'video' ? 'Загрузите фото или укажите промпт'
              : tab === 'prompt' ? 'Укажите промпт' : 'Выберите шаблон')
          : 'Создать · ' + currentPrice + ' ★'}
      </button>
    </div>

    {/* Model picker */}
    {picker === 'model' && modelOptions.length > 0 && <PickerSheet
      title="Модель" options={modelOptions}
      current={currentModelOpt || modelOptions[0]}
      onSelect={function(opt) { setSelectedModelCode(opt.id); }}
      onClose={() => setPicker(null)}/>}

    {/* Aspect picker */}
    {picker === 'aspect' && <PickerSheet
      title="Соотношение сторон" options={ASPECTS}
      current={selectedAspect}
      onSelect={setSelectedAspect}
      onClose={() => setPicker(null)}/>}
  </div>;
}
window.CreateScreen = CreateScreen;

/* ---- reusable option picker sheet ---- */
function PickerSheet({ title, options, current, onSelect, onClose }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState(current ? current.id : null);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={function(e) { e.stopPropagation(); }}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        {options.map(function(o) {
          return <div className="opt" key={o.id} onClick={() => setVal(o.id)}>
            <div>
              <div className="o-t">{o.t}</div>
              {o.s && <div className="o-s">{o.s}</div>}
            </div>
            {val === o.id && <span className="o-check"><Ic n="check" s={22} sw={2.4}/></span>}
          </div>;
        })}
      </div>
      <button className="sheet-cta" onClick={function() {
        var found = options.find(function(o) { return o.id === val; });
        if (found) onSelect(found);
        onClose();
      }}>Сохранить</button>
    </div>
  </div>;
}
window.PickerSheet = PickerSheet;
