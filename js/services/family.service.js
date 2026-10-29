import { APP_CONFIG } from "../config.js";
import { storage } from "../core/storage.js";
import { events } from "../core/events.js";

export const FAMILY_ROLES = Object.freeze({
  adult: "Взрослый",
  participant: "Участник",
  teen: "Подросток",
  child: "Ребёнок",
  advisor: "Старший советник"
});

const normalizeEmail = email => String(email ?? "").trim().toLowerCase();

function listFamilies() {
  const saved = storage.read(APP_CONFIG.storageKeys.family, null);
  if (!saved) return [];
  if (Array.isArray(saved)) return saved.filter(family => family && Array.isArray(family.members));
  if (saved && Array.isArray(saved.members)) {
    const migrated = [{ ...saved, id: saved.id || `family-${Date.now()}` }];
    if (!storage.write(APP_CONFIG.storageKeys.family, migrated)) {
      throw new Error("Не удалось обновить сохранённые данные семьи.");
    }
    return migrated;
  }
  return [];
}

function save(families) {
  if (!storage.write(APP_CONFIG.storageKeys.family, families)) {
    throw new Error("Не удалось сохранить данные семьи в браузере.");
  }
  events.emit("family:changed", families);
  return families;
}

function familyFor(families, email) {
  const normalizedEmail = normalizeEmail(email);
  return families.find(family => family.members.some(member => normalizeEmail(member.email) === normalizedEmail)) || null;
}

function requireManager(family, actorEmail) {
  const actor = family?.members.find(member => normalizeEmail(member.email) === normalizeEmail(actorEmail));
  if (!actor || actor.role !== "adult") {
    throw new Error("Управлять семьёй и ролями может только взрослый участник.");
  }
}

function requireRole(role) {
  if (!Object.prototype.hasOwnProperty.call(FAMILY_ROLES, role)) throw new Error("Выбрана неизвестная роль.");
}

export const familyService = {
  get(email) {
    const families = listFamilies();
    return email ? familyFor(families, email) : families[0] || null;
  },

  roleFor(email) {
    return this.get(email)?.members.find(member => normalizeEmail(member.email) === normalizeEmail(email))?.role ?? null;
  },

  create({ name, creator }) {
    const familyName = String(name ?? "").trim();
    const email = normalizeEmail(creator?.email);
    if (familyName.length < 2) throw new Error("Название семьи должно содержать минимум 2 символа.");
    if (!email || !creator?.name) throw new Error("Войдите в аккаунт, чтобы создать семью.");
    const families = listFamilies();
    if (familyFor(families, email)) throw new Error("Ты уже состоишь в семье и не можешь создать или вступить в другую.");
    const family = {
      id: globalThis.crypto?.randomUUID?.() ?? `family-${Date.now()}-${Math.random()}`,
      name: familyName,
      createdAt: new Date().toISOString(),
      members: [{ email, name: creator.name, role: "adult" }]
    };
    save([...families, family]);
    return family;
  },

  addMember({ email, role, actorEmail, users }) {
    const families = listFamilies();
    const family = familyFor(families, actorEmail);
    if (!family) throw new Error("Сначала создайте семью.");
    requireManager(family, actorEmail);
    requireRole(role);
    const memberEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
      throw new Error("Укажи корректный адрес электронной почты.");
    }
    if (familyFor(families, memberEmail)) throw new Error("Этот пользователь уже состоит в другой семье.");
    const account = (users || []).find(user => normalizeEmail(user.email) === memberEmail);
    const invitedName = memberEmail.split("@")[0].replace(/[._-]+/g, " ").trim();
    family.members.push({ email: memberEmail, name: account?.name || invitedName || memberEmail, role });
    return save(families);
  },

  setRole({ email, role, actorEmail }) {
    const families = listFamilies();
    const family = familyFor(families, actorEmail);
    if (!family) throw new Error("Семья не найдена.");
    requireManager(family, actorEmail);
    requireRole(role);
    const memberEmail = normalizeEmail(email);
    const member = family.members.find(item => item.email === memberEmail);
    if (!member) throw new Error("Участник семьи не найден.");
    if (member.role === "adult" && role !== "adult" &&
        family.members.filter(item => item.role === "adult").length <= 1) {
      throw new Error("В семье должен остаться хотя бы один взрослый.");
    }
    member.role = role;
    return save(families);
  },

  removeMember({ email, actorEmail }) {
    const families = listFamilies();
    const family = familyFor(families, actorEmail);
    if (!family) throw new Error("Семья не найдена.");
    requireManager(family, actorEmail);
    const memberEmail = normalizeEmail(email);
    const member = family.members.find(item => item.email === memberEmail);
    if (!member) throw new Error("Участник семьи не найден.");
    if (member.role === "adult" &&
        family.members.filter(item => item.role === "adult").length <= 1) {
      throw new Error("Нельзя удалить последнего взрослого из семьи.");
    }
    family.members = family.members.filter(item => item.email !== memberEmail);
    return save(families);
  },

  deleteFamily({ actorEmail }) {
    const families = listFamilies();
    const family = familyFor(families, actorEmail);
    if (!family) throw new Error("Семья не найдена.");
    requireManager(family, actorEmail);
    return save(families.filter(item => item.id !== family.id));
  }
};
