/* ============ Create photo/video screen ============ */
/* BUILD: 20260630-aspect-desktop1 */

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
function getAspectField(model) {
  var aspect = getModelField(model, ['aspect_ratio']);
  if (aspect) return aspect;
  var imageSize = getModelField(model, ['image_size']);
  if (imageSize && Array.isArray(imageSize.options)) return imageSize;
  return null;
}
function aspectValueForField(field, aspectId) {
  if (!field) return aspectId;
  var opts = fieldOptions(field).map(function(o) { return String(optionValue(o)); });
  if (opts.indexOf(String(aspectId)) !== -1) return aspectId;
  var map = {
    '1:1': ['square_hd', 'square', '1:1'],
    '2:3': ['2:3'],
    '3:4': ['3:4', 'portrait_4_3'],
    '4:5': ['4:5'],
    '3:2': ['3:2'],
    '4:3': ['4:3', 'landscape_4_3'],
    '5:4': ['5:4'],
    '9:16': ['portrait_16_9', '9:16'],
    '16:9': ['landscape_16_9', '16:9'],
    '21:9': ['21:9']
  };
  var candidates = map[String(aspectId)] || [String(aspectId)];
  for (var i = 0; i < candidates.length; i++) if (opts.indexOf(candidates[i]) !== -1) return candidates[i];
  return optionValue(fieldDefault(field)) || aspectId;
}
function getAspectOptionsForModel(model, fallbackAspects) {
  var field = getAspectField(model);
  if (!field) return fallbackAspects;
  var opts = fieldOptions(field).map(function(o) { return String(optionValue(o)); });
  var filtered = fallbackAspects.filter(function(a) {
    if (opts.indexOf(String(a.id)) !== -1) return true;
    if (field.name !== 'image_size') return false;
    var map = {
      '1:1': ['square_hd', 'square'],
      '3:4': ['portrait_4_3'],
      '4:3': ['landscape_4_3'],
      '9:16': ['portrait_16_9'],
      '16:9': ['landscape_16_9']
    };
    return (map[String(a.id)] || []).some(function(v) { return opts.indexOf(v) !== -1; });
  });
  return filtered.length ? filtered : fallbackAspects;
}
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
function formatDurationLabel(v) {
  var s = String(v == null ? '' : v);
  if (!s) return '';
  if (s === 'auto') return 'Auto';
  if (/^\d+s$/i.test(s)) return s.replace(/s$/i, ' сек');
  if (/^\d+$/.test(s)) return s + ' сек';
  return s;
}
function durationOptionValues(options) {
  return (Array.isArray(options) ? options : []).map(function(o) { return String(optionValue(o)); });
}
function durationSecondsKey(v) {
  var m = String(v == null ? '' : v).match(/^(\d+)s?$/i);
  return m ? String(parseInt(m[1], 10)) : null;
}
function durationValuesMatch(a, b) {
  if (String(a) === String(b)) return true;
  var ak = durationSecondsKey(a);
  var bk = durationSecondsKey(b);
  return !!(ak && bk && ak === bk);
}
function coerceDurationValue(values, value) {
  if (value == null) return null;
  var selected = String(value);
  var hit = (values || []).find(function(v) { return durationValuesMatch(v, selected); });
  return hit != null ? String(hit) : selected;
}
function durationIndex(values, value) {
  var selected = coerceDurationValue(values, value);
  var index = (values || []).findIndex(function(v) { return durationValuesMatch(v, selected); });
  return index < 0 ? 0 : index;
}
function estimateModelPrice(model, inputs, context) {
  if (!model) return 0;
  if (window.MiraCore && window.MiraCore.computeGenerationPrice) {
    return window.MiraCore.computeGenerationPrice(model, inputs, context);
  }
  if (context && context.mode && !modelMatchesMode(model, context.mode)) return 0;
  var dbRules = model.price_rules;
  var basePrice = Number(model.price_credits || 0);
  if (dbRules && typeof dbRules === 'object') {
    var res = String((inputs && inputs.resolution) || dbRules.default_resolution || '').trim();
    var resKey = res.toLowerCase().endsWith('k') && res.length <= 3 ? res.toUpperCase() : res.toLowerCase();
    var dur = String((inputs && inputs.duration) || dbRules.default_duration || '5');
    if (dbRules.resolution_duration_prices) {
      var byResolution = dbRules.resolution_duration_prices[resKey] || dbRules.resolution_duration_prices[res] || null;
      if (byResolution && byResolution[dur] != null) return Math.max(1, Number(byResolution[dur]) || basePrice || 1);
      return Math.max(1, basePrice || 1);
    }
    if (dbRules.duration_prices) {
      if (dbRules.duration_prices[dur] != null) return Math.max(1, Number(dbRules.duration_prices[dur]) || basePrice || 1);
      return Math.max(1, basePrice || 1);
    }
    if (dbRules.resolution_prices) {
      var price = Number(dbRules.resolution_prices[resKey] != null ? dbRules.resolution_prices[resKey] : dbRules.resolution_prices[res]);
      if (!price) price = basePrice;
      if (dbRules.multiply_by_num_images) price *= Math.max(1, Number(inputs && inputs.num_images) || 1);
      return Math.max(1, Math.ceil(price || basePrice || 1));
    }
    if (dbRules.multiply_by_num_images) {
      return Math.max(1, Math.ceil((basePrice || 1) * Math.max(1, Number(inputs && inputs.num_images) || 1)));
    }
  }
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
function replayParams(task) { return (task && task.params && typeof task.params === 'object') ? task.params : {}; }
function replayPrompt(task) {
  var p = replayParams(task);
  if (p._ui_generation_kind === 'template' || p._ui_template_code) return '';
  return task && task.prompt ? String(task.prompt) : '';
}
function replayModelCode(task) { return task && task.model_code ? String(task.model_code) : null; }
function replayQualityValue(task) {
  var p = replayParams(task);
  return p.resolution || p.quality || p.image_size || p.size || null;
}
function replayDurationValue(task) {
  var p = replayParams(task);
  var v = p.duration || p.video_duration || null;
  return v == null ? null : String(v).replace(/s$/i, '');
}
function replayAspectValue(task) {
  var p = replayParams(task);
  var v = p.aspect_ratio || p.ratio || null;
  return v == null ? null : String(v);
}
function replayInputFiles(task) {
  var p = replayParams(task);
  var urls = [];
  var add = function(v) {
    if (!v) return;
    if (Array.isArray(v)) { v.forEach(add); return; }
    if (typeof v === 'string' && /^https?:\/\//i.test(v) && urls.indexOf(v) === -1) urls.push(v);
  };
  add(task && task.input_file_url);
  add(p._ui_input_urls);
  add(p.image_url); add(p.image_urls); add(p.video_url); add(p.video_urls); add(p.media_urls);
  return urls.map(function(url) {
    return { url:url, preview:url, type:/\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : 'image', name:'repeat' };
  }).slice(0, 8);
}
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
function seedanceTierFromCode(code) {
  var s = String(code || '');
  if (s.indexOf('_mini') !== -1 || s === 'seedance_2_mini_auto') return 'mini';
  if (s.indexOf('_fast') !== -1 || s === 'seedance_2_fast_auto') return 'fast';
  return 'normal';
}
function seedanceAutoCodeForTier(tier) {
  if (tier === 'mini') return 'seedance_2_mini_auto';
  if (tier === 'fast') return 'seedance_2_fast_auto';
  return 'seedance_2_auto';
}
function seedanceTierLabel(tier) {
  return tier === 'mini' ? 'Mini' : (tier === 'fast' ? 'Fast' : 'Normal');
}
function resolveSeedanceAutoCode(code, files, tier) {
  var selected = String(code || '');
  if (selected === 'seedance_2_auto' && tier) selected = seedanceAutoCodeForTier(tier);
  var list = Array.isArray(files) ? files.filter(Boolean) : [];
  var images = list.filter(function(f) { return !f || f.type !== 'video'; }).length;
  var videos = list.filter(function(f) { return f && f.type === 'video'; }).length;
  var isFast = selected === 'seedance_2_fast_auto' || selected.indexOf('_fast') !== -1;
  var isMini = selected === 'seedance_2_mini_auto' || selected.indexOf('_mini') !== -1;
  if (selected !== 'seedance_2_auto' && selected !== 'seedance_2_fast_auto' && selected !== 'seedance_2_mini_auto') return selected;
  if (isMini) {
    if (images >= 2 || videos > 0) return 'seedance_2_mini_reference';
    if (images === 1) return 'seedance_2_mini_i2v';
    return 'seedance_2_mini_t2v';
  }
  if (images >= 2 || videos > 0) return isFast ? 'seedance_2_reference_fast' : 'seedance_2_reference';
  if (images === 1) return isFast ? 'seedance_2_i2v_fast' : 'seedance_2_i2v';
  return isFast ? 'seedance_2_t2v_fast' : 'seedance_2_t2v';
}
function displaySeedanceAutoCode(code) {
  var s = String(code || '');
  if (!isSeedanceModelCode(s)) return s;
  return 'seedance_2_auto';
}
function modelMatchesMode(model, mode) {
  if (!model) return false;
  if (mode === 'video') return model.task_type === 'video' || model.category === 'video';
  return model.task_type === 'image' || (model.category === 'photo' && model.task_type !== 'video');
}
function sanitizeDisplayModelId(rawId, mode, modelOptions, filteredModels) {
  var raw = rawId ? String(rawId) : '';
  if (!raw) return null;
  var display = displaySeedanceAutoCode(raw);
  if ((modelOptions || []).some(function(o) { return String(o.id) === display; })) return display;
  var direct = (filteredModels || []).find(function(m) { return String(m.code) === raw && modelMatchesMode(m, mode); });
  return direct ? displaySeedanceAutoCode(direct.code) : null;
}
function findModeModel(models, code, mode) {
  var list = Array.isArray(models) ? models : [];
  var target = String(code || '');
  if (!target) return null;
  return list.find(function(m) { return String(m && m.code) === target && modelMatchesMode(m, mode); }) || null;
}
function firstModeModel(models, mode) {
  return (Array.isArray(models) ? models : []).find(function(m) { return modelMatchesMode(m, mode); }) || null;
}
function modelDisplayTitle(m) {
  var code = String((m && m.code) || '');
  var titles = {
    nano_banana_edit:'Nano Banana · редактор',
    gpt_image_2_edit:'GPT Image 2 · редактор',
    flux_schnell:'Flux · быстрый',
    kling_21_i2v:'Kling 2.1 · по фото',
    kling_30_i2v:'Kling 3.0 · по фото',
    kling_30_motion_control:'Kling 3.0 · движение',
    grok_video_t2v:'Grok · по тексту',
    grok_video_i2v:'Grok · по фото',
    veo_31_t2v:'Veo 3.1 · по тексту',
    veo_31_i2v:'Veo 3.1 · по фото',
    happy_horse_i2v:'Happy Horse · по фото'
  };
  return titles[code] || (m && m.title) || code;
}
function shortModelDescription(m) {
  var code = String((m && m.code) || '');
  if (code === 'nano_banana_2') return 'Быстро создаёт изображения по описанию';
  if (code === 'nano_banana_2_lite') return 'Быстро и дешевле создаёт изображения';
  if (code === 'nano_banana_pro') return 'Создаёт и улучшает фото в высоком качестве';
  if (code === 'nano_banana_edit') return 'Изменяет загруженное фото по описанию';
  if (code === 'gpt_image_2') return 'Точные изображения и надписи';
  if (code === 'gpt_image_2_edit') return 'Аккуратно изменяет загруженное фото';
  if (code === 'seedream') return 'Реалистичные фото и портреты';
  if (code.indexOf('seedance_2_mini') === 0) return 'Доступное видео для быстрых задач';
  if (code.indexOf('seedance_2_') === 0 && code.indexOf('_fast') !== -1) return 'Быстрое видео по тексту или фото';
  if (code === 'flux_schnell') return 'Быстрые изображения по описанию';
  if (code === 'z_image') return 'Недорогая генерация изображений';
  if (code === 'kling_21_i2v') return 'Оживляет загруженную фотографию';
  if (code === 'kling_30_i2v') return 'Качественно оживляет фотографию';
  if (code === 'kling_30_motion_control') return 'Переносит движение из видео на персонажа';
  if (code === 'grok_video_t2v') return 'Создаёт видео по текстовому описанию';
  if (code === 'grok_video_i2v') return 'Оживляет загруженное фото';
  if (code === 'veo_31_t2v') return 'Кинематографичное видео по описанию';
  if (code === 'veo_31_i2v') return 'Кинематографично оживляет фото';
  if (code.indexOf('happy_horse') !== -1) return 'Оживляет фото со звуком и речью';
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

function CreateScreen({ tokens, mode, setMode, preset, initModelCode, repeatTask, onBack, onMinimize, onQueued, refreshBalance, onInsufficientBalance }) {
  const { Ic, Star, ASPECTS, CREATE_TPL, TemplateMedia, FALLBACK_MODELS, mergeModelCatalog, initialModelCatalog, persistModelCatalog, tplKey, readFavTemplateKeys, writeFavTemplateKeys } = window.MiraCore;
  var replayModel = replayModelCode(repeatTask);
  var replayQuality = replayQualityValue(repeatTask);
  var replayDuration = replayDurationValue(repeatTask);
  var replayAspect = replayAspectValue(repeatTask);
  var replayFiles = replayInputFiles(repeatTask);

  // Models from API
  const [apiModels, setApiModels] = useState(function() { return initialModelCatalog ? initialModelCatalog() : (FALLBACK_MODELS || []).slice(); });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [selectedModelCode, setSelectedModelCode] = useState(function() { return initModelCode || (preset ? templateModelCode(preset) : replayModel); });
  const [selectedQuality, setSelectedQuality] = useState(function() { return preset ? (templateQualityValue(preset) || null) : replayQuality; });
  const [selectedDuration, setSelectedDuration] = useState(function() { return preset ? (templateDurationValue(preset) || null) : replayDuration; });
  const [uiModelId, setUiModelId] = useState(function() { return initModelCode || (preset ? templateModelCode(preset) : replayModel); });
  const [uiQualityValue, setUiQualityValue] = useState(function() { return preset ? (templateQualityValue(preset) || null) : replayQuality; });
  const [uiDurationValue, setUiDurationValue] = useState(function() { return preset ? (templateDurationValue(preset) || null) : replayDuration; });
  const [uiModelLabel, setUiModelLabel] = useState(null);
  const [uiQualityLabel, setUiQualityLabel] = useState(null);
  const [uiDurationLabel, setUiDurationLabel] = useState(null);
  const [uiAspectLabel, setUiAspectLabel] = useState(null);
  const [templateLocked, setTemplateLocked] = useState(!!preset);
  const [qualityLocked, setQualityLocked] = useState(!!(preset && templateQualityValue(preset) && preset.qualityLocked !== false));
  const [durationLocked, setDurationLocked] = useState(!!(preset && preset.durationLocked));
  const [aspectLocked, setAspectLocked] = useState(!!(preset && preset.aspectId && preset.aspectLocked !== false));

  // Aspect ratio
  const [selectedAspectId, setSelectedAspectId] = useState(function() {
    return readTemplateAspect(preset) || (preset && preset.aspectId) || replayAspect || (ASPECTS[1] && ASPECTS[1].id) || '1:1';
  });
  const [uiAspectId, setUiAspectId] = useState(function() {
    return readTemplateAspect(preset) || (preset && preset.aspectId) || replayAspect || (ASPECTS[1] && ASPECTS[1].id) || '1:1';
  });

  // Pickers
  const [picker, setPicker] = useState(null); // 'model' | 'quality' | 'duration' | 'aspect'

  // Content
  const [tab, setTab] = useState(preset ? 'tpl' : (repeatTask ? 'prompt' : 'tpl'));
  const [selTpl, setSelTpl] = useState(preset ? preset.t : null);
  const [favTplKeys, setFavTplKeys] = useState(readFavTemplateKeys);
  var favSet = new Set(favTplKeys);
  var toggleFavTpl = function(t) {
    var key = tplKey(t);
    if (!key) return;
    var next = favSet.has(key) ? favTplKeys.filter(function(k) { return k !== key; }) : favTplKeys.concat([key]);
    setFavTplKeys(next); writeFavTemplateKeys(next);
  };
  const [prompt, setPrompt] = useState(function() { return preset ? '' : replayPrompt(repeatTask); });

  // File upload
  const [uploadedFiles, setUploadedFiles] = useState(function() { return replayFiles; }); // [{url, file_id, preview, type, name}]
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const uploadSlotRef = useRef(null);

  // Generation state
  const [genState, setGenState] = useState('idle'); // idle | generating | done | error
  const [currentTask, setCurrentTask] = useState(null);
  const [genError, setGenError] = useState(null);
  const [genErrorKind, setGenErrorKind] = useState('error'); // refunded | timeout | error
  const pollCancelRef = useRef(null);
  const [serverPrice, setServerPrice] = useState(null);
  const pricePreviewSeqRef = useRef(0);

  // Load models on mount
  useEffect(function() {
    var mergeModels = mergeModelCatalog || function(remote) { return Array.isArray(remote) && remote.length ? remote : (FALLBACK_MODELS || []).slice(); };
    if (!window.HubicxApi) { setModelsLoaded(true); return; }
    window.HubicxApi.models().then(function(models) {
      var nextCatalog = mergeModels(models);
      setApiModels(nextCatalog);
      if (persistModelCatalog) persistModelCatalog(nextCatalog);
      setModelsLoaded(true);
    }).catch(function() { setModelsLoaded(true); });
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

  const [seedanceTier, setSeedanceTier] = useState(function() { return seedanceTierFromCode(preset ? templateModelCode(preset) : replayModel); });

  // Picker-compatible model options. Seedance endpoints are grouped into one user-facing choice;
  // the concrete endpoint is selected right before generation from attached files.
  var hasSeedance = filteredModels.some(function(m) { return isSeedanceModelCode(m.code); });
  const modelOptions = [];
  if (hasSeedance) modelOptions.push({ id:'seedance_2_auto', t:'Seedance 2.0', s:'Видео по тексту, фото или референсам', price:'от 112 ★' });
  filteredModels.forEach(function(m) {
    if (isSeedanceModelCode(m.code)) return;
    modelOptions.push({ id: m.code, t: modelDisplayTitle(m), s: shortModelDescription(m), price:(m.price_credits || 0) + ' ★' });
  });

  // Resolve current model
  var defaultModelId = (modelOptions[0] && modelOptions[0].id) || (filteredModels[0] && filteredModels[0].code) || null;
  var requestedModelId = uiModelId || selectedModelCode || null;
  var displayModelId = sanitizeDisplayModelId(requestedModelId, mode, modelOptions, filteredModels) || defaultModelId;
  var currentModelCode = resolveSeedanceAutoCode(displayModelId, uploadedFiles, seedanceTier);
  var defaultModelFull = findModeModel(filteredModels, defaultModelId, mode) || firstModeModel(filteredModels, mode);
  var currentModelFull = findModeModel(filteredModels, currentModelCode, mode) || defaultModelFull || null;
  var currentModelOpt = modelOptions.find(function(m) { return String(m.id) === String(displayModelId); }) || modelOptions.find(function(m) { return String(m.id) === String(currentModelCode); }) || modelOptions[0];
  var qField = getQualityField(currentModelFull);
  var durationField = getDurationField(currentModelFull);
  var aspectField = getAspectField(currentModelFull);
  var filesField = getFilesField(currentModelFull);
  var singleImageField = getSingleImageField(currentModelFull);
  var singleVideoField = getSingleVideoField(currentModelFull);
  var allTplList = CREATE_TPL.filter(function(t) { return mode === 'video' ? t.type === 'video' : t.type !== 'video'; });
  var selectedTpl = allTplList.find(function(t) { return t.t === selTpl; }) || null;
  var referenceSlots = selectedTpl && Array.isArray(selectedTpl.referenceSlots) ? selectedTpl.referenceSlots : null;
  var tplList = allTplList.filter(function(t) { return favSet.has(tplKey(t)); });
  if (selectedTpl && !tplList.some(function(t) { return t.t === selectedTpl.t; })) tplList = [selectedTpl].concat(tplList);
  // Single source of truth for the visible and sent aspect is React state.
  // localStorage is used only to prefill templates, never to override live picker changes.
  var aspectOpts = getAspectOptionsForModel(currentModelFull, ASPECTS);
  var effectiveAspectId = uiAspectId || selectedAspectId;
  var selectedAspect = aspectOpts.find(function(a) { return String(a.id) === String(effectiveAspectId); }) || aspectOpts[0] || ASPECTS[1] || ASPECTS[0];
  var qOptions = fieldOptions(qField);
  var qValue = qField ? normalizeFieldValue(qField, uiQualityValue != null ? uiQualityValue : (selectedQuality != null ? selectedQuality : fieldDefault(qField))) : null;
  var durationOptions = fieldOptions(durationField);
  var templateDurationOptions = selectedTpl && Array.isArray(selectedTpl.durationOptions) && selectedTpl.durationOptions.length ? selectedTpl.durationOptions : null;
  var durationOptionsForUi = templateDurationOptions && (durationLocked || selectedTpl.durationUnlockable === false) ? templateDurationOptions : durationOptions;
  var visibleDurationOptions = durationOptionValues(durationOptionsForUi);
  var rawDurationValue = uiDurationValue != null ? uiDurationValue : (selectedDuration != null ? selectedDuration : (selectedTpl && templateDurationValue(selectedTpl) ? templateDurationValue(selectedTpl) : fieldDefault(durationField)));
  var durationValue = durationField ? normalizeFieldValue(durationField, rawDurationValue) : null;
  if (durationField && visibleDurationOptions.length && durationValue != null && visibleDurationOptions.indexOf(String(durationValue)) === -1) {
    var coercedDuration = coerceDurationValue(visibleDurationOptions, durationValue);
    durationValue = visibleDurationOptions.indexOf(String(coercedDuration)) !== -1 ? coercedDuration : (visibleDurationOptions.indexOf('auto') !== -1 ? 'auto' : String(visibleDurationOptions[0]));
  }
  var displayModelLabel = uiModelLabel || (currentModelOpt ? currentModelOpt.t : null);
  var showSeedanceTier = !selectedTpl && isSeedanceModelCode(displayModelId) && hasSeedance;
  var displayQualityLabel = uiQualityLabel || (qField ? optionTitle(qOptions.find(function(o) { return String(optionValue(o)) === String(qValue); }) || qValue) : null);
  var displayDurationLabel = durationField && durationValue != null ? formatDurationLabel(durationValue) : null;
  var displayAspectLabel = uiAspectLabel && selectedAspect && String(selectedAspect.id) === String(effectiveAspectId)
    ? uiAspectLabel
    : (selectedAspect ? selectedAspect.t + ' · ' + selectedAspect.s : '');
  var priceInputs = {};
  if (qField && qValue != null) priceInputs[qField.name] = qValue;
  if (durationField && durationValue != null) priceInputs[durationField.name] = String(durationValue);
  var templateReferenceCount = selectedTpl && selectedTpl.templatePipeline && referenceSlots ? referenceSlots.length : 0;
  if (templateReferenceCount) {
    priceInputs.template_pipeline = selectedTpl.templatePipeline;
    priceInputs.reference_preprocess_count = templateReferenceCount;
  }
  var priceSignature = currentModelFull
    ? [mode, currentModelFull.code, qField ? qField.name + '=' + String(qValue) : '', durationField ? durationField.name + '=' + String(durationValue) : '', selectedTpl && selectedTpl.templatePipeline ? selectedTpl.templatePipeline : '', String(templateReferenceCount)].join('|')
    : '';
  var localPrice = currentModelFull ? estimateModelPrice(currentModelFull, priceInputs, { mode:mode, displayModelId:displayModelId, concreteModelCode:currentModelFull.code }) : 0;
  if (templateReferenceCount) localPrice += Number(selectedTpl.referencePrepCredits || 0) * templateReferenceCount;
  var serverPriceFresh = serverPrice && serverPrice.signature === priceSignature && serverPrice.value != null ? serverPrice.value : null;
  // Show catalog price immediately, then prefer a fresh backend preview.
  var currentPrice = serverPriceFresh != null ? serverPriceFresh : localPrice;
  var createCtaKey = ['mobile-create-cta', priceSignature, String(currentPrice), currentModelFull ? currentModelFull.code : 'none'].join('|');
  var createCtaLabel = currentModelFull ? 'Создать · ' + currentPrice + ' ★' : 'Модель временно недоступна';
  useEffect(function() {
    if (!window.MiraCore || !window.MiraCore.writePriceTrace) return;
    window.MiraCore.writePriceTrace('mobile-create', {
      build: window.__APP_BUILD__ || window.__HUBICX_INLINE_INDEX__ || '',
      mode: mode,
      modelsLoaded: !!modelsLoaded,
      displayModelId: displayModelId,
      concreteModelCode: currentModelFull ? currentModelFull.code : null,
      modelTaskType: currentModelFull ? currentModelFull.task_type : null,
      modelCategory: currentModelFull ? currentModelFull.category : null,
      modelPriceCredits: currentModelFull ? currentModelFull.price_credits : null,
      hasPriceRules: !!(currentModelFull && currentModelFull.price_rules),
      selectedModelCode: selectedModelCode,
      uiModelId: uiModelId,
      seedanceTier: seedanceTier,
      priceInputs: priceInputs,
      quality: qField ? qField.name + '=' + String(qValue) : '',
      duration: durationField ? durationField.name + '=' + String(durationValue) : '',
      localPrice: localPrice,
      serverPrice: serverPriceFresh,
      previewMismatch: serverPriceFresh != null && serverPriceFresh !== localPrice,
      finalPrice: currentPrice,
      signature: priceSignature,
    });
  }, [priceSignature, currentPrice, displayModelId, selectedModelCode, uiModelId, seedanceTier, modelsLoaded]);
  var singlePhotoTemplate = tab === 'tpl' && selectedTpl && selectedTpl.type === 'photo' && selectedTpl.requiresImage && !referenceSlots;
  var isVideoTemplate = !!(selectedTpl && selectedTpl.type === 'video');
  var effectiveQualityLocked = !!(qualityLocked && !isVideoTemplate);
  var effectiveAspectLocked = !!(aspectLocked && !isVideoTemplate);
  var showModelPicker = !selectedTpl;

  useEffect(function() {
    if (!currentModelFull || !window.HubicxApi || !window.HubicxApi.modelPricePreview || !window.HubicxApi.hasAuth()) {
      setServerPrice({ signature: priceSignature, value: null });
      return;
    }
    var seq = ++pricePreviewSeqRef.current;
    var signature = priceSignature;
    var timer = setTimeout(function() {
      window.HubicxApi.modelPricePreview(currentModelFull.code, priceInputs).then(function(data) {
        if (seq !== pricePreviewSeqRef.current) return;
        var next = data && (data.final_price_credits != null ? data.final_price_credits : data.price_tokens);
        next = Number(next);
        setServerPrice({ signature: signature, value: next > 0 ? Math.ceil(next) : null });
      }).catch(function() {
        if (seq === pricePreviewSeqRef.current) setServerPrice({ signature: signature, value: null });
      });
    }, 120);
    return function() { clearTimeout(timer); };
  }, [priceSignature]);

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
    setUiDurationLabel(null);
    setTemplateLocked(true);
    setQualityLocked(!!templateQualityValue(t) && t.qualityLocked !== false);
    setDurationLocked(!!t.durationLocked);
    setAspectLocked(!!t.aspectId && t.aspectLocked !== false);
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
    var room = slotMode ? 1 : (singlePhotoTemplate ? 1 : Math.max(0, 8 - uploadedFiles.length));
    allowed = allowed.slice(0, room);
    if (!allowed.length) {
      alert(singlePhotoTemplate ? 'Для этого шаблона можно загрузить только одно фото' : 'Можно загрузить максимум 8 файлов');
      return;
    }
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
        if (singlePhotoTemplate) return items.slice(0, 1);
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
    if (currentPrice > Number(tokens || 0)) {
      if (onInsufficientBalance) onInsufficientBalance(currentPrice);
      return;
    }
    if (!window.HubicxApi || !window.HubicxApi.hasAuth()) return;
    if (!currentModelFull) { alert('Модели не загружены, попробуйте позже'); return; }

    var inputs = {};
    var hasSchemaFields = modelFields(currentModelFull).length > 0;
    var hasField = function(name) { return !hasSchemaFields || !!getModelField(currentModelFull, [name]); };
    if (selectedAspect) {
      var providerAspectValue = aspectField ? aspectValueForField(aspectField, selectedAspect.id) : selectedAspect.id;
      if (aspectField) inputs[aspectField.name] = providerAspectValue;
      else inputs.aspect_ratio = providerAspectValue;
    }
    if (qField && qValue != null) inputs[qField.name] = qValue;
    if (durationField && durationValue != null) inputs[durationField.name] = String(durationValue);
    if (selectedTpl && selectedTpl.templatePipeline && hasField('template_pipeline')) {
      inputs.template_pipeline = selectedTpl.templatePipeline;
      if (hasField('reference_preprocess_count')) inputs.reference_preprocess_count = referenceSlots ? referenceSlots.length : 1;
    }
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

    var templatePrompt = selectedTpl && window.MiraCore && window.MiraCore.templatePromptForOutput
      ? window.MiraCore.templatePromptForOutput(selectedTpl, selectedAspect && selectedAspect.id, qValue)
      : ((selectedTpl && selectedTpl.prompt) || selTpl);
    var finalPrompt = (tab === 'prompt' ? prompt.trim() : templatePrompt) || null;
    var payload = {
      model_code: currentModelFull.code,
      prompt: finalPrompt,
      input_file_url: mediaUrls.length ? mediaUrls[0] : null,
      params: {
        _ui_generation_kind: tab === 'tpl' && selectedTpl ? 'template' : 'prompt',
        _ui_template_code: tab === 'tpl' && selectedTpl ? (selectedTpl.code || selectedTpl.t) : null,
        _ui_input_urls: mediaUrls,
      },
      inputs: inputs,
    };

    setGenState('generating');
    setGenError(null);
    setGenErrorKind('error');
    setCurrentTask(null);

    window.HubicxApi.createGeneration(payload).then(function(data) {
      if (onQueued) {
        if (refreshBalance) refreshBalance();
        onQueued({
          taskId: data.task_id,
          status: data.status,
          isVideo: mode === 'video',
        });
        return;
      }
      var cancel = pollTask(
        data.task_id,
        function(task) { setCurrentTask(task); },
        function(task) { setCurrentTask(task); setGenState('done'); if (refreshBalance) refreshBalance(); },
        function(errMsg, kind) { setGenState('error'); setGenError(errMsg); setGenErrorKind(kind || 'error'); if (refreshBalance) refreshBalance(); }
      );
      pollCancelRef.current = cancel;
    }).catch(function(err) {
      if (window.MiraCore.isInsufficientBalanceError && window.MiraCore.isInsufficientBalanceError(err)) {
        if (refreshBalance) refreshBalance();
        if (onInsufficientBalance) onInsufficientBalance(currentPrice);
        setGenState('idle');
        return;
      }
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
    return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="cr-head">
        <div className="cr-back" onClick={minimize}><Ic n="back" s={20}/></div>
        <div className="cr-title">Запускаем…</div>
        <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
      </div>
      <div className="screen scr-enter gen-queue-screen">
        <div className="gen-queue-card">
          <div className="gen-spinner"></div>
          <h3>Отправляем задачу</h3>
          <p>
            {mode === 'video'
              ? 'Видео уйдёт в генерацию в фоне. Когда будет готово, пришлём результат в Telegram.'
              : 'Фото уйдёт в генерацию в фоне. Результат появится в истории и придёт в Telegram.'}
          </p>
        </div>
        <div className="muted" style={{ fontSize:13.5, textAlign:'center', margin:'14px auto 0', maxWidth:280 }}>
          {mode === 'video'
            ? 'Обычно видео занимает 2–3 минуты.'
            : 'Обычно фото занимает 15–40 секунд.'}
        </div>
        <button className="btn-secondary" style={{ margin:'14px auto 0', maxWidth:220 }}
          onClick={minimize}>Свернуть</button>
        <div className="muted" style={{ fontSize:12, textAlign:'center', margin:'10px auto 0', maxWidth:260 }}>
          Можно продолжать пользоваться Hubicx
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
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => { setMode('photo'); setUploadedFiles(function(prev) { return prev.filter(function(f) { return f && f.type !== 'video'; }); }); setSelectedModelCode(null); setUiModelId(null); setSelectedQuality(null); setSelectedDuration(null); setUiQualityValue(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setSelTpl(null); setTemplateLocked(false); setQualityLocked(false); setDurationLocked(false); setAspectLocked(false); }}>
          <Ic n="image" s={18}/> Фото
        </button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => { setMode('video'); setSelectedModelCode(null); setUiModelId(null); setSelectedQuality(null); setSelectedDuration(null); setUiQualityValue(null); setUiDurationValue(null); setUiModelLabel(null); setUiQualityLabel(null); setUiDurationLabel(null); setUiAspectLabel(null); setSelTpl(null); setTemplateLocked(false); setQualityLocked(false); setDurationLocked(false); setAspectLocked(false); }}>
          <Ic n="video" s={18}/> Видео
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple={!singlePhotoTemplate} accept={mode === 'photo' ? 'image/*' : 'image/*,video/*'} style={{ display:'none' }}
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
              {!singlePhotoTemplate && uploadedCount < 8 && <div className="media-add"><Ic n="plus" s={20}/><span>{uploadedCount}/8</span></div>}
            </div>
            <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, marginTop:8 }}>
              <div className="di"><Ic n="check" s={24} c="#5f9184"/></div>
              <div className="dt">{singlePhotoTemplate ? 'Фото загружено' : 'Загружено файлов: ' + uploadedCount + '/8'}</div>
              <div className="ds">{singlePhotoTemplate ? 'Нажмите, чтобы заменить фото' : 'Файлы отправятся в генерацию вместе с промптом'}</div>
            </div>
          </div>
        : <div className="drop-zone" onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}>
            {uploading
              ? <><div className="di"><div className="gen-spinner" style={{ width:28, height:28 }}></div></div>
                  <div className="dt">Загружаю…</div></>
              : <><div className="di"><Ic n="addimg" s={24} c="var(--ink)"/></div>
                   <div className="dt">{needsTplImage && selectedTpl ? selectedTpl.inputLabel : (mode === 'photo' ? 'Загрузить фото' : 'Загрузить фото или видео')}</div>
                   <div className="ds">{singlePhotoTemplate ? 'Только 1 фото для этого шаблона' : 'До 8 файлов · медиа отправятся вместе с промптом'}</div></>}
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
          <div key={'m-' + displayModelId + '-' + displayModelLabel} className={'row-link' + (templateLocked ? ' locked' : '')} onClick={() => !templateLocked && modelOptions.length > 1 && setPicker('model')}>
            <div className="cr-detail-ic">
              <Ic n="model" s={21}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="muted" style={{ fontSize:12 }}>Модель</div>
              <div style={{ fontWeight:700, fontSize:15 }}>
                {displayModelLabel ? displayModelLabel
                  : 'Нет доступных моделей'}
              </div>
              {showSeedanceTier && <div className="seedance-tier-note">Версия: {seedanceTierLabel(seedanceTier)}</div>}
            </div>
            {!templateLocked && modelOptions.length > 1 && <span className="chev"><Ic n="chev" s={20}/></span>}
          </div>
          {showSeedanceTier && <SeedanceTierControl value={seedanceTier} onChange={function(next) {
            setSeedanceTier(next);
            setSelectedModelCode('seedance_2_auto');
            setUiModelId('seedance_2_auto');
            setUiModelLabel(null);
            setSelectedQuality(null);
            setUiQualityValue(null);
            setUiQualityLabel(null);
            setSelectedDuration(null);
            setUiDurationValue(null);
            setUiDurationLabel(null);
          }}/>}
          <div className="divider"></div>
        </React.Fragment>}
        {qField && <React.Fragment>
          <div key={'q-' + (uiQualityValue || 'init')} className={'row-link' + (effectiveQualityLocked ? ' locked' : '')} onClick={() => !effectiveQualityLocked && setPicker('quality')}>
            <div className="cr-detail-ic">
              <Ic n="sparkle" s={21}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="muted" style={{ fontSize:12 }}>Качество</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{displayQualityLabel}</div>
              {selectedTpl && effectiveQualityLocked && <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>Качество закреплено за шаблоном</div>}
            </div>
            {selectedTpl && !isVideoTemplate && <button className={'m-lock-btn' + (!qualityLocked ? ' off' : '')}
              title={qualityLocked ? 'Качество закреплено. Нажмите, чтобы разблокировать' : 'Качество разблокировано'}
              onClick={function(e) { e.stopPropagation(); setQualityLocked(!qualityLocked); setPicker(qualityLocked ? 'quality' : null); }}>
              <Ic n={qualityLocked ? 'lock' : 'unlock'} s={18}/>
            </button>}
            {!effectiveQualityLocked && <span className="chev"><Ic n="chev" s={20}/></span>}
          </div>
          <div className="divider"></div>
        </React.Fragment>}
        {durationField && !isVideoTemplate && <React.Fragment>
          <DurationInlineControl
            value={String(durationValue)}
            label={displayDurationLabel}
            options={visibleDurationOptions}
            locked={durationLocked}
            template={selectedTpl}
            onChange={function(next) {
              setSelectedDuration(next);
              setUiDurationValue(next);
              setUiDurationLabel(null);
              setPicker(null);
            }}
            onUnlock={function() {
              if (selectedTpl && selectedTpl.durationUnlockable === false) return;
              setDurationLocked(false);
              setPicker(null);
            }}
            onRelock={function() {
              setDurationLocked(true);
              setPicker(null);
            }}
          />
          <div className="divider"></div>
        </React.Fragment>}
        <div key={'a-' + (uiAspectId || 'init')} className={'row-link' + (effectiveAspectLocked ? ' locked' : '')} onClick={() => !effectiveAspectLocked && setPicker('aspect')}>
          <div className="cr-detail-ic">
            <Ic n="aspect" s={21}/>
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div className="muted" style={{ fontSize:12 }}>Соотношение сторон</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{displayAspectLabel}</div>
            {selectedTpl && effectiveAspectLocked && <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>Формат закреплён за шаблоном</div>}
          </div>
          {selectedTpl && !isVideoTemplate && <button className={'m-lock-btn' + (!aspectLocked ? ' off' : '')}
            title={aspectLocked ? 'Формат закреплён. Нажмите, чтобы разблокировать' : 'Формат разблокирован'}
            onClick={function(e) {
              e.stopPropagation();
              if (aspectLocked) { setAspectLocked(false); setPicker('aspect'); }
              else { setAspectLocked(true); setPicker(null); }
            }}>
            <Ic n={aspectLocked ? 'lock' : 'unlock'} s={18}/>
          </button>}
          {!effectiveAspectLocked && <span className="chev"><Ic n="chev" s={20}/></span>}
        </div>
      </div>

      <div style={{ height:20 }}/>
      <button key={createCtaKey} className="btn-primary"
        disabled={!ready || uploading || !currentModelFull}
        onClick={startGeneration}>
        <span>{createCtaLabel}</span>
      </button>
    </div>

    {/* Model picker */}
    {picker === 'model' && !templateLocked && modelOptions.length > 0 && <PickerSheet
      title="Модель" options={modelOptions}
      current={currentModelOpt || modelOptions[0]}
      onSelect={function(opt) { setSelectedModelCode(opt.id); setUiModelId(opt.id); setUiModelLabel(opt.id === 'seedance_2_auto' ? null : (opt.t || String(opt.id))); setSelectedQuality(null); setUiQualityValue(null); setUiQualityLabel(null); setSelectedDuration(null); setUiDurationValue(null); setUiDurationLabel(null); setQualityLocked(false); setDurationLocked(false); }}
      onClose={() => setPicker(null)}/>}

    {/* Quality picker */}
    {picker === 'quality' && !effectiveQualityLocked && qField && <PickerSheet
      title="Качество" options={qOptions.map(function(o) { var v = optionValue(o); return { id:String(v), t:optionTitle(o), s:qField.label || 'Качество' }; })}
      current={{ id:String(qValue) }}
      onSelect={function(opt) { setSelectedQuality(opt.id); setUiQualityValue(opt.id); setUiQualityLabel(opt.t || prettyOption(opt.id)); }}
      onClose={() => setPicker(null)}/>}

    {/* Aspect picker */}
    {picker === 'aspect' && !effectiveAspectLocked && <PickerSheet
      title="Соотношение сторон" options={aspectOpts}
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

function SeedanceTierControl({ value, onChange }) {
  var tiers = [
    { id:'mini', t:'Mini', s:'дешевле' },
    { id:'fast', t:'Fast', s:'быстрее' },
    { id:'normal', t:'Normal', s:'максимум' }
  ];
  return <div className="seedance-tier">
    {tiers.map(function(t) {
      return <button key={t.id} type="button" className={value === t.id ? 'on' : ''}
        onClick={function(e) { e.stopPropagation(); onChange && onChange(t.id); }}>
        <b>{t.t}</b><span>{t.s}</span>
      </button>;
    })}
  </div>;
}

function hbxDurationHaptic() {
  try {
    var tg = window.Telegram && window.Telegram.WebApp;
    var h = tg && tg.HapticFeedback;
    if (h && h.selectionChanged) h.selectionChanged();
    else if (h && h.impactOccurred) h.impactOccurred('light');
  } catch (e) {}
}

function DurationInlineControl({ value, label, options, locked, template, onChange, onUnlock, onRelock }) {
  const { Ic } = window.MiraCore;
  var values = durationOptionValues(options);
  var autoEnabled = values.indexOf('auto') !== -1;
  var numericValues = values.filter(function(v) { return /^\d+s?$/i.test(String(v)); });
  if (!numericValues.length) numericValues = values.filter(function(v) { return String(v) !== 'auto'; });
  var selected = coerceDurationValue(values, value);
  var selectedIndex = durationIndex(numericValues, selected);
  var selectedNumeric = numericValues[selectedIndex] || selected;
  var selectedForLabel = selected === 'auto' ? selected : selectedNumeric;
  var progress = numericValues.length > 1 ? Math.round((selectedIndex / (numericValues.length - 1)) * 100) : 0;
  var minLabel = numericValues.length ? formatDurationLabel(numericValues[0]) : '';
  var maxLabel = numericValues.length ? formatDurationLabel(numericValues[numericValues.length - 1]) : '';
  var canUnlock = !(template && template.durationUnlockable === false);
  var selectedLabel = formatDurationLabel(selectedForLabel);
  var selectedAtMin = selected !== 'auto' && selectedIndex === 0;
  var selectedAtMax = selected !== 'auto' && selectedIndex === numericValues.length - 1;
  var middleLabel = selectedAtMin || selectedAtMax ? '' : (selectedLabel || label);
  var controlClass = 'duration-control' + (autoEnabled ? '' : ' no-auto');
  var changeDuration = function(next) {
    var nextValue = coerceDurationValue(values, next);
    if (String(nextValue) !== String(selected)) hbxDurationHaptic();
    onChange && onChange(nextValue);
  };

  return <div className={'duration-inline' + (locked ? ' locked' : '')}>
    <div className="duration-inline-head">
      <div className="cr-detail-ic"><Ic n="clock" s={21}/></div>
      <div className="duration-inline-title">
        <div className="muted" style={{ fontSize:12 }}>Длительность</div>
        <div style={{ fontWeight:800, fontSize:15 }} key={'dur-head-' + String(selectedForLabel)}>{selectedLabel || label}</div>
        {template && locked && <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>Длительность закреплена за шаблоном</div>}
      </div>
      {template && locked && <button className="m-lock-btn"
        title={canUnlock ? 'Длительность закреплена. Нажмите, чтобы разблокировать' : 'Длительность закреплена за шаблоном'}
        onClick={function(e) { e.stopPropagation(); if (canUnlock && onUnlock) onUnlock(); }}>
        <Ic n="lock" s={18}/>
      </button>}
      {template && !locked && template.durationLocked && <button className="m-lock-btn off"
        title="Длительность разблокирована"
        onClick={function(e) { e.stopPropagation(); if (onRelock) onRelock(); }}>
        <Ic n="unlock" s={18}/>
      </button>}
    </div>
    {!locked && <div className={controlClass}>
      {autoEnabled && <button type="button" className={'duration-auto' + (selected === 'auto' ? ' on' : '')}
        onClick={function() { changeDuration('auto'); }}>Auto</button>}
      {numericValues.length > 1
        ? <React.Fragment>
            <input className="duration-range" type="range" min="0" max={numericValues.length - 1} step="1"
              style={{ '--duration-progress': progress + '%' }}
              value={selected === 'auto' ? 0 : selectedIndex}
              onInput={function(e) {
                var next = numericValues[Number(e.currentTarget.value)] || numericValues[0];
                changeDuration(String(next));
              }}
              onChange={function(e) {
                var next = numericValues[Number(e.currentTarget.value)] || numericValues[0];
                changeDuration(String(next));
              }}/>
            <div className="duration-scale" key={'dur-scale-' + numericValues.join('|') + '-' + String(selectedForLabel)}><span className={selectedAtMin ? 'active' : ''}>{minLabel}</span><b>{middleLabel}</b><span className={selectedAtMax ? 'active' : ''}>{maxLabel}</span></div>
          </React.Fragment>
        : <div className="duration-chips">
            {numericValues.map(function(v) {
              return <button key={v} type="button" className={'duration-chip' + (durationValuesMatch(v, selected) ? ' on' : '')} onClick={function() { changeDuration(String(v)); }}>{formatDurationLabel(v)}</button>;
            })}
          </div>}
    </div>}
  </div>;
}
window.DurationInlineControl = DurationInlineControl;

/* ---- reusable option picker sheet ---- */
function PickerSheet({ title, options, current, onSelect, onClose }) {
  const { Ic, HxSheet } = window.MiraCore;
  const val = current ? current.id : null;
  return <HxSheet onClose={onClose} cardClassName="picker-card">
    <div className="sheet-title">{title}</div>
    <div className="picker-grid">
      {options.map(function(o) {
        return <div className={'opt pick' + (String(val) === String(o.id) ? ' on' : '')} key={o.id} onClick={function() { onSelect(o); onClose(); }}>
          {o.preview && <span className="aspect-mini" style={{ aspectRatio:o.preview }}></span>}
          <div className="pick-text">
            <div className="o-t">{o.t}</div>
            {o.s && <div className="o-s">{o.s}{o.price && <span className="o-price">{o.price}</span>}</div>}
          </div>
          {String(val) === String(o.id) && <span className="o-check"><Ic n="check" s={18} sw={2.4}/></span>}
        </div>
      })}
    </div>
  </HxSheet>;
}
window.PickerSheet = PickerSheet;
