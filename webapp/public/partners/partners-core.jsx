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

  var setTab = function(tab) { setScreen(tab); };
  var doLogout = function() { PartnersApi.setCode(''); setPartner(null); setScreen('login'); };

  if (screen === 'loading') return <div className="pa-load">Загрузка...</div>;
  if (screen === 'error') return <div className="pa-error">{error}</div>;
  if (screen === 'login') return <PartnerLogin onLogin={function(p) { setPartner(p); setScreen('dash'); }}/>;

  var titles = { dash:'Дашборд', links:'Ссылки', comms:'Комиссии', payouts:'Выплаты' };
  return <div className="pa-app">
    <PrSidebar partner={partner} screen={screen} onTab={setTab} onLogout={doLogout}/>
    <main className="pa-main">
      <div className="pa-top">
        <div className="pa-top-h">
          <h1>{titles[screen] || 'Партнёрка'}</h1>
          <span>{partner && partner.name ? partner.name : 'Партнёрский кабинет Hubicx'}</span>
        </div>
        <div className="pa-top-r">
          <div className="pa-bal"><div><div className="l">К выплате</div><div className="v">{partner && partner.unpaid_commission != null ? partner.unpaid_commission : 0} ₽</div></div></div>
          <button className="pa-btn pa-btn-pri" onClick={function(){ setScreen('links'); }}>Получить ссылку</button>
        </div>
      </div>
      <div className="pa-body">
        {screen === 'dash'    && <PartnerDash partner={partner}/>} 
        {screen === 'links'   && <PartnerLinks partner={partner}/>} 
        {screen === 'comms'   && <PartnerCommissions/>} 
        {screen === 'payouts' && <PartnerPayouts/>}
      </div>
    </main>
  </div>;
}

function LogoSvg(){
  return <svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#2f80ed"/><path d="M10 23c0-5 1.6-9 3-9s2 3.4 3.6 3.4S19 11 20.6 11 23 15 24 15" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
}

function IconDot(){ return <span className="ic"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="7"/></svg></span>; }

function PrSidebar({ partner, screen, onTab, onLogout }) {
  var nav = [
    ['dash','Дашборд'], ['links','Ссылки'], ['comms','Комиссии'], ['payouts','Выплаты']
  ];
  return <aside className="pa-side">
    <div className="pa-brand"><span className="pa-logo"><LogoSvg/></span><div>Hubicx <span className="sub">Partners</span></div></div>
    <div className="pa-navlabel">Кабинет</div>
    <nav className="pa-nav">
      {nav.map(function(item){ return <button key={item[0]} className={'pa-nav-i' + (screen===item[0] ? ' on' : '')} onClick={function(){ onTab(item[0]); }}><IconDot/>{item[1]}</button>; })}
    </nav>
    <div className="pa-side-foot">
      <div className="pa-side-cta"><b>Партнёрская ссылка</b><span>Делитесь Hubicx и получайте комиссию с оплат.</span><button className="pa-btn pa-btn-dark pa-btn-sm" onClick={function(){ onTab('links'); }}>Открыть ссылки</button></div>
      <div className="pa-user">
        <div className="pa-ava">{((partner && partner.name) || 'P').charAt(0).toUpperCase()}</div>
        <div><div className="nm">{partner && partner.name ? partner.name : 'Партнёр'}</div><div className="rl">{partner && partner.code ? partner.code : 'active'}</div></div>
        <button className="pa-icon-btn" onClick={onLogout} title="Выйти">×</button>
      </div>
    </div>
  </aside>;
}

function PrStatCard({ label, value, sub }) {
  return <div className="pa-kpi">
    <div className="pa-kpi-top"><div className="pa-kpi-ic"><IconDot/></div><div className="pa-kpi-l">{label}</div></div>
    <div className="pa-kpi-v">{value}</div>
    {sub && <div className="pa-kpi-d up">{sub}<span className="since">сейчас</span></div>}
  </div>;
}

function PrTag({ status }) {
  var cls = status === 'paid' || status === 'active' ? 'ok' : (status === 'cancelled' || status === 'blocked' ? 'wait' : 'new');
  return <span className={'pa-tag ' + cls}><span className="dt"></span>{status || 'new'}</span>;
}

window.PartnersApp = PartnersApp;
window.PrStatCard = PrStatCard;
window.PrTag = PrTag;
