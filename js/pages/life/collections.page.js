import { lifeService } from "../../services/life.service.js";
import { escapeHTML } from "../../ui/render.js";
import { quickTaskDialog, tasksByDate } from "./planner.page.js";
import { pageInfo, collectionInfo, escapeAttr, today, dateKey, formatDate, repeatLabel, careTypeLabel, sphereOptions, goalOptions, projectOptions } from "./shared.js";

import { structuredDialog, rewardDialog } from "./dialogs.page.js";

let projectFilter = "active";

export function enriched(collection) {
  const state = lifeService.state();
  const sphereName = id => state.spheres.find(item => item.id === id)?.title;
  const goalName = id => state.goals.find(item => item.id === id)?.title;
  return state[collection].map(item => ({ ...item, sphereName: sphereName(item.sphereId), goalName: goalName(item.goalId) }));
}

export function formFor(view) {
  const info = collectionInfo[view];
  if (!info) return "";
  const fields = [`<input class="field" name="title" required maxlength="100" placeholder="${escapeAttr(info.placeholder)}">`];
  if (view === "tasks") {
    fields.push(`<input class="field life-date-field" name="date" type="date" value="${dateKey(today())}" aria-label="Дата задачи">`);
    fields.push(`<input class="field life-number-field" name="xp" type="number" min="0" max="10000" value="10" aria-label="Опыт XP">`);
    if (lifeService.list("spheres").length) fields.push(`<select class="field life-select-field" name="sphereId" aria-label="Сфера жизни"><option value="">Без сферы</option>${sphereOptions()}</select>`);
    if (lifeService.list("goals").length) fields.push(`<select class="field life-select-field" name="goalId" aria-label="Цель"><option value="">Без цели</option>${goalOptions()}</select>`);
    if (lifeService.list("projects").length) fields.push(`<select class="field life-select-field" name="projectId" aria-label="Проект"><option value="">Без проекта</option>${projectOptions()}</select>`);
  } else if (view === "rewards") {
    fields.push(`<input class="field life-number-field" name="cost" type="number" min="0" max="100000" value="10" aria-label="Стоимость в RP">`);
  } else if (view === "goals") {
    if (lifeService.list("spheres").length) fields.push(`<select class="field life-select-field" name="sphereId" aria-label="Сфера жизни"><option value="">Без сферы</option>${sphereOptions()}</select>`);
    fields.push(`<input class="field life-date-field" name="date" type="date" aria-label="Срок цели">`);
  } else if (view === "projects") {
    if (lifeService.list("spheres").length) fields.push(`<select class="field life-select-field" name="sphereId" aria-label="Сфера жизни"><option value="">Без сферы</option>${sphereOptions()}</select>`);
    if (lifeService.list("goals").length) fields.push(`<select class="field life-select-field" name="goalId" aria-label="Связанная цель"><option value="">Без цели</option>${goalOptions()}</select>`);
  } else if (["habits", "quit", "care", "sport", "familyTime", "hobbies"].includes(view)) {
    fields.push(`<input class="field" name="schedule" maxlength="80" placeholder="${view === "care" ? "Тип или расписание (необязательно)" : "Расписание (необязательно)"}">`);
    if (["sport", "familyTime"].includes(view)) fields.push(`<input class="field life-date-field" name="date" type="date" aria-label="Дата">`);
  } else if (view === "spheres") {
    fields.push(`<input class="field" name="description" maxlength="160" placeholder="Короткое описание (необязательно)">`);
  }
  return `<section class="panel life-form-panel"><div class="panel-heading"><h3>${escapeHTML(info.add)}</h3></div><form class="inline-form life-form" data-life-form="${info.collection}">${fields.join("")}<button class="primary-button" type="submit">${escapeHTML(info.add)}</button></form></section>`;
}

