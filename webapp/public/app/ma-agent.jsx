/* ============ Agent (home) screen ============ */
function AgentScreen({ tokens, onBuyPro, onCreatePhoto, onCreateVideo, onTopup,
  onStartChat, chats, onOpenChat, onDeleteChat, onTab }) {
  const { Ic, Star, TopNav, HERO } = window.MiraCore;
  const [val, setVal] = useState("");
  const send = () => { const t = val.trim(); if (!t) return; setVal(""); onStartChat(t); };

  const acts = [
    { t:"Создать фото", s:"Из описания или фото", ic:"image", bg:"#e6efe9", c:"#5f9184", go: onCreatePhoto },
    { t:"Создать видео", s:"Оживить изображение",  ic:"video", bg:"#eae8fb", c:"#6f6cc8", go: onCreateVideo },
    { t:"Написать в чат", s:"AI-помощник",          ic:"chat",  bg:"#e4eef4", c:"#5b8fb0", go: () => onStartChat("Привет!") },
    { t:"Шаблоны",        s:"Готовые стили",         ic:"sparkle",bg:"#fbeede",c:"#c98a4e", go: () => onTab('gen') },
  ];
  const ideas = [
    { bg:"#dde9e2", c:"#4f8174", ic:"chat",    l:"Идеи для поста" },
    { bg:"#e6e3f7", c:"#6360be", ic:"plus",    l:"План на день" },
    { bg:"#fbe6d2", c:"#c47e44", ic:"image",   l:"Создать фото" },
    { bg:"#f8e1ec", c:"#c45c92", ic:"wand",    l:"Помочь с текстом" },
  ];

  return <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <TopNav active="agent" onTab={onTab}/>
    <div className="screen scr-enter">

      <div className="rise" style={{ '--d':'.04s' }}>
        <h1 className="greeting">Привет! Я здесь,<br/><span className="grad">чтобы помочь вам</span> ✨</h1>
        <p className="greeting-sub">Спроси, создавай или вдохновись идеей</p>
      </div>

      <div className="askbar rise" style={{ '--d':'.1s' }}>
        <input placeholder="Спросить что-нибудь…" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}/>
        <div className={'send' + (val.trim() ? ' on' : '')} onClick={send}>
          <Ic n="arrowUp" s={20}/>
        </div>
      </div>

      <div className="act-grid rise" style={{ '--d':'.16s' }}>
        {acts.map((a, i) => (
          <div key={i} className="act-card" onClick={a.go}>
            <div className="ic" style={{ background:a.bg }}><Ic n={a.ic} s={21} c={a.c}/></div>
            <div><div className="t">{a.t}</div><div className="s">{a.s}</div></div>
          </div>
        ))}
      </div>

      <div className="sec-h rise" style={{ '--d':'.22s', marginTop:22, marginBottom:12 }}>
        <h2>Быстрые идеи</h2>
        <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid var(--faint)' }}></div>
      </div>
      <div className="idea-grid rise" style={{ '--d':'.26s' }}>
        {ideas.map((t, i) => (
          <div key={i} className="idea-tile" style={{ background:t.bg }}
            onClick={() => onStartChat(t.l)}>
            <div className="ic" style={{ background:'rgba(255,255,255,.55)' }}><Ic n={t.ic} s={16} c={t.c}/></div>
            <div className="l" style={{ color:'#1c1c1a' }}>{t.l}</div>
          </div>
        ))}
      </div>

      {chats && chats.length > 0 && <>
        <div className="sec-h" style={{ marginTop:22 }}>
          <h2>Мои чаты</h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {chats.map(c => (
            <div className="chat-plate" key={c.id} onClick={() => onOpenChat(c.id)}>
              <div className="cp-av"><img src="assets/logo.jpg" alt=""/></div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</div>
                <div className="muted" style={{ fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {c.msgs.length ? c.msgs[c.msgs.length-1].text : ''}
                </div>
              </div>
              <div className="cp-x" onClick={e => { e.stopPropagation(); onDeleteChat(c.id); }}>
                <Ic n="close" s={17}/>
              </div>
            </div>
          ))}
        </div>
      </>}

      <div className="sec-h" style={{ marginTop:22 }}>
        <h2>Фото и видео</h2>
        <span className="all">Показать все</span>
      </div>
      <div className="rail">
        {HERO.map((h, i) => (
          <div className="thumb" key={i} style={{ width:152, height:152, scrollSnapAlign:'start' }}>
            <img src={h.img} alt=""/>
          </div>
        ))}
      </div>

    </div>
  </div>;
}
window.AgentScreen = AgentScreen;
