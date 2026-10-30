import { lifeService } from "../../services/life.service.js";
import { escapeHTML } from "../../ui/render.js";
import { escapeAttr, today, dateKey, formatDate, fullDate, repeatLabel, sphereOptions, goalOptions, projectOptions } from "./shared.js";

let weekOffset = 0;
let monthOffset = 0;

export function taskRow(task) {
  return `<div class="quest-row life-task-row${task.status === "done" ? " is-done" : ""}"><button type="button" class="life-check" data-life-complete="${escapeAttr(task.id)}" aria-label="${task.status === "done" ? "Вернуть задачу в работу" : "Завершить задачу"}">${task.status === "done" ? "✓" : "○"}</button><div class="quest-info"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML([task.sphereName, task.goalName, task.projectName, `${task.xp} XP`].filter(Boolean).join(" · "))}</small></div><span class="pill${task.status === "done" ? "" : " pending"}">${task.status === "done" ? "Готово" : formatDate(task.date)}</span><button type="button" class="table-action danger-action" data-life-delete="tasks" data-id="${escapeAttr(task.id)}" aria-label="Удалить задачу">Удалить</button></div>`;
}

export function tasksByDate() {
  const state = lifeService.state();
  return state.tasks.map(task => ({
    ...task,
    sphereName: state.spheres.find(item => item.id === task.sphereId)?.title,
    goalName: state.goals.find(item => item.id === task.goalId)?.title,
    projectName: state.projects.find(item => item.id === task.projectId)?.title
  }));
}

export function renderToday() {
  const key = dateKey(today());
  const tasks = tasksByDate().filter(task => task.date === key);
  const habits = lifeService.list("habits").filter(item => lifeService.isScheduledToday(item));
  const quit = lifeService.list("quit").filter(item => !item.startDate || item.startDate <= key);
  const completed = tasks.filter(task => task.status === "done").length;
  return `<div class="life-heading-row"><div class="section-intro"><h2>${escapeHTML(fullDate(today()))}</h2><p>План на день — один небольшой шаг за раз.</p></div><button class="primary-button" type="button" data-open-quick-task>＋ Добавить задачу</button></div>
    <div class="stats-grid life-stats"><article class="stat-card"><div class="stat-top">Осталось</div><div class="stat-value">${tasks.length - completed}</div></article><article class="stat-card"><div class="stat-top">Выполнено</div><div class="stat-value">${completed}</div></article><article class="stat-card"><div class="stat-top">Привычки</div><div class="stat-value">${habits.filter(item => lifeService.isMarkedToday("habit", item.id)).length}/${habits.length}</div></article></div>
    ${quickTaskDialog(key)}
    <section class="panel"><div class="panel-heading"><h3>Задачи на сегодня</h3><span class="pill">${tasks.length}</span></div>${tasks.length ? tasks.map(taskRow).join("") : `<div class="life-empty">На сегодня пока нет задач. Добавь первую выше.</div>`}</section>
    ${habits.length || quit.length ? `<section class="panel"><div class="panel-heading"><h3>Ежедневный фокус</h3><button class="text-button" data-view="habits">Все привычки →</button></div>${habits.map(item => dailyRow(item, "habit")).join("")}${quit.map(item => dailyRow(item, "quit")).join("")}</section>` : ""}
    <div class="life-shortcuts"><button class="secondary-button" data-view="week">Открыть неделю →</button><button class="secondary-button" data-view="month">Открыть месяц →</button></div>`;
}

export function quickTaskDialog(defaultDate) {
  const projects = lifeService.list("projects");
  const spheres = lifeService.list("spheres");
  const goals = lifeService.list("goals");
  return `<dialog class="life-quick-dialog" id="quickTaskDialog" aria-labelledby="quickTaskTitle">
    <header class="life-quick-header"><div><h2 id="quickTaskTitle">Быстрое добавление</h2><p>Зафиксируйте задачу за несколько секунд. Остальные параметры можно настроить в карточке.</p></div><button type="button" class="life-quick-close" data-close-quick-task aria-label="Закрыть">×</button></header>
    <form class="life-quick-form" data-life-quick-task>
      <label class="life-quick-field life-quick-title">Название задачи<input class="field" name="title" required maxlength="100" placeholder="Что нужно сделать?" autofocus></label>
      <div class="life-quick-grid">
        <label class="life-quick-field">Проект<select class="field" name="projectId"><option value="">Без проекта</option>${projects.map(item => `<option value="${escapeAttr(item.id)}">${escapeHTML(item.title)}</option>`).join("")}</select></label>
        <label class="life-quick-field">Плановая дата завершения<input class="field" name="date" type="date" value="${escapeAttr(defaultDate)}" required></label>
        <label class="life-quick-field">Сфера жизни<select class="field" name="sphereId"><option value="">Без сферы жизни</option>${spheres.map(item => `<option value="${escapeAttr(item.id)}">${escapeHTML(item.title)}</option>`).join("")}</select></label>
        <label class="life-quick-field">Цель<select class="field" name="goalId"><option value="">Без цели</option>${goals.map(item => `<option value="${escapeAttr(item.id)}">${escapeHTML(item.title)}</option>`).join("")}</select></label>
      </div>
      <p class="life-quick-note">Задаче будет назначено 10 XP. Приоритет и обязательность пока используются по умолчанию.</p>
      <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-quick-task>Отмена</button><button type="submit" class="primary-button">Добавить задачу</button></footer>
    </form>
  </dialog>`;
}

