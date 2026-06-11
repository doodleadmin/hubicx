/* ============ Profile screen (interactive) ============ */
function IconChip({ bg, children }){
  return <div style={{width:34,height:34,borderRadius:10,background:bg,flex:'0 0 auto',
    display:'flex',alignItems:'center',justifyContent:'center'}}>{children}</div>;
}

const PROF_KEY='hbx_profile_v1';
const LLM_CODE = {'AI Chat':'ai_chat','Prompt Helper':'prompt_helper'};
const CODE_LLM = {ai_chat:'AI Chat',prompt_helper:'Prompt Helper'};
const PROF_DEFAULTS = {
  llm:'AI Chat', lang:'ru',
  style:'', emoji:'✨', traits:'',
  name:'', gender:'', age:'', location:'',
  activity:'', interests:'', timezone:'',
};
const OPTS = {
  llm:['AI Chat','Prompt Helper'],
  lang:['ru','en','es','pt'],
  style:['Дружелюбный','Формальный','Краткий и по делу','Подробный','С юмором','Вдохновляющий'],
  gender:['Мужской','Женский','Другое','Не указывать'],
  age:['До 18','18–24','25–34','35–44','45–54','55+'],
  timezone:['Москва (UTC+3)','Калининград (UTC+2)','Самара (UTC+4)','Дубай (UTC+4)','Лондон (UTC+0)','Нью-Йорк (UTC−5)','Токио (UTC+9)'],
};
const EMOJIS = ['✨','🔥','💎','🌙','⭐','🚀','🎨','💜','🌸','⚡','🦋','🌊','🍀','☀️','🎯','🧠'];

function toBackendProfile(p){
  const lang = window.HubicxI18n ? window.HubicxI18n.norm(p.lang || p.language_code || 'ru') : (['ru','en','es','pt'].includes(p.lang) ? p.lang : 'ru');
  return {
    language_code:lang,
    preferred_llm_model:LLM_CODE[p.llm] || 'ai_chat',
    daily_enabled:false,
    hubicx_personality:JSON.stringify({traits:p.traits||''}),
    about_user:JSON.stringify({name:p.name||'', gender:p.gender||'', age:p.age||'', location:p.location||'', activity:p.activity||'', interests:p.interests||'', timezone:p.timezone||''}),
    communication_style:p.style || '',
    persona_emoji:p.emoji || '',
  };
}
function fromBackendProfile(profile, current){
  const next = {...PROF_DEFAULTS, ...(current || {})};
  if(!profile) return next;
  next.lang = profile.language_code || next.lang;
  next.llm = CODE_LLM[profile.preferred_llm_model] || next.llm;
  next.style = profile.communication_style || next.style;
  next.emoji = profile.persona_emoji || next.emoji;
  try{ Object.assign(next, JSON.parse(profile.hubicx_personality || '{}')); }catch(e){ if(profile.hubicx_personality) next.traits = profile.hubicx_personality; }
  try{ Object.assign(next, JSON.parse(profile.about_user || '{}')); }catch(e){ if(profile.about_user) next.activity = profile.about_user; }
  return next;
}

