/* ════════════════════════════════════════════════════════════════════════
   DROP-IN ПАТЧ #1 — МОБАЙЛ
   Файл: webapp/public/app/hbx-create.jsx  ·  компонент CreateScreen
   Цель: заменить плоский статус + нижнюю result-card на «Холст» H1
         (скелет в нужном формате → этапы/ETA/% → проявление из размытия).
   ════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 1. В САМЫЙ ВЕРХ ФАЙЛА (module scope, до function CreateScreen)
   добавить таблицу этапов и хук прогресса.
   Бэкенд отдаёт только status-строки, поэтому % считаем по времени и
   снапаем в 100% при completed.
   ─────────────────────────────────────────────────────────────────────── */

const GEN_STAGES = [
  { t: 'В очереди',    s: 'Готовим задачу для модели' },
  { t: 'Композиция',   s: 'Раскладываю сцену и формы' },
  { t: 'Детализация',  s: 'Прорисовываю детали и фактуру' },
  { t: 'Свет и цвет',  s: 'Настраиваю освещение и тон' },
  { t: 'Финал',        s: 'Повышаю чёткость, готовлю результат' },
];

// running — идёт генерация (submitting); done — результат готов (completed)
function useGenProgress(running, done, isVideo){
  const estMs = isVideo ? 150000 : 30000;            // оценка длительности
  const [pct, setPct] = useState(0);
  const startRef = useRef(0);
  useEffect(() => {
    if (done) { setPct(100); return; }
    if (!running) { setPct(0); return; }
    startRef.current = Date.now();
    const id = setInterval(() => {
      const t = Date.now() - startRef.current;
      const lin = Math.min(1, t / estMs);
      // замедление к концу — ощущается «живым»
      setPct(Math.min(99, Math.round((1 - Math.pow(1 - lin, 1.7)) * 100)));
    }, 200);
    return () => clearInterval(id);
  }, [running, done, isVideo]);

  const stageIdx = done
    ? GEN_STAGES.length - 1
    : Math.min(GEN_STAGES.length - 1, Math.floor((pct / 100) * GEN_STAGES.length));
  const etaSec = running && !done
    ? Math.max(1, Math.ceil((estMs / 1000) * (1 - pct / 100)))
    : 0;
  return { pct, stageIdx, etaSec };
}


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 2. ВНУТРИ CreateScreen, рядом с остальными производными переменными
   (после строки `const code = model && (model.code || model.id);`)
   добавить:
   ─────────────────────────────────────────────────────────────────────── */

const isVideoModel = !!(code && (code.includes('seedance') || code.includes('kling') || code.includes('video')));
const revealed = !!(result && result.status === 'completed' && resultUrl(result));   // визуальный результат готов
const genActive = submitting || revealed;                                            // показываем холст
const { pct, stageIdx, etaSec } = useGenProgress(submitting, revealed, isVideoModel);
const aspectCss = (aspect && aspect.id ? aspect.id : '1:1').replace(':', '/');


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 3. ЗАМЕНИТЬ существующий блок вывода статуса+результата.

   УДАЛИТЬ от строки:
       {status && <div className="muted" style={{fontSize:13,marginTop:8}}>{status}</div>}
   ВКЛЮЧИТЕЛЬНО до закрывающего этот {result && ...} блока — т.е. весь
   `{result && <div className="card result-card" ...> ... </div>}`.

   ВСТАВИТЬ вместо него код ниже.
   (price-блок выше и кнопка btn-primary ниже — НЕ трогаем.)
   ─────────────────────────────────────────────────────────────────────── */

{/* ===== ХОЛСТ: проявление визуального результата на месте ===== */}
{genActive && <>
  <div className="label-sec" style={{marginTop:20}}>{revealed ? t('result.ready') : t('gen.creating')}</div>
  <div className="gen-canvas" style={{aspectRatio: aspectCss}}>
    {!revealed && <div className="gen-skel"></div>}
    {revealed && (taskKind(result) === 'video'
      ? <video className="gen-media in" src={resultUrl(result)} controls playsInline></video>
      : <img className="gen-media in" src={resultUrl(result)} alt={t('result.ready')}/>)}
    <div className="gen-grain"></div>
  </div>

  <div className="gen-stages">
    {GEN_STAGES.map((s,i)=>(
      <div key={i} className={'gen-chip' + (revealed || i < stageIdx ? ' done' : i === stageIdx ? ' act' : '')}><i/></div>
    ))}
  </div>
  <div className="gen-stagerow">
    <div className="gen-stage-l">
      {revealed ? <Ic n="check" s={16} c="#5cc8ff"/> : <span className="gen-dot"></span>}
      <span>{revealed ? t('common.ready') : GEN_STAGES[stageIdx].t}</span>
    </div>
    <div className="gen-eta">{revealed ? model.t : '≈ ' + etaSec + ' сек · ' + pct + '%'}</div>
  </div>
  {!revealed && <div className="muted" style={{fontSize:12,marginTop:6}}>{GEN_STAGES[stageIdx].s}</div>}

  {revealed && <div className="result-actions" style={{marginTop:12}}>
    <a className="pill" href={resultUrl(result)} target="_blank" rel="noreferrer">{t('result.open')}</a>
    <button className="pill" onClick={sendToTelegram}>{t('result.send_tg')}</button>
    <button className="pill" onClick={onNewGeneration}>{t('result.new')}</button>
  </div>}
  {sendState && <div className="muted" style={{fontSize:13,marginTop:8}}>{sendState}</div>}
</>}

{/* статус-строка — только когда холст не показан (загрузка файла, ожидание без сабмита) */}
{status && !genActive && <div className="muted" style={{fontSize:13,marginTop:8}}>{status}</div>}

{/* НЕвизуальные результаты (текстовый вывод, ошибка, refunded) — прежняя карточка */}
{result && !revealed && <div className="card result-card" style={{marginTop:12,padding:12}}>
  <div style={{fontWeight:800,marginBottom:8}}>{resultTitle(result)}</div>
  {result.status==='failed' || result.status==='error' || result.status==='refunded'
    ? <div className="muted" style={{fontSize:14}}>{resultText(result)}</div>
    : <div className="result-text">{resultText(result)}</div>}
  {result.status==='completed' && !resultUrl(result) && <div className="result-actions">
    <button className="pill" onClick={copyResult}>{t('result.copy')}</button>
    <button className="pill" onClick={sendToTelegram}>{t('result.send_tg')}</button>
    <button className="pill" onClick={()=>onContinueChat && onContinueChat(resultText(result))}>{t('result.continue_chat')}</button>
  </div>}
  {sendState && <div className="muted" style={{fontSize:13,marginTop:8}}>{sendState}</div>}
  {copyState && <div className="muted" style={{fontSize:13,marginTop:8}}>{copyState}</div>}
</div>}

/* ───────────────────────────────────────────────────────────────────────
   ШАГ 4. (CSS) Скопировать handoff/gen-canvas.css в КОНЕЦ webapp/public/app/hbx.css
   ─────────────────────────────────────────────────────────────────────── */
