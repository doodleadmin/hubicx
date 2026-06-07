/* ============ Profile screen (interactive) ============ */
function IconChip({ bg, children }){
  return <div style={{width:34,height:34,borderRadius:10,background:bg,flex:'0 0 auto',
    display:'flex',alignItems:'center',justifyContent:'center'}}>{children}</div>;
}

const PROF_KEY='hbx_profile_v1';
const PROF_DEFAULTS = {
  llm:'AI Chat', lang:'ru', daily:false,
  style:'', hubicxLang:'', emoji:'✨', traits:'',
  name:'Булочка', gender:'Другое', age:'', location:'Саратов',
  activity:'', interests:'', timezone:'Дубай (UTC+4)',
};
const OPTS = {
  llm:['AI Chat','Prompt Helper','MiniMax M2.5','GPT-4o','Claude 3.5 Sonnet','Gemini 2.0 Pro','DeepSeek V3','Llama 3.3'],
  lang:['ru','en','es','pt'],
  style:['Дружелюбный','Формальный','Краткий и по делу','Подробный','С юмором','Вдохновляющий'],
  hubicxLang:['Русский','English','Español','Deutsch','Français','中文'],
  gender:['Мужской','Женский','Другое','Не указывать'],
  age:['До 18','18–24','25–34','35–44','45–54','55+'],
  timezone:['Москва (UTC+3)','Калининград (UTC+2)','Самара (UTC+4)','Дубай (UTC+4)','Лондон (UTC+0)','Нью-Йорк (UTC−5)','Токио (UTC+9)'],
};
const EMOJIS = ['✨','🔥','💎','🌙','⭐','🚀','🎨','💜','🌸','⚡','🦋','🌊','🍀','☀️','🎯','🧠'];

