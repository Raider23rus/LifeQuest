import { APP_CONFIG } from "../config.js";
import { authService } from "../services/auth.service.js";
import { setPage, escapeHTML } from "../ui/render.js";

export function renderAdmin(user, filters = {}) {
 if (user?.role !== "admin") {
   setPage({
     title: "Доступ запрещён",
     html: `<section class="panel empty-state"><strong>У этой страницы ограниченный доступ</strong>Войдите под учётной записью администратора.</section>`
   });
   return;
 }

 const users = authService.allUsers();
 const search = escapeHTML(filters.search || "");
 const roleFilter = ["admin", "member"].includes(filters.role) ? filters.role : "all";
 const normalizedSearch = (filters.search || "").trim().toLocaleLowerCase("ru");
 const matchesFilter = account => (roleFilter === "all" || account.role === roleFilter) &&
   `${account.name} ${account.email}`.toLocaleLowerCase("ru").includes(normalizedSearch);
 const matchingUsers = users.filter(matchesFilter).length;
 const currentEmail = user.email.trim().toLowerCase();
 const demoAdminEmail = APP_CONFIG.demoAdmin.email.trim().toLowerCase();
 const userRows = users.map(account => {
   const email = escapeHTML(account.email);
   const searchText = escapeHTML(`${account.name} ${account.email}`.toLocaleLowerCase("ru"));
   const protectedAccount = [currentEmail, demoAdminEmail].includes(account.email.trim().toLowerCase());
   return `<tr data-admin-user-row data-role="${escapeHTML(account.role)}" data-search="${searchText}" ${matchesFilter(account) ? "" : "hidden"}>
     <td><strong>${escapeHTML(account.name)}</strong></td>
     <td>${email}</td>
     <td><span class="pill ${account.role === "admin" ? "" : "pending"}">${account.role === "admin" ? "Администратор" : "Участник"}</span></td>
     <td>
       <div class="admin-user-actions">
         <button class="table-action" data-role-email="${email}" data-role-next="${account.role === "admin" ? "member" : "admin"}">${account.role === "admin" ? "Сделать участником" : "Назначить админом"}</button>
           ${account.role === "member" ? `<button class="table-action" type="button" data-edit-user-credentials="${email}">Изменить email/пароль</button>` : ""}
           ${protectedAccount ? "" : `<button class="table-action danger-action" data-delete-user="${email}">Удалить</button>`}
         </div>
     </td>
   </tr>`;
 }).join("");

 setPage({
   title: "Админ-панель",
   eyebrow: "УПРАВЛЕНИЕ ПЛАТФОРМОЙ",
   html: `
     <div class="admin-banner"><strong>Демо-панель.</strong> Это клиентский прототип. Проверка роли в браузере не является безопасной защитой: перед публикацией права должны проверяться сервером.</div>
     <div class="stats-grid">
       <article class="stat-card"><div class="stat-top">Всего аккаунтов <span class="stat-icon">♧</span></div><div class="stat-value">${users.length}</div><div class="stat-foot">В этом браузере</div></article>
       <article class="stat-card"><div class="stat-top">Администраторы <span class="stat-icon">⚙</span></div><div class="stat-value">${users.filter(account => account.role === "admin").length}</div><div class="stat-foot">Демо-роли</div></article>
       <article class="stat-card"><div class="stat-top">Участники <span class="stat-icon">✦</span></div><div class="stat-value">${users.filter(account => account.role !== "admin").length}</div><div class="stat-foot">Обычные аккаунты</div></article>
       <article class="stat-card"><div class="stat-top">Статус системы <span class="stat-icon">✓</span></div><div class="stat-value" style="font-size:19px">Прототип</div><div class="stat-foot">Без серверной БД</div></article>
     </div>
     <section class="panel">
       <div class="panel-heading"><h3>Управление модулями</h3></div>
       <p class="muted">Администратор имеет полный доступ к модулям: может добавлять, изменять и удалять квесты, а также создавать, редактировать и удалять операции в Финансовом хабе.</p>
       <div class="feature-grid">
         <button class="feature-card" data-view="quests"><div class="feature-icon">✦</div><h3>Управление квестами</h3><p>Добавление, изменение, удаление и контроль выполнения.</p></button>
         <button class="feature-card" data-view="finance"><div class="feature-icon">◈</div><h3>Финансовый хаб</h3><p>Добавление, изменение и удаление доходов и расходов.</p></button>
         <button class="feature-card" data-view="family"><div class="feature-icon">♧</div><h3>Семейный модуль</h3><p>Просмотр профиля и управление ролями участников.</p></button>
       </div>
     </section>
     <section class="panel" data-admin-user-panel>
       <div class="panel-heading"><h3>Пользователи</h3></div>
       ${users.length ? `
         <div class="admin-user-filters">
           <label class="admin-user-search"><span>Поиск</span><input class="field" type="search" data-admin-user-search value="${search}" placeholder="Имя или email" autocomplete="off"></label>
           <label class="admin-user-role-filter"><span>Роль</span><select class="field" data-admin-user-role><option value="all" ${roleFilter === "all" ? "selected" : ""}>Все роли</option><option value="admin" ${roleFilter === "admin" ? "selected" : ""}>Администраторы</option><option value="member" ${roleFilter === "member" ? "selected" : ""}>Участники</option></select></label>
           <span class="admin-user-count" data-admin-user-count aria-live="polite">Показано ${matchingUsers} из ${users.length}</span>
         </div>
         <div class="table-wrap" id="adminUserList"><table class="data-table"><thead><tr><th>Пользователь</th><th>Email</th><th>Роль</th><th>Действие</th></tr></thead><tbody>${userRows}<tr data-admin-user-empty ${matchingUsers ? "hidden" : ""}><td colspan="4" class="muted">Пользователи не найдены.</td></tr></tbody></table></div>
         <dialog class="life-quick-dialog" id="adminUserCredentialsDialog" aria-labelledby="adminUserCredentialsTitle">
           <header class="life-quick-header"><div><h2 id="adminUserCredentialsTitle">Изменение данных пользователя</h2><p>Пароль администратора нельзя изменить из этой панели.</p></div><button class="life-quick-close" type="button" data-close-user-credentials aria-label="Закрыть">×</button></header>
           <form class="life-quick-form" id="adminUserCredentialsForm">
             <input type="hidden" name="currentEmail">
             <label class="life-quick-field">Новая почта<input class="field" type="email" name="email" required autocomplete="off"></label>
             <label class="life-quick-field" style="margin-top:14px">Новый пароль<input class="field" type="password" name="password" minlength="8" autocomplete="new-password" placeholder="Оставьте пустым, чтобы не менять"></label>
             <label class="life-quick-field" style="margin-top:14px">Повторите новый пароль<input class="field" type="password" name="passwordConfirm" minlength="8" autocomplete="new-password"></label>
             <p class="auth-error" data-admin-user-error role="alert"></p>
             <footer class="life-quick-footer"><button class="life-quick-cancel" type="button" data-close-user-credentials>Отмена</button><button class="primary-button" type="submit">Сохранить</button></footer>
           </form>
         </dialog>` : `<p class="muted">В этом браузере пока нет зарегистрированных пользователей.</p>`}
       <p class="muted" style="font-size:10px;line-height:1.6;margin-top:15px">Показываются аккаунты, зарегистрированные в этом браузере и на этом адресе сайта. Другие браузеры и устройства не синхронизируются без серверной базы. Управление ролями здесь демонстрационное.</p>
     </section>`
 });
}