/* ============ Docs and Support ============ */

(function(){
const t = window.t || ((k)=>k);

const DOCS = [
  {
    id:'terms',
    title:'doc.terms',
    icon:'doc',
    contentRu: `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ

Hubicx (далее — «Сервис») — Telegram Mini App для генерации изображений, видео и текстов с помощью AI-моделей.

1. Используя Сервис, вы соглашаетесь с настоящими условиями.
2. Вы несёте полную ответственность за создаваемый контент и промпты.
3. Запрещено использовать Сервис для создания незаконного, опасного или оскорбительного контента.
4. Администрация оставляет за собой право ограничить доступ при нарушении правил.
5. Сервис предоставляется «как есть». Результаты генерации зависят от возможностей AI-провайдеров и могут отличаться от ожидаемых.
6. Мы не гарантируем бесперебойную работу API провайдеров.`
  },
  {
    id:'privacy',
    title:'doc.privacy',
    icon:'lock',
    contentRu: `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ

1. Hubicx обрабатывает только данные, необходимые для работы Сервиса: Telegram ID, имя пользователя и язык интерфейса.
2. Переданные вами промпты и изображения используются исключительно для генерации контента и не передаются третьим лицам, кроме API провайдеров генерации.
3. Мы не храним и не передаём ваш Telegram initData, пароли или платёжные данные.
4. Платежная информация обрабатывается напрямую платёжным провайдером (ЮKassa) в соответствии с их политикой конфиденциальности.
5. Вы можете запросить удаление своих данных через поддержку.`
  },
  {
    id:'payment',
    title:'doc.payment',
    icon:'card',
    contentRu: `ПРАВИЛА ОПЛАТЫ

1. Оплата в Сервисе осуществляется через платёжного провайдера ЮKassa.
2. Зачисление токенов происходит автоматически после успешного платежа.
3. Цены на пакеты токенов указаны в рублях и могут быть изменены администрацией.
4. Количество токенов зачисляется согласно выбранному пакету с учётом бонусов.
5. Токены не имеют денежной стоимости и не подлежат обмену на реальные деньги.
6. ЮKassa ещё не подключена — пополнение временно возможно через администратора.`
  },
  {
    id:'refund',
    title:'doc.refund',
    icon:'return',
    contentRu: `ПРАВИЛА ВОЗВРАТА ТОКЕНОВ

1. Токены возвращаются на баланс только в случае технической ошибки: генерация не выполнена, но токены списаны.
2. Возврат происходит автоматически, если генерация завершилась ошибкой провайдера.
3. Токены, потраченные на успешные генерации, не возвращаются, так как результат предоставлен.
4. Ошибочное списание можно обжаловать через поддержку.
5. Купленные токены возврату не подлежат, за исключением случаев технической ошибки при оплате.`
  },
  {
    id:'how_tokens',
    title:'doc.how_tokens',
    icon:'star',
    contentRu: `КАК РАБОТАЮТ ТОКЕНЫ

1. Токены — это внутренняя единица учёта использования AI-моделей.
2. Каждая генерация списывает определённое количество токенов в зависимости от модели и параметров.
3. Цена генерации показывается до её запуска.
4. На балансе отображается количество доступных токенов.
5. При нехватке токенов генерация не будет запущена.
6. Токены можно пополнить, купив один из пакетов в разделе «Мои токены».
7. Токены не сгорают и не имеют срока действия.`
  },
  {
    id:'support',
    title:'doc.support',
    icon:'chat',
    contentRu: `ПОДДЕРЖКА

По всем вопросам обращайтесь в Telegram:

@hubicx_support

Или пишите на почту:
support@hubicx.ru

Мы отвечаем в рабочее время (MSK, пн–пт, 10:00–19:00).`
  }
];

function DocsList({ onClose }){
  const [active, setActive] = useState(null);
  if(active){
    const doc = DOCS.find(d=>d.id===active);
    return <div className="sheet-ov" onClick={()=>setActive(null)}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-card" style={{padding:'18px 18px 24px'}}>
          <div className="sheet-grab"></div>
          <div className="sheet-title" style={{marginBottom:12}}>{t(doc.title)}</div>
          <div className="doc-content">{doc.contentRu}</div>
          <div className="sheet-footer" style={{marginTop:16}}>
            <button className="sheet-cta primary" onClick={()=>setActive(null)}>{t('common.close')}</button>
          </div>
        </div>
      </div>
    </div>;
  }
  return <div className="sheet-ov" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-card">
        <div className="sheet-grab"></div>
        <div className="sheet-title">{t('doc.title')}</div>
        <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6}}>
          {DOCS.map(d=>(
            <div key={d.id} className="opt" onClick={()=>setActive(d.id)} style={{border:'1px solid var(--glass-line)',borderRadius:14,padding:'13px 14px',marginBottom:4}}>
              <div style={{fontWeight:600,fontSize:16}}>{t(d.title)}</div>
              <span className="chev" style={{display:'flex',marginLeft:'auto',color:'var(--tx2)'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="sheet-footer"><button className="sheet-cta primary" onClick={onClose}>{t('common.close')}</button></div>
    </div>
  </div>;
}

window.DocsList = DocsList;
})();