export function dailyRow(item, kind) {
  const checked = lifeService.isMarkedToday(kind, item.id);
  const detail = kind === "habit" ? [item.time, item.minutes && `${item.minutes} мин.`].filter(Boolean).join(" · ") : "День без вредной привычки";
  return `<div class="quest-row"><button type="button" class="life-check${checked ? " checked" : ""}" data-life-mark="${kind}" data-id="${escapeAttr(item.id)}" aria-pressed="${checked}">${checked ? "✓" : "○"}</button><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(detail || (kind === "habit" ? repeatLabel(item.repeat, item.interval) : "День без вредной привычки"))}</small></div><span class="pill${checked ? "" : " pending"}">${checked ? "Отмечено" : "Отметить"}</span></div>`;
}

export function renderWeek() {
  const start = today();
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day + weekOffset * 7);
  const tasks = tasksByDate();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    const dayTasks = tasks.filter(task => task.date === key);
    return `<article class="life-day-card${key === dateKey(today()) ? " is-today" : ""}"><header><strong>${escapeHTML(fullDate(date))}${key === dateKey(today()) ? " · сегодня" : ""}</strong><span>${dayTasks.length}</span></header><div class="life-day-tasks">${dayTasks.length ? dayTasks.map(task => `<div class="life-mini-task${task.status === "done" ? " is-done" : ""}"><button class="life-check" data-life-complete="${escapeAttr(task.id)}" aria-label="Изменить статус">${task.status === "done" ? "✓" : "○"}</button><span>${escapeHTML(task.title)}</span></div>`).join("") : `<p>Нет задач</p>`}</div></article>`;
  });
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const defaultDate = dateKey(today()) >= dateKey(start) && dateKey(today()) <= dateKey(end) ? dateKey(today()) : dateKey(start);
  return `<div class="life-heading-row"><div class="section-intro"><h2>${escapeHTML(formatDate(dateKey(start)))} — ${escapeHTML(formatDate(dateKey(end)))}</h2><p>Недельное планирование</p></div><div class="life-pager"><button class="secondary-button" data-life-week="-1" aria-label="Предыдущая неделя">←</button><button class="secondary-button" data-life-week="0">Текущая неделя</button><button class="secondary-button" data-life-week="1" aria-label="Следующая неделя">→</button><button class="primary-button" type="button" data-open-quick-task>＋ Добавить задачу</button></div></div>
    ${quickTaskDialog(defaultDate)}<div class="life-week-grid">${days.join("")}</div>`;
}

export function renderMonth() {
  const current = today();
  const monthDate = new Date(current.getFullYear(), current.getMonth() + monthOffset, 1);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(1 - ((firstDay.getDay() + 6) % 7));
  const tasks = tasksByDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    const matching = tasks.filter(task => task.date === key);
    return `<div class="life-month-day${date.getMonth() === monthDate.getMonth() ? "" : " is-outside"}${key === dateKey(today()) ? " is-today" : ""}"><strong>${date.getDate()}</strong>${matching.slice(0, 2).map(task => `<button class="life-month-task${task.status === "done" ? " is-done" : ""}" data-life-complete="${escapeAttr(task.id)}" title="${escapeAttr(task.title)}">${escapeHTML(task.title)}</button>`).join("")}${matching.length > 2 ? `<small>+${matching.length - 2} ещё</small>` : ""}</div>`;
  });
  const defaultDate = monthDate.getFullYear() === current.getFullYear() && monthDate.getMonth() === current.getMonth()
    ? dateKey(current) : dateKey(monthDate);
  return `<div class="life-heading-row"><div class="section-intro"><h2>${escapeHTML(new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(monthDate))}</h2><p>Месячный календарь задач.</p></div><div class="life-pager"><button class="secondary-button" data-life-month="-1" aria-label="Предыдущий месяц">←</button><button class="secondary-button" data-life-month="0">Текущий месяц</button><button class="secondary-button" data-life-month="1" aria-label="Следующий месяц">→</button><button class="primary-button" type="button" data-open-quick-task>＋ Добавить задачу</button></div></div>${quickTaskDialog(defaultDate)}<div class="life-month-grid">${["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => `<div class="life-weekday">${day}</div>`).join("")}${cells.join("")}</div>`;
}

export function adjustPlanner(view, amount) {
  if (view === "week") weekOffset = amount === 0 ? 0 : weekOffset + amount;
  if (view === "month") monthOffset = amount === 0 ? 0 : monthOffset + amount;
}
