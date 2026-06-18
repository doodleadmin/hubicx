/* ============ Auth modal: login / register ============ */
function AuthModal({ initial='register', onClose }){
  const { Ic } = window.HBX;
  const [tab,setTab] = useState(initial);
  const [done,setDone] = useState(false);
  const [vals,setVals] = useState({ name:'', email:'', pass:'' });
  const set = (k)=>(e)=>setVals(v=>({...v,[k]:e.target.value}));
  const isReg = tab==='register';
  const valid = vals.email.includes('@') && vals.pass.length>=6 && (!isReg || vals.name.trim());

  function submit(){ if(!valid) return; setDone(true); }

  return <div className="lp-ov" onClick={onClose}>
    <div className="lp-auth" onClick={e=>e.stopPropagation()}>
      <button className="lp-auth-x" onClick={onClose}><Ic n="close" s={17}/></button>

      {done ? <div className="lp-ok">
        <div className="lp-ok-ic"><Ic n="check" s={28} c="#7faa9d" sw={2.6}/></div>
        <div className="lp-auth-h">{isReg?'Аккаунт создан':'С возвращением!'}</div>
        <div className="lp-auth-s">Это демо — в реальном продукте вы бы уже оказались внутри Hubicx.</div>
        <a className="lp-btn lp-btn-grad lp-btn-lg" href="../desktop/Hubicx Desktop.html" style={{marginTop:14}}>Открыть приложение <Ic n="arrow" s={18}/></a>
        <button className="lp-btn lp-btn-ghost" style={{marginTop:8}} onClick={onClose}>Закрыть</button>
      </div> : <>
        <div className="lp-auth-brand">
          <span className="lp-logo" style={{width:30,height:30,borderRadius:9,overflow:'hidden',boxShadow:'0 0 0 1px var(--line)'}}><img src="assets/logo.jpg" alt=""/></span>
          <b style={{fontSize:18,letterSpacing:'-.03em'}}>Hubicx</b>
        </div>
        <div className="lp-auth-h">{isReg?'Создайте аккаунт':'Войти в аккаунт'}</div>
        <div className="lp-auth-s">{isReg?'Старт бесплатный — 20 токенов в подарок':'Рады видеть вас снова'}</div>

        <button className="lp-btn lp-btn-tg lp-btn-lg" style={{width:'100%',marginTop:20}}>
          <Ic n="tg" s={19} c="#fff"/> Продолжить через Telegram
        </button>
        <div className="lp-auth-sep">или по email</div>

        <div className="lp-auth-tabs">
          <button className={!isReg?'on':''} onClick={()=>setTab('login')}>Вход</button>
          <button className={isReg?'on':''} onClick={()=>setTab('register')}>Регистрация</button>
        </div>

        {isReg && <div className="lp-field">
          <label>Имя</label>
          <input className="lp-input" placeholder="Как к вам обращаться" value={vals.name} onChange={set('name')}/>
        </div>}
        <div className="lp-field">
          <label>Email</label>
          <input className="lp-input" type="email" placeholder="you@example.com" value={vals.email} onChange={set('email')}/>
        </div>
        <div className="lp-field">
          <label>Пароль</label>
          <input className="lp-input" type="password" placeholder="Минимум 6 символов" value={vals.pass} onChange={set('pass')}
            onKeyDown={e=>{ if(e.key==='Enter') submit(); }}/>
        </div>

        <button className="lp-btn lp-btn-white lp-btn-lg" style={{width:'100%',marginTop:6,opacity:valid?1:.5}} onClick={submit}>
          {isReg?'Создать аккаунт':'Войти'} <Ic n="arrow" s={18}/>
        </button>

        <div className="lp-auth-foot">
          {isReg ? <>Уже есть аккаунт? <b onClick={()=>setTab('login')}>Войти</b></>
                 : <>Нет аккаунта? <b onClick={()=>setTab('register')}>Создать</b></>}
        </div>
        <div className="lp-auth-note">Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности Hubicx.</div>
      </>}
    </div>
  </div>;
}
window.HBX = window.HBX || {};
window.HBX.AuthModal = AuthModal;
