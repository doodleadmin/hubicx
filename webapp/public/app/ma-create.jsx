/* ============ Create photo/video screen ============ */

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 230; // ~11.5 min — must exceed backend FAL_TASK_TIMEOUT (10 min)

const GEN_STAGES = [
  { t: 'В очереди',    s: 'Готовим задачу для модели' },
  { t: 'Композиция',   s: 'Раскладываю сцену и формы' },
  { t: 'Детализация',  s: 'Прорисовываю детали и фактуру' },
  { t: 'Свет и цвет',  s: 'Настраиваю освещение и тон' },
  { t: 'Финал',        s: 'Повышаю чёткость, готовлю результат' },
];

function useGenProgress(running, done, isVideo) {
  const estMs = isVideo ? 150000 : 30000;
  const [pct, setPct] = useState(0);
  const startRef = useRef(0);
  useEffect(function() {
    if (done) { setPct(100); return; }
    if (!running) { setPct(0); return; }
    startRef.current = Date.now();
    var id = setInterval(function() {
      var t = Date.now() - startRef.current;
      var lin = Math.min(1, t / estMs);
      setPct(Math.min(99, Math.round((1 - Math.pow(1 - lin, 1.7)) * 100)));
    }, 200);
    return function() { clearInterval(id); };
  }, [running, done, isVideo]);
  var stageIdx = done ? GEN_STAGES.length - 1 : Math.min(GEN_STAGES.length - 1, Math.floor((pct / 100) * GEN_STAGES.length));
  var etaSec = running && !done ? Math.max(1, Math.ceil((estMs / 1000) * (1 - pct / 100))) : 0;
  return { pct:pct, stageIdx:stageIdx, etaSec:etaSec };
}

function taskOutputUrl(task) {
  return task && (task.output_file_url || (task.params && (task.params.output_file_url || task.params.url)) || '');
}

function taskIsVideo(task) {
  return !!(task && (task.task_type === 'video' || /\.(mp4|webm|mov)$/i.test(taskOutputUrl(task))));
}

function modelFields(model) { return (model && model.form_schema && Array.isArray(model.form_schema.fields)) ? model.form_schema.fields : []; }
function getModelField(model, names) {
  var fields = modelFields(model);
  for (var i = 0; i < names.length; i++) {
    var f = fields.find(function(x) { return x && x.name === names[i]; });
    if (f) return f;
  }
  return null;
}
function getQualityField(model) { return getModelField(model, ['quality', 'resolution']); }
function fieldDefault(field) {
  if (!field) return null;
  if (field.default != null) return field.default;
  return field.options && field.options.length ? field.options[0] : null;
}
function fieldOptions(field) { return field && Array.isArray(field.options) ? field.options : []; }
function prettyOption(v) {
  var s = String(v == null ? '' : v);
  var map = { auto:'Auto', square_hd:'HD', square:'Square', portrait_4_3:'4:3', portrait_16_9:'9:16', landscape_4_3:'4:3', landscape_16_9:'16:9', auto_2K:'2K', auto_4K:'4K' };
  return map[s] || s;
}
function estimateModelPrice(model, inputs) {
  if (!model) return 0;
  var rules = model.form_schema && model.form_schema.price_rules;
  var total = Number((rules && rules.base) || model.price_credits || 0);
  if (rules && Array.isArray(rules.multipliers)) {
    rules.multipliers.forEach(function(rule) {
      if (!rule || !rule.field) return;
      var value = inputs && inputs[rule.field];
      if (value == null) return;
      var mult = 1;
      if (rule.mode === 'multiply_by_value') mult = Number(value) || 1;
      else if (rule.values) {
        var key = String(value);
        mult = Number(rule.values[key] != null ? rule.values[key] : rule.values[key.toLowerCase()]) || 1;
      }
      total *= mult;
    });
  }
  return Math.max(1, Math.ceil(total || Number(model.price_credits || 0)));
}

