import { lifeService } from "../../services/life.service.js";
import { escapeHTML } from "../../ui/render.js";
import { pageInfo } from "./shared.js";

export function renderCharacter() {
  const progress = lifeService.progress();
  const state = lifeService.state();
  const achievements = progress.unlocked;
  return `<div class="section-intro"><h2>Персонаж</h2><p>Реальные действия превращаются в XP, уровни, достижения и Reward Points.</p></div>
    <section class="panel life-character"><div class="life-character-avatar">♜</div><div class="life-character-info"><span>УРОВЕНЬ ${progress.level}</span><h2>${escapeHTML(progress.levelName)}</h2><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, progress.xpInLevel / 150 * 100)}%"></div></div><small>${progress.xp} XP · ещё ${progress.xpToNext} XP до следующего уровня</small></div><div class="life-character-rp"><span>REWARD POINTS</span><strong>${progress.rewardPoints}</strong></div></section>
    <div class="stats-grid life-stats"><article class="stat-card"><div class="stat-top">Lifetime XP</div><div class="stat-value">${progress.xp}</div></article><article class="stat-card"><div class="stat-top">Уровень</div><div class="stat-value">${progress.level}</div></article><article class="stat-card"><div class="stat-top">Достижения</div><div class="stat-value">${achievements.length}/${progress.achievements.length}</div></article><article class="stat-card"><div class="stat-top">Задачи в работе</div><div class="stat-value">${state.tasks.filter(item => item.status !== "done").length}</div></article></div>
    <div class="life-shortcuts"><button class="secondary-button" data-view="levels">Уровни →</button><button class="secondary-button" data-view="achievements">Достижения →</button><button class="secondary-button" data-view="rewards">Магазин наград →</button></div>
    <section class="panel"><div class="panel-heading"><h3>Последние достижения</h3><button class="text-button" data-view="achievements">Все →</button></div>${achievements.length ? achievements.slice(-3).reverse().map(item => `<div class="quest-row"><div class="quest-symbol">✦</div><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description)}</small></div><span class="pill">+${item.rp} RP</span></div>`).join("") : `<div class="life-empty">Первое достижение впереди — создай сферу жизни или заверши задачу.</div>`}</section>`;
}

export function renderLevels() {
  const progress = lifeService.progress();
  return `<div class="section-intro"><h2>Уровни</h2><p>30 ступеней развития. Достигнутый уровень не снижается.</p></div><section class="panel life-level-summary"><div><span>СЕЙЧАС</span><strong>${progress.level}</strong><small>${escapeHTML(progress.levelName)}</small></div><div><span>СЛЕДУЮЩАЯ ЦЕЛЬ</span><strong>${progress.nextLevel}</strong><small>${escapeHTML(progress.nextLevelName)}</small></div><div class="life-level-xp"><span>PROGRESSION XP</span><strong>${progress.xp}</strong><small>до следующего: ${progress.xpToNext} XP</small></div></section>
    <div class="life-level-list">${Array.from({ length: 30 }, (_, index) => {
      const number = index + 1;
      const threshold = index * 150;
      const current = number === progress.level;
      const unlocked = number <= progress.level;
      return `<article class="life-level-row${current ? " is-current" : ""}${unlocked ? " is-unlocked" : ""}"><div class="life-level-badge">${number}</div><div class="quest-info"><strong>${escapeHTML(progress.levelNames[index])}</strong><small>${threshold} XP${number === 1 ? " · старт" : ""}</small>${current ? `<div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, progress.xpInLevel / 150 * 100)}%"></div></div>` : ""}</div><span class="pill${unlocked ? "" : " pending"}">${current ? "Текущий" : unlocked ? "Открыт" : "Впереди"}</span></article>`;
    }).join("")}</div>`;
}

export function renderAchievements() {
  const progress = lifeService.progress();
  const groups = [...new Set(progress.achievements.map(item => item.group))];
  return `<div class="section-intro"><h2>Достижения</h2><p>${escapeHTML(pageInfo.achievements[2])}</p></div><section class="panel life-achievement-summary"><strong>Открыто ${progress.unlocked.length} из ${progress.achievements.length}</strong><div class="progress-track"><div class="progress-fill" style="width:${progress.unlocked.length / progress.achievements.length * 100}%"></div></div></section>
    ${groups.map(group => {
      const items = progress.achievements.filter(item => item.group === group);
      return `<section class="panel"><div class="panel-heading"><h3>✧ ${escapeHTML(group)}</h3><span class="muted">${items.filter(item => progress.unlocked.includes(item)).length}/${items.length}</span></div><div class="life-achievement-grid">${items.map(item => {
        const count = item.count(lifeService.state());
        const unlocked = count >= item.target;
        return `<article class="life-achievement-card${unlocked ? " is-unlocked" : ""}"><div class="life-achievement-icon">${unlocked ? "✦" : "◇"}</div><div class="quest-info"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description)}</small><small>${Math.min(count, item.target)}/${item.target} · +${item.xp} XP · +${item.rp} RP</small><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, count / item.target * 100)}%"></div></div></div></article>`;
      }).join("")}</div></section>`;
    }).join("")}`;
}
