import { APP_CONFIG } from "../config.js";
import { storage } from "../core/storage.js";
import { events } from "../core/events.js";
const makeId = () => globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
const initial = [
  { id: "t1", title: "Продукты", category: "Дом", amount: -4200, date: new Date().toISOString() },
  { id: "t2", title: "Доход", category: "Зарплата", amount: 85000, date: new Date().toISOString() },
  { id: "t3", title: "Транспорт", category: "Транспорт", amount: -1200, date: new Date().toISOString() }
];
function save(items) { storage.write(APP_CONFIG.storageKeys.transactions, items); events.emit("finance:changed", items); return items; }
export const financeService = {
  list() { return storage.read(APP_CONFIG.storageKeys.transactions, initial); },
  add({ title, category, amount }) {
    title = String(title ?? "").trim(); if (!title) throw new Error("Укажи описание операции.");
    const numericAmount = Number(amount); if (!Number.isFinite(numericAmount) || numericAmount === 0) throw new Error("Сумма должна быть ненулевым числом.");
    return save([{ id: makeId(), title, category: String(category ?? "Другое").trim() || "Другое", amount: numericAmount, date: new Date().toISOString() }, ...this.list()]);
  },
  update(id, changes) {
    const items = this.list(); const index = items.findIndex(item => item.id === id);
    if (index < 0) throw new Error("Операция не найдена.");
    const amount = Number(changes.amount ?? items[index].amount);
    if (!Number.isFinite(amount) || amount === 0) throw new Error("Сумма должна быть ненулевым числом.");
    items[index] = { ...items[index], ...changes, title: String(changes.title ?? items[index].title).trim(), category: String(changes.category ?? items[index].category).trim(), amount };
    if (!items[index].title || !items[index].category) throw new Error("Заполни описание и категорию.");
    return save(items);
  },
  remove(id) { return save(this.list().filter(item => item.id !== id)); }
};
