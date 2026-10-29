import { questService } from "../services/quest.service.js";
import { setPage, escapeHTML } from "../ui/render.js";
export function renderQuests(user) {
 const isAdmin = user?.role === "admin";
 const quests = questService.list();
 setPage({title:"Квесты и цели",html:`<div class="section-intro"><h2>Маленькие шаги — большие результаты</h2><p>Добавляй задания и отмечай выполнение. За каждый квест начисляется опыт.${isAdmin?" У администратора доступны добавление, изменение и удаление квестов.":""}</p></div>
 <section class="panel"><div class="panel-heading"><h3>Новый квест</h3></div><form id="questForm" class="inline-form"><input class="field" name="title" required maxlength="100" placeholder="Название квеста"><select class="field" name="category" style="max-width:180px"><option>Семья</option><option>Финансы</option><option>Развитие</option><option>Дом</option><option>Личное</option></select><input class="field" name="xp" type="number" min="0" max="10000" value="20" required aria-label="Опыт XP" style="max-width:100px"><button class="primary-button">Добавить</button></form></section>
 <section class="panel"><div class="panel-heading"><h3>Список заданий</h3><span class="pill">${quests.filter(q=>q.done).length}/${quests.length} выполнено</span></div>
 ${quests.length?quests.map(q=>`<div class="quest-row"><div class="quest-symbol">${q.done?"✓":"✦"}</div><div class="quest-info"><strong>${escapeHTML(q.title)}</strong><small>${escapeHTML(q.category)} · ${Number(q.xp)||0} XP</small></div><button class="table-action" data-toggle-quest="${escapeHTML(q.id)}">${q.done?"Вернуть":"Выполнено"}</button><button class="table-action danger-action" data-delete-quest="${escapeHTML(q.id)}">Удалить</button>${isAdmin?`<button class="table-action" data-edit-quest="${escapeHTML(q.id)}">Изменить</button>`:""}</div>`).join(""):`<div class="empty-state">Пока нет квестов. Создай первый выше.</div>`}</section>`});
}
