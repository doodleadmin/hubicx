function PartnerDash({ partner }) {
  const [data, setData] = useState(null);
  React.useEffect(function() {
    PartnersApi.dashboard().then(setData).catch(function(){ setData({}); });
  }, []);

  if (!data) return <div className="pa-card"><div className="pa-card-h"><h3>Дашборд</h3></div><div className="pa-load-sm">Загрузка статистики...</div></div>;

  var d = data;
  var daily = d.daily || [];
  return <React.Fragment>
    <div className="pa-kpis">
      <PrStatCard label="Переходы" value={d.total_clicks || 0}/>
      <PrStatCard label="Регистрации" value={d.total_conversions || 0}/>
      <PrStatCard label="Платежи" value={d.total_payments || 0}/>
      <PrStatCard label="Комиссия" value={(d.total_commission || 0) + ' ₽'} sub={d.unpaid_commission != null ? ('К выплате: ' + d.unpaid_commission + ' ₽') : ''}/>
    </div>
    <div className="pa-grid">
      <div className="pa-card">
        <div className="pa-card-h"><h3>Статистика по дням</h3><div className="pa-seg"><button className="on">30 дней</button></div></div>
        <div className="pa-tbl-wrap">
          <table className="pa-tbl">
            <thead><tr><th>Дата</th><th>Клики</th><th>Реги</th><th>Платежи</th><th>Комиссия</th></tr></thead>
            <tbody>{daily.length ? daily.map(function(row, i) { return <tr key={i}><td>{row.date}</td><td>{row.clicks || 0}</td><td>{row.conversions || 0}</td><td>{row.payments || 0}</td><td className="money">{row.commission || 0} ₽</td></tr>; }) : <tr><td colSpan="5">Нет данных</td></tr>}</tbody>
          </table>
        </div>
      </div>
      <div className="pa-card">
        <div className="pa-card-h"><h3>Как увеличить доход</h3></div>
        <div className="pa-info"><IconDot/><div><b>Делитесь ссылками</b><br/>Используйте разные ссылки для разных каналов и отслеживайте конверсию.</div></div>
      </div>
    </div>
  </React.Fragment>;
}
