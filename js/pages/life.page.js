import { lifeService } from "../services/life.service.js";
import { escapeHTML, setPage } from "../ui/render.js";

const pageInfo = {
  today: ["Сегодня", "ЕЖЕДНЕВНЫЙ ФОКУС", "Задачи и привычки на сегодня."],
  week: ["Неделя", "НЕДЕЛЬНОЕ ПЛАНИРОВАНИЕ", "Планируй неделю небольшими шагами."],
  month: ["Месяц", "МЕСЯЧНЫЙ ОБЗОР", "План задач на месяц."],
  spheres: ["Сферы жизни", "СТРУКТУРА ЖИЗНИ", "Большие направления, которые помогают держать баланс."],
  goals: ["Цели", "СФЕРЫ ЖИЗНИ · ЦЕЛИ", "Направления результата, сгруппированные по сферам жизни."],
  projects: ["Проекты", "ПРОЕКТЫ / PERSONAL WIP", "Держи в фокусе то, что действительно движется вперёд."],
  tasks: ["Задачи", "ИСПОЛНЕНИЕ", "Все незавершённые задачи находятся в одном рабочем списке."],
  habits: ["Привычки", "ЖИЗНЬ · РЕГУЛЯРНОСТЬ", "Небольшие повторяющиеся действия создают устойчивый прогресс."],
  quit: ["Отказ от привычек", "ЖИЗНЬ · САМОКОНТРОЛЬ", "Ежедневные отметки помогают сохранять выбранный курс."],
  care: ["Забота", "ЖИЗНЬ · ЗАБОТА", "Растения, питомцы и другие объекты регулярной заботы."],
  sport: ["Спорт", "ЖИЗНЬ · ДВИЖЕНИЕ", "Записывай тренировки и поддерживай активность."],
  familyTime: ["Семья", "ЖИЗНЬ · БЛИЗКИЕ", "Совместные планы и время с близкими."],
  hobbies: ["Хобби", "ЖИЗНЬ · ИНТЕРЕСЫ", "Занятия для себя — с расписанием или без него."],
  character: ["Персонаж", "ИГРОВОЙ ПРОФИЛЬ", "Твой реальный прогресс, превращённый в уровни, XP и награды."],
  levels: ["Уровни", "ПРОГРЕСС", "30 ступеней развития. Опыт за реальные действия."],
  achievements: ["Достижения", "КОЛЛЕКЦИЯ", "Достижения открываются автоматически по фактическим действиям."],
  rewards: ["Магазин наград", "REWARD POINTS", "Создавай личные награды и обменивай Reward Points."]
};
const collectionInfo = {
  spheres: { collection: "spheres", add: "Новая сфера", placeholder: "Например, Здоровье", empty: "Сфер пока нет", detail: item => item.description },
  goals: { collection: "goals", add: "Новая цель", placeholder: "Например, выучить язык", empty: "Целей пока нет", detail: item => [item.sphereName, item.date && `до ${formatDate(item.date)}`].filter(Boolean).join(" · ") },
  projects: { collection: "projects", add: "Новый проект", placeholder: "Название проекта", empty: "Проектов пока нет", detail: item => [item.goalName, item.sphereName].filter(Boolean).join(" · ") },
  tasks: { collection: "tasks", add: "Добавить задачу", placeholder: "Что нужно сделать?", empty: "Задач пока нет", detail: item => `${formatDate(item.date)} · ${item.xp} XP` },
  habits: { collection: "habits", add: "Новая привычка", placeholder: "Например, читать 20 минут", empty: "Привычек пока нет", detail: item => [repeatLabel(item.repeat, item.interval), item.time, item.minutes && `${item.minutes} мин.`].filter(Boolean).join(" · ") },
  quit: { collection: "quit", add: "Новая цель отказа", placeholder: "От чего хочешь отказаться?", empty: "Целей отказа пока нет", detail: item => `Начало: ${formatDate(item.startDate || dateKey(today()))}` },
  care: { collection: "care", add: "Новый объект заботы", placeholder: "Название", empty: "Объектов пока нет", detail: item => [careTypeLabel(item.type), item.notes].filter(Boolean).join(" · ") },
  sport: { collection: "sport", add: "Новое занятие", placeholder: "Название активности", empty: "Записей о тренировках пока нет", detail: item => [item.category, item.regular ? `${repeatLabel(item.repeat, item.interval)} с ${formatDate(item.startDate)}` : "Разовая активность", item.description].filter(Boolean).join(" · ") },
  familyTime: { collection: "familyTime", add: "Новое семейное дело", placeholder: "Название", empty: "Совместных планов пока нет", detail: item => [item.participants, item.regular ? `${repeatLabel(item.repeat, item.interval)} с ${formatDate(item.startDate)}` : "", item.description].filter(Boolean).join(" · ") },
  hobbies: { collection: "hobbies", add: "Новое хобби", placeholder: "Например, рисование", empty: "Хобби пока нет", detail: item => [item.regular ? `${repeatLabel(item.repeat, item.interval)} с ${formatDate(item.startDate)}` : "", item.description].filter(Boolean).join(" · ") },
  rewards: { collection: "rewards", add: "Новая награда", placeholder: "Например, вечер кино", empty: "Наград пока нет", detail: item => [`${item.cost} RP`, `уровень ${item.minLevel || 1}`, item.rewardType === "family" ? "Семейная" : item.rewardType === "experience" ? "Впечатление" : "Личная", item.repeatable ? "можно покупать повторно" : "одна покупка", item.description].filter(Boolean).join(" · ") }
};

