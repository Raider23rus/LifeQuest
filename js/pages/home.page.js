import { questService } from "../services/quest.service.js";
import { financeService } from "../services/finance.service.js";
import { familyService, FAMILY_ROLES } from "../services/family.service.js";
import { setPage, escapeHTML, formatMoney } from "../ui/render.js";
<<<<<<< HEAD
import { lifeService } from "../services/life.service.js";
=======
>>>>>>> 28e5a2dfa42c4f82a35452afa9491e5a6e18f9e3
export function renderHome(user, users = []) {
  const quests = questService.list(), transactions = financeService.list();
  const family = user ? familyService.get(user.email) : null;
  const done = quests.filter(q => q.done).length, total = quests.length;
  const balance = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const name = user?.name?.split(" ")[0] || "друг";
  const streak = questService.activityStreak();
<<<<<<< HEAD
  const lifeState = lifeService.state();
  const dayKey = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const todayTasks = lifeState.tasks.filter(task => task.date === dayKey);
  const activeProjects = lifeState.projects.filter(project => project.status === "active");
  const progression = lifeService.progress();
=======
>>>>>>> 28e5a2dfa42c4f82a35452afa9491e5a6e18f9e3
  const lastDigit = streak % 10, lastTwoDigits = streak % 100;
  const streakLabel = lastDigit === 1 && lastTwoDigits !== 11 ? "день подряд" : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? "дня подряд" : "дней подряд";
  setPage({ title: "Главная", html: `
    <section class="welcome"><div class="welcome-copy"><div class="eyebrow">ТВОЯ СЕМЕЙНАЯ ВСЕЛЕННАЯ</div><h2>Привет, ${escapeHTML(name)}! ✨</h2><p>Большие перемены начинаются с маленьких шагов. Выбери квест и двигайся к целям вместе с семьёй.</p></div><button class="primary-button" data-view="quests">Посмотреть квесты&nbsp; →</button></section>
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-top">Баланс операций <span class="stat-icon">◈</span></div><div class="stat-value">${formatMoney(balance)}</div><div class="stat-foot">Сумма демо-операций</div></article>
      <article class="stat-card"><div class="stat-top">Выполнено квестов <span class="stat-icon">✦</span></div><div class="stat-value">${done}<span class="muted">/${total}</span></div><div class="stat-foot"><span class="positive">${total ? Math.round(done/total*100) : 0}%</span> общего прогресса</div></article>
      <article class="stat-card"><div class="stat-top">Опыт семьи <span class="stat-icon">⚡</span></div><div class="stat-value">${quests.filter(q=>q.done).reduce((sum,q)=>sum+q.xp,0)} XP</div><div class="stat-foot">За выполненные задания</div></article>
      <article class="stat-card"><div class="stat-top">Серия активности <span class="stat-icon">♧</span></div><div class="stat-value">${streak} ${streakLabel}</div><div class="stat-foot">За выполнение квестов</div></article>
    </div>
<<<<<<< HEAD
    <div class="life-home-grid">
      <section class="panel"><div class="panel-heading"><div><h3>Фокус дня</h3><p class="muted" style="margin:5px 0 0">Задачи, которые запланированы на сегодня.</p></div><button class="text-button" data-view="today">Все задачи →</button></div>
        ${todayTasks.length ? todayTasks.slice(0,3).map(task=>`<div class="quest-row"><div class="quest-symbol">${task.status==="done"?"✓":"○"}</div><div class="quest-info"><strong>${escapeHTML(task.title)}</strong><small>${task.xp} XP</small></div><span class="pill${task.status==="done"?"":" pending"}">${task.status==="done"?"Готово":"В работе"}</span></div>`).join("") : `<div class="life-empty">На сегодня пока нет задач. Добавь первую в план.</div>`}
      </section>
      <section class="panel"><div class="panel-heading"><div><h3>Активные проекты</h3><p class="muted" style="margin:5px 0 0">${activeProjects.length} в работе</p></div><button class="text-button" data-view="projects">Проекты →</button></div>
        ${activeProjects.length ? activeProjects.slice(0,3).map(project=>`<div class="quest-row"><div class="quest-symbol">▣</div><div class="quest-info"><strong>${escapeHTML(project.title)}</strong><small>${escapeHTML(lifeState.spheres.find(sphere=>sphere.id===project.sphereId)?.title||"Личный проект")}</small></div></div>`).join("") : `<div class="life-empty">Создай проект, когда будешь готов выделить ему место в фокусе.</div>`}
      </section>
      <section class="panel life-home-character"><div class="panel-heading"><h3>Персонаж</h3><button class="text-button" data-view="character">Открыть →</button></div><strong>${escapeHTML(progression.levelName)}</strong><p>${progression.xp} XP · ${progression.rewardPoints} RP · открыто достижений: ${progression.unlocked.length}</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,progression.xpInLevel/150*100)}%"></div></div></section>
    </div>
=======
>>>>>>> 28e5a2dfa42c4f82a35452afa9491e5a6e18f9e3
    <div class="content-grid"><div>
      <section class="panel"><div class="panel-heading"><h3>Твои квесты</h3><button class="text-button" data-view="quests">Все квесты →</button></div>
      ${quests.slice(0,4).map(q=>`<div class="quest-row"><div class="quest-symbol">${q.done?"✓":"✦"}</div><div class="quest-info"><strong>${escapeHTML(q.title)}</strong><small>${escapeHTML(q.category)} · ${q.xp} XP</small></div><span class="pill ${q.done?"":"pending"}">${q.done?"Готово":"В процессе"}</span></div>`).join("")}
      </section>
      <section class="panel"><div class="panel-heading"><h3>Исследуй LifeQuest</h3></div><div class="feature-grid">
        <button class="feature-card" data-view="quests"><div class="feature-icon">✦</div><h3>Цели и квесты</h3><p>Разбивай большие цели на маленькие действия.</p></button>
        <button class="feature-card" data-view="finance"><div class="feature-icon">◈</div><h3>Финансовый хаб</h3><p>Смотри доходы, расходы и денежный поток.</p></button>
        <button class="feature-card" data-view="family"><div class="feature-icon">♧</div><h3>Семейное ядро</h3><p>Знакомься с ролями и прогрессом команды.</p></button>
      </div></section>
    </div><div>
      <section class="panel"><div class="panel-heading"><h3>Общий прогресс</h3><span class="pill">${total ? Math.round(done/total*100) : 0}%</span></div><div class="progress-head"><span class="muted">Квесты завершены</span><strong>${done} из ${total}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${total?done/total*100:0}%"></div></div><p class="muted" style="font-size:11px;line-height:1.6;margin:15px 0 0">Каждый небольшой шаг приближает семью к большой цели.</p></section>
      <section class="panel"><div class="panel-heading"><div><h3>Семейная команда</h3>${family ? `<p class="muted" style="margin:5px 0 0">${escapeHTML(family.name)}</p>` : ""}</div><button class="text-button" data-view="family">${family ? "Управлять →" : "Создать семью →"}</button></div>${family ? `<div class="family-list">${family.members.map(member=>{const account=users.find(item=>item.email.toLowerCase()===member.email);const memberName=account?.name||member.name;const fullName=[memberName,account?.patronymic||member.patronymic].filter(Boolean).join(" ");return `<div class="family-person"><div class="avatar">${escapeHTML((memberName||"?").trim().charAt(0).toUpperCase())}</div><div class="person-meta"><strong>${escapeHTML(fullName)}</strong><small>${escapeHTML(FAMILY_ROLES[member.role]||"Участник")}</small></div><span class="status-dot"></span></div>`}).join("")}</div><p class="muted" style="font-size:10px;margin:14px 0 0">${family.members.length} ${family.members.length === 1 ? "участник" : "участника"}</p>` : `<p class="muted" style="font-size:11px;line-height:1.6;margin:0">Семья ещё не создана. Создай её и добавь участников на странице семьи.</p>`}</section>
    </div></div>` });
}