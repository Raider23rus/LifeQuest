// Централизованные настройки приложения.
export const APP_CONFIG = Object.freeze({
  name: "LifeQuest",
  storageKeys: Object.freeze({
    users: "lifequest.demo.users.v1",
    session: "lifequest.demo.session.v1",
    quests: "lifequest.demo.quests.v1",
    transactions: "lifequest.demo.transactions.v1",
    activityDates: "lifequest.demo.activity-dates.v1",
    family: "lifequest.demo.family.v1"
  }),
  // Только для локального ознакомления. Удалите демо-учётную запись перед публикацией.
  demoAdmin: { name: "Администратор", email: "admin@lifequest.local", password: "Admin123!", role: "admin" }
});