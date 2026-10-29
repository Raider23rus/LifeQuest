import { APP_CONFIG } from "../config.js";
import { storage } from "../core/storage.js";
import { events } from "../core/events.js";

const normalizeEmail = value => value.trim().toLowerCase();
function splitName(value = "") {
  const [firstName = "", ...surnameParts] = String(value).trim().split(/\s+/);
  return { firstName, surname: surnameParts.join(" ") };
}
const safeUser = ({ name, firstName, surname, patronymic, email, role, avatar }) => {
  const legacyName = splitName(name);
  firstName = firstName || legacyName.firstName;
  surname = surname ?? legacyName.surname;
  return { name: [firstName, surname].filter(Boolean).join(" "), firstName, surname, patronymic: patronymic || "", email, role, avatar: avatar || "" };
};

function ensureDemoAdmin() {
  const users = storage.read(APP_CONFIG.storageKeys.users, []);
  if (!users.some(user => user.email === APP_CONFIG.demoAdmin.email)) {
    users.push({ ...APP_CONFIG.demoAdmin, createdAt: new Date().toISOString() });
    storage.write(APP_CONFIG.storageKeys.users, users);
  }
}
ensureDemoAdmin();

function readUsers() { return storage.read(APP_CONFIG.storageKeys.users, []); }
function writeUsers(users) { storage.write(APP_CONFIG.storageKeys.users, users); }

function refreshSession(users, email) {
  const user = users.find(u => u.email === email);
  if (!user) { storage.remove(APP_CONFIG.storageKeys.session); events.emit("auth:changed", null); return null; }
  const session = safeUser(user);
  storage.write(APP_CONFIG.storageKeys.session, session);
  events.emit("auth:changed", session);
  return session;
}

export const authService = {
  current() { return storage.read(APP_CONFIG.storageKeys.session, null); },
  allUsers() { return readUsers().map(safeUser); },

  async register({ name, email, password }) {
    name = name.trim(); email = normalizeEmail(email);
    if (name.length < 2) throw new Error("Имя должно содержать минимум 2 символа.");
    if (password.length < 8) throw new Error("Пароль должен содержать минимум 8 символов.");
    const users = readUsers();
    if (users.some(user => user.email === email)) throw new Error("Аккаунт с такой почтой уже существует.");
    const user = { name, patronymic: "", email, password, role: "member", avatar: "", createdAt: new Date().toISOString() };
    users.push(user); writeUsers(users);
    const session = safeUser(user); storage.write(APP_CONFIG.storageKeys.session, session);
    events.emit("auth:changed", session); return session;
  },

  async login({ email, password }) {
    const users = readUsers();
    const user = users.find(item => item.email === normalizeEmail(email) && item.password === password);
    if (!user) throw new Error("Неверная почта или пароль.");
    const session = safeUser(user); storage.write(APP_CONFIG.storageKeys.session, session);
    events.emit("auth:changed", session); return session;
  },

  async resetPassword({ email, password }) {
    email = normalizeEmail(email);
    if (password.length < 8) throw new Error("Новый пароль должен содержать минимум 8 символов.");
    const users = readUsers();
    const user = users.find(item => item.email === email);
    if (!user) throw new Error("Аккаунт с такой почтой не найден.");
    user.password = password;
    writeUsers(users);
    return true;
  },

  logout() { storage.remove(APP_CONFIG.storageKeys.session); events.emit("auth:changed", null); },

  async setRole(email, role) {
    const current = this.current();
    if (current?.role !== "admin") throw new Error("Недостаточно прав.");
    if (!["admin", "member"].includes(role)) throw new Error("Недопустимая роль.");
    const users = readUsers();
    const target = users.find(user => user.email === email);
    if (!target) throw new Error("Пользователь не найден.");
    if (target.email === APP_CONFIG.demoAdmin.email && role !== "admin") throw new Error("Нельзя изменить роль встроенного демо-администратора.");
    target.role = role; writeUsers(users);
    if (current.email === email) storage.write(APP_CONFIG.storageKeys.session, safeUser(target));
    events.emit("users:changed", this.allUsers());
  },

  // ==== ПРОФИЛЬ ====

  async updateProfile({ firstName, surname, name, patronymic, email }) {
    const current = this.current();
    if (!current) throw new Error("Нужно войти в аккаунт.");
    const legacyName = splitName(name);
    firstName = String(firstName ?? legacyName.firstName).trim();
    surname = String(surname ?? legacyName.surname).trim();
    patronymic = String(patronymic ?? "").trim();
    email = normalizeEmail(String(email ?? ""));
    if (firstName.length < 2) throw new Error("Имя должно содержать минимум 2 символа.");
    if (surname.length < 2) throw new Error("Фамилия должна содержать минимум 2 символа.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Некорректная почта.");

    const users = readUsers();
    const me = users.find(u => u.email === current.email);
    if (!me) throw new Error("Аккаунт не найден.");
    if (email !== current.email && users.some(u => u.email === email)) {
      throw new Error("Этот email уже используется другим аккаунтом.");
    }
    me.firstName = firstName; me.surname = surname;
    me.name = [firstName, surname].join(" ");
    me.patronymic = patronymic; me.email = email;
    writeUsers(users);
    return refreshSession(users, email);
  },

  async changePassword({ currentPassword, newPassword }) {
    const current = this.current();
    if (!current) throw new Error("Нужно войти в аккаунт.");
    if (String(newPassword || "").length < 8) throw new Error("Новый пароль должен содержать минимум 8 символов.");
    const users = readUsers();
    const me = users.find(u => u.email === current.email);
    if (!me) throw new Error("Аккаунт не найден.");
    if (me.password !== currentPassword) throw new Error("Текущий пароль неверен.");
    if (me.password === newPassword) throw new Error("Новый пароль должен отличаться от текущего.");
    me.password = newPassword;
    writeUsers(users);
    events.emit("users:changed", this.allUsers());
    return true;
  },

  async setAvatar(dataUrl) {
    const current = this.current();
    if (!current) throw new Error("Нужно войти в аккаунт.");
    if (typeof dataUrl !== "string") throw new Error("Некорректное изображение.");
    if (dataUrl && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(dataUrl)) {
      throw new Error("Поддерживаются только PNG, JPG, WEBP или GIF.");
    }
    if (dataUrl.length > 900_000) throw new Error("Файл слишком большой. Выбери изображение до 600 КБ.");
    const users = readUsers();
    const me = users.find(u => u.email === current.email);
    if (!me) throw new Error("Аккаунт не найден.");
    me.avatar = dataUrl || "";
    writeUsers(users);
    return refreshSession(users, me.email);
  }
};