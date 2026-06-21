(function(){
  const DEFAULT_API_URL = 'https://api.hubicx.ru';
  const API_KEY = 'hubicx_admin_api_url';
  const TOKEN_KEY = 'hubicx_admin_token';
  const root = document.getElementById('root');
  const state = {tab:'overview', token:localStorage.getItem(TOKEN_KEY)||'', apiUrl:localStorage.getItem(API_KEY)||DEFAULT_API_URL, me:null, data:{}, loading:false, error:'', toast:'', filters:{users:'',tasksStatus:'',tasksUser:'',partnerSearch:'',partnerId:''}};
  const tabs = [
    ['overview','Обзор'],['users','Пользователи'],['tasks','Генерации'],['models','Модели'],['pricing','Цены'],['packages','Пакеты'],['transactions','Транзакции'],['files','Файлы'],['partners','Партнёры']
  ];
  function esc(v){return String(v??'').replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}
  function apiBase(){return String(state.apiUrl||DEFAULT_API_URL).replace(/\/$/,'');}
  function apiPath(p){return `${apiBase()}${p.startsWith('/api/')?p:'/api'+(p.startsWith('/')?p:'/'+p)}`;}
  async function request(path,opt={}){
    const headers = {'Content-Type':'application/json', ...(opt.headers||{})};
    if(state.token) headers.Authorization = `Bearer ${state.token}`;
    const res = await fetch(apiPath(path), {...opt, headers, cache:'no-store'});
    const ct = res.headers.get('content-type')||'';
    const body = ct.includes('application/json') ? await res.json().catch(()=>({})) : await res.text().catch(()=>'');
    if(!res.ok){ const msg = typeof body==='string'?body:(body.detail||body.message||'Ошибка запроса'); throw new Error(msg); }
    return body;
  }
  function set(patch){Object.assign(state,patch); render();}
  function toast(msg){set({toast:msg}); setTimeout(()=>{state.toast=''; render();},2600);}
  async function boot(){ if(!state.token) return render(); try{state.me=(await request('/admin/auth/me')).user; await loadTab('overview', false);}catch(e){localStorage.removeItem(TOKEN_KEY); state.token=''; state.error='Сессия истекла. Войдите снова.'; render();}}
  async function login(ev){ev.preventDefault(); const fd=new FormData(ev.target); const apiUrl=String(fd.get('apiUrl')||DEFAULT_API_URL).trim(); const password=String(fd.get('password')||''); state.apiUrl=apiUrl; localStorage.setItem(API_KEY,apiUrl); try{set({loading:true,error:''}); const r=await request('/admin/auth/login',{method:'POST',body:JSON.stringify({password})}); state.token=r.token; state.me=r.user; localStorage.setItem(TOKEN_KEY,r.token); await loadTab('overview', false); toast('Вход выполнен');}catch(e){set({error:e.message,loading:false});}}
  function logout(){localStorage.removeItem(TOKEN_KEY); state.token=''; state.me=null; state.data={}; render();}
  async function loadTab(tab=state.tab, rerender=true){state.tab=tab; state.loading=true; state.error=''; if(rerender) render(); try{
    if(tab==='overview'){
      const [users,tasks,errors,models,tx,files]=await Promise.all([request('/admin/users?limit=5'),request('/admin/tasks?limit=5'),request('/admin/errors?limit=5'),request('/admin/models'),request('/admin/transactions?limit=5'),request('/admin/files?limit=5')]);
      state.data.overview={users,tasks,errors,models,tx,files};
    } else if(tab==='users') state.data.users=await request('/admin/users?limit=100');
    else if(tab==='tasks'){
      const qs=new URLSearchParams({limit:'100'}); if(state.filters.tasksStatus) qs.set('status',state.filters.tasksStatus); if(state.filters.tasksUser) qs.set('user_id',state.filters.tasksUser);
      state.data.tasks=await request('/admin/tasks?'+qs.toString());
    } else if(tab==='models') state.data.models=await request('/admin/models');
    else if(tab==='pricing') state.data.pricing=await request('/admin/model-pricing');
    else if(tab==='packages') state.data.packages=await request('/admin/token-packages');
    else if(tab==='transactions') state.data.transactions=await request('/admin/transactions?limit=100');
    else if(tab==='files') state.data.files=await request('/admin/files?limit=100');
    else if(tab==='partners'){ state.data.partners=await request('/admin/referral/partners'); state.data.partnerRates=await request('/admin/referral/rates'); }
    state.loading=false; render();
  }catch(e){set({loading:false,error:e.message});}}
  function nav(){return tabs.map(([id,label])=>`<button data-tab="${id}" class="${state.tab===id?'active':''}">${label}</button>`).join('');}
  function layout(content){return `<div class="app"><aside class="sidebar"><div class="brand"><div class="logo">H</div><div><h2>Hubicx Admin</h2><p>${esc(state.me?.username?'@'+state.me.username:'browser panel')}</p></div></div><nav class="nav">${nav()}</nav></aside><main class="main"><div class="topbar"><div><h1>${esc(tabs.find(t=>t[0]===state.tab)?.[1]||'Admin')}</h1><p class="muted">${esc(apiBase())}</p></div><div class="toolbar"><button class="btn secondary" data-action="refresh">Обновить</button><button class="btn danger" data-action="logout">Выйти</button></div></div>${state.error?`<div class="card error">${esc(state.error)}</div>`:''}${state.loading?'<div class="card">Загрузка...</div>':content}</main><nav class="mobile-nav">${nav()}</nav>${state.toast?`<div class="toast">${esc(state.toast)}</div>`:''}</div>`;}
  function loginView(){return `<div class="admin-login"><form class="login-card" id="loginForm"><div class="logo">H</div><h1>Hubicx Admin</h1><p class="muted">Браузерная админка. Работает на desktop и mobile, без Telegram.</p><label class="field"><span>API URL</span><input class="input" name="apiUrl" value="${esc(state.apiUrl)}"/></label><label class="field"><span>Admin password</span><input class="input" name="password" type="password" autocomplete="current-password" autofocus/></label><button class="btn" style="margin-top:18px" ${state.loading?'disabled':''}>Войти</button>${state.error?`<div class="error">${esc(state.error)}</div>`:''}</form></div>`;}
  function badge(v){const s=String(v??''); const cls=s==='completed'||s==='paid'||s==='true'||s==='active'?'ok':(s==='failed'||s==='refunded'||s==='false'||s==='blocked'?'bad':'warn'); return `<span class="pill ${cls}">${esc(s)}</span>`;}
  function table(headers, rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${headers.length}">Нет данных</td></tr>`}</tbody></table></div>`;}
  function overview(){const d=state.data.overview||{}; const totalUsers=d.users?.total||0, totalTasks=d.tasks?.total||0, errors=d.errors?.total||0, models=(d.models||[]).length; return layout(`<section class="cards"><div class="card"><div class="metric">${totalUsers}</div><div class="metric-label">Пользователей</div></div><div class="card"><div class="metric">${totalTasks}</div><div class="metric-label">Генераций</div></div><div class="card"><div class="metric">${errors}</div><div class="metric-label">Ошибок</div></div><div class="card"><div class="metric">${models}</div><div class="metric-label">Моделей</div></div></section><div class="grid2"><div class="card"><h3>Последние задачи</h3>${miniTasks(d.tasks?.items||[])}</div><div class="card"><h3>Последние пользователи</h3>${miniUsers(d.users?.items||[])}</div></div>`);}
  function miniTasks(items){return items.map(t=>`<p>#${t.id} ${badge(t.status)} ${esc(t.model_code||'')} <span class="muted">${esc(t.cost_credits)} cr</span></p>`).join('')||'<p class="muted">Нет задач</p>';}
  function miniUsers(items){return items.map(u=>`<p><b>${esc(u.username?'@'+u.username:u.telegram_id)}</b> <span class="muted">${esc(u.balance_credits)} cr</span></p>`).join('')||'<p class="muted">Нет пользователей</p>';}
  function usersView(){let items=state.data.users?.items||[]; const q=state.filters.users.toLowerCase(); if(q) items=items.filter(u=>String(u.telegram_id).includes(q)||String(u.username||'').toLowerCase().includes(q)||String(u.first_name||'').toLowerCase().includes(q)); return layout(`<div class="toolbar"><input class="input" data-filter="users" placeholder="Поиск: telegram_id / username" value="${esc(state.filters.users)}"/></div>${table(['ID','Telegram','Username','Баланс','Admin','Действия'],items.map(u=>`<tr><td>${u.id}</td><td>${u.telegram_id}</td><td>${esc(u.username||u.first_name||'')}</td><td><b>${u.balance_credits}</b></td><td>${badge(u.is_admin)}</td><td><button class="btn small" data-action="balance" data-user="${u.id}" data-name="${esc(u.username||u.telegram_id)}">Баланс</button> <button class="btn small secondary" data-action="ledger" data-user="${u.id}">Ledger</button></td></tr>`))}`);}
  function tasksView(){const items=state.data.tasks?.items||[]; return layout(`<div class="toolbar"><select class="select" data-filter="tasksStatus"><option value="">Все статусы</option>${['created','processing','completed','failed','refunded'].map(s=>`<option ${state.filters.tasksStatus===s?'selected':''}>${s}</option>`).join('')}</select><input class="input" data-filter="tasksUser" placeholder="user_id" value="${esc(state.filters.tasksUser)}"/><button class="btn secondary" data-action="applyTasks">Применить</button></div>${table(['ID','User','Модель','Тип','Статус','Цена','Ошибка','Создано'],items.map(t=>`<tr data-action="task" data-id="${t.id}"><td>#${t.id}</td><td>${esc(t.telegram_id||t.user_id)}</td><td>${esc(t.model_code||t.model_title||'')}</td><td>${esc(t.task_type)}</td><td>${badge(t.status)}</td><td>${esc(t.cost_credits)}</td><td>${esc(t.error_message||'')}</td><td>${esc(t.created_at||'')}</td></tr>`))}`);}
  function modelsView(){const items=state.data.models||[]; return layout(`${table(['Code','Название','Категория','Provider','Цена','Active','Действия'],items.map(m=>`<tr><td><b>${esc(m.code)}</b></td><td>${esc(m.title)}</td><td>${esc(m.category)}</td><td>${esc(m.provider)}</td><td>${esc(m.price_credits)}</td><td>${badge(m.is_active)}</td><td><button class="btn small" data-action="modelPrice" data-code="${esc(m.code)}" data-price="${esc(m.price_credits)}">Цена</button> <button class="btn small secondary" data-action="toggleModel" data-code="${esc(m.code)}" data-active="${m.is_active?'false':'true'}">${m.is_active?'Выключить':'Включить'}</button></td></tr>`))}`);}
  function pricingView(){const items=state.data.pricing||[]; return layout(`${table(['Модель','Название','Категория','Цена','Enabled','Featured','Заметка'],items.map(p=>`<tr><td><b>${esc(p.model_code)}</b></td><td>${esc(p.display_name)}</td><td>${esc(p.category)}</td><td>${esc(p.price_tokens)}</td><td>${badge(p.is_enabled)}</td><td>${badge(p.is_featured)}</td><td>${esc(p.admin_note||'')}</td></tr>`))}`);}
  function packagesView(){const items=state.data.packages||[]; return layout(`${table(['Code','Название','Tokens','Цена ₽','Бонус','Active'],items.map(p=>`<tr><td><b>${esc(p.code)}</b></td><td>${esc(p.title)}</td><td>${esc(p.tokens||p.total_tokens||'')}</td><td>${esc(p.price_rub)}</td><td>${esc(p.bonus_tokens||0)}</td><td>${badge(p.is_active)}</td></tr>`))}`);}
  function transactionsView(){const items=state.data.transactions?.items||[]; return layout(`${table(['ID','User','Тип','Сумма','Статус','Комментарий','Дата'],items.map(t=>`<tr><td>${t.id}</td><td>${t.user_id}</td><td>${esc(t.type)}</td><td>${esc(t.amount_credits)}</td><td>${badge(t.status)}</td><td>${esc(t.comment||'')}</td><td>${esc(t.created_at||'')}</td></tr>`))}`);}
  function filesView(){const items=state.data.files?.items||[]; return layout(`${table(['ID','User','Type','Purpose','MIME','Size','URL'],items.map(f=>`<tr><td>${f.id}</td><td>${f.user_id}</td><td>${esc(f.file_type)}</td><td>${esc(f.purpose)}</td><td>${esc(f.mime_type||'')}</td><td>${esc(f.size_bytes||'')}</td><td><a href="${esc(f.storage_url)}" target="_blank">open</a></td></tr>`))}`);}

  // ── Partners view ──
  function partnersView(){
    const items = state.data.partners || [];
    const rates = state.data.partnerRates || [];
    const q = state.filters.partnerSearch.toLowerCase();
    let filtered = items;
    if(q) filtered = items.filter(p => (p.code||'').toLowerCase().includes(q) || (p.name||'').toLowerCase().includes(q));
    const rateByCat = {};
    rates.forEach(r => { if(!r.partner_id) rateByCat[r.category] = r.rate_percent; });
    return layout(`<div class="toolbar">
      <input class="input" data-filter="partnerSearch" placeholder="Поиск партнёра" value="${esc(state.filters.partnerSearch)}"/>
      <button class="btn" data-action="newPartner">+ Новый партнёр</button>
      <button class="btn secondary" data-action="editRates">Ставки комиссий</button>
    </div>
    <div class="cards" style="margin-bottom:18px">
      <div class="card"><div class="metric">${rateByCat.token_topup||0}%</div><div class="metric-label">Токены</div></div>
      <div class="card"><div class="metric">${rateByCat.template_subscription||0}%</div><div class="metric-label">Шаблоны</div></div>
      <div class="card"><div class="metric">${rateByCat.full_subscription||0}%</div><div class="metric-label">Общие тарифы</div></div>
    </div>
    ${table(['Code','Название','Статус','Контакты','Переходы','Регистрации','Комиссия','Действия'],
      filtered.map(p=>`<tr>
        <td><b>${esc(p.code)}</b></td>
        <td>${esc(p.name)}</td>
        <td>${badge(p.status)}</td>
        <td>${esc((p.contact_info||{}).telegram||(p.contact_info||{}).email||'')}</td>
        <td>${p.total_clicks||0}</td>
        <td>${p.total_conversions||0}</td>
        <td>${esc(p.total_commission||0)} ₽</td>
        <td>
          <button class="btn small" data-action="editPartner" data-id="${p.id}" data-code="${esc(p.code)}" data-name="${esc(p.name)}" data-status="${esc(p.status)}" data-contact="${esc(JSON.stringify(p.contact_info||{}))}">Ред.</button>
          <button class="btn small secondary" data-action="partnerStats" data-id="${p.id}" data-code="${esc(p.code)}">Стат.</button>
          <button class="btn small danger" data-action="togglePartner" data-id="${p.id}" data-status="${p.status==='active'?'blocked':'active'}">${p.status==='active'?'Блок.':(p.status==='blocked'?'Акт.':'Акт.')}</button>
        </td>
      </tr>`)
    )}`);
  }

  function modal(title, body){document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="modal"><div class="modal"><div class="modal-head"><h2>${esc(title)}</h2><button class="btn small secondary" data-action="closeModal">Закрыть</button></div>${body}</div></div>`);}

  async function handleClick(e){const el=e.target.closest('[data-tab],[data-action]'); if(!el) return; const tab=el.dataset.tab, a=el.dataset.action; if(tab) return loadTab(tab); if(a==='refresh') return loadTab(); if(a==='logout') return logout(); if(a==='applyTasks') return loadTab('tasks'); if(a==='closeModal') return document.getElementById('modal')?.remove();
    if(a==='balance'){ const amount=prompt('Сумма изменения баланса (+/-):','1000'); if(!amount) return; const reason=prompt('Причина:','Admin adjustment')||'Admin adjustment'; await request(`/admin/users/${el.dataset.user}/balance-adjust`,{method:'POST',body:JSON.stringify({amount:Number(amount),reason})}); toast('Баланс обновлён'); return loadTab('users'); }
    if(a==='ledger'){ const r=await request(`/admin/users/${el.dataset.user}/balance-ledger?limit=30`); return modal('Balance ledger', table(['Операция','Сумма','До','После','Причина','Дата'],r.items.map(x=>`<tr><td>${esc(x.operation_type)}</td><td>${esc(x.amount)}</td><td>${esc(x.balance_before)}</td><td>${esc(x.balance_after)}</td><td>${esc(x.reason||'')}</td><td>${esc(x.created_at||'')}</td></tr>`))); }
    if(a==='task'){ const r=await request(`/admin/generation-tasks/${el.dataset.id}`); return modal(`Задача #${r.id}`, `<div class="pre">${esc(JSON.stringify(r,null,2))}</div>`); }
    if(a==='modelPrice'){ const price=prompt(`Новая цена для ${el.dataset.code}:`, el.dataset.price||'0'); if(price===null) return; await request(`/admin/models/${encodeURIComponent(el.dataset.code)}/price?price_credits=${encodeURIComponent(price)}`,{method:'POST',body:'{}'}); toast('Цена обновлена'); return loadTab('models'); }
    if(a==='toggleModel'){ await request(`/admin/models/${encodeURIComponent(el.dataset.code)}/toggle?is_active=${encodeURIComponent(el.dataset.active)}`,{method:'POST',body:'{}'}); toast('Статус модели обновлён'); return loadTab('models'); }

    // ── Partner actions ──
    if(a==='newPartner'){
      return modal('Новый партнёр', `<form id="partnerForm" style="display:grid;gap:14px">
        <label class="field"><span>Код (уникальный)</span><input class="input" name="code" placeholder="blogger123" required/></label>
        <label class="field"><span>Имя</span><input class="input" name="name" placeholder="Иван Петров" required/></label>
        <label class="field"><span>Telegram (без @)</span><input class="input" name="telegram" placeholder="blogger"/></label>
        <button class="btn" type="submit">Создать</button>
      </form>`);
      document.getElementById('partnerForm').onsubmit = async function(ev){ev.preventDefault(); const fd=new FormData(ev.target); const code=fd.get('code'), name=fd.get('name'), tg=fd.get('telegram')||''; try{await request('/admin/referral/partners',{method:'POST',body:JSON.stringify({code,name,status:'active',contact_info:{telegram:'@'+tg}})}); document.getElementById('modal')?.remove(); toast('Партнёр создан'); loadTab('partners');}catch(e){alert(e.message);}};
    }
    if(a==='editPartner'){
      const id=el.dataset.id, code=el.dataset.code, name=el.dataset.name, status=el.dataset.status; let contact={}; try{contact=JSON.parse(el.dataset.contact)}catch(e){}
      return modal('Редактировать партнёра', `<form id="editPartnerForm" style="display:grid;gap:14px">
        <label class="field"><span>Код</span><input class="input" name="code" value="${esc(code)}" required/></label>
        <label class="field"><span>Имя</span><input class="input" name="name" value="${esc(name)}" required/></label>
        <label class="field"><span>Статус</span><select class="select" name="status"><option value="active" ${status==='active'?'selected':''}>active</option><option value="paused" ${status==='paused'?'selected':''}>paused</option><option value="blocked" ${status==='blocked'?'selected':''}>blocked</option></select></label>
        <label class="field"><span>Telegram</span><input class="input" name="telegram" value="${esc((contact.telegram||'').replace('@',''))}"/></label>
        <button class="btn" type="submit">Сохранить</button>
      </form>`);
      document.getElementById('editPartnerForm').onsubmit = async function(ev){ev.preventDefault(); const fd=new FormData(ev.target); const body={code:fd.get('code'),name:fd.get('name'),status:fd.get('status'),contact_info:{telegram:'@'+fd.get('telegram')}}; try{await request('/admin/referral/partners/'+id,{method:'PUT',body:JSON.stringify(body)}); document.getElementById('modal')?.remove(); toast('Партнёр обновлён'); loadTab('partners');}catch(e){alert(e.message);}};
    }
    if(a==='togglePartner'){
      const id=el.dataset.id, newStatus=el.dataset.status;
      try{await request('/admin/referral/partners/'+id,{method:'PUT',body:JSON.stringify({status:newStatus})}); toast('Статус изменён'); loadTab('partners');}catch(e){alert(e.message);}
    }
    if(a==='partnerStats'){
      const id=el.dataset.id, code=el.dataset.code;
      try{const r=await request('/admin/referral/stats?partner_id='+id); return modal(`Статистика: ${code}`, `<div class="cards"><div class="card"><div class="metric">${r.total_clicks||0}</div><div class="metric-label">Переходы</div></div><div class="card"><div class="metric">${r.total_conversions||0}</div><div class="metric-label">Регистрации</div></div><div class="card"><div class="metric">${r.total_commission||0} ₽</div><div class="metric-label">Комиссия</div></div></div>`);}catch(e){alert(e.message);}
    }
    if(a==='editRates'){
      const rates = state.data.partnerRates || [];
      const rateByCat = {};
      rates.forEach(r => { if(!r.partner_id) rateByCat[r.category] = r.rate_percent; });
      return modal('Ставки комиссий (по умолчанию)', `<form id="ratesForm" style="display:grid;gap:14px">
        <label class="field"><span>Пополнение токенов (%)</span><input class="input" name="token_topup" type="number" min="0" max="100" value="${rateByCat.token_topup||0}"/></label>
        <label class="field"><span>Подписка на шаблоны (%)</span><input class="input" name="template_subscription" type="number" min="0" max="100" value="${rateByCat.template_subscription||0}"/></label>
        <label class="field"><span>Полные тарифы (%)</span><input class="input" name="full_subscription" type="number" min="0" max="100" value="${rateByCat.full_subscription||0}"/></label>
        <button class="btn" type="submit">Сохранить</button>
      </form>`);
      document.getElementById('ratesForm').onsubmit = async function(ev){ev.preventDefault(); const fd=new FormData(ev.target); const cats={token_topup:'token_topup',template_subscription:'template_subscription',full_subscription:'full_subscription'}; try{for(const [key,cat] of Object.entries(cats)){const v=parseFloat(fd.get(key))||0; await request('/admin/referral/rates',{method:'PUT',body:JSON.stringify({category:cat,rate_percent:v})});} document.getElementById('modal')?.remove(); toast('Ставки обновлены'); loadTab('partners');}catch(e){alert(e.message);}};
    }
  }
  function handleInput(e){const k=e.target.dataset.filter; if(!k) return; state.filters[k]=e.target.value; if(k==='users'||k==='partnerSearch') render();}
  function render(){ if(!state.token){root.innerHTML=loginView(); document.getElementById('loginForm')?.addEventListener('submit',login); return;} const map={overview,users:usersView,tasks:tasksView,models:modelsView,pricing:pricingView,packages:packagesView,transactions:transactionsView,files:filesView,partners:partnersView}; root.innerHTML=(map[state.tab]||overview)(); root.onclick=handleClick; root.oninput=handleInput; }
  boot();
})();
