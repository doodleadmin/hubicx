/* ============ Create photo/video screen ============ */
function CreateScreen({ tokens, mode, setMode, preset, model, aspect, onPickModel, onPickAspect, onBack }) {
  const { Ic, Star, CREATE_TPL } = window.MiraCore;
  const [tab, setTab] = useState('tpl');
  const [sel, setSel] = useState(preset ? preset.t : null);
  const [prompt, setPrompt] = useState("");

  const ready = (tab === 'tpl' && sel) || (tab === 'prompt' && prompt.trim());
  const btnLabel = tab === 'prompt' && !prompt.trim() ? 'Укажите промпт'
    : !ready ? 'Выберите шаблон' : 'Создать · ' + (mode === 'video' ? 5 : 2) + ' ★';

  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <div className="cr-head">
      <div className="cr-back" onClick={onBack}><Ic n="back" s={20}/></div>
      <div className="cr-title">{mode === 'photo' ? 'Создать фото' : 'Создать видео'}</div>
      <div className="cr-tok"><Star s={15} c="#c9c7f4"/> {tokens}</div>
    </div>

    <div className="screen scr-enter" style={{ paddingTop:14 }}>
      <div className="seg">
        <button className={mode === 'photo' ? 'on' : ''} onClick={() => setMode('photo')}>
          <Ic n="image" s={18}/> Фото
        </button>
        <button className={mode === 'video' ? 'on' : ''} onClick={() => setMode('video')}>
          <Ic n="video" s={18}/> Видео
        </button>
      </div>

      <div className="drop-zone" onClick={() => {}}>
        <div className="di"><Ic n="addimg" s={24} c="var(--ink)"/></div>
        <div className="dt">{mode === 'photo' ? 'Загрузить селфи или фото' : 'Загрузить фото для видео'}</div>
        <div className="ds">Нажмите или перетащите файл</div>
      </div>

      <div className="seg" style={{ marginTop:14 }}>
        <button className={tab === 'tpl' ? 'on' : ''} onClick={() => setTab('tpl')}>Шаблон</button>
        <button className={tab === 'prompt' ? 'on' : ''} onClick={() => setTab('prompt')}>Свой промпт</button>
      </div>

      {tab === 'tpl'
        ? <div className="rail" style={{ marginTop:14 }}>
            {CREATE_TPL.map((t, i) => (
              <div className="thumb" key={i} onClick={() => setSel(t.t)}
                style={{ width:120, height:148, scrollSnapAlign:'start', cursor:'pointer',
                  outline: sel === t.t ? '2.5px solid var(--ink)' : 'none', outlineOffset:-1 }}>
                <img src={t.img} alt=""/>
                <div className="shade"></div>
                <div className="lbl" style={{ fontSize:13 }}>{t.t}</div>
              </div>
            ))}
          </div>
        : <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Опишите, что хотите сгенерировать…"
            style={{ width:'100%', marginTop:14, height:120, resize:'none', background:'var(--card)',
              border:'1px solid var(--line)', borderRadius:16, padding:16, color:'var(--ink)',
              fontSize:15, fontFamily:'inherit', outline:'none' }}/>}

      <div className="label-sec" style={{ marginTop:20, marginBottom:8 }}>Детали</div>
      <div className="card" style={{ overflow:'hidden' }}>
        <div className="row-link" onClick={onPickModel}>
          <div style={{ width:42, height:42, borderRadius:13, background:'#f1f0ea', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="model" s={21} c="var(--ink)"/>
          </div>
          <div>
            <div className="muted" style={{ fontSize:12 }}>Модель</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{model.t} · {model.s}</div>
          </div>
          <span className="chev"><Ic n="chev" s={20}/></span>
        </div>
        <div className="divider"></div>
        <div className="row-link" onClick={onPickAspect}>
          <div style={{ width:42, height:42, borderRadius:13, background:'#f1f0ea', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="aspect" s={21} c="var(--ink)"/>
          </div>
          <div>
            <div className="muted" style={{ fontSize:12 }}>Соотношение сторон</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{aspect.t} · {aspect.s}</div>
          </div>
          <span className="chev"><Ic n="chev" s={20}/></span>
        </div>
      </div>

      <div style={{ height:20 }}/>
      <button className="btn-primary" disabled={!ready}>{btnLabel}</button>
    </div>
  </div>;
}
window.CreateScreen = CreateScreen;

/* ---- reusable option picker sheet ---- */
function PickerSheet({ title, options, current, onSelect, onClose }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState(current.id);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{title}</div>
        {options.map(o => (
          <div className="opt" key={o.id} onClick={() => setVal(o.id)}>
            <div>
              <div className="o-t">{o.t}</div>
              <div className="o-s">{o.s}</div>
            </div>
            {val === o.id && <span className="o-check"><Ic n="check" s={22} sw={2.4}/></span>}
          </div>
        ))}
      </div>
      <button className="sheet-cta" onClick={() => { onSelect(options.find(o => o.id === val)); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
window.PickerSheet = PickerSheet;