function ProfileScreen({ tokens, authHint, onTopup, onDocs, onSupport, history=[], historyHint='', onRefreshHistory, onBalanceRefresh, onProfileChange }){
  const { Ic, Star } = window.HubicxCore;
  const t = window.t || ((k)=>k);
  const [p, setP] = useState(()=>{ try{ return {...PROF_DEFAULTS, ...(JSON.parse(localStorage.getItem(PROF_KEY))||{})}; }catch(e){ return {...PROF_DEFAULTS}; } });
  const [editor, setEditor] = useState(null);
  const [saveHint, setSaveHint] = useState('');
  const didMount = useRef(false);
  const suppressSave = useRef(false);
  const saveTimerRef = useRef(null);
  useEffect(()=>{
    let alive = true;
    if(!window.HubicxApi || !window.HubicxApi.getInitData()) return ()=>{};
    window.HubicxApi.profile().then(profile=>{
      if(!alive) return;
      suppressSave.current = true;
      setP(cur=>{
        const loaded = fromBackendProfile(profile, cur);
        if(!loaded.name){
          const tgName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '';
          if(tgName) loaded.name = tgName;
        }
        return loaded;
      });
      if(profile && profile.language_code && window.HubicxI18n) window.HubicxI18n.setLang(profile.language_code);
      setSaveHint(t('profile.loaded'));
    }).catch(err=>{ if(alive) setSaveHint((err && err.code)==='unauthorized' ? t('profile.telegram_save') : t('profile.local')); });
    return ()=>{ alive=false; };
  }, []);
  useEffect(()=>{
    localStorage.setItem(PROF_KEY, JSON.stringify(p));
    localStorage.setItem('hubicx-profile', JSON.stringify(p));
    localStorage.setItem('hubicx-language', p.lang || 'ru');
    localStorage.setItem('hubicx-locale', p.lang || 'ru');
    localStorage.setItem('hbx_lang', p.lang || 'ru');
    if(window.HubicxI18n) window.HubicxI18n.setLang(p.lang || 'ru');
    localStorage.setItem('hubicx-llm-model', p.llm || 'AI Chat');
    localStorage.setItem('hubicx-personality', JSON.stringify({style:p.style, emoji:p.emoji, traits:p.traits}));
    localStorage.setItem('hubicx-about-user', JSON.stringify({name:p.name, gender:p.gender, age:p.age, location:p.location, activity:p.activity, interests:p.interests, timezone:p.timezone}));
    const backendPayload = toBackendProfile(p);
    if(onProfileChange) onProfileChange({...backendPayload, ...p});
    if(!didMount.current){ didMount.current = true; return; }
    if(suppressSave.current){ suppressSave.current = false; return; }
    if(saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(()=>{
      if(window.HubicxApi && window.HubicxApi.getInitData()) window.HubicxApi.updateProfile(backendPayload)
        .then(saved=>{ setSaveHint(t('profile.saved')); if(onProfileChange) onProfileChange({...saved, ...p}); })
        .catch(()=>setSaveHint(t('profile.telegram_save')));
      else setSaveHint(t('profile.telegram_save'));
    }, 800);
  }, [p]);
  const set = (k,v)=> setP(s=>({...s,[k]:v}));

  const openOpts = (field, title) => setEditor({kind:'opts', field, title, options:OPTS[field]});
  const openText = (field, title, ph, maxLen=200) => setEditor({kind:'text', field, title, ph, maxLen});
  const openEmoji = () => setEditor({kind:'emoji', field:'emoji', title:t('profile.emoji')});

  const ValRow = ({field, label, promptLabel, title, ph, kind='text', maxLen=200, last}) => {
    const v = p[field];
    const open = ()=> kind==='opts' ? openOpts(field,title) : openText(field,title,ph,maxLen);
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
    <div className="label-sec" style={{marginTop:4}}>{t('profile.title')}</div>
    {authHint && <div className="muted" style={{fontSize:12,marginBottom:8}}>{authHint}</div>}
    {saveHint && <div className="muted" style={{fontSize:12,marginBottom:8}}>{saveHint}</div>}
    <div className="card" style={{overflow:'hidden'}}>
      <Row chip={<IconChip bg="#5b34ff"><Star s={16} c="#fff"/></IconChip>} title={t('profile.tokens')} value={tokens} onClick={onTopup}/>
      <Row chip={<IconChip bg="#d94fd0"><Ic n="wand" s={18} c="#fff"/></IconChip>} title={t('profile.llm')} value={p.llm} onClick={()=>openOpts('llm',t('profile.llm'))}/>
      <Row chip={<IconChip bg="#2f80ed"><Ic n="globe" s={18} c="#fff"/></IconChip>} title={t('profile.language')} value={p.lang} onClick={()=>openOpts('lang',t('profile.language'))} last/>
    </div>

    <div className="card" style={{overflow:'hidden',marginTop:14}}>
      <Row chip={<IconChip bg="#1a7a5c"><Ic n="doc" s={18} c="#fff"/></IconChip>} title={t('doc.title')} value="" onClick={onDocs}/>
      <Row chip={<IconChip bg="#7b5cff"><Ic n="chat" s={18} c="#fff"/></IconChip>} title={t('doc.support')} value="" onClick={onSupport} last/>
    </div>

    {window.HistoryBlock && <window.HistoryBlock items={history} hint={historyHint} onRefresh={onRefreshHistory} onBalanceRefresh={onBalanceRefresh}/>}

    <div className="sec-h" style={{marginBottom:4}}>
      <span className="label-sec" style={{padding:0}}>{t('profile.personality')}</span>
    </div>
    <div className="card" style={{padding:'2px 16px'}}>
      <ValRow field="style" label={t('profile.style')} promptLabel={t('profile.set_style')} title={t('profile.style')} kind="opts"/>
      <div className="prow" onClick={openEmoji}>
        <div style={{flex:1}}>
          <div className="muted" style={{fontSize:14}}>{t('profile.emoji')}</div>
          <div style={{fontSize:22,marginTop:2}}>{p.emoji}</div>
        </div>
        <span className="chev" style={{display:'flex'}}><Ic n="chev" s={18}/></span>
      </div>
      <div className="divider" style={{marginLeft:0}}></div>
      <ValRow field="traits" label={t('profile.traits')} promptLabel={t('profile.set_traits')} title={t('profile.traits')} ph={t('profile.traits_ph')} maxLen={500} last/>
    </div>

    <div className="sec-h" style={{marginBottom:4}}>
      <span className="label-sec" style={{padding:0}}>{t('profile.about')}</span>
    </div>
    <div className="card" style={{padding:'4px 16px'}}>
      <ValRow field="name" label={t('profile.name')} promptLabel={t('profile.set_name')} title={t('profile.name')} ph={t('profile.name_ph')} maxLen={50}/>
      <ValRow field="gender" label={t('profile.gender')} promptLabel={t('profile.set_gender')} title={t('profile.gender')} kind="opts"/>
      <ValRow field="age" label={t('profile.age')} promptLabel={t('profile.set_age')} title={t('profile.age')} kind="opts"/>
      <ValRow field="location" label={t('profile.location')} promptLabel={t('profile.set_location')} title={t('profile.location')} ph={t('profile.location_ph')} maxLen={80}/>
      <ValRow field="activity" label={t('profile.activity')} promptLabel={t('profile.set_activity')} title={t('profile.activity')} ph={t('profile.activity_ph')} maxLen={200}/>
      <ValRow field="interests" label={t('profile.interests')} promptLabel={t('profile.set_interests')} title={t('profile.interests')} ph={t('profile.interests_ph')} maxLen={300}/>
      <ValRow field="timezone" label={t('profile.timezone')} promptLabel={t('profile.set_timezone')} title={t('profile.timezone')} kind="opts" last/>
    </div>

    {editor && editor.kind==='opts' && <OptsSheet title={editor.title} options={editor.options}
      current={p[editor.field]} onSave={v=>set(editor.field,v)} onClose={()=>setEditor(null)}/>}
    {editor && editor.kind==='text' && <TextSheet title={editor.title} ph={editor.ph}
      current={p[editor.field]} maxLen={editor.maxLen} onSave={v=>set(editor.field,v)} onClose={()=>setEditor(null)}/>}
    {editor && editor.kind==='emoji' && <EmojiSheet current={p.emoji}
      onSave={v=>set('emoji',v)} onClose={()=>setEditor(null)}/>}
  </div>;
}

/* ---- editor sheets ---- */
function OptsSheet({ title, options, current, onSave, onClose }){
  const { Ic } = window.HubicxCore;
  const t = window.t || ((k)=>k);
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
      <div className="sheet-footer"><button className="sheet-cta primary" onClick={()=>{ onSave(val); onClose(); }}>{t('common.save')}</button></div>
    </div>
  </div>;
}
function TextSheet({ title, ph, current, onSave, onClose, maxLen=200 }){
  const t = window.t || ((k)=>k);
  const [val, setVal] = useState(current||"");
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.focus(); }, []);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-h">{title}</div>
        <input ref={ref} className="text-in" placeholder={ph||t('profile.value_ph')} value={val}
          maxLength={maxLen} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onSave(val.trim()); onClose(); } }}/>
      </div>
      <div className="sheet-footer"><button className="sheet-cta primary" onClick={()=>{ onSave(val.trim()); onClose(); }}>{t('common.save')}</button></div>
    </div>
  </div>;
}
function EmojiSheet({ current, onSave, onClose }){
  const t = window.t || ((k)=>k);
  const [val, setVal] = useState(current);
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-h">{t('profile.emoji')}</div>
        <div className="emoji-grid">
          {EMOJIS.map(e=>(
            <div key={e} className={"emoji-cell"+(val===e?" on":"")} onClick={()=>setVal(e)}>{e}</div>
          ))}
        </div>
      </div>
      <div className="sheet-footer"><button className="sheet-cta primary" onClick={()=>{ onSave(val); onClose(); }}>{t('common.save')}</button></div>
    </div>
  </div>;
}
window.ProfileScreen = ProfileScreen;
