/* ════════════════════════════════════════════════════════════════════════
   DROP-IN ПАТЧ #2 — ДЕСКТОП
   Файл: webapp/public/app/ma-desktop-screens.jsx  ·  компонент DeskGen
   Цель: заменить голый gen-spinner в ветке canvas==='generating' на
         staged-холст (скелет в формате → этапы/ETA/%), как на мобайле.
   ════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 1. В module scope (рядом с другими хелперами, например над DeskGen)
   добавить таблицу этапов и сам компонент холста. Он сам ведёт таймер,
   потому что монтируется только на время генерации.
   ─────────────────────────────────────────────────────────────────────── */

const DESK_STAGES = [
  { t: 'В очереди',   s: 'Готовим задачу для модели' },
  { t: 'Композиция',  s: 'Раскладываю сцену и формы' },
  { t: 'Детализация', s: 'Прорисовываю детали и фактуру' },
  { t: 'Свет и цвет', s: 'Настраиваю освещение и тон' },
  { t: 'Финал',       s: 'Повышаю чёткость, готовлю результат' },
];

function DeskStageCanvas({ mode, aspectId }) {
  const estMs = mode === 'video' ? 150000 : 30000;
  const [pct, setPct] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(function () {
    const id = setInterval(function () {
      const t = Date.now() - startRef.current;
      const lin = Math.min(1, t / estMs);
      setPct(Math.min(99, Math.round((1 - Math.pow(1 - lin, 1.7)) * 100)));
    }, 200);
    return function () { clearInterval(id); };
  }, []);
  const idx = Math.min(DESK_STAGES.length - 1, Math.floor((pct / 100) * DESK_STAGES.length));
  const eta = Math.max(1, Math.ceil((estMs / 1000) * (1 - pct / 100)));
  const aspectCss = (aspectId || '2:3').replace(':', '/');

  return <div className="dk-stage-wrap">
    <div className="dk-stage" style={{ aspectRatio: aspectCss }}>
      <div className="gen-skel"></div>
      <div className="gen-grain"></div>
    </div>
    <div className="gen-stages">
      {DESK_STAGES.map(function (s, i) {
        return <div key={i} className={'gen-chip' + (i < idx ? ' done' : i === idx ? ' act' : '')}><i/></div>;
      })}
    </div>
    <div className="gen-stagerow">
      <div className="gen-stage-l"><span className="gen-dot"></span><span>{DESK_STAGES[idx].t}</span></div>
      <div className="gen-eta">≈ {eta} сек · {pct}%</div>
    </div>
    <div className="dk-canvas-es" style={{ marginTop: 8, textAlign: 'center' }}>
      {mode === 'video'
        ? 'Видео генерируется 2–3 минуты — можно продолжать работу, результат появится здесь и в «Истории».'
        : DESK_STAGES[idx].s}
    </div>
  </div>;
}


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 2. ВНУТРИ DeskGen, в правой панели заменить блок canvas==='generating'.

   БЫЛО:
     {canvas === 'generating' && <div className="dk-canvas-empty">
       <div className="gen-spinner"></div>
       <div className="dk-canvas-et" style={{ marginTop:18 }}>{task && (task.status === 'processing' || task.status === 'running') ? 'Генерация…' : 'В очереди…'}</div>
       <div className="dk-canvas-es">{mode === 'video' ? '…' : 'Обычно занимает 15–40 секунд.'}</div>
     </div>}

   СТАЛО:
   ─────────────────────────────────────────────────────────────────────── */

{canvas === 'generating' && <div className="dk-canvas-empty">
  <DeskStageCanvas mode={mode} aspectId={selectedAspect && selectedAspect.id}/>
</div>}

/* Остальные ветки (idle / done→DeskResult / error) НЕ меняем. */


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 3. (опционально, премиальнее) Проявление результата в DeskResult.
   В компоненте DeskResult добавить класс gen-media + .in на <img>/<video>,
   обернув их в <div className="dk-stage"> — тогда готовый кадр тоже
   «проступит» из размытия. Не обязательно; текущий вывод тоже корректен.
   ─────────────────────────────────────────────────────────────────────── */


/* ───────────────────────────────────────────────────────────────────────
   ШАГ 4. (CSS) Скопировать handoff/gen-canvas.css в КОНЕЦ
   webapp/public/app/ma-desktop.css.
   Классы используют var(--line)/var(--muted) — работают и в светлой, и в
   тёмной теме десктопа. Унификацию бренда (синий вместо жёлтого) НЕ делаем
   в этом патче — это отдельная задача по токенам ma.css.
   ─────────────────────────────────────────────────────────────────────── */
