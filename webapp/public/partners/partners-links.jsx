function PartnerLinks({ partner }) {
  const [data, setData] = useState(null);

  React.useEffect(function() {
    PartnersApi.links().then(setData).catch(function(){});
  }, []);

  var copyLink = function(url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() { alert('Ссылка скопирована!'); });
    } else {
      prompt('Скопируйте ссылку:', url);
    }
  };

  if (!data) return <div className="pr-sect"><h2>Мои ссылки</h2><div className="pr-load-sm">Загрузка...</div></div>;

  return <div className="pr-sect">
    <h2>Мои ссылки</h2>
    <div className="pr-links-grid">
      {(data.links || []).map(function(link, i) {
        return <div key={i} className="pr-link-card">
          <div className="pr-link-name">{link.label}</div>
          <div className="pr-link-desc">{link.desc}</div>
          <div className="pr-link-url">{link.url}</div>
          <div className="pr-link-stats">
            <span>{link.clicks || 0} переходов</span>
            <span>{link.conversions || 0} регистраций</span>
          </div>
          <button className="pr-btn pr-btn-sm" onClick={function(){ copyLink(link.url); }}>Копировать</button>
        </div>;
      })}
    </div>
  </div>;
}