let weekOffset = 0;
let monthOffset = 0;
let projectFilter = "active";
const escapeAttr = escapeHTML;
const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
const dateKey = date => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const formatDate = value => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
const fullDate = value => new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(value);
const repeatLabel = (repeat, interval = 1) => {
  const intervalText = Number(interval) > 1 ? `каждые ${interval} ` : "";
  const unit = { daily: Number(interval) > 1 ? "дня" : "ежедневно", weekly: Number(interval) > 1 ? "недели" : "еженедельно", monthly: Number(interval) > 1 ? "месяца" : "ежемесячно" }[repeat];
  return unit ? `${intervalText}${unit}` : "Ежедневно";
};
const careTypeLabel = type => ({ plant: "Растение", pet: "Питомец", home: "Дом", aquarium: "Аквариум", other: "Другое" }[type] || "Другое");
const sphereOptions = selected => lifeService.list("spheres").map(item =>
  `<option value="${escapeAttr(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHTML(item.title)}</option>`).join("");
const goalOptions = selected => lifeService.list("goals").map(item =>
  `<option value="${escapeAttr(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHTML(item.title)}</option>`).join("");
const projectOptions = selected => lifeService.list("projects").map(item =>
  `<option value="${escapeAttr(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHTML(item.title)}</option>`).join("");
