(function () {
  const storageKey = "lifequest-theme";
  const root = document.documentElement;
  const themes = ["light", "dark", "gray"];
  const themeLabels = {
    light: "☾ Тёмная тема",
    dark: "◐ Серая тема",
    gray: "☀ Светлая тема"
  };
  let theme = "light";

  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (themes.includes(savedTheme)) theme = savedTheme;
  } catch (error) {
    console.warn("Не удалось загрузить сохранённую тему.", error);
  }

  function applyTheme() {
    const isDark = theme === "dark";
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.textContent = themeLabels[theme];
      button.setAttribute("aria-pressed", String(isDark));
    });
  }

  applyTheme();

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        theme = themes[(themes.indexOf(theme) + 1) % themes.length];
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
