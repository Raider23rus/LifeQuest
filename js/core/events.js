// Простая шина событий позволяет модулям общаться без жёстких зависимостей.
const listeners = new Map();
export const events = {
  on(name, callback) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(callback);
    return () => listeners.get(name)?.delete(callback);
  },
  emit(name, payload) { listeners.get(name)?.forEach(callback => callback(payload)); }
};