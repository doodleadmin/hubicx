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

  return <div className="pr-sect">
    <h2>Комиссии</h2>
    {list.length === 0 ? <div className="pr-empty">Комиссий пока нет</div> :
    <table className="pr-table">
      <thead><tr><th>Дата</th><th>Категория</th><th>Сумма платежа</th><th>Ставка</th><th>Комиссия</th><th>Статус</th></tr></thead>
      <tbody>
        {list.map(function(c, i) {
          return <tr key={i}><td>{c.created_at ? new Date(c.created_at).toLocaleDateString('ru') : ''}</td><td>{c.category || ''}</td><td>{c.amount_rub || 0} ₽</td><td>{c.rate_percent || 0}%</td><td>{c.commission_rub || 0} ₽</td><td>{c.status === 'paid' ? 'Выплачено' : c.status === 'cancelled' ? 'Отменено' : 'Ожидает'}</td></tr>;
        })}
      </tbody>
    </table>}
    {total > 20 && <div className="pr-pager">
      <button className="pr-btn pr-btn-sm" disabled={page <= 1 || busy} onClick={function(){ load(page-1); }}>← Назад</button>
      <span>стр. {page} из {Math.ceil(total/20)}</span>
      <button className="pr-btn pr-btn-sm" disabled={page * 20 >= total || busy} onClick={function(){ load(page+1); }}>Вперёд →</button>
    </div>}
  </div>;
}
