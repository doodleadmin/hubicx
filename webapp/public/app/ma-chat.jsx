/* ============ Chat screen ============ */
const BOT_LINES = [
  "Конечно! Давайте разберёмся вместе. Расскажите чуть подробнее, что именно нужно — и я помогу.",
  "Отличная идея. Вот как я предлагаю двигаться: сначала уточним цель, затем подберём формат и детали.",
  "Готово ✨ Я набросал вариант. Скажите, если что-то поправить — стиль, длину или тон.",
  "Понял вас. Могу сгенерировать фото или видео по этому описанию — просто скажите слово.",
];

function ChatScreen({ chat, onBack, onSend }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState("");
  const endRef = useRef(null);
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; }, [chat.msgs.length]);

  const send = () => {
    const t = val.trim();
    if (!t) return;
    setVal("");
    onSend(t);
  };

  return <div className="chat-wrap">
    <div className="chat-top">
      <div className="chat-back" onClick={onBack}><Ic n="back" s={22}/></div>
      <div className="chat-id">
        <div className="chat-av">
          <img src="assets/logo.jpg" alt=""/>
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:16 }}>Агент Hubicx</div>
          <div className="muted" style={{ fontSize:12, fontWeight:600, color:'#7a9c92' }}>онлайн</div>
        </div>
      </div>
    </div>

    <div className="chat-body" ref={endRef}>
      {chat.msgs.map((m, i) => (
        <div key={i} className={'bubble ' + (m.role === 'user' ? 'me' : 'bot')}>{m.text}</div>
      ))}
      {chat.typing && <div className="bubble bot typing"><span/><span/><span/></div>}
    </div>

    <div className="chat-input">
      <div className="askbar" style={{ marginTop:0 }}>
        <input placeholder="Сообщение…" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}/>
        <div className={'send' + (val.trim() ? ' on' : '')} onClick={send}>
          <Ic n="arrowUp" s={20}/>
        </div>
      </div>
    </div>
  </div>;
}

window.ChatScreen = ChatScreen;
window.BOT_LINES = BOT_LINES;
