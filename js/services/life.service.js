import { APP_CONFIG } from "../config.js";
import { storage } from "../core/storage.js";

const initialState = {
  spheres: [], goals: [], projects: [], tasks: [], habits: [], quit: [],
  care: [], sport: [], familyTime: [], hobbies: [], rewards: [],
  dailyEntries: [], dailyAwards: [], xpAwards: [], unlockedAchievementIds: [], purchases: []
};
const collections = Object.keys(initialState);
const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
const todayKey = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const parseDate = value => {
  const [year, month, day] = String(value || "").split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};
function habitIsScheduled(habit, date) {
  const key = todayKey(date);
  const start = habit.startDate || habit.date;
  const end = habit.endDate;
  if (start && key < start || end && key > end) return false;
  const interval = Math.max(1, Number(habit.interval) || 1);
  if (!start || !habit.repeat || habit.repeat === "daily") {
    if (!start) return true;
    const elapsed = Math.floor((parseDate(key) - parseDate(start)) / 86400000);
    return elapsed % interval === 0;
  }
  const startDate = parseDate(start);
  const currentDate = parseDate(key);
  if (!startDate || !currentDate || currentDate < startDate) return false;
  if (habit.repeat === "weekly") {
    const elapsedDays = Math.floor((currentDate - startDate) / 86400000);
    return currentDate.getDay() === startDate.getDay() && Math.floor(elapsedDays / 7) % interval === 0;
  }
  if (habit.repeat === "monthly") {
    const elapsedMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12
      + currentDate.getMonth() - startDate.getMonth();
    return currentDate.getDate() === startDate.getDate() && elapsedMonths % interval === 0;
  }
  return true;
}
const validCollection = collection => {
  if (!collections.includes(collection)) throw new Error("Неизвестный раздел.");
};
function readState() {
  const state = storage.read(APP_CONFIG.storageKeys.life, initialState);
  const normalized = Object.fromEntries(collections.map(key => [key, Array.isArray(state?.[key]) ? state[key] : []]));
  if (!Array.isArray(state?.xpAwards)) {
    normalized.xpAwards = normalized.tasks.filter(task => task.firstCompletedAt)
      .map(task => ({ id: task.id, xp: Number(task.xp) || 0 }));
  }
  if (!Array.isArray(state?.dailyAwards)) normalized.dailyAwards = normalized.dailyEntries;
  return normalized;
}
function saveState(state) {
  const unlocked = new Set(state.unlockedAchievementIds || []);
  for (const achievement of achievements) {
    if (achievement.count(state) >= achievement.target) unlocked.add(achievement.id);
  }
  state.unlockedAchievementIds = [...unlocked];
  if (!storage.write(APP_CONFIG.storageKeys.life, state)) {
    throw new Error("Не удалось сохранить данные в браузере.");
  }
  return state;
}
const levels = [
  "Новобранец", "Искатель порядка", "Собиратель фокуса", "Ученик ритма", "Хранитель ритма",
  "Охотник за Done", "Укротитель дедлайнов", "Мастер привычек", "Архитектор целей", "Хранитель баланса",
  "Проводник перемен", "Чемпион регулярности", "Мастер планирования", "Стратег развития", "Герой дня",
  "Наставник команды", "Алхимик времени", "Опора семьи", "Мастер прогресса", "Легенда LifeQuest",
  "Хранитель горизонта", "Повелитель ритма", "Создатель возможностей", "Мастер постоянства",
  "Вдохновитель", "Покоритель вершин", "Мудрец пути", "Стратег жизни", "Воплощение фокуса", "Легенда"
];
const achievements = [
  { id: "first-task", group: "Выполнение", title: "Первый шаг", description: "Заверши первую задачу.", count: state => state.tasks.filter(item => item.firstCompletedAt).length, target: 1, xp: 10, rp: 5 },
  { id: "ten-tasks", group: "Выполнение", title: "Вошёл в ритм", description: "Заверши 10 задач.", count: state => state.tasks.filter(item => item.firstCompletedAt).length, target: 10, xp: 20, rp: 10 },
  { id: "fifty-tasks", group: "Выполнение", title: "Машина Done", description: "Заверши 50 задач.", count: state => state.tasks.filter(item => item.firstCompletedAt).length, target: 50, xp: 50, rp: 20 },
  { id: "first-goal", group: "Цели", title: "К большой цели", description: "Создай первую цель.", count: state => state.goals.length, target: 1, xp: 10, rp: 5 },
  { id: "first-project", group: "Проекты", title: "Личный проект", description: "Создай первый проект.", count: state => state.projects.length, target: 1, xp: 10, rp: 5 },
  { id: "first-sphere", group: "Баланс", title: "Карта жизни", description: "Добавь первую сферу жизни.", count: state => state.spheres.length, target: 1, xp: 10, rp: 5 },
  { id: "first-habit", group: "Регулярность", title: "Новый ритм", description: "Создай первую привычку.", count: state => state.habits.length, target: 1, xp: 10, rp: 5 },
  { id: "habit-week", group: "Регулярность", title: "Неделя заботы о себе", description: "Отметь привычки 7 раз.", count: state => state.dailyAwards.filter(entry => entry.kind === "habit").length, target: 7, xp: 20, rp: 10 },
  { id: "first-care", group: "Забота", title: "Забота начинается", description: "Добавь первый объект заботы.", count: state => state.care.length, target: 1, xp: 10, rp: 5 },
  { id: "first-sport", group: "Движение", title: "В движении", description: "Запиши первую тренировку.", count: state => state.sport.length, target: 1, xp: 10, rp: 5 },
  { id: "first-family", group: "Семья", title: "Вместе лучше", description: "Запланируй семейное занятие.", count: state => state.familyTime.length, target: 1, xp: 10, rp: 5 },
  { id: "first-hobby", group: "Интересы", title: "Время для себя", description: "Добавь первое хобби.", count: state => state.hobbies.length, target: 1, xp: 10, rp: 5 }
];

