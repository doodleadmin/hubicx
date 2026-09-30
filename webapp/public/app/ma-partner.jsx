/* ============ Partner program: Profile → Партнёрство ============ */
function fmtRub(value) {
  var n = Number(value || 0);
  return n.toLocaleString('ru-RU', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' ₽';
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  return new Promise(function(resolve, reject) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      resolve();
    } catch (e) { reject(e); }
  });
}

var PARTNER_OP_STATUS = {
  requested: 'На проверке',
  approved: 'Одобрено',
  paid: 'Выплачено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
};

function PartnerWithdrawSheet({ partner, onClose, onDone }) {
  const { HxSheet } = window.MiraCore;
  var available = Number(partner.balance.available_rub || 0);
  var methods = partner.payout_methods && partner.payout_methods.length ? partner.payout_methods : [{ code:'card', title:'Банковская карта' }, { code:'sbp', title:'СБП по номеру телефона' }];
  const [amount, setAmount] = useState(String(Math.floor(available)));
  const [method, setMethod] = useState(methods[0].code);
  const [card, setCard] = useState('');
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');
  const [holder, setHolder] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  var amountNum = Number(String(amount).replace(',', '.'));
  var amountOk = amountNum >= partner.min_payout_rub && amountNum <= available;

  var submit = function() {
    if (sending) return;
    setError('');
    if (!amountOk) {
      setError(amountNum > available ? 'Сумма больше доступного баланса' : 'Минимальная сумма вывода — ' + fmtRub(partner.min_payout_rub));
      return;
    }
    var details = method === 'card' ? { card: card, holder: holder } : { phone: phone, bank: bank, holder: holder };
    setSending(true);
    window.HubicxApi.partnerWithdraw({ amount_rub: amountNum, method: method, details: details }).then(function(data) {
      setSending(false);
      if (window.tgHaptic) window.tgHaptic('success');
      onDone(data.partner);
      onClose();
    }).catch(function(err) {
      setSending(false);
      setError((err && err.message) || 'Не удалось создать заявку');
    });
  };

  return <HxSheet onClose={onClose} sheetClassName="profile-sheet" cardClassName="profile-sheet-card pt-sheet">
    <div className="sheet-title">Вывод средств</div>
    <div className="pt-sheet-sub">Доступно {fmtRub(available)} · от {fmtRub(partner.min_payout_rub)}. Выплата вручную в течение 3 рабочих дней.</div>

    <label className="pt-field">
      <span>Сумма</span>
      <div className="pt-input-wrap">
        <input className="text-in" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}/>
        <em>₽</em>
      </div>
    </label>

    <div className="pt-seg">
      {methods.map(function(m) {
        return <button key={m.code} className={'pt-seg-item' + (method === m.code ? ' on' : '')} onClick={() => setMethod(m.code)}>
          {m.code === 'card' ? 'Карта' : 'СБП'}
        </button>;
      })}
    </div>

    {method === 'card'
      ? <label className="pt-field">
          <span>Номер карты</span>
          <input className="text-in" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card} onChange={e => setCard(e.target.value)}/>
        </label>
      : <React.Fragment>
          <label className="pt-field">
            <span>Телефон</span>
            <input className="text-in" inputMode="tel" placeholder="+7 900 000-00-00" value={phone} onChange={e => setPhone(e.target.value)}/>
          </label>
          <label className="pt-field">
            <span>Банк</span>
            <input className="text-in" placeholder="Например, Т-Банк" value={bank} onChange={e => setBank(e.target.value)}/>
          </label>
        </React.Fragment>}
    <label className="pt-field">
      <span>Имя получателя</span>
      <input className="text-in" autoComplete="cc-name" placeholder="Как в банке" value={holder} onChange={e => setHolder(e.target.value)}/>
    </label>

    {error && <div className="topup-error">{error}</div>}
    <button className="sheet-cta" disabled={sending} onClick={submit}>{sending ? 'Отправляем…' : 'Отправить заявку · ' + (amountNum > 0 ? fmtRub(amountNum) : '')}</button>
  </HxSheet>;
}

