import { escapeHTML, setPage } from "../ui/render.js";
import { pageInfo, collectionInfo } from "./life/shared.js";
import { renderToday, renderWeek, renderMonth, adjustPlanner } from "./life/planner.page.js";
import { renderCollection, setProjectFilter } from "./life/collections.page.js";
import { renderCharacter, renderLevels, renderAchievements } from "./life/progression.page.js";

export function renderLifePage(view) {
  const [title, eyebrow, description] = pageInfo[view] || pageInfo.today;
  const html = view === "today" ? renderToday()
    : view === "week" ? renderWeek()
    : view === "month" ? renderMonth()
    : view === "character" ? renderCharacter()
    : view === "levels" ? renderLevels()
    : view === "achievements" ? renderAchievements()
    : collectionInfo[view] ? renderCollection(view)
    : `<div class="section-intro"><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p></div>`;
  setPage({ title, eyebrow, html });
}

export { adjustPlanner, setProjectFilter };