export const lifeService = {
  list(collection) {
    validCollection(collection);
    return readState()[collection];
  },
  state() { return readState(); },
  add(collection, fields) {
    validCollection(collection);
    const title = String(fields.title ?? "").trim();
    if (!title) throw new Error("Укажи название.");
    const state = readState();
    const numeric = {};
    for (const key of ["xp", "cost", "order", "interval", "minutes", "minLevel"]) {
      if (fields[key] !== undefined && fields[key] !== "") {
        const value = Number(fields[key]);
        if (!Number.isFinite(value) || value < 0) throw new Error("Значение должно быть положительным числом.");
        numeric[key] = value;
      }
    }
    const item = {
      id: makeId(), ...fields, ...numeric, title,
      createdAt: new Date().toISOString(),
      status: fields.status || "active"
    };
    delete item.collection;
    delete item.action;
    delete item.kind;
    if (collection === "tasks") {
      item.date = fields.date || todayKey();
      item.xp = numeric.xp ?? 10;
      item.status = "active";
    }
    if (collection === "spheres") {
      if (fields.color && !/^#[\da-f]{6}$/i.test(fields.color)) {
        throw new Error("Выбран некорректный цвет сферы.");
      }
      item.color = fields.color || "#4778f5";
      item.icon = String(fields.icon || "◉").slice(0, 8);
      item.order = numeric.order ?? state.spheres.length;
      item.description = String(fields.description || "").trim();
    }
    if (collection === "projects") {
      const progress = Number(fields.progress ?? 0);
      if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
        throw new Error("Прогресс проекта должен быть от 0 до 100.");
      }
      item.progress = progress;
      item.status = "planned";
      item.description = String(fields.description || "").trim();
      item.expectedResult = String(fields.expectedResult || "").trim();
      item.completionCriteria = String(fields.completionCriteria || "").trim();
      item.context = fields.context === "work" ? "work" : "personal";
      item.targetDate = fields.targetDate || "";
      item.nextAction = String(fields.nextAction || "").trim();
    }
    if (collection === "habits") {
      const interval = numeric.interval ?? 1;
      if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
        throw new Error("Повторять можно с интервалом от 1 до 365.");
      }
      if (fields.endDate && fields.startDate && fields.endDate < fields.startDate) {
        throw new Error("Дата окончания не может быть раньше даты начала.");
      }
      item.description = String(fields.description || "").trim();
      item.repeat = ["daily", "weekly", "monthly"].includes(fields.repeat) ? fields.repeat : "daily";
      item.interval = interval;
      item.startDate = fields.startDate || todayKey();
      item.endDate = fields.endDate || "";
      item.time = fields.time || "";
      item.minutes = numeric.minutes ?? 0;
      item.status = "active";
    }
    if (collection === "quit") {
      item.startDate = fields.startDate || todayKey();
      item.description = String(fields.description || "").trim();
      item.status = "active";
    }
    if (collection === "care") {
      item.type = fields.type || "other";
      item.notes = String(fields.notes || "").trim();
    }
    if (collection === "sport") {
      item.category = String(fields.category || "").trim();
      item.description = String(fields.description || "").trim();
      item.regular = fields.regular === "on";
      if (item.regular) {
        const interval = numeric.interval ?? 1;
        if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
          throw new Error("Повторять можно с интервалом от 1 до 365.");
        }
        item.repeat = ["daily", "weekly", "monthly"].includes(fields.repeat) ? fields.repeat : "weekly";
        item.interval = interval;
        item.startDate = fields.startDate || todayKey();
      }
    }
    if (collection === "familyTime") {
      item.participants = String(fields.participants || "").trim();
      item.description = String(fields.description || "").trim();
      item.regular = fields.regular === "on";
      if (item.regular) {
        const interval = numeric.interval ?? 1;
        if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
          throw new Error("Повторять можно с интервалом от 1 до 365.");
        }
        item.repeat = ["daily", "weekly", "monthly"].includes(fields.repeat) ? fields.repeat : "weekly";
        item.interval = interval;
        item.startDate = fields.startDate || todayKey();
      }
    }
    if (collection === "hobbies") {
      item.description = String(fields.description || "").trim();
      item.regular = fields.regular === "on";
      if (item.regular) {
        const interval = numeric.interval ?? 1;
        if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
          throw new Error("Повторять можно с интервалом от 1 до 365.");
        }
        item.repeat = ["daily", "weekly", "monthly"].includes(fields.repeat) ? fields.repeat : "weekly";
        item.interval = interval;
        item.startDate = fields.startDate || todayKey();
      }
    }
    if (collection === "rewards") {
      const minLevel = numeric.minLevel ?? 1;
      if (!Number.isInteger(minLevel) || minLevel < 1 || minLevel > levels.length) {
        throw new Error(`Минимальный уровень должен быть от 1 до ${levels.length}.`);
      }
      item.cost = numeric.cost ?? 25;
      if (item.cost < 1) throw new Error("Стоимость награды должна быть не меньше 1 RP.");
      item.minLevel = minLevel;
      item.rewardType = ["personal", "family", "experience"].includes(fields.rewardType) ? fields.rewardType : "personal";
      item.repeatable = fields.repeatable === "on";
      item.description = String(fields.description || "").trim();
    }
    state[collection] = [item, ...state[collection]];
    saveState(state);
    return item;
  },
  remove(collection, id) {
    validCollection(collection);
    const state = readState();
    state[collection] = state[collection].filter(item => item.id !== id);
    saveState(state);
  },
  completeTask(id) {
    const state = readState();
    const task = state.tasks.find(item => item.id === id);
    if (!task) throw new Error("Задача не найдена.");
    if (task.status === "done") {
      task.status = "active";
    } else {
      task.status = "done";
      task.completedAt = task.completedAt || new Date().toISOString();
      task.firstCompletedAt = task.firstCompletedAt || task.completedAt;
      if (!state.xpAwards.some(award => award.id === task.id)) {
        state.xpAwards.push({ id: task.id, xp: Number(task.xp) || 0 });
      }
    }
    saveState(state);
  },
  toggleStatus(collection, id) {
    if (!["goals", "projects"].includes(collection)) throw new Error("Для этой записи нельзя изменить статус.");
    const state = readState();
    const item = state[collection].find(entry => entry.id === id);
    if (!item) throw new Error("Запись не найдена.");
    item.status = item.status === "done" ? "active" : "done";
    saveState(state);
  },
  activateProject(id) {
    const state = readState();
    const project = state.projects.find(item => item.id === id);
    if (!project) throw new Error("Проект не найден.");
    if (project.status !== "planned") throw new Error("Этот проект уже активирован.");
    project.status = "active";
    saveState(state);
  },
  markDaily(kind, id) {
    if (kind !== "habit" && kind !== "quit") throw new Error("Неизвестная ежедневная отметка.");
    const state = readState();
    const exists = state[kind === "habit" ? "habits" : "quit"].some(item => item.id === id);
    if (!exists) throw new Error("Запись не найдена.");
    const item = state[kind === "habit" ? "habits" : "quit"].find(entry => entry.id === id);
    if (kind === "habit" && !habitIsScheduled(item, new Date())) throw new Error("Эта привычка сегодня не запланирована.");
    const startDate = item.startDate || item.date;
    if (kind === "quit" && startDate && todayKey() < startDate) throw new Error("Дата начала цели отказа ещё не наступила.");
    const key = `${kind}:${id}:${todayKey()}`;
    const index = state.dailyEntries.findIndex(entry => entry.key === key);
    if (index >= 0) state.dailyEntries.splice(index, 1);
    else {
      const entry = { key, kind, id, date: todayKey() };
      state.dailyEntries.push(entry);
      if (!state.dailyAwards.some(award => award.key === key)) state.dailyAwards.push(entry);
    }
    saveState(state);
  },
  isMarkedToday(kind, id) {
    const key = `${kind}:${id}:${todayKey()}`;
    return readState().dailyEntries.some(entry => entry.key === key);
  },
  isScheduledToday(habit) { return habitIsScheduled(habit, new Date()); },
  progress() {
    const state = readState();
    const unlocked = achievements.filter(item => state.unlockedAchievementIds.includes(item.id) || item.count(state) >= item.target);
    const xp = state.xpAwards.reduce((sum, award) => sum + (Number(award.xp) || 0), 0)
      + state.dailyAwards.length * 2 + unlocked.reduce((sum, item) => sum + item.xp, 0);
    const level = Math.min(levels.length, 1 + Math.floor(xp / 150));
    const currentThreshold = (level - 1) * 150;
    const nextThreshold = level * 150;
    const purchases = state.purchases.reduce((sum, item) => sum + item.cost, 0);
    const rewardPoints = Math.floor(xp / 10) + unlocked.reduce((sum, item) => sum + item.rp, 0) - purchases;
    return {
      xp, level, levelName: levels[level - 1], nextLevel: Math.min(level + 1, levels.length),
      nextLevelName: levels[Math.min(level, levels.length - 1)],
      levelNames: levels,
      xpInLevel: xp - currentThreshold, xpToNext: Math.max(0, nextThreshold - xp),
      rewardPoints: Math.max(0, rewardPoints), unlocked, achievements
    };
  },
  purchase(id) {
    const state = readState();
    const reward = state.rewards.find(item => item.id === id && item.status !== "archived");
    if (!reward) throw new Error("Награда недоступна.");
    const progress = this.progress();
    if (progress.level < (Number(reward.minLevel) || 1)) {
      throw new Error(`Для этой награды нужен уровень ${Number(reward.minLevel) || 1}.`);
    }
    if (!reward.repeatable && state.purchases.some(item => item.rewardId === id)) {
      throw new Error("Эту награду можно купить только один раз.");
    }
    if (progress.rewardPoints < Number(reward.cost)) throw new Error("Недостаточно Reward Points.");
    state.purchases.push({
      id: makeId(), rewardId: reward.id, title: reward.title,
      cost: Number(reward.cost), purchasedAt: new Date().toISOString()
    });
    saveState(state);
  }
};
