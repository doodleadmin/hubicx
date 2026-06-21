function PartnerDash({ partner }) {
  const [data, setData] = useState(null);
  React.useEffect(function() {
    PartnersApi.dashboard().then(setData).catch(function(){});
  }, []);

  if (!data) return <div className="pr-sect"><h2>Дашборд</h2><div className="pr-load-sm">Загрузка статистики...</div></div>;

  var d = data;
  return <div className="pr-sect">
    <h2>Дашборд</h2>
    <div className="pr-stats">
      <PrStatCard label="Переходы" value={d.total_clicks||0}/>
      <PrStatCard label="Регистрации" value={d.total_conversions||0}/>
      <PrStatCard label="Платежи" value={d.total_payments||0}/>
      <PrStatCard label="Комиссия" value={(d.total_commission||0) + ' ₽'} sub={d.unpaid_commission != null ? ('К выплате: ' + d.unpaid_commission + ' ₽') : ''}/>
    </div>
    {d.daily && d.daily.length > 0 && <div className="pr-chart">
      <h3>По дням (30 дней)</h3>
      <table className="pr-table">
        <thead><tr><th>Дата</th><th>Клики</th><th>Реги</th><th>Платежи</th><th>Комиссия</th></tr></thead>
        <tbody>
          {d.daily.map(function(row, i) {
            return <tr key={i}><td>{row.date}</td><td>{row.clicks||0}</td><td>{row.conversions||0}</td><td>{row.payments||0}</td><td>{row.commission||0} ₽</td></tr>;
          })}
        </tbody>
      </table>
    </div>}
  </div>;
}