function GenStageCanvas({ running, done, isVideo, aspectId, task }) {
  const { Ic } = window.MiraCore;
  var progress = useGenProgress(running, done, isVideo);
  var pct = progress.pct;
  var stageIdx = progress.stageIdx;
  var etaSec = progress.etaSec;
  var url = taskOutputUrl(task);
  var aspectCss = (aspectId || '1:1').replace(':', '/');
  var revealed = !!(done && url);
  return <>
    <div className="label-sec" style={{ marginTop:20 }}>{revealed ? 'Результат готов' : 'Создаю…'}</div>
    <div className="gen-canvas" style={{ aspectRatio: aspectCss }}>
      {!revealed && <div className="gen-skel"></div>}
      {revealed && (taskIsVideo(task)
        ? <video className="gen-media in" src={url} controls playsInline></video>
        : <img className="gen-media in" src={url} alt="Результат готов"/>)}
      <div className="gen-grain"></div>
    </div>
    <div className="gen-stages">
      {GEN_STAGES.map(function(s, i) {
        return <div key={i} className={'gen-chip' + (revealed || i < stageIdx ? ' done' : i === stageIdx ? ' act' : '')}><i/></div>;
      })}
    </div>
    <div className="gen-stagerow">
      <div className="gen-stage-l">
        {revealed ? <Ic n="check" s={16} c="#5cc8ff"/> : <span className="gen-dot"></span>}
        <span>{revealed ? 'Готово' : GEN_STAGES[stageIdx].t}</span>
      </div>
      <div className="gen-eta">{revealed ? 'Финал' : '≈ ' + etaSec + ' сек · ' + pct + '%'}</div>
    </div>
    {!revealed && <div className="muted" style={{ fontSize:12, marginTop:6 }}>{GEN_STAGES[stageIdx].s}</div>}
  </>;
}

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
        onError(task.error_message || 'Произошла ошибка генерации', 'refunded');
        return;
      }
      attempts++;
      if (attempts >= POLL_MAX_ATTEMPTS) { onError('Генерация занимает дольше обычного. Результат появится в разделе «Генерация» → История, как только будет готов.', 'timeout'); return; }
      setTimeout(check, POLL_INTERVAL_MS);
    }).catch(function(err) {
      if (cancelled) return;
      onError((err && err.message) || 'Ошибка запроса', 'error');
    });
  }
  check();
  return function() { cancelled = true; };
}

function GenResult({ task, tokens, onNewGeneration, aspectId }) {
  const { Ic } = window.MiraCore;
  const isVideo = taskIsVideo(task);
  const url = taskOutputUrl(task);
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

  var aspectCss = (aspectId || '1:1').replace(':', '/');
  return <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
    <div className="gen-canvas gen-result-canvas" style={{ aspectRatio: aspectCss }}>
      {isVideo
        ? <video src={url} controls autoPlay playsInline className="gen-media in"/>
        : <img src={url} alt="Результат" className="gen-media in"/>}
      <div className="gen-grain"></div>
    </div>

    <div style={{ display:'flex', gap:10 }}>
      <button className="btn-secondary" style={{ flex:1 }} onClick={handleSendToChat}
        disabled={sendState === 'sending' || sendState === 'done'}>
        {sendState === 'done' ? '✓ Отправлено' : sendState === 'sending' ? 'Отправка…' : sendState === 'error' ? 'Ошибка' : '📤 В Telegram'}
      </button>
      <button className="btn-primary" style={{ flex:1 }} onClick={onNewGeneration}>Ещё раз</button>
    </div>
  </div>;
}

