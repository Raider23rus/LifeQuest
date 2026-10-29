import { APP_CONFIG } from "../config.js";
import { storage } from "../core/storage.js";
import { events } from "../core/events.js";

const initial = [
  { id: "q1", title: "Составить семейный план на неделю", category: "Семья", xp: 30, done: false },
  { id: "q2", title: "Записать три финансовые цели", category: "Финансы", xp: 20, done: false },
  { id: "q3", title: "15 минут обучения новому навыку", category: "Развитие", xp: 15, done: true }
];
const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
function save(quests) {
  if (!storage.write(APP_CONFIG.storageKeys.quests, quests)) throw new Error("Не удалось сохранить квесты в браузере.");
  events.emit("quests:changed", quests);
  return quests;
}
function recordActivity() {
  const key = APP_CONFIG.storageKeys.activityDates;
  const savedDates = storage.read(key, []);
  const dates = Array.isArray(savedDates) ? savedDates : [];
  const today = dateKey(new Date());
  if (!dates.includes(today) && !storage.write(key, [...dates, today])) {
    throw new Error("Не удалось сохранить серию активности в браузере.");
  }
}
export const questService = {
  list() { return storage.read(APP_CONFIG.storageKeys.quests, initial); },
  activityStreak() {
    const savedDates = storage.read(APP_CONFIG.storageKeys.activityDates, []);
    const dates = new Set(Array.isArray(savedDates) ? savedDates : []);
    const today = new Date();
    const todayKey = dateKey(today);
    if (!dates.has(todayKey)) today.setDate(today.getDate() - 1);
    if (!dates.has(dateKey(today))) return 0;
    let streak = 0;
    while (dates.has(dateKey(today))) {
      streak++;
      today.setDate(today.getDate() - 1);
    }
    return streak;
  },
  add(title, category = "Личное", xp = 20) {
    title = String(title ?? "").trim(); if (!title) throw new Error("Укажи название квеста.");
    return save([{ id: makeId(), title, category, xp: Math.max(0, Number(xp) || 0), done: false }, ...this.list()]);
  },
  update(id, changes) {
    const quests = this.list(); const index = quests.findIndex(q => q.id === id);
    if (index < 0) throw new Error("Квест не найден.");
    quests[index] = { ...quests[index], ...changes, title: String(changes.title ?? quests[index].title).trim() };
    if (!quests[index].title) throw new Error("Название квеста не может быть пустым.");
    return save(quests);
  },
  remove(id) { return save(this.list().filter(q => q.id !== id)); },
  toggle(id) {
    const quests = this.list();
    const quest = quests.find(item => item.id === id);
    if (!quest) throw new Error("Квест не найден.");
    if (!quest.done) recordActivity();
    return save(quests.map(item => item.id === id ? { ...item, done: !item.done } : item));
  }
};