function PartnerPanel({ onSpend }) {
  const { Ic } = window.MiraCore;
  const [partner, setPartner] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  var load = function() {
    if (!window.HubicxApi || !window.HubicxApi.partner) return;
    setError('');
    window.HubicxApi.partner().then(setPartner).catch(function(err) {
      setError((err && err.message) || 'Не удалось загрузить партнёрскую программу');
    });
  };
  useEffect(function() {
    load();
    // Purchases paid from the partner balance happen in the top-up sheet.
    window.addEventListener('hubicx:partner-changed', load);
    return function() { window.removeEventListener('hubicx:partner-changed', load); };
  }, []);

  if (!partner) {
    return <div className="card pt-loading">
      {error ? <React.Fragment>
        <div className="muted">{error}</div>
        <button className="btn-secondary" onClick={load}>Повторить</button>
      </React.Fragment> : <div className="gen-spinner"></div>}
    </div>;
  }

  var b = partner.balance || {};
  var available = Number(b.available_rub || 0);
  var withdrawalsOn = partner.withdrawals_enabled !== false;
  var canWithdraw = withdrawalsOn && available >= partner.min_payout_rub;
  var shareText = 'Создаю фото и видео с нейросетями в Hubicx — попробуй тоже:';

  var copyLink = function() {
    copyText(partner.link).then(function() {
      if (window.tgHaptic) window.tgHaptic('success');
      setCopied(true);
      setTimeout(function() { setCopied(false); }, 1800);
    }).catch(function() {});
  };
  var shareLink = function() {
    var url = 'https://t.me/share/url?url=' + encodeURIComponent(partner.link) + '&text=' + encodeURIComponent(shareText);
    var tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank');
  };

  return <React.Fragment>
    <div className="card pt-hero">
      <div className="pt-hero-title">Партнёрская программа</div>
      <div className="pt-hero-sub">Приглашайте друзей и получайте {partner.percent}% с каждой их покупки. {withdrawalsOn ? 'Заработок можно вывести на карту или потратить на тарифы и токены.' : 'Заработок можно потратить на тарифы и токены.'}</div>
      <div className="pt-stats">
        <div className="pt-stat accent"><span>Доступно</span><b>{fmtRub(available)}</b></div>
        <div className="pt-stat"><span>Заработано всего</span><b>{fmtRub(b.earned_total_rub)}</b></div>
        <div className="pt-stat"><span>Ваш процент</span><b>{partner.percent}%</b></div>
        <div className="pt-stat"><span>Приглашено</span><b>{partner.invited_count}</b></div>
      </div>
      {Number(b.hold_rub || 0) > 0 && <div className="pt-note">
        <Ic n="clock" s={15}/> {fmtRub(b.hold_rub)} в холде — станут доступны через {partner.hold_days} дней после оплаты.
      </div>}
    </div>

    <div className="card pt-link-card">
      <div className="pt-k">Ваша ссылка</div>
      <button className="pt-link" onClick={copyLink}>{partner.link || 'Ссылка появится после настройки бота'}</button>
      <div className="pt-actions">
        <button className="btn-secondary pt-btn" onClick={copyLink} disabled={!partner.link}>
          <Ic n={copied ? 'check' : 'copy'} s={17}/> {copied ? 'Скопировано' : 'Скопировать'}
        </button>
        <button className="btn-secondary pt-btn" onClick={shareLink} disabled={!partner.link}>
          <Ic n="telegram" s={17}/> Отправить
        </button>
      </div>
    </div>

    <div className="card pt-balance-card">
      <div className="pt-k">Партнёрский баланс</div>
      <div className="pt-balance">{fmtRub(available)}</div>
      {withdrawalsOn
        ? <div className="pt-balance-note">Минимальная сумма вывода: <b>{fmtRub(partner.min_payout_rub)}</b></div>
        : <div className="pt-balance-note">Вывод на карту появится позже. Сейчас баланс можно потратить на тариф или токены.</div>}
      <div className="pt-balance-actions">
        <button className="btn-primary" disabled={available <= 0} onClick={onSpend}>Потратить на тариф</button>
        <button className="btn-secondary" disabled={!canWithdraw} onClick={() => setWithdrawOpen(true)}>{withdrawalsOn ? 'Вывести' : 'Вывод скоро'}</button>
      </div>
      {(Number(b.withdrawal_processing_rub || 0) > 0 || Number(b.withdrawn_rub || 0) > 0 || Number(b.spent_rub || 0) > 0) && <div className="pt-mini-stats">
        {Number(b.withdrawal_processing_rub || 0) > 0 && <span>В обработке: <b>{fmtRub(b.withdrawal_processing_rub)}</b></span>}
        {Number(b.withdrawn_rub || 0) > 0 && <span>Выведено: <b>{fmtRub(b.withdrawn_rub)}</b></span>}
        {Number(b.spent_rub || 0) > 0 && <span>Потрачено: <b>{fmtRub(b.spent_rub)}</b></span>}
      </div>}
    </div>

    {partner.operations && partner.operations.length > 0 && <div className="card pt-ops">
      <div className="pt-k">История операций</div>
      {partner.operations.map(function(op) {
        var isPurchase = op.kind === 'purchase';
        return <div className="pt-op" key={op.id}>
          <div className="pt-op-main">
            <b>{isPurchase ? 'Оплата: ' + (op.details || 'токены') : 'Вывод · ' + (op.details || '')}</b>
            <span>{op.created_at ? new Date(op.created_at).toLocaleDateString('ru-RU') : ''}{isPurchase ? '' : ' · ' + (PARTNER_OP_STATUS[op.status] || op.status)}</span>
          </div>
          <strong className={op.status === 'rejected' || op.status === 'cancelled' ? 'muted' : ''}>−{fmtRub(op.amount_rub)}</strong>
        </div>;
      })}
    </div>}

    <div className="card pt-how">
      <div className="pt-k">Как это работает</div>
      <div className="pt-step"><i>1</i><span>Отправьте ссылку друзьям или в свой канал.</span></div>
      <div className="pt-step"><i>2</i><span>Они запускают бота по ссылке и становятся вашими рефералами навсегда.</span></div>
      <div className="pt-step"><i>3</i><span>С каждой их оплаты вы получаете {partner.percent}%. Через {partner.hold_days} дней деньги доступны {withdrawalsOn ? 'для вывода или покупки тарифа' : 'для покупки тарифа и токенов'}.</span></div>
    </div>

    {withdrawOpen && <PartnerWithdrawSheet partner={partner} onClose={() => setWithdrawOpen(false)} onDone={function(next) { if (next) setPartner(next); }}/>}
  </React.Fragment>;
}

window.PartnerPanel = PartnerPanel;
window.HubicxFmtRub = fmtRub;
