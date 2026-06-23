function PartnerPayouts() {
  const [data, setData] = useState(null);

  React.useEffect(function() {
    PartnersApi.payouts().then(setData).catch(function(){ setData({payouts:[]}); });
  }, []);

  if (!data) return <div className="pa-card"><div className="pa-card-h"><h3>Выплаты</h3></div><div className="pa-load-sm">Загрузка...</div></div>;

  return <React.Fragment>
    <div className="pa-payhead">
      <div className="pa-bigbal"><div className="l">Баланс к выплате</div><div className="v">{data.pending_balance || 0} ₽</div><div className="row"><button className="pa-btn pa-btn-pri">Запросить выплату</button></div></div>
      <div className="pa-stat-card"><div className="l">Всего выплачено</div><div className="v">{data.total_paid || 0} <small>₽</small></div></div>
      <div className="pa-stat-card"><div className="l">В обработке</div><div className="v">{data.processing || 0} <small>₽</small></div></div>
    </div>
    <div className="pa-card">
      <div className="pa-card-h"><h3>История выплат</h3></div>
      {(data.payouts || []).length === 0 ? <div className="pa-empty">Выплат пока нет</div> :
      <div className="pa-tbl-wrap"><table className="pa-tbl">
        <thead><tr><th>Дата</th><th>Сумма</th><th>Статус</th><th>Примечание</th></tr></thead>
        <tbody>{(data.payouts || []).map(function(p, i) { return <tr key={i}><td>{p.created_at ? new Date(p.created_at).toLocaleDateString('ru') : ''}</td><td className="money">{p.amount_rub || 0} ₽</td><td><PrTag status={p.status || 'waiting'}/></td><td>{p.note || ''}</td></tr>; })}</tbody>
      </table></div>}
    </div>
  </React.Fragment>;
}
