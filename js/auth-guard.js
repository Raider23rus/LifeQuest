/* js/auth-guard.js
   Защита приватных страниц LifeQuest.
   Подключать ОБЫЧНЫМ <script> в <head>, ДО styles.css и app.js.
*/
(function () {
  'use strict';

  var REDIRECT_URL = 'index.html?auth=required';

  // Ключ сессии взят из js/config.js → storageKeys.session
  var SESSION_KEYS = [
    'lifequest.demo.session.v1',   // ← реальный ключ проекта
    'lq_session',
    'lq_user',
    'currentUser'
  ];

  function isFilled(value) {
    if (value === null || value === undefined) return false;
    var v = String(value).trim();
    if (!v) return false;
    if (['null', 'undefined', 'false', '0', '{}', '[]'].indexOf(v) !== -1) return false;
    if (v.charAt(0) === '{' || v.charAt(0) === '[') {
      try {
        var parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed.length > 0;
        return !!parsed && Object.keys(parsed).length > 0;
      } catch (e) { return true; }
    }
    return true;
  }

  function hasSession() {
    try {
      for (var i = 0; i < SESSION_KEYS.length; i++) {
        if (isFilled(localStorage.getItem(SESSION_KEYS[i]))) return true;
        if (isFilled(sessionStorage.getItem(SESSION_KEYS[i]))) return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function redirectOut() {
    window.__LQ_AUTH_BLOCKED = true;
    try { document.documentElement.style.visibility = 'hidden'; } catch (e) {}
    window.location.replace(REDIRECT_URL);
  }

  if (!hasSession()) { redirectOut(); return; }

  window.addEventListener('pageshow', function (e) {
    if (e.persisted && !hasSession()) redirectOut();
  });
})();