function ProfileScreen({ tokens, authHint, onTopup }){
  const { Ic, Star } = window.MiraCore;
  const [p, setP] = useState(()=>{ try{ return {...PROF_DEFAULTS, ...(JSON.parse(localStorage.getItem(PROF_KEY))||{})}; }catch(e){ return {...PROF_DEFAULTS}; } });
  const [editor, setEditor] = useState(null);
  useEffect(()=>{
    localStorage.setItem(PROF_KEY, JSON.stringify(p));
    localStorage.setItem('hubicx-profile', JSON.stringify(p));
    localStorage.setItem('hubicx-language', p.lang || 'ru');
    localStorage.setItem('hubicx-llm-model', p.llm || 'AI Chat');
    localStorage.setItem('hubicx-personality', JSON.stringify({style:p.style, hubicxLang:p.hubicxLang, emoji:p.emoji, traits:p.traits}));
    localStorage.setItem('hubicx-about-user', JSON.stringify({name:p.name, gender:p.gender, age:p.age, location:p.location, activity:p.activity, interests:p.interests, timezone:p.timezone}));
    localStorage.setItem('hubicx-daily-enabled', p.daily ? '1' : '0');
    if(window.HubicxApi) window.HubicxApi.updateProfile(p).catch(()=>{});
  }, [p]);
  const set = (k,v)=> setP(s=>({...s,[k]:v}));

  const openOpts = (field, title) => setEditor({kind:'opts', field, title, options:OPTS[field]});
  const openText = (field, title, ph) => setEditor({kind:'text', field, title, ph});
  const openEmoji = () => setEditor({kind:'emoji', field:'emoji', title:'Любимый эмодзи'});

  // a value row (grey label + value, or blue prompt if empty)
  const ValRow = ({field, label, promptLabel, title, ph, kind='text', last}) => {
    const v = p[field];
    const open = ()=> kind==='opts' ? openOpts(field,title) : openText(field,title,ph);
    return <>
      {v
        ? <div className="prow" onClick={open}>
            <div style={{flex:1}}>
              <div className="muted" style={{fontSize:14}}>{label}</div>
              <div style={{fontSize:16,fontWeight:600,marginTop:3}}>{v}</div>
            </div>
            <span className="chev" style={{display:'flex'}}><Ic n="chev" s={18}/></span>
          </div>
        : <div className="linkrow" onClick={open}>{promptLabel}</div>}
      {!last && <div className="divider" style={{marginLeft:0}}></div>}
    </>;
  };

  const Row = ({chip, title, value, onClick, last}) => (
    <>
      <div className="row-link" onClick={onClick}>
        {chip}
        <span style={{fontWeight:600,fontSize:16}}>{title}</span>
        <span className="muted" style={{marginLeft:'auto',fontSize:15}}>{value}</span>
        <span className="chev" style={{marginLeft:8,display:'flex'}}><Ic n="chev" s={19}/></span>
      </div>
      {!last && <div className="divider"></div>}
    </>
  );

  return <div className="screen scr-enter" style={{paddingTop:14}}>
    <div className="label-sec" style={{marginTop:4}}>Профиль</div>
    {authHint && <div className="muted" style={{fontSize:12,marginBottom:8}}>{authHint}</div>}
    <div className="card" style={{overflow:'hidden'}}>
      <Row chip={<IconChip bg="#5b34ff"><Star s={16} c="#fff"/></IconChip>} title="Мои токены" value={tokens} onClick={onTopup}/>
      <Row chip={<IconChip bg="#d94fd0"><Ic n="wand" s={18} c="#fff"/></IconChip>} title="LLM-модель" value={p.llm} onClick={()=>openOpts('llm','LLM-модель')}/>
      <Row chip={<IconChip bg="#2f80ed"><Ic n="globe" s={18} c="#fff"/></IconChip>} title="Язык" value={p.lang} onClick={()=>openOpts('lang','Язык')} last/>
    </div>

    <div className="card" style={{overflow:'hidden',marginTop:14}}>
      <div className="row-link" onClick={()=>set('daily',!p.daily)}>
        <IconChip bg="#ff4d3d"><Ic n="bolt" s={17} c="#fff"/></IconChip>
        <span style={{fontWeight:600,fontSize:16}}>Hubicx Daily</span>
        <span className="muted" style={{marginLeft:'auto',marginRight:10,fontSize:15}}>{p.daily?'Включен':'Выключен'}</span>
        <span className={"switch"+(p.daily?" on":"")}><i></i></span>
      </div>
    </div>

    <div className="sec-h" style={{marginBottom:4}}>
      <span className="label-sec" style={{padding:0}}>Личность Hubicx</span>
    </div>
    <div className="card" style={{padding:'2px 16px'}}>
      <ValRow field="style" label="Стиль общения" promptLabel="Указать стиль общения" title="Стиль общения" kind="opts"/>
      <ValRow field="hubicxLang" label="Язык Hubicx" promptLabel="Указать язык Hubicx" title="Язык Hubicx" kind="opts"/>
      <div className="prow" onClick={openEmoji}>
        <div style={{flex:1}}>
          <div className="muted" style={{fontSize:14}}>Любимый эмодзи</div>
          <div style={{fontSize:22,marginTop:2}}>{p.emoji}</div>
        </div>
        <span className="chev" style={{display:'flex'}}><Ic n="chev" s={18}/></span>
      </div>
      <div className="divider" style={{marginLeft:0}}></div>
      <ValRow field="traits" label="Черты характера" promptLabel="Указать черты характера" title="Черты характера" ph="Например: спокойный, внимательный..." last/>
    </div>

    <div className="sec-h" style={{marginBottom:4}}>
      <span className="label-sec" style={{padding:0}}>О Вас</span>
    </div>
    <div className="card" style={{padding:'4px 16px'}}>
      <ValRow field="name" label="Имя" promptLabel="Указать имя" title="Имя" ph="Ваше имя"/>
      <ValRow field="gender" label="Пол" promptLabel="Указать пол" title="Пол" kind="opts"/>
      <ValRow field="age" label="Возраст" promptLabel="Указать возраст" title="Возраст" kind="opts"/>
      <ValRow field="location" label="Локация" promptLabel="Указать локацию" title="Локация" ph="Город"/>
      <ValRow field="activity" label="Вид деятельности" promptLabel="Указать вид деятельности" title="Вид деятельности" ph="Чем вы занимаетесь"/>
      <ValRow field="interests" label="Интересы" promptLabel="Указать интересы" title="Интересы" ph="Ваши интересы"/>
      <ValRow field="timezone" label="Часовой пояс" promptLabel="Указать часовой пояс" title="Часовой пояс" kind="opts" last/>
    </div>

    {editor && editor.kind==='opts' && <OptsSheet title={editor.title} options={editor.options}
      current={p[editor.field]} onSave={v=>set(editor.field,v)} onClose={()=>setEditor(null)}/>}
    {editor && editor.kind==='text' && <TextSheet title={editor.title} ph={editor.ph}
      current={p[editor.field]} onSave={v=>set(editor.field,v)} onClose={()=>setEditor(null)}/>}
    {editor && editor.kind==='emoji' && <EmojiSheet current={p.emoji}
      onSave={v=>set('emoji',v)} onClose={()=>setEditor(null)}/>}
  </div>;
}

/* ---- editor sheets ---- */
function OptsSheet({ title, options, current, onSave, onClose }){
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-h">{title}</div>
        {options.map(o=>(
          <div className="opt" key={o} onClick={()=>setVal(o)}>
            <div className="o-t" style={{fontWeight:600}}>{o}</div>
            {val===o && <span className="o-check"><Ic n="check" s={22} sw={2.4}/></span>}
          </div>
        ))}
      </div>
      <button className="sheet-cta" onClick={()=>{ onSave(val); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
function TextSheet({ title, ph, current, onSave, onClose }){
  const [val, setVal] = useState(current||"");
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.focus(); }, []);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-h">{title}</div>
        <input ref={ref} className="text-in" placeholder={ph||"Введите значение"} value={val}
          onChange={e=>setVal(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onSave(val.trim()); onClose(); } }}/>
      </div>
      <button className="sheet-cta" onClick={()=>{ onSave(val.trim()); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
function EmojiSheet({ current, onSave, onClose }){
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-h">Любимый эмодзи</div>
        <div className="emoji-grid">
          {EMOJIS.map(e=>(
            <div key={e} className={"emoji-cell"+(val===e?" on":"")} onClick={()=>setVal(e)}>{e}</div>
          ))}
        </div>
      </div>
      <button className="sheet-cta" onClick={()=>{ onSave(val); onClose(); }}>Сохранить</button>
    </div>
  </div>;
}
window.ProfileScreen = ProfileScreen;
