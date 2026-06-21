/* Partners core shared components */
const { useState, useEffect, useRef } = React;
function PartnersApp() {
  const [screen, setScreen] = useState('loading');
  const [partner, setPartner] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(function() {
    if (!PartnersApi.getCode()) { setScreen('login'); return; }
    PartnersApi.me().then(function(p) {
      setPartner(p); setScreen('dash');
    }).catch(function(e) {
      if (e.message === 'AUTH_REQUIRED') { setScreen('login'); }
      else { setError(e.message); setScreen('error'); }
    });
  }, []);

  var goDash = function() { setScreen('dash'); };
  var goLinks = function() { setScreen('links'); };
  var goComms = function() { setScreen('comms'); };
  var goPayouts = function() { setScreen('payouts'); };
  var doLogout = function() { PartnersApi.setCode(''); setScreen('login'); };

  if (screen === 'loading') return <div className="pr-load">Загрузка...</div>;
  if (screen === 'error') return <div className="pr-error">{error}</div>;
  if (screen === 'login') return <PartnerLogin onLogin={function(p) { setPartner(p); setScreen('dash'); }}/>;

  return <div className="pr-app">
    <PrHeader partner={partner} screen={screen} onDash={goDash} onLinks={goLinks} onComms={goComms} onPayouts={goPayouts} onLogout={doLogout}/>
    <div className="pr-body">
      {screen === 'dash'      && <PartnerDash partner={partner}/>}
      {screen === 'links'     && <PartnerLinks partner={partner}/>}
      {screen === 'comms'     && <PartnerCommissions/>}
      {screen === 'payouts'   && <PartnerPayouts/>}
    </div>
  </div>;
}

function PrHeader({ partner, screen, onDash, onLinks, onComms, onPayouts, onLogout }) {
  return <header className="pr-head">
    <div className="pr-logo">Hubicx <span>Partners</span></div>
    <div className="pr-user">
      <span className="pr-partner-name">{partner && partner.name}</span>
      <button onClick={onLogout} className="pr-logout">Выйти</button>
    </div>
    <nav className="pr-nav">
      <a className={screen==='dash'?'on':''} onClick={onDash}>Дашборд</a>
      <a className={screen==='links'?'on':''} onClick={onLinks}>Ссылки</a>
      <a className={screen==='comms'?'on':''} onClick={onComms}>Комиссии</a>
      <a className={screen==='payouts'?'on':''} onClick={onPayouts}>Выплаты</a>
    </nav>
  </header>;
}

function PrStatCard({ label, value, sub }) {
  return <div className="pr-stat">
    <div className="pr-stat-val">{value}</div>
    <div className="pr-stat-lbl">{label}</div>
    {sub && <div className="pr-stat-sub">{sub}</div>}
  </div>;
}

window.PartnersApp = PartnersApp;
window.PrStatCard = PrStatCard;
