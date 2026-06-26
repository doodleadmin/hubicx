function PartnerLogin({ onLogin }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  var submit = function(e) {
    e && e.preventDefault();
    var c = code.trim();
    if (!c) { setErr('Введите код партнёра'); return; }
    setBusy(true); setErr('');
    PartnersApi.setCode(c);
    PartnersApi.me().then(function(p) { setBusy(false); onLogin(p); }).catch(function(e) {
      setBusy(false);
      if (e.message === 'AUTH_REQUIRED') setErr('Неверный код партнёра');
      else setErr(e.message);
    });
  };

  return <div className="pa-login-screen">
    <form className="pa-login-card" onSubmit={submit}>
      <div className="pa-brand"><span className="pa-logo"><LogoSvg/></span><div>Hubicx <span className="sub">Partners</span></div></div>
      <h1>Вход в партнёрский кабинет</h1>
      <p>Введите код партнёра, чтобы открыть статистику, ссылки, комиссии и выплаты.</p>
      <input className="pa-input" type="text" placeholder="Код партнёра" value={code} onChange={function(e){setCode(e.target.value)}} disabled={busy}/>
      {err && <div className="pa-err">{err}</div>}
      <button className="pa-btn pa-btn-pri" type="submit" disabled={busy || !code.trim()}>{busy ? 'Вход...' : 'Войти'}</button>
    </form>
  </div>;
}
