(function () {
  const storageKey = "lifequest-theme";
  const root = document.documentElement;
  let theme = "light";

  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
  } catch (error) {
    console.warn("Не удалось загрузить сохранённую тему.", error);
  }

  function applyTheme() {
    const isDark = theme === "dark";
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.textContent = isDark ? "☀ Светлая тема" : "☾ Тёмная тема";
      button.setAttribute("aria-pressed", String(isDark));
    });
  }

  applyTheme();

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        theme = theme === "dark" ? "light" : "dark";
        applyTheme();
        try {
          window.localStorage.setItem(storageKey, theme);
        } catch (error) {
          console.error("Не удалось сохранить выбранную тему.", error);
        }
      });
    });
  });
})();