export function itemRow(view, item) {
  const info = collectionInfo[view];
  const detail = info.detail(item);
  const statusControl = view === "tasks"
    ? `<button class="table-action" data-life-complete="${escapeAttr(item.id)}">${item.status === "done" ? "Вернуть" : "Выполнено"}</button>`
    : ["goals", "projects"].includes(view)
      ? `<button class="table-action" data-life-status="${info.collection}" data-id="${escapeAttr(item.id)}">${item.status === "done" ? "Возобновить" : "Выполнено"}</button>` : "";
  const dailyControl = ["habits", "quit"].includes(view)
    ? `<button class="table-action" data-life-mark="${view === "habits" ? "habit" : "quit"}" data-id="${escapeAttr(item.id)}"${view === "habits" && !lifeService.isScheduledToday(item) || view === "quit" && item.startDate > dateKey(today()) ? " disabled" : ""}>${lifeService.isMarkedToday(view === "habits" ? "habit" : "quit", item.id) ? "Отмечено сегодня" : view === "habits" && !lifeService.isScheduledToday(item) ? "Не запланировано" : "Отметить сегодня"}</button>` : "";
  const purchase = view === "rewards"
    ? (() => {
      const progress = lifeService.progress();
      const alreadyPurchased = lifeService.list("purchases").some(entry => entry.rewardId === item.id);
      const unavailable = progress.level < (Number(item.minLevel) || 1) || (!item.repeatable && alreadyPurchased);
      return `<button class="table-action" data-life-purchase="${escapeAttr(item.id)}"${unavailable ? " disabled" : ""}>${alreadyPurchased && !item.repeatable ? "Куплена" : "Обменять"}</button>`;
    })() : "";
  return `<div class="quest-row life-item-row${item.status === "done" ? " is-done" : ""}"><div class="quest-symbol">${view === "rewards" ? "✦" : view === "tasks" ? "○" : "✧"}</div><div class="quest-info"><strong>${escapeHTML(item.title)}</strong>${detail ? `<small>${escapeHTML(detail)}</small>` : ""}</div>${statusControl}${dailyControl}${purchase}<button class="table-action danger-action" data-life-delete="${info.collection}" data-id="${escapeAttr(item.id)}" aria-label="Удалить">Удалить</button></div>`;
}