function CreateScreen({ tokens, mode, setMode, preset, onBack, onMinimize, refreshBalance }) {
  const { Ic, Star, ASPECTS, CREATE_TPL } = window.MiraCore;

  // Models from API
  const [apiModels, setApiModels] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [selectedModelCode, setSelectedModelCode] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);

  // Aspect ratio
  const [selectedAspect, setSelectedAspect] = useState(ASPECTS[1]);

  // Pickers
  const [picker, setPicker] = useState(null); // 'model' | 'quality' | 'aspect'

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
  const [genErrorKind, setGenErrorKind] = useState('error'); // refunded | timeout | error
  const pollCancelRef = useRef(null);

  // Load models on mount
  useEffect(function() {
    if (!window.HubicxApi) { setApiModels(window.MiraCore.FALLBACK_MODELS); setModelsLoaded(true); return; }
    window.HubicxApi.models().then(function(models) {
      if (Array.isArray(models) && models.length > 0) setApiModels(models);
      else setApiModels(window.MiraCore.FALLBACK_MODELS);
      setModelsLoaded(true);
    }).catch(function() { setApiModels(window.MiraCore.FALLBACK_MODELS); setModelsLoaded(true); });
  }, []);

  // Cancel polling on unmount
  useEffect(function() {
    return function() { if (pollCancelRef.current) pollCancelRef.current(); };
  }, []);

  // Filter models by current mode (task_type is authoritative)
  const filteredModels = apiModels.filter(function(m) {
    if (mode === 'video') return m.task_type === 'video' || m.category === 'video';
    return m.task_type === 'image' || (m.category === 'photo' && m.task_type !== 'video');
  });

  // Picker-compatible model options
  const modelOptions = filteredModels.map(function(m) {
    return { id: m.code, t: m.title, s: (m.description || m.category || '') + ' · ' + m.price_credits + ' ★' };
  });

  // Resolve current model
  var currentModelCode = selectedModelCode || (filteredModels[0] && filteredModels[0].code);
  var currentModelFull = filteredModels.find(function(m) { return m.code === currentModelCode; }) || filteredModels[0];
  var currentModelOpt = modelOptions.find(function(m) { return m.id === currentModelCode; }) || modelOptions[0];
  var qField = getQualityField(currentModelFull);
  var qOptions = fieldOptions(qField);
  var qValue = qField ? (qOptions.some(function(o) { return String(o) === String(selectedQuality); }) ? selectedQuality : fieldDefault(qField)) : null;
  var priceInputs = {};
  if (qField && qValue != null) priceInputs[qField.name] = qValue;
  var currentPrice = currentModelFull ? estimateModelPrice(currentModelFull, priceInputs) : (mode === 'video' ? 5 : 2);
  var tplList = CREATE_TPL.filter(function(t) { return mode === 'video' ? t.type === 'video' : t.type !== 'video'; });
  var selectedTpl = tplList.find(function(t) { return t.t === selTpl; }) || null;

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
    if (qField && qValue != null) inputs[qField.name] = qValue;
    if (uploadedFile) inputs.image_url = uploadedFile.url;

    var finalPrompt = (tab === 'prompt' ? prompt.trim() : ((selectedTpl && selectedTpl.prompt) || selTpl)) || null;
    var payload = {
      model_code: currentModelFull.code,
      prompt: finalPrompt,
      input_file_url: uploadedFile ? uploadedFile.url : null,
      inputs: inputs,
    };

    setGenState('generating');
    setGenError(null);
    setGenErrorKind('error');
    setCurrentTask(null);

    window.HubicxApi.createGeneration(payload).then(function(data) {
      var cancel = pollTask(
        data.task_id,
        function(task) { setCurrentTask(task); },
        function(task) { setCurrentTask(task); setGenState('done'); if (refreshBalance) refreshBalance(); },
        function(errMsg, kind) { setGenState('error'); setGenError(errMsg); setGenErrorKind(kind || 'error'); if (refreshBalance) refreshBalance(); }
      );
      pollCancelRef.current = cancel;
    }).catch(function(err) {
      // Task was never created — nothing was charged, so no refund to report.
      setGenState('error');
      setGenError((err && err.message) || 'Ошибка создания задачи');
      setGenErrorKind('error');
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
  var needsTplImage = tab === 'tpl' && selectedTpl && selectedTpl.requiresImage;
  var ready = (hasTextInput && (!needsTplImage || !!uploadedFile)) || (mode === 'video' && !!uploadedFile);

  // ── Generating view ──
  if (genState === 'generating') {
    var minimize = onMinimize || resetGen;
    var isVideoModel = mode === 'video' || !!(currentModelCode && (currentModelCode.indexOf('seedance') !== -1 || currentModelCode.indexOf('kling') !== -1 || currentModelCode.indexOf('video') !== -1));
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="cr-head">
        <div className="cr-back" onClick={minimize}><Ic n="back" s={20}/></div>
        <div className="cr-title">Создание…</div>
        <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
      </div>
      <div className="screen scr-enter" style={{ paddingTop:14 }}>
        <GenStageCanvas running={true} done={false} isVideo={isVideoModel} aspectId={selectedAspect && selectedAspect.id} task={currentTask}/>
        <div className="muted" style={{ fontSize:13.5, textAlign:'center', margin:'14px auto 0', maxWidth:280 }}>
          {mode === 'video'
            ? 'Видео генерируется 2–3 минуты. Можно свернуть — пришлём уведомление в Telegram, когда будет готово.'
            : 'Обычно занимает 15–40 секунд. Результат проявится на этом холсте.'}
        </div>
        <button className="btn-secondary" style={{ margin:'14px auto 0', maxWidth:220 }}
          onClick={minimize}>Свернуть</button>
        <div className="muted" style={{ fontSize:12, textAlign:'center', margin:'10px auto 0', maxWidth:260 }}>
          Генерация продолжится в фоне и появится в разделе «Генерация»
        </div>
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
        <GenResult task={currentTask} tokens={tokens} onNewGeneration={resetGen} aspectId={selectedAspect && selectedAspect.id}/>
      </div>
    </div>;
  }

  // ── Error view ──
  if (genState === 'error') {
    var isTimeout = genErrorKind === 'timeout';
    var isRefunded = genErrorKind === 'refunded';
    var headTitle = isTimeout ? 'Почти готово' : 'Ошибка';
    var emoji = isTimeout ? '⏳' : '⚠️';
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="cr-head">
        <div className="cr-back" onClick={resetGen}><Ic n="back" s={20}/></div>
        <div className="cr-title">{headTitle}</div>
        <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
      </div>
      <div className="screen" style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', gap:14, minHeight:0 }}>
        <div style={{ fontSize:42 }}>{emoji}</div>
        <div style={{ fontWeight:700, fontSize:16, textAlign:'center', maxWidth:280 }}>{genError}</div>
        {isRefunded && <div style={{ fontSize:13.5, fontWeight:700, color:'#5f9184',
          background:'#eef5f1', borderRadius:12, padding:'9px 16px' }}>
          ✓ Токены возвращены на баланс
        </div>}
        <button className="btn-primary" onClick={resetGen} style={{ marginTop:4 }}>
          {isTimeout ? 'Понятно' : 'Попробовать снова'}
        </button>
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
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setSelectedModelCode(null); setSelectedQuality(null); }}>
          <Ic n="image" s={18}/> Фото
        </button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setSelectedModelCode(null); setSelectedQuality(null); }}>
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
                  <div className="dt">{needsTplImage && selectedTpl ? selectedTpl.inputLabel : (mode === 'photo' ? 'Загрузить селфи или фото' : 'Загрузить фото для видео')}</div>
                  <div className="ds">Нажмите или перетащите файл</div></>}
          </div>}

      {/* Content tabs */}
      <div className="seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={() => setTab('prompt')}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <div className="rail" style={{ marginTop:14 }}>
            {tplList.map(function(t, i) {
              return <div className="thumb" key={i} onClick={() => setSelTpl(t.t)}
                style={{ width:120, height:148, scrollSnapAlign:'start', cursor:'pointer',
                  outline: selTpl === t.t ? '2.5px solid var(--ink)' : 'none', outlineOffset:-1 }}>
                <img src={t.img} alt="" loading={i < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}/>
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
        {qField && <React.Fragment>
          <div className="row-link" onClick={() => setPicker('quality')}>
            <div style={{ width:42, height:42, borderRadius:13, background:'#f1f0ea',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Ic n="sparkle" s={21} c="var(--ink)"/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="muted" style={{ fontSize:12 }}>Качество</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{prettyOption(qValue)}</div>
            </div>
            <span className="chev"><Ic n="chev" s={20}/></span>
          </div>
          <div className="divider"></div>
        </React.Fragment>}
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
        {!modelsLoaded ? 'Загрузка…' : 'Создать · ' + currentPrice + ' ★'}
      </button>
    </div>

    {/* Model picker */}
    {picker === 'model' && modelOptions.length > 0 && <PickerSheet
      title="Модель" options={modelOptions}
      current={currentModelOpt || modelOptions[0]}
      onSelect={function(opt) { setSelectedModelCode(opt.id); setSelectedQuality(null); }}
      onClose={() => setPicker(null)}/>}

    {/* Quality picker */}
    {picker === 'quality' && qField && <PickerSheet
      title="Качество" options={qOptions.map(function(o) { return { id:String(o), t:prettyOption(o), s:qField.label || 'Качество' }; })}
      current={{ id:String(qValue) }}
      onSelect={function(opt) { var found = qOptions.find(function(o) { return String(o) === String(opt.id); }); setSelectedQuality(found != null ? found : opt.id); }}
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
