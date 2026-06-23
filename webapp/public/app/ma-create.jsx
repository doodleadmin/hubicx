/* ============ Create photo/video screen ============ */
/* BUILD: 20260622-v3 */
(function(){ if (typeof window!=='undefined' && window.__APP_BUILD__ && window.__APP_BUILD__!=='20260623-bonus1') { var u = new URL(window.location); u.searchParams.set('_r', Date.now()); window.location.replace(u.href); } })();

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
function getDurationField(model) { return getModelField(model, ['duration']); }
function getFilesField(model) { return getModelField(model, ['image_urls', 'media_urls']); }
function getSingleImageField(model) { return getModelField(model, ['image_url']); }
function getSingleVideoField(model) { return getModelField(model, ['video_url']); }
function fieldDefault(field) {
  if (!field) return null;
  if (field.default != null) return field.default;
  return field.options && field.options.length ? field.options[0] : null;
}
function fieldOptions(field) { return field && Array.isArray(field.options) ? field.options : []; }
function optionValue(o) {
  if (o && typeof o === 'object') return o.value != null ? o.value : (o.id != null ? o.id : o.name);
  return o;
}
function optionTitle(o) {
  if (o && typeof o === 'object') return o.t || o.title || o.label || prettyOption(optionValue(o));
  return prettyOption(o);
}
function normalizeFieldValue(field, value) {
  var opts = fieldOptions(field);
  if (value == null) return fieldDefault(field);
  var found = opts.find(function(o) { return String(optionValue(o)) === String(value); });
  return found != null ? optionValue(found) : value;
}
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
function templateModelCode(t) { return (t && t.modelCode) || 'nano_banana_pro'; }
function templateQualityValue(t) { return t && (t.qualityValue || t.quality || t.resolution); }
function templateDurationValue(t) { return t && (t.durationValue || t.duration); }
function templateAspectKey(t) { return t && (t.code || t.t) ? 'tplAspect:' + (t.code || t.t) : null; }
function readTemplateAspect(t) {
  var key = templateAspectKey(t);
  if (!key) return null;
  try { return window.localStorage && window.localStorage.getItem(key); } catch (_) { return null; }
}
function saveTemplateAspect(t, aspectId) {
  var key = templateAspectKey(t);
  if (!key || !aspectId) return;
  try { if (window.localStorage) window.localStorage.setItem(key, String(aspectId)); } catch (_) {}
}
function isSeedanceModelCode(code) { return /^seedance_2_/.test(String(code || '')) || String(code || '').indexOf('seedance') === 0; }
function resolveSeedanceAutoCode(code, files) {
  var selected = String(code || '');
  var list = Array.isArray(files) ? files.filter(Boolean) : [];
  var images = list.filter(function(f) { return !f || f.type !== 'video'; }).length;
  var videos = list.filter(function(f) { return f && f.type === 'video'; }).length;
  var isFast = selected === 'seedance_2_fast_auto' || selected.indexOf('_fast') !== -1;
  if (selected !== 'seedance_2_auto' && selected !== 'seedance_2_fast_auto') return selected;
  if (images >= 2 || videos > 0) return isFast ? 'seedance_2_reference_fast' : 'seedance_2_reference';
  if (images === 1) return isFast ? 'seedance_2_i2v_fast' : 'seedance_2_i2v';
  return 'seedance_2_t2v';
}
function shortModelDescription(m) {
  var code = String((m && m.code) || '');
  if (code === 'nano_banana_2') return 'Быстрая генерация';
  if (code === 'nano_banana_pro') return 'Pro · высокое разрешение';
  if (code === 'nano_banana_edit') return 'Редактирование фото';
  if (code === 'gpt_image_2') return 'Качественная генерация';
  if (code === 'gpt_image_2_edit') return 'Редактирование фото';
  if (code === 'seedream') return 'Фотореализм';
  if (code === 'flux_schnell') return 'Быстро и дёшево';
  if (code === 'z_image') return 'Доступная генерация';
  if (code === 'kling_21_i2v') return 'Image → video';
  if (code === 'kling_30_i2v') return 'Image → video · 720p';
  if (code === 'kling_30_motion_control') return 'Motion control';
  if (code === 'grok_video_t2v') return 'Текст → видео';
  if (code === 'grok_video_i2v') return 'Фото → видео';
  if (code === 'veo_31_t2v') return 'Текст → видео';
  if (code === 'veo_31_i2v') return 'Фото → видео';
  if (code.indexOf('happy_horse') !== -1) return 'Липсинк-видео';
  return (m && m.description) ? String(m.description).replace(/\s+через\s+Fal\.?/ig, '').replace(/\s+высокая\s+стоимость\.?/ig, '') : '';
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

function CreateScreen({ tokens, mode, setMode, preset, initModelCode, onBack, onMinimize, refreshBalance }) {
  const { Ic, Star, ASPECTS, CREATE_TPL, TemplateMedia, FALLBACK_MODELS, tplKey, readFavTemplateKeys, writeFavTemplateKeys } = window.MiraCore;

  // Models from API
  const [apiModels, setApiModels] = useState(FALLBACK_MODELS || []);
  const [modelsLoaded, setModelsLoaded] = useState(true);
  const [selectedModelCode, setSelectedModelCode] = useState(function() { return initModelCode || (preset ? templateModelCode(preset) : null); });
  const [selectedQuality, setSelectedQuality] = useState(function() { return preset ? (templateQualityValue(preset) || null) : null; });
  const [selectedDuration, setSelectedDuration] = useState(function() { return preset ? (templateDurationValue(preset) || null) : null; });
  const [uiModelId, setUiModelId] = useState(function() { return initModelCode || (preset ? templateModelCode(preset) : null); });
  const [uiQualityValue, setUiQualityValue] = useState(function() { return preset ? (templateQualityValue(preset) || null) : null; });
  const [uiDurationValue, setUiDurationValue] = useState(function() { return preset ? (templateDurationValue(preset) || null) : null; });
  const [uiModelLabel, setUiModelLabel] = useState(null);
  const [uiQualityLabel, setUiQualityLabel] = useState(null);
  const [uiDurationLabel, setUiDurationLabel] = useState(null);
  const [uiAspectLabel, setUiAspectLabel] = useState(null);
  const [templateLocked, setTemplateLocked] = useState(!!preset);
  const [qualityLocked, setQualityLocked] = useState(!!(preset && templateQualityValue(preset)));
  const [durationLocked, setDurationLocked] = useState(!!(preset && preset.durationLocked));
  const [aspectLocked, setAspectLocked] = useState(!!(preset && preset.aspectId));

  // Aspect ratio
  const [selectedAspectId, setSelectedAspectId] = useState(function() {
    return readTemplateAspect(preset) || (preset && preset.aspectId) || (ASPECTS[1] && ASPECTS[1].id) || '1:1';
  });
  const [uiAspectId, setUiAspectId] = useState(function() {
    return readTemplateAspect(preset) || (preset && preset.aspectId) || (ASPECTS[1] && ASPECTS[1].id) || '1:1';
  });

  // Pickers
  const [picker, setPicker] = useState(null); // 'model' | 'quality' | 'duration' | 'aspect'

  // Content
  const [tab, setTab] = useState('tpl');
  const [selTpl, setSelTpl] = useState(preset ? preset.t : null);
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  var favSet = new Set(favTplKeys);
  var toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  const [prompt, setPrompt] = useState('');

  // File upload
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{url, file_id, preview, type, name}]
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const uploadSlotRef = useRef(null);

  // Generation state
  const [genState, setGenState] = useState('idle'); // idle | generating | done | error
  const [currentTask, setCurrentTask] = useState(null);
  const [genError, setGenError] = useState(null);
  const [genErrorKind, setGenErrorKind] = useState('error'); // refunded | timeout | error
  const pollCancelRef = useRef(null);

  // Load models on mount
  useEffect(function() {
    function mergeModels(remote) {
      var byCode = {};
      (FALLBACK_MODELS || []).forEach(function(m) { if (m && m.code) byCode[m.code] = m; });
      (Array.isArray(remote) ? remote : []).forEach(function(m) { if (m && m.code) byCode[m.code] = Object.assign({}, byCode[m.code] || {}, m); });
      return Object.keys(byCode).map(function(k) { return byCode[k]; });
    }
    if (!window.HubicxApi) { setApiModels(mergeModels([])); setModelsLoaded(true); return; }
    setApiModels(mergeModels([]));
    setModelsLoaded(true);
    window.HubicxApi.models().then(function(models) {
      setApiModels(mergeModels(models));
      setModelsLoaded(true);
    }).catch(function() { setApiModels(mergeModels([])); setModelsLoaded(true); });
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

  // Picker-compatible model options. Seedance endpoints are grouped into two user-facing choices;
  // the concrete endpoint is selected right before generation from attached files.
  var hasSeedance = filteredModels.some(function(m) { return isSeedanceModelCode(m.code) && String(m.code).indexOf('_fast') === -1; });
  var hasSeedanceFast = filteredModels.some(function(m) { return isSeedanceModelCode(m.code) && String(m.code).indexOf('_fast') !== -1; });
  const modelOptions = [];
  if (hasSeedance) modelOptions.push({ id:'seedance_2_auto', t:'Seedance 2.0', s:'Автовыбор: текст / фото / референсы', price:'от 250 ★' });
  if (hasSeedanceFast) modelOptions.push({ id:'seedance_2_fast_auto', t:'Seedance 2.0 Fast', s:'Дешевле и быстрее, автовыбор режима', price:'от 180 ★' });
  filteredModels.forEach(function(m) {
    if (isSeedanceModelCode(m.code)) return;
    modelOptions.push({ id: m.code, t: m.title, s: shortModelDescription(m), price:(m.price_credits || 0) + ' ★' });
  });

  // Resolve current model
  var defaultModelId = (modelOptions[0] && modelOptions[0].id) || (filteredModels[0] && filteredModels[0].code) || null;
  var displayModelId = uiModelId || selectedModelCode || defaultModelId;
  var currentModelCode = resolveSeedanceAutoCode(displayModelId, uploadedFiles);
  var currentModelFull = filteredModels.find(function(m) { return m.code === currentModelCode; }) || filteredModels[0];
  var currentModelOpt = modelOptions.find(function(m) { return String(m.id) === String(displayModelId); }) || modelOptions.find(function(m) { return String(m.id) === String(currentModelCode); }) || modelOptions[0];
  var qField = getQualityField(currentModelFull);
  var durationField = getDurationField(currentModelFull);
  var filesField = getFilesField(currentModelFull);
  var singleImageField = getSingleImageField(currentModelFull);
  var singleVideoField = getSingleVideoField(currentModelFull);
  var allTplList = CREATE_TPL.filter(function(t) { return mode === 'video' ? t.type === 'video' : t.type !== 'video'; });
  var selectedTpl = allTplList.find(function(t) { return t.t === selTpl; }) || null;
  var tplList = allTplList.filter(function(t) { return favSet.has(tplKey(t)); });
  if (selectedTpl && !tplList.some(function(t) { return t.t === selectedTpl.t; })) tplList = [selectedTpl].concat(tplList);
  // Single source of truth for the visible and sent aspect is React state.
  // localStorage is used only to prefill templates, never to override live picker changes.
  var effectiveAspectId = uiAspectId || selectedAspectId;
  var selectedAspect = ASPECTS.find(function(a) { return String(a.id) === String(effectiveAspectId); }) || ASPECTS[1] || ASPECTS[0];
  var qOptions = fieldOptions(qField);
  var qValue = qField ? normalizeFieldValue(qField, uiQualityValue != null ? uiQualityValue : (selectedQuality != null ? selectedQuality : fieldDefault(qField))) : null;
  var durationOptions = fieldOptions(durationField);
  var rawDurationValue = uiDurationValue != null ? uiDurationValue : (selectedDuration != null ? selectedDuration : (selectedTpl && templateDurationValue(selectedTpl) ? templateDurationValue(selectedTpl) : fieldDefault(durationField)));
  var durationValue = durationField ? normalizeFieldValue(durationField, rawDurationValue) : null;
  if (selectedTpl && Array.isArray(selectedTpl.durationOptions) && selectedTpl.durationOptions.length && selectedTpl.durationOptions.indexOf(String(durationValue)) === -1) durationValue = String(selectedTpl.durationOptions[0]);
  var displayModelLabel = uiModelLabel || (currentModelOpt ? currentModelOpt.t : null);
  var displayQualityLabel = uiQualityLabel || (qField ? optionTitle(qOptions.find(function(o) { return String(optionValue(o)) === String(qValue); }) || qValue) : null);
  var displayDurationLabel = uiDurationLabel || (durationField && durationValue != null ? (String(durationValue) + ' сек') : null);
  var displayAspectLabel = uiAspectLabel || (selectedAspect ? selectedAspect.t + ' · ' + selectedAspect.s : '');
  var priceInputs = {};
  if (qField && qValue != null) priceInputs[qField.name] = qValue;
  if (durationField && durationValue != null) priceInputs[durationField.name] = String(durationValue);
  var currentPrice = currentModelFull ? estimateModelPrice(currentModelFull, priceInputs) : (mode === 'video' ? 5 : 2);
  var referenceSlots = selectedTpl && Array.isArray(selectedTpl.referenceSlots) ? selectedTpl.referenceSlots : null;
  var showModelPicker = !selectedTpl;

  var pickTemplate = function(t) {
    if (!t) return;
    setTab('tpl');
    setSelTpl(t.t);
    setMode(t.type === 'video' ? 'video' : 'photo');
    setSelectedModelCode(templateModelCode(t));
    setUiModelId(templateModelCode(t));
    setSelectedQuality(templateQualityValue(t) || null);
    setSelectedDuration(templateDurationValue(t) || null);
    setUiQualityValue(templateQualityValue(t) || null);
    setUiDurationValue(templateDurationValue(t) || null);
    setUiModelLabel(null);
    setUiQualityLabel(templateQualityValue(t) ? prettyOption(templateQualityValue(t)) : null);
    setUiDurationLabel(templateDurationValue(t) ? (String(templateDurationValue(t)) + ' сек') : null);
    setTemplateLocked(true);
    setQualityLocked(!!templateQualityValue(t));
    setDurationLocked(!!t.durationLocked);
    setAspectLocked(!!t.aspectId);
    if (t.aspectId) {
      var nextAspect = readTemplateAspect(t) || t.aspectId;
      setSelectedAspectId(nextAspect);
      setUiAspectId(nextAspect);
      var nextAspectOpt = ASPECTS.find(function(a) { return String(a.id) === String(nextAspect); });
      setUiAspectLabel(nextAspectOpt ? nextAspectOpt.t + ' · ' + nextAspectOpt.s : null);
    }
    setUploadedFiles([]);
    setPicker(null);
  };

  var clearTemplate = function() {
    setSelTpl(null);
    setTemplateLocked(false);
    setTab('prompt');
    setPrompt('');
    setSelectedModelCode(null);
    setUiModelId(null);
    setSelectedQuality(null);
    setSelectedDuration(null);
    setUiQualityValue(null);
    setUiDurationValue(null);
    setUiModelLabel(null);
    setUiQualityLabel(null);
    setUiDurationLabel(null);
    setUiAspectLabel(null);
    setQualityLocked(false);
    setDurationLocked(false);
    setAspectLocked(false);
    setPicker(null);
  };

  var goPromptTab = function() {
    setTab('prompt');
    setSelTpl(null);
    setTemplateLocked(false);
    setSelectedModelCode(null);
    setUiModelId(null);
    setSelectedQuality(null);
    setSelectedDuration(null);
    setUiQualityValue(null);
    setUiDurationValue(null);
    setUiModelLabel(null);
    setUiQualityLabel(null);
    setUiDurationLabel(null);
    setUiAspectLabel(null);
    setQualityLocked(false);
    setDurationLocked(false);
    setAspectLocked(false);
    setPicker(null);
  };

  // File upload handler
  var fileKind = function(file) {
    var t = String((file && file.type) || '').toLowerCase();
    return t.indexOf('video/') === 0 ? 'video' : 'image';
  };
  var handleFiles = function(files, slotIndex) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length || uploading) return;
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    var slotMode = typeof slotIndex === 'number';
    var allowed = list.filter(function(f) { return (mode === 'video' && !slotMode) ? /^(image|video)\//.test(f.type || '') : /^image\//.test(f.type || ''); });
    if (allowed.length !== list.length) alert(mode === 'photo' ? 'В генерации фото можно прикреплять только изображения' : 'Можно прикреплять только фото или видео');
    var room = slotMode ? 1 : Math.max(0, 8 - uploadedFiles.length);
    allowed = allowed.slice(0, room);
    if (!allowed.length) { if (uploadedFiles.length >= 8) alert('Можно загрузить максимум 8 файлов'); return; }
    setUploading(true);
    Promise.all(allowed.map(function(file) {
      var previewUrl = URL.createObjectURL(file);
      return window.HubicxApi.uploadFile(file).then(function(data) {
        return { url: data.url, file_id: data.file_id, preview: previewUrl, type: fileKind(file), name: file.name || 'file' };
      });
    })).then(function(items) {
      setUploadedFiles(function(prev) {
        if (slotMode) {
          var next = prev.slice();
          while (next.length < slotIndex) next.push(null);
          next[slotIndex] = items[0];
          return next.slice(0, 8);
        }
        return prev.concat(items).slice(0, 8);
      });
      setUploading(false);
    }).catch(function(err) {
      setUploading(false);
      alert((err && err.message) || 'Ошибка загрузки файла');
    });
  };

  // Start generation
  var startGeneration = function() {
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    if (!currentModelFull) { alert('Модели не загружены, попробуйте позже'); return; }

    var inputs = {};
    var hasSchemaFields = modelFields(currentModelFull).length > 0;
    var hasField = function(name) { return !hasSchemaFields || !!getModelField(currentModelFull, [name]); };
    if (effectiveAspectId) inputs.aspect_ratio = effectiveAspectId;
    if (qField && qValue != null) inputs[qField.name] = qValue;
    if (durationField && durationValue != null) inputs[durationField.name] = String(durationValue);
    if (selectedTpl && selectedTpl.templatePipeline && hasField('template_pipeline')) inputs.template_pipeline = selectedTpl.templatePipeline;
    var cleanFiles = uploadedFiles.filter(Boolean);
    var mediaUrls = cleanFiles.map(function(f) { return f.url; });
    var imageFiles = cleanFiles.filter(function(f) { return f.type !== 'video'; });
    var videoFiles = cleanFiles.filter(function(f) { return f.type === 'video'; });
    var imageUrls = imageFiles.map(function(f) { return f.url; });
    var imageIds = imageFiles.map(function(f) { return f.file_id; }).filter(function(id) { return id != null; });
    var videoUrls = videoFiles.map(function(f) { return f.url; });
    var videoIds = videoFiles.map(function(f) { return f.file_id; }).filter(function(id) { return id != null; });
    if (imageUrls.length) {
      if (hasField('image_url')) {
        if (singleImageField && singleImageField.type === 'file' && imageIds.length) inputs.image_url = imageIds[0];
        else inputs.image_url = imageUrls[0];
      }
      if (filesField && filesField.type === 'files' && imageIds.length) inputs[filesField.name] = imageIds;
      else if (hasField('image_urls')) inputs.image_urls = imageUrls;
    }
    if (videoUrls.length) {
      if (hasField('video_url')) {
        if (singleVideoField && singleVideoField.type === 'file' && videoIds.length) inputs.video_url = videoIds[0];
        else inputs.video_url = videoUrls[0];
      }
      if (hasField('video_urls')) inputs.video_urls = videoUrls;
    }
    if (mediaUrls.length && hasField('media_urls')) inputs.media_urls = mediaUrls;

    var finalPrompt = (tab === 'prompt' ? prompt.trim() : ((selectedTpl && selectedTpl.prompt) || selTpl)) || null;
    if (mediaUrls.length) {
      var refs = cleanFiles.map(function(f, i) { return '[file' + (i + 1) + '] ' + f.url; }).join('\n');
      finalPrompt = (finalPrompt ? finalPrompt + '\n\n' : '') + 'Прикрепленные медиафайлы для промпта:\n' + refs;
    }
    var payload = {
      model_code: currentModelFull.code,
      prompt: finalPrompt,
      input_file_url: mediaUrls.length ? mediaUrls[0] : null,
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
  var uploadedCount = uploadedFiles.filter(Boolean).length;
  var requiredRefCount = referenceSlots ? referenceSlots.length : 0;
  var refsReady = referenceSlots ? uploadedCount >= requiredRefCount : uploadedCount > 0;
  var ready = (hasTextInput && (!needsTplImage || refsReady)) || (mode === 'video' && uploadedCount > 0);

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
        <GenStageCanvas running={true} done={false} isVideo={isVideoModel} aspectId={effectiveAspectId} task={currentTask}/>
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
        <GenResult task={currentTask} tokens={tokens} onNewGeneration={resetGen} aspectId={effectiveAspectId}/>
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
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setUploadedFiles(function(prev) { return prev.filter(function(f) { return f && f.type !== 'video'; }); }); setSelectedModelCode(null); setUiModelId(null); setSelectedQuality(null); setSelectedDuration(null); setUiQualityValue(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setSelTpl(null); setTemplateLocked(false); setQualityLocked(false); setDurationLocked(false); setAspectLocked(false); }}>
          <Ic n="image" s={18}/> Фото
        </button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setSelectedModelCode(null); setUiModelId(null); setSelectedQuality(null); setSelectedDuration(null); setUiQualityValue(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setSelTpl(null); setTemplateLocked(false); setQualityLocked(false); setDurationLocked(false); setAspectLocked(false); }}>
          <Ic n="video" s={18}/> Видео
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple accept={mode === 'photo' ? 'image/*' : 'image/*,video/*'} style={{ display:'none' }}
        onChange={function(e) { var slot = uploadSlotRef.current; uploadSlotRef.current = null; handleFiles(e.target.files, slot); e.target.value = ''; }}/>

      {/* Drop-zone / upload preview */}
      {referenceSlots
        ? <div className="ref-slots">
            {referenceSlots.map(function(slot, i) {
              var f = uploadedFiles[i];
              return <div className={'ref-slot' + (f ? ' has' : '')} key={i} onClick={function() { if (!uploading) { uploadSlotRef.current = i; fileInputRef.current && fileInputRef.current.click(); } }}>
                {f ? <React.Fragment>
                  <img src={f.preview} alt=""/>
                  <button onClick={function(e) { e.stopPropagation(); setUploadedFiles(function(prev) { var next = prev.slice(); next[i] = null; return next; }); }}>×</button>
                </React.Fragment> : <div className="ref-empty"><Ic n="addimg" s={22} c="var(--ink)"/></div>}
                <div className="ref-caption">
                  <b>{slot.label}</b>
                  <span>{f ? 'Заменить фото' : (slot.hint || 'Загрузить фото')}</span>
                </div>
              </div>;
            })}
            {uploading && <div className="ref-uploading"><div className="gen-spinner" style={{ width:20, height:20 }}></div> Загружаю…</div>}
          </div>
        : uploadedCount > 0
        ? <div className="drop-zone media-drop" style={{ position:'relative', overflow:'hidden' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <div className="media-grid">
              {uploadedFiles.filter(Boolean).map(function(f, i) { return <div className="media-chip" key={i}>
                {f.type === 'video' ? <video src={f.preview} muted playsInline/> : <img src={f.preview} alt=""/>}
                <b>file{i + 1}</b>
                <button onClick={function(e) { e.stopPropagation(); setUploadedFiles(function(prev) { return prev.filter(function(_, idx) { return idx !== i; }); }); }}>×</button>
              </div>; })}
              {uploadedCount < 8 && <div className="media-add"><Ic n="plus" s={20}/><span>{uploadedCount}/8</span></div>}
            </div>
            <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, marginTop:8 }}>
              <div className="di"><Ic n="check" s={24} c="#5f9184"/></div>
              <div className="dt">Загружено файлов: {uploadedCount}/8</div>
              <div className="ds">В промпте можно ссылаться: file1, file2…</div>
            </div>
          </div>
        : <div className="drop-zone" onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}>
            {uploading
              ? <><div className="di"><div className="gen-spinner" style={{ width:28, height:28 }}></div></div>
                  <div className="dt">Загружаю…</div></>
              : <><div className="di"><Ic n="addimg" s={24} c="var(--ink)"/></div>
                   <div className="dt">{needsTplImage && selectedTpl ? selectedTpl.inputLabel : (mode === 'photo' ? 'Загрузить фото' : 'Загрузить фото или видео')}</div>
                   <div className="ds">До 8 файлов · в промпте: file1, file2…</div></>}
          </div>}

      {/* Content tabs */}
      <div className="seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={goPromptTab}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <div className="rail" style={{ marginTop:14 }}>
            {tplList.map(function(t, i) {
              var isFav = favSet.has(tplKey(t));
              return <div className="thumb" key={i} onClick={() => pickTemplate(t)}
                style={{ width:120, height:148, scrollSnapAlign:'start', cursor:'pointer', position:'relative',
                  outline: selTpl === t.t ? '2.5px solid var(--ink)' : 'none', outlineOffset:-1 }}>
                <TemplateMedia t={t} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}/>
                <button className="mob-tpl-fav" title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                  onClick={function(e) { e.stopPropagation(); toggleFavTpl(t); }}
                  style={{ position:'absolute', top:6, right:6, background:isFav ? 'rgba(0,0,0,.5)' : 'rgba(0,0,0,.35)', border:'none', borderRadius:8, padding:'4px 6px', display:'flex', cursor:'pointer', zIndex:2 }}>
                  <Ic n="star" s={18} c={isFav ? '#f5c542' : '#fff'}/>
                </button>
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
        {showModelPicker && <React.Fragment>
          <div key={'m-' + displayModelId + '-' + currentPrice} className={'row-link' + (templateLocked ? ' locked' : '')} onClick={() => !templateLocked && modelOptions.length > 1 && setPicker('model')}>
            <div className="cr-detail-ic">
              <Ic n="model" s={21}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="muted" style={{ fontSize:12 }}>Модель</div>
              <div style={{ fontWeight:700, fontSize:15 }}>
                {displayModelLabel ? displayModelLabel + ' · ' + currentPrice + ' ★'
                  : 'Нет доступных моделей'}
              </div>
            </div>
            {!templateLocked && modelOptions.length > 1 && <span className="chev"><Ic n="chev" s={20}/></span>}
          </div>
          <div className="divider"></div>
        </React.Fragment>}
        {qField && <React.Fragment>
          <div key={'q-' + (uiQualityValue || 'init')} className={'row-link' + (qualityLocked ? ' locked' : '')} onClick={() => !qualityLocked && setPicker('quality')}>
            <div className="cr-detail-ic">
              <Ic n="sparkle" s={21}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="muted" style={{ fontSize:12 }}>Качество</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{displayQualityLabel}</div>
              {selectedTpl && qualityLocked && <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>Качество закреплено за шаблоном</div>}
            </div>
            {selectedTpl && <button className={'m-lock-btn' + (!qualityLocked ? ' off' : '')}
              title={qualityLocked ? 'Качество закреплено. Нажмите, чтобы разблокировать' : 'Качество разблокировано'}
              onClick={function(e) { e.stopPropagation(); setQualityLocked(!qualityLocked); setPicker(qualityLocked ? 'quality' : null); }}>
              <Ic n={qualityLocked ? 'lock' : 'unlock'} s={18}/>
            </button>}
            {!qualityLocked && <span className="chev"><Ic n="chev" s={20}/></span>}
          </div>
          <div className="divider"></div>
        </React.Fragment>}
        {durationField && <React.Fragment>
          <div key={'d-' + (durationValue || 'init') + '-' + (durationLocked ? 'locked' : 'open')} className={'row-link' + (durationLocked ? ' locked' : '')} onClick={() => !durationLocked && setPicker('duration')}>
            <div className="cr-detail-ic">
              <Ic n="clock" s={21}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="muted" style={{ fontSize:12 }}>Длительность</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{displayDurationLabel}</div>
              {selectedTpl && durationLocked && <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>Длительность закреплена за шаблоном</div>}
            </div>
            {selectedTpl && durationLocked && <button className={'m-lock-btn' + (!durationLocked ? ' off' : '')}
              title={selectedTpl.durationUnlockable === false ? 'Длительность закреплена за шаблоном' : 'Длительность закреплена. Нажмите, чтобы разблокировать'}
              onClick={function(e) { e.stopPropagation(); if (selectedTpl.durationUnlockable === false) return; setDurationLocked(false); setPicker('duration'); }}>
              <Ic n="lock" s={18}/>
            </button>}
            {selectedTpl && !durationLocked && selectedTpl.durationLocked && <button className="m-lock-btn off"
              title="Длительность разблокирована"
              onClick={function(e) { e.stopPropagation(); setDurationLocked(true); setPicker(null); }}>
              <Ic n="unlock" s={18}/>
            </button>}
            {!durationLocked && <span className="chev"><Ic n="chev" s={20}/></span>}
          </div>
          <div className="divider"></div>
        </React.Fragment>}
        <div key={'a-' + (uiAspectId || 'init')} className={'row-link' + (aspectLocked ? ' locked' : '')} onClick={() => !aspectLocked && setPicker('aspect')}>
          <div className="cr-detail-ic">
            <Ic n="aspect" s={21}/>
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div className="muted" style={{ fontSize:12 }}>Соотношение сторон</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{displayAspectLabel}</div>
            {selectedTpl && aspectLocked && <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>Формат закреплён за шаблоном</div>}
          </div>
          {selectedTpl && <button className={'m-lock-btn' + (!aspectLocked ? ' off' : '')}
            title={aspectLocked ? 'Формат закреплён. Нажмите, чтобы разблокировать' : 'Формат разблокирован'}
            onClick={function(e) {
              e.stopPropagation();
              if (aspectLocked) { setAspectLocked(false); setPicker('aspect'); }
              else { setAspectLocked(true); setPicker(null); }
            }}>
            <Ic n={aspectLocked ? 'lock' : 'unlock'} s={18}/>
          </button>}
          {!aspectLocked && <span className="chev"><Ic n="chev" s={20}/></span>}
        </div>
      </div>

      <div style={{ height:20 }}/>
      <button className="btn-primary"
        disabled={!ready || uploading || !currentModelFull}
        onClick={startGeneration}>
        {'Создать · ' + currentPrice + ' ★'}
      </button>
    </div>

    {/* Model picker */}
    {picker === 'model' && !templateLocked && modelOptions.length > 0 && <PickerSheet
      title="Модель" options={modelOptions}
      current={currentModelOpt || modelOptions[0]}
      onSelect={function(opt) { setSelectedModelCode(opt.id); setUiModelId(opt.id); setUiModelLabel(opt.t || String(opt.id)); setSelectedQuality(null); setUiQualityValue(null); setUiQualityLabel(null); setQualityLocked(false); }}
      onClose={() => setPicker(null)}/>}

    {/* Quality picker */}
    {picker === 'quality' && !qualityLocked && qField && <PickerSheet
      title="Качество" options={qOptions.map(function(o) { var v = optionValue(o); return { id:String(v), t:optionTitle(o), s:qField.label || 'Качество' }; })}
      current={{ id:String(qValue) }}
      onSelect={function(opt) { setSelectedQuality(opt.id); setUiQualityValue(opt.id); setUiQualityLabel(opt.t || prettyOption(opt.id)); }}
      onClose={() => setPicker(null)}/>}

    {/* Duration picker */}
    {picker === 'duration' && !durationLocked && durationField && <PickerSheet
      title="Длительность" options={(selectedTpl && Array.isArray(selectedTpl.durationOptions) && selectedTpl.durationOptions.length ? selectedTpl.durationOptions : durationOptions).map(function(o) { var v = optionValue(o); return { id:String(v), t:String(v) + ' сек', s:'Длительность видео' }; })}
      current={{ id:String(durationValue) }}
      onSelect={function(opt) { setSelectedDuration(opt.id); setUiDurationValue(opt.id); setUiDurationLabel((opt.t || (String(opt.id) + ' сек'))); }}
      onClose={() => setPicker(null)}/>}

    {/* Aspect picker */}
    {picker === 'aspect' && !aspectLocked && <PickerSheet
      title="Соотношение сторон" options={ASPECTS}
      current={selectedAspect}
      onSelect={function(opt) {
        if (opt && opt.id) {
          var nextAspectId = String(opt.id);
          setSelectedAspectId(nextAspectId);
          setUiAspectId(nextAspectId);
          setUiAspectLabel((opt.t || nextAspectId) + (opt.s ? ' · ' + opt.s : ''));
          setAspectLocked(false);
          saveTemplateAspect(selectedTpl, nextAspectId);
        }
      }}
      onClose={() => setPicker(null)}/>}
  </div>;
}
window.CreateScreen = CreateScreen;

/* ---- reusable option picker sheet ---- */
function PickerSheet({ title, options, current, onSelect, onClose }) {
  const { Ic } = window.MiraCore;
  const val = current ? current.id : null;
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={function(e) { e.stopPropagation(); }}>
      <div className="sheet-card picker-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        <div className="picker-grid">
        {options.map(function(o) {
          return <div className={'opt pick' + (String(val) === String(o.id) ? ' on' : '')} key={o.id} onClick={function() { onSelect(o); onClose(); }}>
            <div className="pick-text">
              <div className="o-t">{o.t}</div>
              {o.s && <div className="o-s">{o.s}{o.price && <span className="o-price">{o.price}</span>}</div>}
            </div>
            {String(val) === String(o.id) && <span className="o-check"><Ic n="check" s={18} sw={2.4}/></span>}
          </div>;
        })}
        </div>
      </div>
    </div>
  </div>;
}
window.PickerSheet = PickerSheet;
