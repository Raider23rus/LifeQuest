import { authService } from "../services/auth.service.js";
import { setPage, escapeHTML } from "../ui/render.js";

export function renderProfile(user) {
  if (!user) {
    setPage({
      title: "Мой профиль",
      html: `<section class="panel empty-state">
        <strong>Ты не авторизован</strong>
        Войди или зарегистрируйся, чтобы редактировать профиль.
      </section>`
    });
    return;
  }

  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();
  const legacyNameParts = (user.name || "").trim().split(/\s+/);
  const firstName = user.firstName || legacyNameParts.shift() || "";
  const surname = user.surname ?? legacyNameParts.join(" ");
  const avatar = user.avatar
    ? `<img class="avatar avatar-lg" src="${user.avatar}" alt="Аватар">`
    : `<div class="avatar avatar-lg">${escapeHTML(initial)}</div>`;

  setPage({
    title: "Мой профиль",
    eyebrow: "АККАУНТ И БЕЗОПАСНОСТЬ",
    html: `
      <div class="section-intro">
        <h2>Настрой свой профиль</h2>
        <p>Измени имя, email, фото и пароль. Все данные хранятся в этом браузере — это демо-прототип.</p>
      </div>

      <div class="profile-grid">
        <section class="panel">
          <div class="panel-heading"><h3>Фото профиля</h3></div>
          <div class="profile-avatar-block">
            ${avatar}
            <div class="profile-avatar-actions">
              <label class="primary-button file-button">
                Загрузить фото
                <input type="file" id="avatarInput" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
              </label>
              <button type="button" class="table-action danger-action" id="avatarReset">Удалить фото</button>
              <p class="muted" style="font-size:10px;margin:8px 0 0">PNG, JPG, WEBP или GIF · до 600 КБ</p>
            </div>
          </div>
          <p class="auth-error" id="avatarError" role="alert"></p>
        </section>

        <section class="panel">
          <div class="panel-heading"><h3>Личные данные</h3></div>
          <form id="profileForm" class="profile-form" novalidate>
            <div class="profile-name-fields">
              <div><label class="field-label" for="profileSurname">Фамилия</label><input class="field" id="profileSurname" name="surname" required minlength="2" autocomplete="family-name" value="${escapeHTML(surname)}"></div>
              <div><label class="field-label" for="profileFirstName">Имя</label><input class="field" id="profileFirstName" name="firstName" required minlength="2" autocomplete="given-name" value="${escapeHTML(firstName)}"></div>
            </div>

            <label class="field-label" for="profilePatronymic">Отчество</label>
            <input class="field" id="profilePatronymic" name="patronymic" autocomplete="additional-name" value="${escapeHTML(user.patronymic || "")}" placeholder="Отчество (необязательно)">

            <label class="field-label" for="profileEmail">Электронная почта</label>
            <input class="field" id="profileEmail" name="email" type="email" required autocomplete="email" value="${escapeHTML(user.email)}">

            <button class="primary-button full-width" type="submit">Сохранить изменения</button>
            <p class="auth-error" id="profileError" role="alert"></p>
            <p class="auth-success" id="profileSuccess" role="status"></p>
          </form>
        </section>

        <section class="panel">
          <div class="panel-heading"><h3>Смена пароля</h3></div>
          <form id="passwordForm" class="profile-form" novalidate>
            <label class="field-label" for="currentPassword">Текущий пароль</label>
            <input class="field" id="currentPassword" name="currentPassword" type="password" required minlength="8" autocomplete="current-password" placeholder="Текущий пароль">

            <label class="field-label" for="newPassword">Новый пароль</label>
            <input class="field" id="newPassword" name="newPassword" type="password" required minlength="8" autocomplete="new-password" placeholder="Не менее 8 символов">

            <label class="field-label" for="confirmPassword">Повтори новый пароль</label>
            <input class="field" id="confirmPassword" name="confirmPassword" type="password" required minlength="8" autocomplete="new-password" placeholder="Повтори пароль">

            <button class="primary-button full-width" type="submit">Изменить пароль</button>
            <p class="auth-error" id="passwordError" role="alert"></p>
            <p class="auth-success" id="passwordSuccess" role="status"></p>
          </form>
        </section>
      </div>

      <section class="panel profile-ip-panel">
        <div class="panel-heading"><h3>Мой публичный IP</h3></div>
        <div class="profile-ip-row">
          <strong id="profileIpValue" role="status" aria-live="polite">Нажми «Обновить IP»</strong>
          <button class="primary-button" type="button" data-refresh-ip>Обновить IP</button>
        </div>
        <p class="muted">Адрес загружается с сервиса 2ip.io и не сохраняется сайтом. Сервис 2ip.io получает ваш IP при запросе.</p>
        <p class="auth-error" id="profileIpError" role="alert"></p>
      </section>
    `
  });
}