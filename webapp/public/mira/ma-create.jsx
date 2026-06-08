/* ============ Create photo/video screen (sub-screen) ============ */
function CreateScreen({ tokens, mode, setMode, preset, model, aspect, onPickModel, onPickAspect, onTaskDone, onNewGeneration, onContinueChat }){
  const { Ic, Star, CREATE_TPL, isModelAllowedForMode } = window.MiraCore;
  const t = window.t || ((k)=>k);
  const [tab, setTab] = useState('tpl');          // tpl | prompt
  const [sel, setSel] = useState(preset ? preset.t : null);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [price, setPrice] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [sendState, setSendState] = useState('');
  const [copyState, setCopyState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duration, setDuration] = useState('5');
  const [resolution, setResolution] = useState('720p');
  const [numImages, setNumImages] = useState(1);
  const [audio, setAudio] = useState(true);

  const ready = (tab==='tpl' && sel) || (tab==='prompt' && prompt.trim());
  const modelAllowed = isModelAllowedForMode(model, mode);
  const btnLabel = tab==='prompt' && !prompt.trim() ? t('gen.enter_prompt')
    : !model ? t('gen.select_model')
    : !modelAllowed ? t('gen.select_model')
    : !ready ? t('gen.select_tpl') : submitting ? t('gen.creating') : t('gen.create');
  const code = model && (model.code || model.id);
  const fields = (modelInfo && modelInfo.form_schema && modelInfo.form_schema.fields) || [];
  const hasField = (name)=>fields.some(f=>f.name===name);
  const field = (name)=>fields.find(f=>f.name===name) || {};
  const fieldValue = (name, current)=>{
    const f = field(name);
    const opts = f.options || [];
    if(opts.length && !opts.map(String).includes(String(current))) return f.default || opts[0];
    return current || f.default || (opts.length ? opts[0] : current);
  };
  const needsImage = fields.some(f=>(f.name==='image_url' || f.name==='image_urls') && f.required);
  const showUpload = needsImage || (model && (model.subtype==='image_edit' || model.subtype==='image_to_video'));

  useEffect(()=>{
    let alive=true;
    setModelInfo(null); setPrice(null); setStatus(''); setResult(null); setSendState(''); setCopyState('');
    if(!code || !window.HubicxApi) return;
    window.HubicxApi.model(code).then(m=>{ if(alive) setModelInfo(m); }).catch(()=>{});
    return ()=>{ alive=false; };
  }, [code]);

  function imageSizeFromAspect(a){
    const id = a && a.id;
    if(id==='1:1') return 'square_hd';
    if(id==='2:3' || id==='9:16') return 'portrait_16_9';
    if(id==='3:2' || id==='16:9') return 'landscape_16_9';
    return 'square_hd';
  }
  function currentPrompt(){
    return tab==='prompt' ? prompt.trim() : (sel ? `Шаблон: ${sel}` : '');
  }
  function buildInputs(){
    const input = {};
    const p = currentPrompt();
    if(hasField('prompt')) input.prompt = p;
    if(hasField('aspect_ratio')) input.aspect_ratio = fieldValue('aspect_ratio', aspect.id);
    if(hasField('image_size')) input.image_size = fieldValue('image_size', imageSizeFromAspect(aspect));
    if(hasField('resolution')) input.resolution = fieldValue('resolution', resolution);
    if(hasField('duration')) input.duration = fieldValue('duration', duration);
    if(hasField('generate_audio')) input.generate_audio = audio;
    if(hasField('num_images')) input.num_images = Number(numImages || 1);
    if(uploaded && hasField('image_url')) input.image_url = uploaded.file_id;
    if(uploaded && hasField('image_urls')) input.image_urls = [uploaded.file_id];
    return input;
  }

  useEffect(()=>{
    if(!ready || !modelAllowed || !modelInfo || !window.HubicxApi) return;
    if(needsImage && !uploaded) { setPrice(null); return; }
    const timer = setTimeout(()=>{
      window.HubicxApi.pricePreview({model_code:code, inputs:buildInputs()})
        .then(setPrice)
        .catch(err=>setPrice({error:(err && err.message) || 'Цена недоступна'}));
    }, 400);
    return ()=>clearTimeout(timer);
  }, [ready, modelAllowed, modelInfo, code, aspect.id, duration, resolution, numImages, audio, uploaded && uploaded.file_id, prompt, sel, tab]);

  async function onFile(e){
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    setFile(f); setUploaded(null); setUploading(true); setStatus(t('gen.file_uploading'));
    try{
      const up = await window.HubicxApi.upload(f);
      setUploaded(up); setStatus(t('gen.file_uploaded'));
    }catch(err){ setStatus((err && err.message) || t('gen.file_failed')); }
    finally{ setUploading(false); }
  }
  async function submit(){
    if(!ready || submitting || uploading) return;
    if(!model){ setStatus(t('gen.select_model')); return; }
    if(!modelAllowed){ setStatus(mode==='video' ? t('gen.need_video_model') : t('gen.need_photo_model')); return; }
    if(needsImage && !uploaded){ setStatus(t('gen.need_image')); return; }
    setSubmitting(true); setResult(null); setStatus(t('gen.task_created'));
    try{
      const body = {model_code:code, prompt:currentPrompt(), inputs:buildInputs()};
      const queued = await window.HubicxApi.createGeneration(body);
      let task = null;
      for(let i=0;i<45;i++){
        task = await window.HubicxApi.getTask(queued.task_id);
        if(task.status==='completed' || task.status==='failed') break;
        setStatus(t('gen.task_status',{status:task.status}));
        await new Promise(r=>setTimeout(r, 1500));
      }
      if(task && task.status==='completed'){
        setResult(task);
        setStatus(t('common.ready'));
        if(onTaskDone) onTaskDone(task);
      }else if(task && task.status==='failed'){
        setResult(task);
        setStatus(task.error_message || t('gen.generation_failed'));
      }else setStatus(t('gen.long_task'));
    }catch(err){ setStatus((err && err.message) || t('gen.create_failed')); }
    finally{ setSubmitting(false); }
  }

  async function sendToTelegram(){
    if(!result || result.status!=='completed' || !window.HubicxApi) return;
    setSendState(t('result.sending'));
    try{
      await window.HubicxApi.sendToTelegram(result.id);
      setSendState(t('result.sent'));
      if(onTaskDone) onTaskDone(result);
    }catch(err){ setSendState((err && err.message) || t('result.send_failed')); }
  }

  async function copyResult(){
    const text = resultText(result);
    if(!text) return;
    try{
      await navigator.clipboard.writeText(text);
      setCopyState(t('common.copied'));
    }catch(e){ setCopyState(t('common.copy_failed')); }
  }

  function resultUrl(task){ return task && (task.output_file_url || (task.params && (task.params.output_file_url || task.params.url))); }
  function resultText(task){ return task && (task.output_text || task.error_message || t('result.unavailable')); }
  function resultTitle(task){
    const st = task && task.status;
    if(st==='completed') return t('result.ready');
    if(st==='failed' || st==='error') return t('result.failed');
    if(st==='refunded') return t('result.refunded');
    return t('result.processing');
  }

  return <div className="screen scr-enter" style={{paddingTop:6}}>
    <div className="topbar" style={{padding:'10px 0 8px'}}>
      <div className="seg" style={{flex:1,maxWidth:230}}>
        <button className={mode==='photo'?'on':''} onClick={()=>setMode('photo')}><Ic n="image" s={18}/> {t('gen.photo')}</button>
        <button className={mode==='video'?'on':''} onClick={()=>setMode('video')}><Ic n="video" s={18}/> {t('gen.video')}</button>
      </div>
      <div style={{marginLeft:'auto',textAlign:'right'}}>
        <div className="muted" style={{fontSize:12,fontWeight:600}}>{t('gen.balance')}</div>
        <div style={{display:'flex',alignItems:'center',gap:5,justifyContent:'flex-end',fontWeight:700}}>
          <Star s={14} c="#cfe0ff"/> {tokens}
        </div>
      </div>
    </div>

    {showUpload && <label className="card" style={{display:'flex',alignItems:'center',gap:14,padding:'18px 18px',marginTop:6,cursor:'pointer'}}>
      <Ic n="addimg" s={26} c="#4d9bf5"/>
      <span style={{color:'#4d9bf5',fontWeight:700,fontSize:16}}>
        {file ? file.name : (mode==='photo'?t('gen.upload_photo'):t('gen.upload_video'))}</span>
      <input type="file" accept="image/*" onChange={onFile} style={{display:'none'}}/>
    </label>}

    <div className="seg lite" style={{marginTop:16}}>
      <button className={tab==='tpl'?'on':''} onClick={()=>setTab('tpl')}>{t('gen.choose_tpl')}</button>
      <button className={tab==='prompt'?'on':''} onClick={()=>setTab('prompt')}>{t('gen.custom_prompt')}</button>
    </div>

    {tab==='tpl'
      ? <div className="rail" style={{marginTop:14}}>
          {CREATE_TPL.map((t,i)=>(
            <div className="thumb" key={i} onClick={()=>setSel(t.t)}
              style={{width:124,height:150,scrollSnapAlign:'start',
                outline:sel===t.t?'2.5px solid #2f80ed':'none',outlineOffset:-1}}>
              <img src={t.img} alt=""/>
              <div className="shade"></div>
              <div className="lbl" style={{fontSize:13}}>{t.t}</div>
            </div>
          ))}
        </div>
      : <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
          placeholder={t('gen.prompt_ph')}
          style={{width:'100%',marginTop:14,height:120,resize:'none',background:'var(--card)',
            border:'1px solid var(--line)',borderRadius:16,padding:16,color:'#fff',
            fontSize:15,fontFamily:'inherit',outline:'none'}}/>}

    <div className="label-sec" style={{marginTop:20}}>{t('gen.details')}</div>
    <div className="card" style={{overflow:'hidden'}}>
      <div className="row-link" onClick={onPickModel}>
        <Ic n="model" s={22} c="#cfe0ff"/>
        <div>
          <div className="muted" style={{fontSize:13}}>{t('gen.model')}</div>
          <div style={{fontWeight:600,fontSize:15}}>{model.t}</div>
        </div>
        <span className="chev" style={{marginLeft:'auto'}}><Ic n="chev" s={20}/></span>
      </div>
      <div className="divider"></div>
      <div className="row-link" onClick={onPickAspect}>
        <Ic n="aspect" s={22} c="#cfe0ff"/>
        <div>
          <div className="muted" style={{fontSize:13}}>{t('gen.aspect')}</div>
          <div style={{fontWeight:600,fontSize:15}}>{aspect.t}</div>
        </div>
        <span className="chev" style={{marginLeft:'auto'}}><Ic n="chev" s={20}/></span>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:12}}>
      {hasField('num_images') && <select className="text-in" value={numImages} onChange={e=>setNumImages(e.target.value)}><option value="1">{t('gen.one_image')}</option><option value="2">2</option><option value="4">4</option></select>}
      {hasField('duration') && <select className="text-in" value={fieldValue('duration', duration)} onChange={e=>setDuration(e.target.value)}>{(field('duration').options || ['5']).map(o=><option key={o} value={o}>{o} {t('gen.seconds')}</option>)}</select>}
      {hasField('resolution') && <select className="text-in" value={fieldValue('resolution', resolution)} onChange={e=>setResolution(e.target.value)}>{(field('resolution').options || ['720p']).map(o=><option key={o} value={o}>{o}</option>)}</select>}
      {hasField('generate_audio') && <button className="pill" onClick={()=>setAudio(!audio)} style={{justifyContent:'center'}}>{audio?t('gen.with_audio'):t('gen.no_audio')}</button>}
    </div>

    {price && <div className="muted" style={{fontSize:13,marginTop:12}}>
      {price.error ? price.error : <>
        {t('common.cost')}: <b>{price.final_price_credits}</b> {t('common.tokens')}
        {price.applied_rules_summary && <span style={{marginLeft:6,fontSize:11}}>({price.applied_rules_summary})</span>}
      </>}
    </div>}
    {status && <div className="muted" style={{fontSize:13,marginTop:8}}>{status}</div>}
    {result && <div className="card result-card" style={{marginTop:12,padding:12}}>
      <div style={{fontWeight:800,marginBottom:8}}>{resultTitle(result)}</div>
      {result.status==='failed' || result.status==='error' || result.status==='refunded'
        ? <div className="muted" style={{fontSize:14}}>{resultText(result)}</div>
        : resultUrl(result)
          ? <>
              <img className="result-img" src={resultUrl(result)} alt={t('result.ready')}/>
              <div className="result-actions">
                <a className="pill" href={resultUrl(result)} target="_blank" rel="noreferrer">{t('result.open')}</a>
                {result.status==='completed' && <button className="pill" onClick={sendToTelegram}>{t('result.send_tg')}</button>}
                <button className="pill" onClick={onNewGeneration}>{t('result.new')}</button>
              </div>
            </>
          : <div className="result-text">{resultText(result)}</div>}
      {result.status==='completed' && !resultUrl(result) && <div className="result-actions">
        <button className="pill" onClick={copyResult}>{t('result.copy')}</button>
        <button className="pill" onClick={sendToTelegram}>{t('result.send_tg')}</button>
        <button className="pill" onClick={()=>onContinueChat && onContinueChat(resultText(result))}>{t('result.continue_chat')}</button>
      </div>}
      {sendState && <div className="muted" style={{fontSize:13,marginTop:8}}>{sendState}</div>}
      {copyState && <div className="muted" style={{fontSize:13,marginTop:8}}>{copyState}</div>}
    </div>}

    <div style={{height:18}}/>
    <button className="btn-primary" disabled={!ready || !modelAllowed || submitting || uploading} onClick={submit}>{btnLabel}</button>
  </div>;
}
window.CreateScreen = CreateScreen;

/* ---- reusable option picker sheet ---- */
function PickerSheet({ title, options, current, onSelect, onClose }){
  const { Ic } = window.MiraCore;
  const t = window.t || ((k)=>k);
  const safeCurrent = options.find(o=>current && o.id===current.id) || options[0];
  const [val, setVal] = useState(safeCurrent && safeCurrent.id);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-h">{title}</div>
        {options.map(o=>(
          <div className="opt" key={o.id} onClick={()=>setVal(o.id)}>
            <div>
              <div className="o-t">{o.t}</div>
              <div className="o-s">{o.sKey ? t(o.sKey) : o.s}</div>
            </div>
            {val===o.id && <span className="o-check"><Ic n="check" s={22} sw={2.4}/></span>}
          </div>
        ))}
      </div>
      <div className="sheet-footer"><button className="sheet-cta primary" onClick={()=>{ const picked = options.find(o=>o.id===val) || options[0]; if(picked) onSelect(picked); onClose(); }}>{t('common.save')}</button></div>
    </div>
  </div>;
}
window.PickerSheet = PickerSheet;
