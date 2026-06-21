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
    PartnersApi.me().then(function(p) {
      setBusy(false); onLogin(p);
    }).catch(function(e) {
      setBusy(false);
      if (e.message === 'AUTH_REQUIRED') setErr('Неверный код партнёра');
      else setErr(e.message);
    });
  };

  return <div className="pr-login-screen">
    <div className="pr-login-card">
      <div className="pr-login-logo">Hubicx Partners</div>
      <div className="pr-login-sub">Войдите по коду партнёра</div>
      <form onSubmit={submit}>
        <input className="pr-input" type="text" placeholder="Код партнёра" value={code} onChange={function(e){setCode(e.target.value)}} disabled={busy}/>
        {err && <div className="pr-err">{err}</div>}
        <button className="pr-btn" type="submit" disabled={busy || !code.trim()}>{busy ? 'Вход...' : 'Войти'}</button>
      </form>
    </div>
  </div>;
}
