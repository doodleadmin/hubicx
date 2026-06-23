function PartnerLinks({ partner }) {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState('');

  React.useEffect(function() {
    PartnersApi.links().then(setData).catch(function(){ setData({links:[]}); });
  }, []);

  var copyLink = function(url) {
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ setCopied(url); setTimeout(function(){ setCopied(''); }, 1600); });
    else prompt('Скопируйте ссылку:', url);
  };

  if (!data) return <div className="pa-card"><div className="pa-card-h"><h3>Мои ссылки</h3></div><div className="pa-load-sm">Загрузка...</div></div>;

  var links = data.links || [];
  return <div className="pa-card">
    <div className="pa-card-h"><h3>Мои ссылки</h3><button className="pa-btn pa-btn-pri pa-btn-sm">Создать ссылку</button></div>
    {links.length ? <div>
      <div className="pa-linkrow head"><div>Ссылка</div><div>Клики</div><div>Регистрации</div><div>Платежи</div><div>Комиссия</div><div></div></div>
      {links.map(function(link, i) { return <div key={i} className="pa-linkrow">
        <div className="pa-link-name"><b>{link.label || 'Основная ссылка'}</b><span>{link.url}</span></div>
        <div className="pa-link-stat">{link.clicks || 0}<small>клики</small></div>
        <div className="pa-link-stat">{link.conversions || 0}<small>реги</small></div>
        <div className="pa-link-stat">{link.payments || 0}<small>оплаты</small></div>
        <div className="pa-link-stat">{link.commission || 0} ₽<small>доход</small></div>
        <button className={'pa-copy' + (copied === link.url ? ' done' : '')} onClick={function(){ copyLink(link.url); }}>{copied === link.url ? 'Готово' : 'Копировать'}</button>
      </div>; })}
    </div> : <div className="pa-empty">Ссылок пока нет</div>}
  </div>;
}