function enriched(collection) {
  const state = lifeService.state();
  const sphereName = id => state.spheres.find(item => item.id === id)?.title;
  const goalName = id => state.goals.find(item => item.id === id)?.title;
  return state[collection].map(item => ({ ...item, sphereName: sphereName(item.sphereId), goalName: goalName(item.goalId) }));
}
function formFor(view) {
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
function taskRow(task) {
  return `<div class="quest-row life-task-row${task.status === "done" ? " is-done" : ""}"><button type="button" class="life-check" data-life-complete="${escapeAttr(task.id)}" aria-label="${task.status === "done" ? "Вернуть задачу в работу" : "Завершить задачу"}">${task.status === "done" ? "✓" : "○"}</button><div class="quest-info"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML([task.sphereName, task.goalName, task.projectName, `${task.xp} XP`].filter(Boolean).join(" · "))}</small></div><span class="pill${task.status === "done" ? "" : " pending"}">${task.status === "done" ? "Готово" : formatDate(task.date)}</span><button type="button" class="table-action danger-action" data-life-delete="tasks" data-id="${escapeAttr(task.id)}" aria-label="Удалить задачу">Удалить</button></div>`;
}
function tasksByDate() {
  const state = lifeService.state();
  return state.tasks.map(task => ({
    ...task,
    sphereName: state.spheres.find(item => item.id === task.sphereId)?.title,
    goalName: state.goals.find(item => item.id === task.goalId)?.title,
    projectName: state.projects.find(item => item.id === task.projectId)?.title
  }));
}
function renderToday() {
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
function quickTaskDialog(defaultDate) {
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
function dailyRow(item, kind) {
  const checked = lifeService.isMarkedToday(kind, item.id);
  const detail = kind === "habit" ? [item.time, item.minutes && `${item.minutes} мин.`].filter(Boolean).join(" · ") : "День без вредной привычки";
  return `<div class="quest-row"><button type="button" class="life-check${checked ? " checked" : ""}" data-life-mark="${kind}" data-id="${escapeAttr(item.id)}" aria-pressed="${checked}">${checked ? "✓" : "○"}</button><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(detail || (kind === "habit" ? repeatLabel(item.repeat, item.interval) : "День без вредной привычки"))}</small></div><span class="pill${checked ? "" : " pending"}">${checked ? "Отмечено" : "Отметить"}</span></div>`;
}
function renderWeek() {
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
function renderMonth() {
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
function itemRow(view, item) {
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
function renderCollection(view) {
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
function recurrenceFields(defaultRepeat = "weekly", defaultDate = dateKey(today()), includeEnd = false) {
  return `<div class="life-recurrence-grid">
    <label class="life-quick-field">Повторение<select class="field" name="repeat"><option value="daily"${defaultRepeat === "daily" ? " selected" : ""}>Ежедневно</option><option value="weekly"${defaultRepeat === "weekly" ? " selected" : ""}>Еженедельно</option><option value="monthly"${defaultRepeat === "monthly" ? " selected" : ""}>Ежемесячно</option></select></label>
    <label class="life-quick-field">Повторять каждые<input class="field" name="interval" type="number" min="1" max="365" value="1" required><small>1 = каждый период, 2 = через период.</small></label>
    <label class="life-quick-field">Начало<input class="field" name="startDate" type="date" value="${escapeAttr(defaultDate)}" required></label>
    ${includeEnd ? `<label class="life-quick-field">Окончание<input class="field" name="endDate" type="date"></label>` : ""}
  </div>`;
}
function structuredDialog(view) {
  const date = dateKey(today());
  const forms = {
    habits: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новая привычка</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="habits">
        <div class="life-quick-grid"><label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label><label class="life-quick-field">Описание<textarea class="field" name="description" rows="2" maxlength="300"></textarea></label></div>
        <h3 class="life-form-section-title">Расписание</h3>${recurrenceFields("daily", date, true)}
        <div class="life-recurrence-grid life-recurrence-extra"><label class="life-quick-field">Время<input class="field" name="time" type="time"></label><label class="life-quick-field">Минуты<input class="field" name="minutes" type="number" min="0" max="1440"></label></div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Сохранить</button></footer>
      </form>`,
    quit: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новая цель отказа</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="quit"><label class="life-quick-field">От чего отказываемся<input class="field" name="title" required maxlength="100"></label>
        <label class="life-quick-field life-quit-date">Дата начала<input class="field" name="startDate" type="date" value="${escapeAttr(date)}" required></label>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Сохранить</button></footer>
      </form>`,
    care: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новый объект заботы</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="care">
        <label class="life-quick-field life-care-field">Название<input class="field" name="title" required maxlength="100"></label>
        <label class="life-quick-field life-care-field">Тип<select class="field" name="type"><option value="other">Другое</option><option value="plant">Растение</option><option value="pet">Питомец</option><option value="home">Дом</option><option value="aquarium">Аквариум</option></select></label>
        <label class="life-quick-field life-care-field">Заметки<textarea class="field" name="notes" rows="3" maxlength="500"></textarea></label>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`,
    sport: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новое: активность</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="sport">
        <div class="life-quick-grid"><label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label><label class="life-quick-field">Категория<input class="field" name="category" maxlength="80"></label></div>
        <label class="life-quick-field life-sport-description">Описание<textarea class="field" name="description" rows="3" maxlength="400"></textarea></label>
        <h3 class="life-form-section-title">Расписание</h3><label class="life-schedule-toggle"><input type="checkbox" name="regular" data-toggle-life-schedule> Планировать регулярно</label>
        <div class="life-optional-schedule" hidden>${recurrenceFields("weekly", date, false)}</div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`,
    familyTime: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новое: семейное дело</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="familyTime">
        <div class="life-quick-grid"><label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label><label class="life-quick-field">Участники<input class="field" name="participants" maxlength="200"></label></div>
        <label class="life-quick-field life-family-description">Описание<textarea class="field" name="description" rows="3" maxlength="400"></textarea></label>
        <h3 class="life-form-section-title">Расписание</h3><label class="life-schedule-toggle"><input type="checkbox" name="regular" data-toggle-life-schedule> Планировать регулярно</label>
        <div class="life-optional-schedule" hidden>${recurrenceFields("weekly", date, false)}</div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`,
    hobbies: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новое: хобби</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="hobbies">
        <label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label>
        <label class="life-quick-field life-hobby-description">Описание<textarea class="field" name="description" rows="3" maxlength="400"></textarea></label>
        <h3 class="life-form-section-title">Расписание</h3><label class="life-schedule-toggle"><input type="checkbox" name="regular" data-toggle-life-schedule> Планировать регулярно</label>
        <div class="life-optional-schedule" hidden>${recurrenceFields("weekly", date, false)}</div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`
  };
  return `<dialog class="life-quick-dialog life-structured-dialog life-structured-${view}" id="lifeFormDialog" aria-labelledby="structuredDialogTitle">${forms[view]}</dialog>`;
}
function rewardDialog() {
  return `<dialog class="life-quick-dialog life-structured-dialog life-reward-dialog" id="lifeFormDialog" aria-labelledby="structuredDialogTitle">
    <header class="life-quick-header"><div><h2 id="structuredDialogTitle">Новая награда</h2><p>Награда должна быть достаточно желанной, но не превращать систему в бесконечный магазин.</p></div><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
    <form class="life-quick-form" data-life-form="rewards">
      <label class="life-quick-field">Название<input class="field" name="title" required maxlength="100" placeholder="Например, вечер без дел"></label>
      <label class="life-quick-field life-reward-description">Описание<textarea class="field" name="description" rows="3" maxlength="400" placeholder="Что именно вы себе разрешаете или покупаете"></textarea></label>
      <div class="life-quick-grid life-reward-grid">
        <label class="life-quick-field">Стоимость, RP<input class="field" name="cost" type="number" min="1" max="100000" value="25" required></label>
        <label class="life-quick-field">Минимальный уровень<input class="field" name="minLevel" type="number" min="1" max="30" value="1" required></label>
      </div>
      <label class="life-quick-field">Тип награды<select class="field" name="rewardType"><option value="personal">Личная</option><option value="family">Семейная</option><option value="experience">Впечатление</option></select></label>
      <label class="life-schedule-toggle life-reward-repeat"><input type="checkbox" name="repeatable"> Можно покупать повторно</label>
      <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать награду</button></footer>
    </form>
  </dialog>`;
}
function renderStructuredCollection(view, rows) {
  const info = collectionInfo[view];
  const addLabel = { habits: "＋ Новая привычка", quit: "＋ Новая цель", care: "＋ Новый объект", sport: "＋ Добавить", familyTime: "＋ Добавить", hobbies: "＋ Новое хобби" }[view];
  return `<div class="life-heading-row"><div class="section-intro"><h2>${escapeHTML(pageInfo[view][0])}</h2><p>${escapeHTML(pageInfo[view][2])}</p></div><button class="primary-button" type="button" data-open-life-dialog>${addLabel}</button></div>
    ${view === "habits" || view === "quit" ? `<section class="panel life-daily-summary"><strong>${lifeService.list("dailyEntries").filter(entry => entry.date === dateKey(today())).length}</strong><span>отметок сегодня</span></section>` : ""}
    ${structuredDialog(view)}
    <section class="panel"><div class="panel-heading"><h3>${escapeHTML(pageInfo[view][0])}</h3><span class="pill">${rows.length}</span></div>${rows.length ? rows.map(item => itemRow(view, item)).join("") : `<div class="life-empty">${escapeHTML(info.empty)}. Добавь первую запись.</div>`}</section>`;
}
function renderCharacter() {
  const progress = lifeService.progress();
  const state = lifeService.state();
  const achievements = progress.unlocked;
  return `<div class="section-intro"><h2>Персонаж</h2><p>Реальные действия превращаются в XP, уровни, достижения и Reward Points.</p></div>
    <section class="panel life-character"><div class="life-character-avatar">♜</div><div class="life-character-info"><span>УРОВЕНЬ ${progress.level}</span><h2>${escapeHTML(progress.levelName)}</h2><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, progress.xpInLevel / 150 * 100)}%"></div></div><small>${progress.xp} XP · ещё ${progress.xpToNext} XP до следующего уровня</small></div><div class="life-character-rp"><span>REWARD POINTS</span><strong>${progress.rewardPoints}</strong></div></section>
    <div class="stats-grid life-stats"><article class="stat-card"><div class="stat-top">Lifetime XP</div><div class="stat-value">${progress.xp}</div></article><article class="stat-card"><div class="stat-top">Уровень</div><div class="stat-value">${progress.level}</div></article><article class="stat-card"><div class="stat-top">Достижения</div><div class="stat-value">${achievements.length}/${progress.achievements.length}</div></article><article class="stat-card"><div class="stat-top">Задачи в работе</div><div class="stat-value">${state.tasks.filter(item => item.status !== "done").length}</div></article></div>
    <div class="life-shortcuts"><button class="secondary-button" data-view="levels">Уровни →</button><button class="secondary-button" data-view="achievements">Достижения →</button><button class="secondary-button" data-view="rewards">Магазин наград →</button></div>
    <section class="panel"><div class="panel-heading"><h3>Последние достижения</h3><button class="text-button" data-view="achievements">Все →</button></div>${achievements.length ? achievements.slice(-3).reverse().map(item => `<div class="quest-row"><div class="quest-symbol">✦</div><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description)}</small></div><span class="pill">+${item.rp} RP</span></div>`).join("") : `<div class="life-empty">Первое достижение впереди — создай сферу жизни или заверши задачу.</div>`}</section>`;
}
function renderLevels() {
  const progress = lifeService.progress();
  return `<div class="section-intro"><h2>Уровни</h2><p>30 ступеней развития. Достигнутый уровень не снижается.</p></div><section class="panel life-level-summary"><div><span>СЕЙЧАС</span><strong>${progress.level}</strong><small>${escapeHTML(progress.levelName)}</small></div><div><span>СЛЕДУЮЩАЯ ЦЕЛЬ</span><strong>${progress.nextLevel}</strong><small>${escapeHTML(progress.nextLevelName)}</small></div><div class="life-level-xp"><span>PROGRESSION XP</span><strong>${progress.xp}</strong><small>до следующего: ${progress.xpToNext} XP</small></div></section>
    <div class="life-level-list">${Array.from({ length: 30 }, (_, index) => {
      const number = index + 1;
      const threshold = index * 150;
      const current = number === progress.level;
      const unlocked = number <= progress.level;
      return `<article class="life-level-row${current ? " is-current" : ""}${unlocked ? " is-unlocked" : ""}"><div class="life-level-badge">${number}</div><div class="quest-info"><strong>${escapeHTML(progress.levelNames[index])}</strong><small>${threshold} XP${number === 1 ? " · старт" : ""}</small>${current ? `<div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, progress.xpInLevel / 150 * 100)}%"></div></div>` : ""}</div><span class="pill${unlocked ? "" : " pending"}">${current ? "Текущий" : unlocked ? "Открыт" : "Впереди"}</span></article>`;
    }).join("")}</div>`;
}
function renderAchievements() {
  const progress = lifeService.progress();
  const groups = [...new Set(progress.achievements.map(item => item.group))];
  return `<div class="section-intro"><h2>Достижения</h2><p>${escapeHTML(pageInfo.achievements[2])}</p></div><section class="panel life-achievement-summary"><strong>Открыто ${progress.unlocked.length} из ${progress.achievements.length}</strong><div class="progress-track"><div class="progress-fill" style="width:${progress.unlocked.length / progress.achievements.length * 100}%"></div></div></section>
    ${groups.map(group => {
      const items = progress.achievements.filter(item => item.group === group);
      return `<section class="panel"><div class="panel-heading"><h3>✧ ${escapeHTML(group)}</h3><span class="muted">${items.filter(item => progress.unlocked.includes(item)).length}/${items.length}</span></div><div class="life-achievement-grid">${items.map(item => {
        const count = item.count(lifeService.state());
        const unlocked = count >= item.target;
        return `<article class="life-achievement-card${unlocked ? " is-unlocked" : ""}"><div class="life-achievement-icon">${unlocked ? "✦" : "◇"}</div><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description)}</small><small>${Math.min(count, item.target)}/${item.target} · +${item.xp} XP · +${item.rp} RP</small><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, count / item.target * 100)}%"></div></div></div></article>`;
      }).join("")}</div></section>`;
    }).join("")}`;
}

export function renderLifePage(view) {
  const [title, eyebrow, description] = pageInfo[view] || pageInfo.today;
  const html = view === "today" ? renderToday()
    : view === "week" ? renderWeek()
    : view === "month" ? renderMonth()
    : view === "character" ? renderCharacter()
    : view === "levels" ? renderLevels()
    : view === "achievements" ? renderAchievements()
    : collectionInfo[view] ? renderCollection(view)
    : `<div class="section-intro"><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p></div>`;
  setPage({ title, eyebrow, html });
}

export function adjustPlanner(view, amount) {
  if (view === "week") weekOffset = amount === 0 ? 0 : weekOffset + amount;
  if (view === "month") monthOffset = amount === 0 ? 0 : monthOffset + amount;
}

export function setProjectFilter(filter) {
  if (["planned", "active", "done", "all"].includes(filter)) projectFilter = filter;
}