export function renderCollection(view) {
  const info = collectionInfo[view];
  const rows = view === "spheres"
    ? enriched(info.collection).sort((left, right) => (Number(left.order) || 0) - (Number(right.order) || 0))
    : enriched(info.collection);
  if (view === "spheres") {
    return `<div class="life-heading-row"><div class="section-intro"><h2>Сферы жизни</h2><p>${escapeHTML(pageInfo.spheres[2])}</p></div><button class="primary-button" type="button" data-open-sphere-dialog>＋ Новая сфера жизни</button></div>
      <dialog class="life-quick-dialog life-sphere-dialog" id="sphereDialog" aria-labelledby="sphereDialogTitle">
        <header class="life-quick-header"><div><h2 id="sphereDialogTitle">Новая сфера жизни</h2><p>Сфера — это устойчивое направление жизни, а не отдельная задача или краткосрочная цель.</p></div><button type="button" class="life-quick-close" data-close-sphere-dialog aria-label="Закрыть">×</button></header>
        <form class="life-quick-form" data-life-sphere-form>
          <label class="life-quick-field life-quick-title">Название<input class="field" name="title" required maxlength="100" placeholder="Например, Здоровье"></label>
          <label class="life-quick-field life-sphere-description">Описание<textarea class="field" name="description" rows="3" maxlength="300" placeholder="Что относится к этой сфере"></textarea></label>
          <div class="life-quick-grid">
            <label class="life-quick-field">Иконка<select class="field" name="icon"><option value="◉">Компас</option><option value="♡">Сердце</option><option value="⌂">Дом</option><option value="✦">Звезда</option><option value="▣">Портфель</option><option value="♧">Лист</option><option value="◎">Мишень</option><option value="♜">Башня</option></select></label>
            <label class="life-quick-field">Цвет<input class="field life-sphere-color" type="color" name="color" value="#4778f5"></label>
          </div>
          <label class="life-quick-field life-sphere-order">Порядок в списке<input class="field" name="order" type="number" min="0" max="9999" value="0" required></label>
          <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-sphere-dialog>Отмена</button><button type="submit" class="primary-button">Создать сферу</button></footer>
        </form>
      </dialog>
      <section class="panel"><div class="panel-heading"><h3>Мои сферы жизни</h3><span class="pill">${rows.length}</span></div>${rows.length ? rows.map(item => `<article class="life-sphere-row"><span class="life-sphere-icon" style="--sphere-color:${escapeAttr(item.color || "#4778f5")}">${escapeHTML(item.icon || "◉")}</span><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description || "Сфера жизни")} · порядок ${Number(item.order) || 0}</small></div><button class="table-action danger-action" data-life-delete="spheres" data-id="${escapeAttr(item.id)}" aria-label="Удалить сферу">Удалить</button></article>`).join("") : `<div class="life-empty">Начни с 4–7 устойчивых направлений, которые важны именно тебе. Например: здоровье, семья, карьера, финансы, развитие или отдых.</div>`}</section>`;
  }
  if (view === "projects") return renderProjects(rows);
  if (["habits", "quit", "care", "sport", "familyTime", "hobbies"].includes(view)) {
    return renderStructuredCollection(view, rows);
  }
  if (view === "rewards") {
    const progress = lifeService.progress();
    const purchases = lifeService.list("purchases");
    return `<div class="life-heading-row"><div class="section-intro"><h2>Магазин наград</h2><p>Обменивай Reward Points на то, что действительно хочется.</p></div><div class="life-rp-card"><span>ДОСТУПНО</span><strong>${progress.rewardPoints} RP</strong><small>Уровень ${progress.level}</small></div></div>
      <div class="life-heading-row life-reward-add-row"><span></span><button class="primary-button" type="button" data-open-life-dialog>＋ Новая награда</button></div>
      ${rewardDialog()}
      <section class="panel"><div class="panel-heading"><h3>Мои награды</h3><span class="pill">${rows.length}</span></div>${rows.length ? rows.map(item => itemRow(view, item)).join("") : `<div class="life-empty">${info.empty}. Создай первую личную награду.</div>`}</section><section class="panel"><div class="panel-heading"><h3>Мои покупки</h3><span class="muted">${purchases.length}</span></div>${purchases.length ? purchases.map(item => `<div class="quest-row"><div class="quest-symbol">🎁</div><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(formatDate(item.purchasedAt.slice(0, 10)))}</small></div><span class="pill">${item.cost} RP</span></div>`).join("") : `<p class="muted">Купленные награды появятся здесь.</p>`}</section>`;
  }
  function renderProjects(projects) {
    const activeCount = projects.filter(project => project.status === "active").length;
    const filtered = projects.filter(project => projectFilter === "all" || project.status === projectFilter);
    const statusLabel = { planned: "Запланирован", active: "В работе", done: "Завершён" };
    const sphereSelect = `<option value="">Без сферы жизни</option>${sphereOptions()}`;
    const goalSelect = `<option value="">Без цели</option>${goalOptions()}`;
    const rows = filtered.length ? filtered.map(project => {
      const sphereName = project.sphereName || lifeService.list("spheres").find(item => item.id === project.sphereId)?.title;
      const goalName = project.goalName || lifeService.list("goals").find(item => item.id === project.goalId)?.title;
      const statusAction = project.status === "planned"
        ? `<button class="table-action" data-life-activate-project="${escapeAttr(project.id)}">Активировать</button>`
        : `<button class="table-action" data-life-status="projects" data-id="${escapeAttr(project.id)}">${project.status === "done" ? "Возобновить" : "Завершить"}</button>`;
      return `<article class="life-project-card"><div class="life-project-main"><span class="life-sphere-icon life-project-icon">${escapeHTML(sphereName ? "◉" : "▣")}</span><div class="quest-info"><strong>${escapeHTML(project.title)}</strong><small>${escapeHTML([sphereName, goalName, project.context === "work" ? "Рабочий" : "Личный", project.targetDate && `до ${formatDate(project.targetDate)}`].filter(Boolean).join(" · "))}</small>${project.description ? `<p>${escapeHTML(project.description)}</p>` : ""}</div><span class="pill${project.status === "active" ? "" : " pending"}">${statusLabel[project.status]}</span></div>
        ${project.expectedResult || project.completionCriteria || project.nextAction ? `<div class="life-project-details">${project.expectedResult ? `<div><span>Ожидаемый результат</span><p>${escapeHTML(project.expectedResult)}</p></div>` : ""}${project.completionCriteria ? `<div><span>Критерий завершения</span><p>${escapeHTML(project.completionCriteria)}</p></div>` : ""}${project.nextAction ? `<div><span>Следующее действие</span><p>${escapeHTML(project.nextAction)}</p></div>` : ""}</div>` : ""}
        <div class="life-project-progress"><span>Прогресс</span><div class="progress-track"><div class="progress-fill" style="width:${project.progress}%"></div></div><strong>${project.progress}%</strong></div>
        <div class="life-project-actions">${statusAction}<button class="table-action danger-action" data-life-delete="projects" data-id="${escapeAttr(project.id)}">Удалить</button></div></article>`;
    }).join("") : `<div class="life-empty">${projectFilter === "planned" ? "Запланированных проектов пока нет." : projectFilter === "done" ? "Завершённых проектов пока нет." : "Нет проектов в работе. Создай проект или активируй запланированный."}</div>`;
    return `<div class="life-heading-row"><div class="section-intro"><h2>Проекты</h2><p>${escapeHTML(pageInfo.projects[2])}</p></div><button class="primary-button" type="button" data-open-project-dialog>＋ Новый проект</button></div>
      <section class="panel life-project-summary"><div><span>АКТИВНЫЕ ПРОЕКТЫ</span><strong>${activeCount}</strong><small>Запланированные проекты не занимают WIP-слот до активации.</small></div></section>
      <div class="life-project-tabs" role="tablist" aria-label="Фильтр проектов">${[["active","В работе"],["planned","Запланированные"],["done","Завершённые"],["all","Все"]].map(([value,label])=>`<button class="secondary-button${projectFilter===value?" active":""}" type="button" role="tab" aria-selected="${projectFilter===value}" data-project-filter="${value}">${label}</button>`).join("")}</div>
      <dialog class="life-quick-dialog life-project-dialog" id="projectDialog" aria-labelledby="projectDialogTitle">
        <header class="life-quick-header"><div><h2 id="projectDialogTitle">Новый проект</h2><p>Новый проект создаётся запланированным и не занимает WIP-слот до активации.</p></div><button type="button" class="life-quick-close" data-close-project-dialog aria-label="Закрыть">×</button></header>
        <form class="life-quick-form" data-life-project-form>
          <label class="life-quick-field life-quick-title">Название проекта<input class="field" name="title" required maxlength="100"></label>
          <label class="life-quick-field life-project-description">Описание<textarea class="field" name="description" rows="3" maxlength="500"></textarea></label>
          <div class="life-quick-grid">
            <label class="life-quick-field">Сфера жизни<select class="field" name="sphereId">${sphereSelect}</select></label>
            <label class="life-quick-field">Цель<select class="field" name="goalId">${goalSelect}</select></label>
            <label class="life-quick-field">Ожидаемый результат<textarea class="field" name="expectedResult" rows="3" maxlength="300"></textarea></label>
            <label class="life-quick-field">Критерий завершения<textarea class="field" name="completionCriteria" rows="3" maxlength="300"></textarea></label>
            <label class="life-quick-field">Контекст<select class="field" name="context"><option value="personal">Личный</option><option value="work">Рабочий</option></select></label>
            <label class="life-quick-field">Прогресс, %<input class="field" name="progress" type="number" min="0" max="100" step="1" value="0" required></label>
            <label class="life-quick-field">Желаемая дата завершения<input class="field" name="targetDate" type="date"></label>
          </div>
          <label class="life-quick-field life-project-next-action">Следующее действие<input class="field" name="nextAction" maxlength="160" placeholder="Один конкретный следующий шаг"></label>
          <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-project-dialog>Отмена</button><button type="submit" class="primary-button">Создать проект</button></footer>
        </form>
      </dialog>
      <section class="panel life-project-list"><div class="panel-heading"><h3>${projectFilter === "planned" ? "Запланированные проекты" : projectFilter === "done" ? "Завершённые проекты" : projectFilter === "active" ? "Проекты в работе" : "Все проекты"}</h3><span class="pill">${filtered.length}</span></div>${rows}</section>`;
  }
  const displayRows = view === "tasks" ? tasksByDate() : rows;
  if (view === "tasks") {
    return `<div class="life-heading-row"><div class="section-intro"><h2>Задачи</h2><p>${escapeHTML(pageInfo.tasks[2])}</p></div><button class="primary-button" type="button" data-open-quick-task>＋ Быстро добавить</button></div>${quickTaskDialog(dateKey(today()))}<section class="panel"><div class="panel-heading"><h3>Все задачи</h3><span class="pill">${displayRows.length}</span></div>${displayRows.length ? displayRows.map(item => itemRow("tasks", item)).join("") : `<div class="life-empty">Задач пока нет. Добавь первую задачу.</div>`}</section>`;
  }
  return `${view === "habits" || view === "quit" ? `<div class="life-heading-row"><div class="section-intro"><h2>${escapeHTML(pageInfo[view][0])}</h2><p>${escapeHTML(pageInfo[view][2])}</p></div><button class="secondary-button" data-view="today">Сегодня →</button></div>` : `<div class="section-intro"><h2>${escapeHTML(pageInfo[view][0])}</h2><p>${escapeHTML(pageInfo[view][2])}</p></div>`}
    ${view === "habits" || view === "quit" ? `<section class="panel life-daily-summary"><strong>${lifeService.list("dailyEntries").filter(entry => entry.date === dateKey(today())).length}</strong><span>отметок сегодня</span></section>` : ""}
    ${formFor(view)}<section class="panel"><div class="panel-heading"><h3>${view === "tasks" ? "Рабочий список" : escapeHTML(pageInfo[view][0])}</h3><span class="pill">${displayRows.length}</span></div>${displayRows.length ? displayRows.map(item => itemRow(view, item)).join("") : `<div class="life-empty">${escapeHTML(info.empty)}. Добавь первую запись выше.</div>`}</section>`;
}

