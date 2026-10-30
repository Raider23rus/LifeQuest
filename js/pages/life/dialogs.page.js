import { lifeService } from "../../services/life.service.js";
import { escapeAttr, today, dateKey } from "./shared.js";

export function recurrenceFields(defaultRepeat = "weekly", defaultDate = dateKey(today()), includeEnd = false) {
  return `<div class="life-recurrence-grid">
    <label class="life-quick-field">Повторение<select class="field" name="repeat"><option value="daily"${defaultRepeat === "daily" ? " selected" : ""}>Ежедневно</option><option value="weekly"${defaultRepeat === "weekly" ? " selected" : ""}>Еженедельно</option><option value="monthly"${defaultRepeat === "monthly" ? " selected" : ""}>Ежемесячно</option></select></label>
    <label class="life-quick-field">Повторять каждые<input class="field" name="interval" type="number" min="1" max="365" value="1" required><small>1 = каждый период, 2 = через период.</small></label>
    <label class="life-quick-field">Начало<input class="field" name="startDate" type="date" value="${escapeAttr(defaultDate)}" required></label>
    ${includeEnd ? `<label class="life-quick-field">Окончание<input class="field" name="endDate" type="date"></label>` : ""}
  </div>`;
}

export function structuredDialog(view) {
  const date = dateKey(today());
  const forms = {
    habits: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новая привычка</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="habits">
        <div class="life-quick-grid"><label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label><label class="life-quick-field">Описание<textarea class="field" name="description" rows="2" maxlength="300"></textarea></label></div>
        <h3 class="life-form-section-title">Расписание</h3>${recurrenceFields("daily", date, true)}
        <div class="life-recurrence-grid life-recurrence-extra"><label class="life-quick-field">Время<input class="field" name="time" type="time"></label><label class="life-quick-field">Минуты<input class="field" name="minutes" type="number" min="0" max="1440"></label></div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Сохранить</button></footer>
      </form>`,
    quit: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новая цель отказа</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="quit"><label class="life-quick-field">От чего отказываемся<input class="field" name="title" required maxlength="100"></label>
        <label class="life-quick-field life-quit-date">Дата начала<input class="field" name="startDate" type="date" value="${escapeAttr(date)}" required></label>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Сохранить</button></footer>
      </form>`,
    care: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новый объект заботы</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="care">
        <label class="life-quick-field life-care-field">Название<input class="field" name="title" required maxlength="100"></label>
        <label class="life-quick-field life-care-field">Тип<select class="field" name="type"><option value="other">Другое</option><option value="plant">Растение</option><option value="pet">Питомец</option><option value="home">Дом</option><option value="aquarium">Аквариум</option></select></label>
        <label class="life-quick-field life-care-field">Заметки<textarea class="field" name="notes" rows="3" maxlength="500"></textarea></label>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`,
    sport: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новое: активность</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="sport">
        <div class="life-quick-grid"><label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label><label class="life-quick-field">Категория<input class="field" name="category" maxlength="80"></label></div>
        <label class="life-quick-field life-sport-description">Описание<textarea class="field" name="description" rows="3" maxlength="400"></textarea></label>
        <h3 class="life-form-section-title">Расписание</h3><label class="life-schedule-toggle"><input type="checkbox" name="regular" data-toggle-life-schedule> Планировать регулярно</label>
        <div class="life-optional-schedule" hidden>${recurrenceFields("weekly", date, false)}</div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`,
    familyTime: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новое: семейное дело</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="familyTime">
        <div class="life-quick-grid"><label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label><label class="life-quick-field">Участники<input class="field" name="participants" maxlength="200"></label></div>
        <label class="life-quick-field life-family-description">Описание<textarea class="field" name="description" rows="3" maxlength="400"></textarea></label>
        <h3 class="life-form-section-title">Расписание</h3><label class="life-schedule-toggle"><input type="checkbox" name="regular" data-toggle-life-schedule> Планировать регулярно</label>
        <div class="life-optional-schedule" hidden>${recurrenceFields("weekly", date, false)}</div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`,
    hobbies: `<header class="life-quick-header"><h2 id="structuredDialogTitle">Новое: хобби</h2><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
      <form class="life-quick-form" data-life-form="hobbies">
        <label class="life-quick-field">Название<input class="field" name="title" required maxlength="100"></label>
        <label class="life-quick-field life-hobby-description">Описание<textarea class="field" name="description" rows="3" maxlength="400"></textarea></label>
        <h3 class="life-form-section-title">Расписание</h3><label class="life-schedule-toggle"><input type="checkbox" name="regular" data-toggle-life-schedule> Планировать регулярно</label>
        <div class="life-optional-schedule" hidden>${recurrenceFields("weekly", date, false)}</div>
        <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать</button></footer>
      </form>`
  };
  return `<dialog class="life-quick-dialog life-structured-dialog life-structured-${view}" id="lifeFormDialog" aria-labelledby="structuredDialogTitle">${forms[view]}</dialog>`;
}

export function rewardDialog() {
  return `<dialog class="life-quick-dialog life-structured-dialog life-reward-dialog" id="lifeFormDialog" aria-labelledby="structuredDialogTitle">
    <header class="life-quick-header"><div><h2 id="structuredDialogTitle">Новая награда</h2><p>Награда должна быть достаточно желанной, но не превращать систему в бесконечный магазин.</p></div><button type="button" class="life-quick-close" data-close-life-dialog aria-label="Закрыть">×</button></header>
    <form class="life-quick-form" data-life-form="rewards">
      <label class="life-quick-field">Название<input class="field" name="title" required maxlength="100" placeholder="Например, вечер без дел"></label>
      <label class="life-quick-field life-reward-description">Описание<textarea class="field" name="description" rows="3" maxlength="400" placeholder="Что именно вы себе разрешаете или покупаете"></textarea></label>
      <div class="life-quick-grid life-reward-grid">
        <label class="life-quick-field">Стоимость, RP<input class="field" name="cost" type="number" min="1" max="100000" value="25" required></label>
        <label class="life-quick-field">Минимальный уровень<input class="field" name="minLevel" type="number" min="1" max="30" value="1" required></label>
      </div>
      <label class="life-quick-field">Тип награды<select class="field" name="rewardType"><option value="personal">Личная</option><option value="family">Семейная</option><option value="experience">Впечатление</option></select></label>
      <label class="life-schedule-toggle life-reward-repeat"><input type="checkbox" name="repeatable"> Можно покупать повторно</label>
      <footer class="life-quick-footer"><button type="button" class="life-quick-cancel" data-close-life-dialog>Отмена</button><button type="submit" class="primary-button">Создать награду</button></footer>
    </form>
  </dialog>`;
}
