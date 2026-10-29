import { setPage, escapeHTML } from "../ui/render.js";
import { familyService, FAMILY_ROLES } from "../services/family.service.js";

const roleOptions = selectedRole => Object.entries(FAMILY_ROLES)
  .map(([value, label]) => `<option value="${value}"${selectedRole === value ? " selected" : ""}>${label}</option>`)
  .join("");

export function renderFamily(user, users = []) {
  const family = user ? familyService.get(user.email) : null;
  const currentRole = user ? familyService.roleFor(user.email) : null;
  const canManage = currentRole === "adult";

  const familyContent = !user
    ? `<section class="panel empty-state"><strong>Войди, чтобы создать семью</strong>Создать семью и управлять ролями можно после входа в аккаунт.<br><button class="primary-button" data-open-register type="button" style="margin-top:18px">Войти / зарегистрироваться</button></section>`
    : !family
      ? `<section class="panel"><div class="panel-heading"><h3>Создать семью</h3></div><p class="muted">Создай семейную команду. Создатель автоматически получит роль “Взрослый” и сможет добавлять участников и назначать им роли.</p><form id="familyCreateForm" class="inline-form"><input class="field" name="name" required minlength="2" maxlength="60" placeholder="Название семьи"><button class="primary-button" type="submit">Создать семью</button></form></section>`
      : `<section class="panel"><div class="panel-heading"><h3>${escapeHTML(family.name)}</h3><span class="pill">${family.members.length} ${family.members.length === 1 ? "участник" : "участника"}</span></div>
          <div class="family-list">${family.members.map(member => { const account = users.find(item => item.email.toLowerCase() === member.email); const memberName = account?.name || member.name; const fullName = [memberName, account?.patronymic || member.patronymic].filter(Boolean).join(" "); return `<div class="family-person family-member-row"><div class="avatar">${escapeHTML((memberName || "?").trim().charAt(0).toUpperCase())}</div><div class="person-meta"><strong>${escapeHTML(fullName)}</strong><small>${escapeHTML(member.email)}${account ? "" : " · ожидает регистрации"}</small></div>${canManage ? `<label class="family-role-control"><span>Роль</span><select class="field" data-family-role="${escapeHTML(member.email)}" aria-label="Роль участника ${escapeHTML(fullName)}">${roleOptions(member.role)}</select></label>${member.role !== "adult" || family.members.filter(item => item.role === "adult").length > 1 ? `<button type="button" class="table-action danger-action" data-remove-family-member="${escapeHTML(member.email)}">Убрать</button>` : ""}` : `<span class="pill">${escapeHTML(FAMILY_ROLES[member.role] || "Участник")}</span>`}</div>`; }).join("")}</div>
          ${canManage ? `<div class="family-invite-block"><div class="panel-heading"><h3>Добавить участника по почте</h3></div><form id="familyAddMemberForm" class="inline-form"><input class="field" name="email" type="email" required autocomplete="email" placeholder="Электронная почта участника"><select class="field" name="role" required aria-label="Роль участника">${roleOptions("participant")}</select><button class="primary-button" type="submit">Добавить</button></form><p class="muted">Участнику назначится роль для указанной почты. Если аккаунта ещё нет, он появится в семье после регистрации с этой почтой. Письмо-приглашение в демо-режиме не отправляется.</p></div><button type="button" class="table-action danger-action" data-delete-family style="margin-top:18px">Удалить семью</button>` : `<p class="muted" style="margin-top:16px">Добавлять участников, менять роли и удалять семью могут взрослые.</p>`}
        </section>`;

  setPage({
    title: "Моя семья",
    html: `<div class="section-intro"><h2>Семья — наша команда</h2><p>${family ? "Участники семьи и их роли." : "Создай семью, чтобы собрать свою команду и распределить роли."}</p></div>
      ${familyContent}
      ${user ? `<section class="panel"><div class="panel-heading"><h3>Твой профиль</h3><span class="pill">Аккаунт активен</span></div><div class="family-person"><div class="avatar">${escapeHTML(user.name.charAt(0).toUpperCase())}</div><div class="person-meta"><strong>${escapeHTML([user.name, user.patronymic].filter(Boolean).join(" "))}</strong><small>${escapeHTML(user.email)}</small></div></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="primary-button" data-view="profile" type="button">Настроить профиль</button><button class="table-action" id="profileLogoutBtn" type="button">Выйти из аккаунта</button></div></section>` : ""}
      <section class="panel"><div class="panel-heading"><h3>Роли в семье</h3></div><div class="family-list">${Object.entries(FAMILY_ROLES).map(([role, label]) => `<div class="quest-row"><div class="quest-symbol">${role === "adult" ? "♧" : role === "teen" ? "✦" : role === "child" ? "★" : role === "advisor" ? "⌂" : "●"}</div><div class="quest-info"><strong>${label}</strong><small>${role === "adult" ? "Создаёт семью, добавляет участников, управляет ролями и может удалить семью." : role === "participant" ? "Использует квесты, профиль и финансовые разделы; не управляет составом семьи." : role === "teen" ? "Выполняет квесты и участвует в семейных целях." : role === "child" ? "Участвует в заданиях, подходящих по возрасту." : "Делится опытом и семейными историями."}</small></div></div>`).join("")}</div><p class="muted" style="font-size:10px;line-height:1.6;margin-top:16px">Семейные данные хранятся в этом браузере. Для приглашения участника он должен сначала зарегистрировать аккаунт здесь.</p></section>`
  });
}