export function renderStructuredCollection(view, rows) {
  const info = collectionInfo[view];
  const addLabel = { habits: "＋ Новая привычка", quit: "＋ Новая цель", care: "＋ Новый объект", sport: "＋ Добавить", familyTime: "＋ Добавить", hobbies: "＋ Новое хобби" }[view];
  return `<div class="life-heading-row"><div class="section-intro"><h2>${escapeHTML(pageInfo[view][0])}</h2><p>${escapeHTML(pageInfo[view][2])}</p></div><button class="primary-button" type="button" data-open-life-dialog>${addLabel}</button></div>
    ${view === "habits" || view === "quit" ? `<section class="panel life-daily-summary"><strong>${lifeService.list("dailyEntries").filter(entry => entry.date === dateKey(today())).length}</strong><span>отметок сегодня</span></section>` : ""}
    ${structuredDialog(view)}
    <section class="panel"><div class="panel-heading"><h3>${escapeHTML(pageInfo[view][0])}</h3><span class="pill">${rows.length}</span></div>${rows.length ? rows.map(item => itemRow(view, item)).join("") : `<div class="life-empty">${escapeHTML(info.empty)}. Добавь первую запись.</div>`}</section>`;
}

export function setProjectFilter(filter) {
  if (["planned", "active", "done", "all"].includes(filter)) projectFilter = filter;
}
