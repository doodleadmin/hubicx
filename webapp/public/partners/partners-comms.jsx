function PartnerCommissions() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);

  var load = function(pg) {
    setBusy(true);
    PartnersApi.commissions({ page: pg, limit: 20 }).then(function(d) {
      setList(d.items || []); setTotal(d.total || 0); setPage(pg); setBusy(false);
    }).catch(function() { setBusy(false); });
  };

  React.useEffect(function() { load(1); }, []);

  return <div className="pa-card">
    <div className="pa-card-h"><h3>Комиссии</h3></div>
    {list.length === 0 ? <div className="pa-empty">Комиссий пока нет</div> :
    <div className="pa-tbl-wrap"><table className="pa-tbl">
      <thead><tr><th>Дата</th><th>Категория</th><th>Сумма платежа</th><th>Ставка</th><th>Комиссия</th><th>Статус</th></tr></thead>
      <tbody>{list.map(function(c, i) { return <tr key={i}><td>{c.created_at ? new Date(c.created_at).toLocaleDateString('ru') : ''}</td><td>{c.category || ''}</td><td className="money">{c.amount_rub || 0} ₽</td><td>{c.rate_percent || 0}%</td><td className="money">{c.commission_rub || 0} ₽</td><td><PrTag status={c.status === 'paid' ? 'paid' : c.status === 'cancelled' ? 'cancelled' : 'waiting'}/></td></tr>; })}</tbody>
    </table></div>}
    {total > 20 && <div className="pa-foot-link"><button disabled={page <= 1 || busy} onClick={function(){ load(page-1); }}>← Назад</button><button disabled={page * 20 >= total || busy} onClick={function(){ load(page+1); }}>Вперёд →</button></div>}
  </div>;
}
