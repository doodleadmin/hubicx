/* ============ Chat screen ============ */
function ChatScreen({ chat, onBack, onSend }) {
  const { Ic } = window.MiraCore;
  const [val, setVal] = useState("");
  const bodyRef = useRef(null);
  const msgs = chat.msgs || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [msgs.length, msgs[msgs.length - 1] && msgs[msgs.length - 1].text]);

  const send = () => {
    const t = val.trim();
    if (!t) return;
    // Prevent sending while a stream is in progress
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg && lastMsg.streaming) return;
    setVal("");
    onSend(t);
  };

  // Show typing dots when last message is streaming with no text yet
  const lastMsg = msgs[msgs.length - 1];
  const isStreaming = lastMsg && lastMsg.streaming;
  const showTyping = isStreaming && !lastMsg.text;

  return <div className="chat-wrap">
    <div className="chat-top">
      <div className="chat-back" onClick={onBack}><Ic n="back" s={22}/></div>
      <div className="chat-id">
        <div className="chat-av">
          <img src="assets/logo.jpg" alt=""/>
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:16 }}>Агент Hubicx</div>
          <div className="muted" style={{ fontSize:12, fontWeight:600, color: isStreaming ? '#c98a4e' : '#7a9c92' }}>
            {isStreaming ? 'печатает…' : 'онлайн'}
          </div>
        </div>
      </div>
    </div>

    <div className="chat-body" ref={bodyRef}>
      {msgs.map((m, i) => {
        if (m.streaming && !m.text) return null; // shown as typing dots below
        return <div key={i} className={'bubble ' + (m.role === 'user' ? 'me' : 'bot') + (m.isError ? ' err' : '')}>
          {m.text}
        </div>;
      })}
      {showTyping && <div className="bubble bot typing"><span/><span/><span/></div>}
    </div>

    <div className="chat-input">
      <div className="askbar" style={{ marginTop:0 }}>
        <input placeholder="Сообщение…" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(); }}/>
        <div className={'send' + (val.trim() && !isStreaming ? ' on' : '')} onClick={send}>
          <Ic n="arrowUp" s={20}/>
        </div>
      </div>
    </div>
  </div>;
}

window.ChatScreen = ChatScreen;
