function PartnerPayouts() {
  const [data, setData] = useState(null);

  React.useEffect(function() {
    PartnersApi.payouts().then(setData).catch(function(){});
  }, []);

  if (!data) return <div className="pr-sect"><h2>Выплаты</h2><div className="pr-load-sm">Загрузка...</div></div>;

  return <div className="pr-sect">
    <h2>Выплаты</h2>
    <PrStatCard label="Баланс к выплате" value={(data.pending_balance || 0) + ' ₽'}/>
    <h3 style={{ marginTop: 18 }}>История выплат</h3>
    {(data.payouts || []).length === 0 ? <div className="pr-empty">Выплат пока нет</div> :
    <table className="pr-table">
      <thead><tr><th>Дата</th><th>Сумма</th><th>Статус</th><th>Примечание</th></tr></thead>
      <tbody>
        {(data.payouts || []).map(function(p, i) {
          return <tr key={i}><td>{p.created_at ? new Date(p.created_at).toLocaleDateString('ru') : ''}</td><td>{p.amount_rub || 0} ₽</td><td>{p.status || ''}</td><td>{p.note || ''}</td></tr>;
        })}
      </tbody>
    </table>}
  </div>;
}
