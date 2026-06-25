/* ============ Hubicx live i18n ru/en/es/pt ============ */
(function(){
  const LANGS = ['ru','en','es','pt'];
  const LANG_NAMES = { ru:'Русский', en:'English', es:'Español', pt:'Português' };

  const TEXT = {
    en: {
      'Главная':'Home','Генерация':'Generation','Профиль':'Profile','Шаблоны':'Templates','Все':'All','Фото':'Photo','Видео':'Video',
      'Популярные шаблоны':'Popular templates','Быстрые идеи':'Quick ideas','Мои токены':'My tokens','Пополнить':'Top up','Пополнить токены':'Top up tokens',
      'Профиль':'Profile','LLM-модель':'LLM model','Язык':'Language','Тёмная тема':'Dark theme','Включена':'On','Выключена':'Off',
      'История генераций':'Generation history','История пока пустая':'History is empty','Создайте фото или видео — результаты появятся здесь':'Create a photo or video — results will appear here',
      'Личность Hubicx':'Hubicx personality','Стиль общения':'Communication style','Указать стиль общения':'Set communication style','Язык Hubicx':'Hubicx language','Указать язык Hubicx':'Set Hubicx language','Любимый эмодзи':'Favorite emoji','Черты характера':'Traits','Указать черты характера':'Set traits','О Вас':'About you','Имя':'Name','Указать имя':'Set name','Пол':'Gender','Возраст':'Age','Локация':'Location','Вид деятельности':'Activity','Интересы':'Interests','Часовой пояс':'Time zone','Настройки профиля':'Profile settings','Настройки':'Settings',
      'Создать фото':'Create photo','Создать видео':'Create video','Создать':'Create','Создаю…':'Creating…','Загрузить селфи или фото':'Upload selfie or photo','Загрузить фото для видео':'Upload photo for video','Нажмите или перетащите файл':'Tap or drag a file','Шаблон':'Template','Свой промпт':'Custom prompt','Детали':'Details','Модель':'Model','Соотношение сторон':'Aspect ratio','Качество':'Quality','Выберите модель':'Choose model','Выберите агента':'Choose agent','Выберите шаблон':'Choose template','Свой промпт':'Custom prompt','Назад':'Back','Результат':'Result','В Telegram':'To Telegram',
      'Видео-модели':'Video models','Скоро баннер':'Banner soon','Киношное движение из фото':'Cinematic motion from photo','Быстрое AI-видео нового поколения':'Fast next-gen AI video',
      'Текущий баланс:':'Current balance:','Готовые пакеты':'Ready packages','Своя сумма':'Custom amount','Оплата скоро будет доступна':'Payments coming soon','Скоро будет доступно':'Coming soon','Создаём платёж…':'Creating payment…','Оплатить':'Pay','Выгодно':'Best value',
      'Агент Hubicx':'Hubicx Agent','онлайн':'online','печатает…':'typing…','Сообщение…':'Message…','Копирайтер':'Copywriter','СММщик':'SMM manager','Маркетолог':'Marketer','Дизайнер':'Designer','Сценарист':'Screenwriter','Давинчи':'Da Vinci','Мыслитель':'Thinker','Редактор':'Editor','Промпт-мастер':'Prompt master','Обычный универсальный чат':'General universal chat','Тексты и офферы':'Texts and offers','Посты и контент-план':'Posts and content plan','Воронки и гипотезы':'Funnels and hypotheses','Визуал и брифы':'Visuals and briefs','Reels и AI-видео':'Reels and AI video','Креативные идеи':'Creative ideas','Стратегия и анализ':'Strategy and analysis','Улучшить текст':'Improve text','Промпты генераций':'Generation prompts','Агент меняет стиль следующих сообщений':'Agent changes the style of next messages',
      'Баланс токенов':'Token balance','Последние работы':'Recent works','Ваши работы появятся здесь':'Your works will appear here','Подписка':'Subscription','активна':'active','Лимит в день':'Daily limit','без лимита':'unlimited','Все модели':'All models','доступны':'available','Пригласить друга':'Invite a friend','Аккаунт':'Account','Выйти из аккаунта':'Log out'
    },
    es: {
      'Главная':'Inicio','Генерация':'Generación','Профиль':'Perfil','Шаблоны':'Plantillas','Все':'Todo','Фото':'Foto','Видео':'Vídeo',
      'Популярные шаблоны':'Plantillas populares','Быстрые идеи':'Ideas rápidas','Мои токены':'Mis tokens','Пополнить':'Recargar','Пополнить токены':'Recargar tokens',
      'LLM-модель':'Modelo LLM','Язык':'Idioma','Тёмная тема':'Tema oscuro','Включена':'Activado','Выключена':'Desactivado','История генераций':'Historial de generaciones','История пока пустая':'El historial está vacío','Создайте фото или видео — результаты появятся здесь':'Crea una foto o vídeo — los resultados aparecerán aquí',
      'Личность Hubicx':'Personalidad Hubicx','Стиль общения':'Estilo de comunicación','Указать стиль общения':'Definir estilo de comunicación','Язык Hubicx':'Idioma Hubicx','Указать язык Hubicx':'Definir idioma Hubicx','Любимый эмодзи':'Emoji favorito','Черты характера':'Rasgos','Указать черты характера':'Definir rasgos','О Вас':'Sobre ti','Имя':'Nombre','Указать имя':'Definir nombre','Пол':'Género','Возраст':'Edad','Локация':'Ubicación','Вид деятельности':'Actividad','Интересы':'Intereses','Часовой пояс':'Zona horaria','Настройки профиля':'Ajustes del perfil','Настройки':'Ajustes',
      'Создать фото':'Crear foto','Создать видео':'Crear vídeo','Создать':'Crear','Создаю…':'Creando…','Загрузить селфи или фото':'Subir selfie o foto','Загрузить фото для видео':'Subir foto para vídeo','Нажмите или перетащите файл':'Toca o arrastra un archivo','Шаблон':'Plantilla','Свой промпт':'Prompt propio','Детали':'Detalles','Модель':'Modelo','Соотношение сторон':'Relación de aspecto','Качество':'Calidad','Выберите модель':'Elige modelo','Выберите агента':'Elige agente','Выберите шаблон':'Elige plantilla','Назад':'Atrás','Результат':'Resultado','В Telegram':'A Telegram',
      'Видео-модели':'Modelos de vídeo','Скоро баннер':'Banner pronto','Киношное движение из фото':'Movimiento cinematográfico desde foto','Быстрое AI-видео нового поколения':'Vídeo AI rápido de nueva generación',
      'Текущий баланс:':'Saldo actual:','Готовые пакеты':'Paquetes listos','Своя сумма':'Importe propio','Оплата скоро будет доступна':'Pago disponible pronto','Скоро будет доступно':'Disponible pronto','Создаём платёж…':'Creando pago…','Оплатить':'Pagar','Выгодно':'Mejor oferta',
      'Агент Hubicx':'Agente Hubicx','онлайн':'en línea','печатает…':'escribiendo…','Сообщение…':'Mensaje…','Копирайтер':'Copywriter','СММщик':'SMM','Маркетолог':'Marketing','Дизайнер':'Diseñador','Сценарист':'Guionista','Давинчи':'Da Vinci','Мыслитель':'Pensador','Редактор':'Editor','Промпт-мастер':'Maestro de prompts','Обычный универсальный чат':'Chat universal','Тексты и офферы':'Textos y ofertas','Посты и контент-план':'Posts y plan de contenido','Воронки и гипотезы':'Embudos e hipótesis','Визуал и брифы':'Visuales y briefs','Reels и AI-видео':'Reels y vídeo AI','Креативные идеи':'Ideas creativas','Стратегия и анализ':'Estrategia y análisis','Улучшить текст':'Mejorar texto','Промпты генераций':'Prompts de generación','Агент меняет стиль следующих сообщений':'El agente cambia el estilo de los próximos mensajes',
      'Баланс токенов':'Saldo de tokens','Последние работы':'Trabajos recientes','Ваши работы появятся здесь':'Tus trabajos aparecerán aquí','Подписка':'Suscripción','активна':'activa','Лимит в день':'Límite diario','без лимита':'sin límite','Все модели':'Todos los modelos','доступны':'disponibles','Пригласить друга':'Invitar a un amigo','Аккаунт':'Cuenta','Выйти из аккаунта':'Salir'
    },
    pt: {
      'Главная':'Início','Генерация':'Geração','Профиль':'Perfil','Шаблоны':'Modelos','Все':'Tudo','Фото':'Foto','Видео':'Vídeo',
      'Популярные шаблоны':'Modelos populares','Быстрые идеи':'Ideias rápidas','Мои токены':'Meus tokens','Пополнить':'Recarregar','Пополнить токены':'Recarregar tokens',
      'LLM-модель':'Modelo LLM','Язык':'Idioma','Тёмная тема':'Tema escuro','Включена':'Ativado','Выключена':'Desativado','История генераций':'Histórico de gerações','История пока пустая':'Histórico vazio','Создайте фото или видео — результаты появятся здесь':'Crie uma foto ou vídeo — os resultados aparecerão aqui',
      'Личность Hubicx':'Personalidade Hubicx','Стиль общения':'Estilo de comunicação','Указать стиль общения':'Definir estilo de comunicação','Язык Hubicx':'Idioma Hubicx','Указать язык Hubicx':'Definir idioma Hubicx','Любимый эмодзи':'Emoji favorito','Черты характера':'Traços','Указать черты характера':'Definir traços','О Вас':'Sobre você','Имя':'Nome','Указать имя':'Definir nome','Пол':'Gênero','Возраст':'Idade','Локация':'Localização','Вид деятельности':'Atividade','Интересы':'Interesses','Часовой пояс':'Fuso horário','Настройки профиля':'Configurações do perfil','Настройки':'Configurações',
      'Создать фото':'Criar foto','Создать видео':'Criar vídeo','Создать':'Criar','Создаю…':'Criando…','Загрузить селфи или фото':'Enviar selfie ou foto','Загрузить фото для видео':'Enviar foto para vídeo','Нажмите или перетащите файл':'Toque ou arraste um arquivo','Шаблон':'Modelo','Свой промпт':'Prompt próprio','Детали':'Detalhes','Модель':'Modelo','Соотношение сторон':'Proporção','Качество':'Qualidade','Выберите модель':'Escolha o modelo','Выберите агента':'Escolha o agente','Выберите шаблон':'Escolha o modelo','Назад':'Voltar','Результат':'Resultado','В Telegram':'Para Telegram',
      'Видео-модели':'Modelos de vídeo','Скоро баннер':'Banner em breve','Киношное движение из фото':'Movimento cinematográfico da foto','Быстрое AI-видео нового поколения':'Vídeo AI rápido de nova geração',
      'Текущий баланс:':'Saldo atual:','Готовые пакеты':'Pacotes prontos','Своя сумма':'Valor próprio','Оплата скоро будет доступна':'Pagamento em breve','Скоро будет доступно':'Disponível em breve','Создаём платёж…':'Criando pagamento…','Оплатить':'Pagar','Выгодно':'Melhor oferta',
      'Агент Hubicx':'Agente Hubicx','онлайн':'online','печатает…':'digitando…','Сообщение…':'Mensagem…','Копирайтер':'Copywriter','СММщик':'SMM','Маркетолог':'Marketing','Дизайнер':'Designer','Сценарист':'Roteirista','Давинчи':'Da Vinci','Мыслитель':'Pensador','Редактор':'Editor','Промпт-мастер':'Mestre de prompts','Обычный универсальный чат':'Chat universal','Тексты и офферы':'Textos e ofertas','Посты и контент-план':'Posts e plano de conteúdo','Воронки и гипотезы':'Funis e hipóteses','Визуал и брифы':'Visuais e briefs','Reels и AI-видео':'Reels e vídeo AI','Креативные идеи':'Ideias criativas','Стратегия и анализ':'Estratégia e análise','Улучшить текст':'Melhorar texto','Промпты генераций':'Prompts de geração','Агент меняет стиль следующих сообщений':'O agente muda o estilo das próximas mensagens',
      'Баланс токенов':'Saldo de tokens','Последние работы':'Trabalhos recentes','Ваши работы появятся здесь':'Seus trabalhos aparecerão aqui','Подписка':'Assinatura','активна':'ativa','Лимит в день':'Limite diário','без лимита':'sem limite','Все модели':'Todos os modelos','доступны':'disponíveis','Пригласить друга':'Convidar amigo','Аккаунт':'Conta','Выйти из аккаунта':'Sair'
    }
  };

  function norm(lang){ lang=String(lang||'').slice(0,2).toLowerCase(); return LANGS.includes(lang) ? lang : 'ru'; }
  function detect(){
    try{ const p=JSON.parse(localStorage.getItem('hbx_profile_v1')||'{}'); if(p.lang){ const r={'Русский':'ru','English':'en','Español':'es','Português':'pt'}[p.lang]; if(r) return r; } }catch(e){}
    try{ const s=localStorage.getItem('hubicx-locale')||localStorage.getItem('hbx_lang')||localStorage.getItem('hubicx-language'); if(s) return norm(s); }catch(e){}
    try{ const tg=window.Telegram&&window.Telegram.WebApp; const lc=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.language_code; if(lc) return norm(lc); }catch(e){}
    return 'ru';
  }

  let current = detect();
  const originals = new WeakMap();
  let scheduled = false;

  function trText(base){
    const raw = String(base || '');
    if (current === 'ru') return raw;
    const trimmed = raw.trim();
    const dict = TEXT[current] || {};
    let out = dict[trimmed];
    if (!out) {
      out = raw
        .replace(/токенов/g, current === 'en' ? 'tokens' : current === 'es' ? 'tokens' : 'tokens')
        .replace(/генераций/g, current === 'en' ? 'generations' : current === 'es' ? 'generaciones' : 'gerações')
        .replace(/фото/g, current === 'en' ? 'photo' : current === 'es' ? 'foto' : 'foto')
        .replace(/видео/g, current === 'en' ? 'video' : current === 'es' ? 'vídeo' : 'vídeo');
      return out;
    }
    const pre = raw.match(/^\s*/)[0], post = raw.match(/\s*$/)[0];
    return pre + out + post;
  }

  function translateNode(node){
    if (!node) return;
    if (node.nodeType === 3) {
      const v = node.nodeValue;
      if (!v || !v.trim()) return;
      if (!originals.has(node)) originals.set(node, v);
      const base = originals.get(node);
      const next = trText(base);
      if (node.nodeValue !== next) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;
    ['placeholder','title','aria-label'].forEach(function(attr){
      if (!node.hasAttribute || !node.hasAttribute(attr)) return;
      const key = '__hbx_i18n_' + attr;
      if (!node[key]) node[key] = node.getAttribute(attr);
      node.setAttribute(attr, trText(node[key]));
    });
    for (let c=node.firstChild; c; c=c.nextSibling) translateNode(c);
  }
  function apply(){ scheduled = false; try{ document.documentElement.lang = current; translateNode(document.body); }catch(e){} }
  function schedule(){ if (scheduled) return; scheduled = true; setTimeout(apply, 0); }
  function setLang(lang){
    current = norm(lang);
    try{ localStorage.setItem('hubicx-locale', current); localStorage.setItem('hbx_lang', current); localStorage.setItem('hubicx-language', current); document.documentElement.lang=current; }catch(e){}
    schedule();
    window.dispatchEvent(new CustomEvent('hubicx:lang',{detail:{lang:current}}));
    return current;
  }
  function t(key){
    if (!key) return key;
    var entry = TEXT[current] && TEXT[current][key];
    if (entry !== undefined) return entry;
    entry = TEXT['ru'] && TEXT['ru'][key];
    return entry !== undefined ? entry : key;
  }
  window.HubicxI18n = { languages:LANGS, names:LANG_NAMES, norm, detect, getLang:function(){return current;}, setLang, t, apply:schedule };
  window.t = t;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  try{ new MutationObserver(schedule).observe(document.documentElement, { childList:true, subtree:true }); }catch(e){}
})();
