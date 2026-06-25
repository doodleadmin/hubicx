/* ============ API adapter — connects to api.hubicx.ru ============ */
(function() {
  var TIMEOUT_MS = 12000;
  var UPLOAD_TIMEOUT_MS = 120000;
  var TELEGRAM_ERROR = 'Откройте приложение через Telegram-бота';
  var BROWSER_LOGIN_ERROR = 'Войдите в аккаунт для продолжения';
  var SSE_TIMEOUT_MS = 120000;

  var TOKEN_KEY = 'hubicx_jwt';

  function host() {
    try { return String(window.location && window.location.hostname || '').toLowerCase(); } catch (e) { return ''; }
  }

  function apiBase() { var h = host(); if (h === 'hubicx.ru' || h === 'www.hubicx.ru' || h === 'webapp.hubicx.ru' || h === 'app.hubicx.ru' || h === 'admin.hubicx.ru') return ''; return 'https://api.hubicx.ru'; }
  function isMiniAppHost() {
    if (window.HUBICX_APP_CONTEXT === 'telegram' || host() === 'webapp.hubicx.ru') return true;
    if (window.HUBICX_APP_CONTEXT === 'auto') {
      var tg = window.Telegram && window.Telegram.WebApp;
      return !!(tg && tg.initData);
    }
    return false;
  }

  function isBrowserHost() {
    var h = host();
    return window.HUBICX_APP_CONTEXT === 'browser' || h === 'app.hubicx.ru' || h === 'hubicx.ru' || h === 'www.hubicx.ru';
  }

  function getInitData() {
    // Telegram initData is valid only for the Telegram Mini App product.
    // app.hubicx.ru is a standalone browser product and must not authorize via initData.
    if (isBrowserHost()) return '';
    var tg = window.Telegram && window.Telegram.WebApp;
    return (isMiniAppHost() && tg) ? (tg.initData || '') : '';
  }

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }
  function setToken(t) {
    try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  }

  // Auth headers: Telegram initData takes priority, otherwise JWT Bearer (desktop).
  function authHeaders() {
    var initData = getInitData();
    if (initData) return { 'X-Telegram-Init-Data': initData };
    if (isMiniAppHost()) return null;
    var token = getToken();
    if (token) return { 'Authorization': 'Bearer ' + token };
    return null;
  }

  function requestPublic(path, opts) {
    opts = opts || {};
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, TIMEOUT_MS);
    var headers = { 'Content-Type': 'application/json' };
    var initData = getInitData();
    if (initData) headers['X-Telegram-Init-Data'] = initData;
    return fetch(apiBase() + '/api' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body || undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      clearTimeout(timer);
      if (!res.ok) return res.json().catch(function() { return {}; }).then(function(err) {
        return Promise.reject({ code: String(err.code || ''), message: String(err.detail || 'Ошибка запроса'), status: res.status });
      });
      return res.json();
    }, function(err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') return Promise.reject({ code: 'timeout', message: 'Превышено время ожидания' });
      return Promise.reject({ code: 'network', message: 'Нет соединения с сервером' });
    });
  }

  function request(path, opts) {
    opts = opts || {};
    var auth = authHeaders();
    if (!auth) return Promise.reject({ code: 'unauthorized', message: isBrowserHost() ? BROWSER_LOGIN_ERROR : TELEGRAM_ERROR });

    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, TIMEOUT_MS);
    var headers = { 'Content-Type': 'application/json' };
    var ak = Object.keys(auth);
    for (var a = 0; a < ak.length; a++) headers[ak[a]] = auth[ak[a]];
    if (opts.headers) {
      var k = Object.keys(opts.headers);
      for (var i = 0; i < k.length; i++) headers[k[i]] = opts.headers[k[i]];
    }

    return fetch(apiBase() + '/api' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body || undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      clearTimeout(timer);
      if (!res.ok) {
        return res.json().catch(function() { return {}; }).then(function(err) {
          var code = String(err.code || '');
          var msg = String(err.detail || 'Ошибка запроса');
          if (res.status === 401) code = 'unauthorized';
          return Promise.reject({ code: code, message: msg, status: res.status });
        });
      }
      return res.json();
    }, function(err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') return Promise.reject({ code: 'timeout', message: 'Превышено время ожидания' });
      if (err && err.code) return Promise.reject(err);
      return Promise.reject({ code: 'network', message: 'Нет соединения с сервером' });
    });
  }

  function inferImageType(file) {
    var type = (file && file.type ? String(file.type) : '').toLowerCase();
    if (type) return type;
    var name = (file && file.name ? String(file.name) : '').toLowerCase();
    if (/\.jpe?g$/.test(name)) return 'image/jpeg';
    if (/\.png$/.test(name)) return 'image/png';
    if (/\.webp$/.test(name)) return 'image/webp';
    if (/\.gif$/.test(name)) return 'image/gif';
    if (/\.heic$/.test(name)) return 'image/heic';
    if (/\.heif$/.test(name)) return 'image/heif';
    return type;
  }

  function canCanvasCompress(file) {
    var type = inferImageType(file);
    return /^image\/(jpeg|jpg|png|webp)$/i.test(type || '') && file && file.size > 900 * 1024;
  }

  function compressImageForUpload(file) {
    if (!canCanvasCompress(file)) return Promise.resolve(file);
    return new Promise(function(resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function() {
        try {
          var maxSide = 2200;
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = Math.min(1, maxSide / Math.max(w, h));
          var nw = Math.max(1, Math.round(w * scale));
          var nh = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = nw;
          canvas.height = nh;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, nw, nh);
          URL.revokeObjectURL(url);
          canvas.toBlob(function(blob) {
            if (!blob) return resolve(file);
            // If compression did not help, keep the original file.
            if (blob.size >= file.size && file.size <= 18 * 1024 * 1024) return resolve(file);
            var name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
            try { resolve(new File([blob], name, { type: 'image/jpeg' })); }
            catch(e) { blob.name = name; resolve(blob); }
          }, 'image/jpeg', 0.86);
        } catch(e) {
          try { URL.revokeObjectURL(url); } catch(_) {}
          resolve(file);
        }
      };
      img.onerror = function() { try { URL.revokeObjectURL(url); } catch(_) {} resolve(file); };
      img.src = url;
    });
  }

  // File upload — multipart/form-data, no JSON Content-Type
  function uploadFile(file) {
    var auth = authHeaders();
    if (!auth) return Promise.reject({ code: 'unauthorized', message: TELEGRAM_ERROR });
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, UPLOAD_TIMEOUT_MS);
    return compressImageForUpload(file).then(function(uploadFileObj) {
      var formData = new FormData();
      var type = inferImageType(uploadFileObj) || (uploadFileObj && uploadFileObj.type) || 'application/octet-stream';
      var name = (uploadFileObj && uploadFileObj.name) || (file && file.name) || 'upload';
      if (uploadFileObj && uploadFileObj.type) formData.append('file', uploadFileObj, name);
      else formData.append('file', new Blob([uploadFileObj], { type: type }), name);
      return fetch(apiBase() + '/api/files/upload', {
        method: 'POST',
        headers: auth,
        body: formData,
        signal: ctrl.signal,
        cache: 'no-store',
      }).then(function(res) {
        clearTimeout(timer);
        if (!res.ok) {
          return res.json().catch(function() { return {}; }).then(function(err) {
            return Promise.reject({ code: String(err.code || ''), status: res.status, message: String(err.detail || 'Ошибка загрузки файла') });
          });
        }
        return res.json();
      }, function(err) {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') return Promise.reject({ code: 'timeout', message: 'Файл загружается слишком долго. Попробуйте выбрать фото меньшего размера.' });
        return Promise.reject({ code: 'network', message: 'Ошибка загрузки' });
      });
    }).catch(function(err) {
      clearTimeout(timer);
      if (err && err.code) return Promise.reject(err);
      return Promise.reject({ code: 'upload_prepare_failed', message: 'Не удалось подготовить файл к загрузке' });
    });
  }

  // SSE streaming for agent chat
  function agentStreamMessage(chatId, content, onChunk, onDone, onError) {
    var auth = authHeaders();
    if (!auth) { if (onError) onError(TELEGRAM_ERROR); return null; }
    var sseHeaders = { 'Content-Type': 'application/json' };
    var ak = Object.keys(auth);
    for (var a = 0; a < ak.length; a++) sseHeaders[ak[a]] = auth[ak[a]];

    var ctrl = new AbortController();
    var sseTimer = setTimeout(function() { ctrl.abort(); }, SSE_TIMEOUT_MS);

    fetch(apiBase() + '/api/agent/chats/' + chatId + '/stream', {
      method: 'POST',
      headers: sseHeaders,
      body: JSON.stringify({ content: content }),
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      if (!res.ok) {
        clearTimeout(sseTimer);
        return res.json().catch(function() { return {}; }).then(function(err) {
          if (onError) onError(String(err.detail || 'Ошибка чата'));
        });
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';

      function read() {
        reader.read().then(function(result) {
          if (result.done) { clearTimeout(sseTimer); if (onDone) onDone(); return; }
          buf += decoder.decode(result.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line.startsWith('data:')) continue;
            var raw = line.slice(5).trim();
            if (raw === '[DONE]') { clearTimeout(sseTimer); if (onDone) onDone(); return; }
            try {
              var obj = JSON.parse(raw);
              if (obj.error) { if (onError) onError(obj.error); return; }
              if (obj.text && onChunk) onChunk(obj.text);
            } catch(e) {}
          }
          read();
        }).catch(function(err) {
          if (err && err.name === 'AbortError') return;
          if (onError) onError('Соединение прервано');
        });
      }
      read();
    }).catch(function(err) {
      if (err && err.name === 'AbortError') return;
      if (onError) onError('Нет соединения с сервером');
    });

    return ctrl;
  }

  window.HubicxApi = {
    hasAuth:        function()          { return !!getInitData() || (!isMiniAppHost() && !!getToken()); },
    isTelegram:     function()          { return !!getInitData(); },
    isMiniAppHost:  isMiniAppHost,
    isBrowserHost:  isBrowserHost,
    getToken:       getToken,
    setToken:       setToken,
    logout:         function()          { setToken(''); },
    register:       function(email, password, firstName) {
      return requestPublic('/auth/register', { method:'POST', body:JSON.stringify({ email:email, password:password, first_name:firstName || null }) })
        .then(function(data) { if (data && data.token) setToken(data.token); return data; });
    },
    login:          function(email, password) {
      return requestPublic('/auth/login', { method:'POST', body:JSON.stringify({ email:email, password:password }) })
        .then(function(data) { if (data && data.token) setToken(data.token); return data; });
    },
    linkEmail:      function(email, password) {
      return request('/auth/link-email', { method:'POST', body:JSON.stringify({ email:email, password:password }) });
    },
    linkTelegram:   function(email, password) {
      return request('/auth/link-telegram', { method:'POST', body:JSON.stringify({ email:email, password:password }) })
        .then(function(data) { if (data && data.token) setToken(data.token); return data; });
    },
    me:             function()          { return request('/auth/me'); },
    pricing:        function()          { return request('/pricing'); },
    bonuses:        function()          { return request('/bonuses'); },
    claimBonus:     function(code)      { return request('/bonuses/' + encodeURIComponent(code) + '/claim', { method:'POST', body:'{}' }); },
    trackRef:       function(refCode)   { return request('/admin/referral/track', { method:'POST', body: JSON.stringify({ ref_code: refCode }) }); },
    profile:        function()          { return request('/profile'); },
    updateProfile:  function(data)      { return request('/profile', { method:'PATCH', body:JSON.stringify(data) }); },
    models:         function(category)  { return requestPublic('/models' + (category ? '?category=' + encodeURIComponent(category) : '')); },
    history:        function()          { return request('/generations/history'); },
    createGeneration: function(p)       { return request('/generations', { method:'POST', body:JSON.stringify(p) }); },
    getTask:        function(id)        { return request('/generations/' + id); },
    sendToChat:     function(taskId)    { return request('/generations/' + taskId + '/send-to-chat', { method:'POST', body:'{}' }); },
    uploadFile:     uploadFile,
    agentChats:     function()          { return request('/agent/chats'); },
    agentCreateChat: function(mode, firstMessage) {
      return request('/agent/chats', { method:'POST', body:JSON.stringify({ agent_mode: mode || 'default', first_message: firstMessage }) });
    },
    agentGetChat:   function(chatId)    { return request('/agent/chats/' + chatId); },
    agentUpdateChat:function(chatId, payload) { return request('/agent/chats/' + chatId, { method:'PATCH', body:JSON.stringify(payload || {}) }); },
    agentArchiveChat: function(chatId)  { return request('/agent/chats/' + chatId, { method:'DELETE' }); },
    agentStreamMessage: agentStreamMessage,
    createPayment:  function(p)         { return request('/payments/create', { method:'POST', body:JSON.stringify(p) }); },
  };
})();
