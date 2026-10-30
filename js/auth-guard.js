import { APP_CONFIG } from "./config.js";

const redirectUrl = "index.html?auth=required";
const sessionKeys = [
  APP_CONFIG.storageKeys.session,
  "lq_session",
  "lq_user",
  "currentUser"
];

function isFilled(value) {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  if (!text || ["null", "undefined", "false", "0", "{}", "[]"].includes(text)) return false;
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.length > 0 : !!parsed && Object.keys(parsed).length > 0;
    } catch {
      return true;
    }
  }
  return true;
}

function hasSession() {
  try {
    return sessionKeys.some(key => isFilled(localStorage.getItem(key)) || isFilled(sessionStorage.getItem(key)));
  } catch {
    return false;
  }
}

function redirectOut() {
  window.__LQ_AUTH_BLOCKED = true;
  window.location.replace(redirectUrl);
}

function checkSession() {
  if (!hasSession()) {
    redirectOut();
    return;
  }
  document.body.classList.remove("auth-pending");
}

checkSession();
window.addEventListener("pageshow", event => {
  if (event.persisted && !hasSession()) redirectOut();
});
