import { lifeService } from "../../services/life.service.js";
import { escapeHTML } from "../../ui/render.js";

export const pageInfo = {
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

export const collectionInfo = {
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

export const escapeAttr = escapeHTML;

export const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const dateKey = date => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const formatDate = value => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));

export const fullDate = value => new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(value);

export const repeatLabel = (repeat, interval = 1) => {
  const intervalText = Number(interval) > 1 ? `каждые ${interval} ` : "";
  const unit = { daily: Number(interval) > 1 ? "дня" : "ежедневно", weekly: Number(interval) > 1 ? "недели" : "еженедельно", monthly: Number(interval) > 1 ? "месяца" : "ежемесячно" }[repeat];
  return unit ? `${intervalText}${unit}` : "Ежедневно";
};

export const careTypeLabel = type => ({ plant: "Растение", pet: "Питомец", home: "Дом", aquarium: "Аквариум", other: "Другое" }[type] || "Другое");

export const sphereOptions = selected => lifeService.list("spheres").map(item =>
  `<option value="${escapeAttr(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHTML(item.title)}</option>`).join("");

export const goalOptions = selected => lifeService.list("goals").map(item =>
  `<option value="${escapeAttr(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHTML(item.title)}</option>`).join("");

export const projectOptions = selected => lifeService.list("projects").map(item =>
  `<option value="${escapeAttr(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHTML(item.title)}</option>`).join("");
