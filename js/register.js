import { authService } from "./services/auth.service.js";
const $ = selector => document.querySelector(selector);
let mode = new URLSearchParams(location.search).get('mode') || 'login';
const form = $('#accountForm');
function setMode(next) {
  mode = next;
  const isRegister = mode === 'register';
  const isReset = mode === 'reset';
  $('#authTabs').classList.toggle('hidden', isReset);
  document.querySelectorAll('[data-auth-mode]').forEach(button => button.classList.toggle('active', button.dataset.authMode === mode));
  $('#nameGroup').classList.toggle('hidden', !isRegister);
  $('#confirmGroup').classList.toggle('hidden', !isReset);
  $('#resetPasswordGroup').classList.toggle('hidden', !isReset);
  $('#passwordGroup').classList.toggle('hidden', isReset);
  $('#accountPassword').required = !isReset;
  $('#accountName').required = isRegister;
  $('#accountConfirm').required = isReset;
  $('#resetPassword').required = isReset;
  $('#authTitle').textContent = isRegister ? 'Создай свой аккаунт' : isReset ? 'Восстановление пароля' : 'С возвращением!';
  $('#authSubtitle').textContent = isRegister ? 'Начни строить семейные привычки вместе с LifeQuest.' : isReset ? 'Укажи почту и задай новый пароль для демо-аккаунта.' : 'Войди, чтобы продолжить свой путь.';
  $('#accountSubmit').textContent = isRegister ? 'Зарегистрироваться' : isReset ? 'Сменить пароль' : 'Войти';
  $('#forgotLink').classList.toggle('hidden', isRegister || isReset);
  $('#accountError').textContent = ''; $('#accountSuccess').textContent = '';
  $('#accountPassword').autocomplete = isRegister || isReset ? 'new-password' : 'current-password';
}
document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.authMode)));
$('#forgotLink').addEventListener('click', () => setMode('reset'));
form.addEventListener('submit', async event => {
  event.preventDefault(); $('#accountError').textContent = ''; $('#accountSuccess').textContent = '';
  const data = new FormData(form), email = String(data.get('email') || '').trim();
  try {
    if (mode === 'register') {
      await authService.register({ name: data.get('name'), email, password: String(data.get('password') || '') });
      location.href = 'workspace.html';
    } else if (mode === 'login') {
      await authService.login({ email, password: String(data.get('password') || '') });
      location.href = 'workspace.html';
    } else {
      const password = String(data.get('resetPassword') || '');
      if (password !== String(data.get('confirm') || '')) throw new Error('Пароли не совпадают.');
      if (password.length < 8) throw new Error('Новый пароль должен содержать минимум 8 символов.');
      await authService.resetPassword({ email, password });
      setMode('login');
      $('#accountEmail').value = email;
      $('#accountSuccess').textContent = 'Пароль изменён. Теперь войди с новым паролем.';
    }
  } catch (error) { $('#accountError').textContent = error.message || 'Не удалось выполнить действие.'; }
});
setMode(['login','register','reset'].includes(mode) ? mode : 'login');
