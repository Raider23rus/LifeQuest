import { financeService } from "../services/finance.service.js";
import { setPage, escapeHTML, formatMoney, formatDate } from "../ui/render.js";
export function renderFinance() {
  const items = financeService.list();
  const balances = financeService.getBalances();
  
  const income = items.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = items.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  
  setPage({
    title: "Финансовый хаб",
    html: `
<div class="section-intro"><h2>Учёт доходов и расходов.</h2></div>
<div class="stats-grid">
<article class="stat-card"><div class="stat-top">Доходы <span class="stat-icon">↗</span></div><div class="stat-value">${financeService.formatMoney(income)}</div><div class="stat-foot">Все записи с плюсом</div></article>
<article class="stat-card"><div class="stat-top">Расходы <span class="stat-icon">↘</span></div><div class="stat-value">${financeService.formatMoney(expenses)}</div><div class="stat-foot">Все записи с минусом</div></article>
<article class="stat-card"><div class="stat-top">Баланс активов <span class="stat-icon">⚙</span></div><div class="stat-value" style="color:#218a68;font-weight:700">${financeService.formatMoney(balances.totalAssets)}</div><div class="stat-foot">Активные записи</div></article>
<article class="stat-card"><div class="stat-top">Баланс пассивов <span class="stat-icon">⚠</span></div><div class="stat-value" style="color:#c05c5c;font-weight:700">${financeService.formatMoney(balances.totalLiabilities)}</div><div class="stat-foot">Отрицательные записи</div></article>
<article class="stat-card"><div class="stat-top">Денежный поток <span class="stat-icon">◈</span></div><div class="stat-value">${financeService.formatMoney(income - expenses)}</div><div class="stat-foot">Доходы минус расходы</div></article>
<article class="stat-card"><div class="stat-top">Итого операций <span class="stat-icon">≡</span></div><div class="stat-value">${items.length}</div><div class="stat-foot">Сохранено в браузере</div></article>
</div>

<section class="panel">
<div class="panel-heading"><h3>📊 Отчёт по активам и пассивам</h3></div>
<p class="muted">Актив: запись с положительной суммой (доход), Пассив: запись с отрицательной суммой (расход)</p>
<div class="table-wrap">
<table class="data-table" id="balanceReportTable"><thead><tr><th style="width:40%">Описание</th><th>Категория</th><th>Дата</th><th style="width:150px">Сумма</th></tr></thead><tbody>${balances.totalAssets > 0 ? balances.assets.map(t => `
<tr>
<td style="color:#218a68;font-weight:700">${escapeHTML(t.title)}</td>
<td>${escapeHTML(t.category)}</td>
<td>${financeService.formatDate(t.date)}</td>
<td style="font-size:15px;color:#218a68">+${financeService.formatMoney(t.amount)}</td>
</tr>`).join("") : `<tr><td colspan="4" class="muted">Активов нет</td></tr>`}${balances.totalLiabilities > 0 ? balances.liabilities.map(t => `
<tr>
<td style="color:#c05c5c;font-weight:700">${escapeHTML(t.title)}</td>
<td>${escapeHTML(t.category)}</td>
<td>${financeService.formatDate(t.date)}</td>
<td style="font-size:15px;color:#c05c5c">-${financeService.formatMoney(Math.abs(t.amount))}</td>
</tr>`).join("") : `<tr><td colspan="4" class="muted">Пассивов нет</td></tr>`}</tbody></table>
</div>
</section>

<section class="panel">
<div class="panel-heading"><h3>Добавить операцию</h3></div>
<form id="financeForm" class="inline-form">
<input class="field" name="title" required maxlength="80" placeholder="Описание"><input class="field" name="category" required maxlength="40" placeholder="Категория" style="max-width:150px"><input class="field" name="amount" type="number" step="0.01" required placeholder="Сумма (+ доход / − расход)" style="max-width:200px">
<button class="primary-button">Сохранить</button>
</form>
<p class="muted" style="font-size:10px">Положительное число — доход (актив), отрицательное — расход (пассив).</p>
</section>

<section class="panel">
<div class="panel-heading"><h3>История операций</h3></div>
<div class="table-wrap">
<table class="data-table"><thead><tr><th>Описание</th><th>Категория</th><th>Дата</th><th style="width:150px">Сумма</th><th>Управление</th></tr></thead><tbody>${items.map(t => `
<tr>
<td style="color:${t.amount>=0?"#218a68":"#c05c5c"};font-weight:700">${escapeHTML(t.title)}</td>
<td>${escapeHTML(t.category)}</td>
<td>${financeService.formatDate(t.date)}</td>
<td style="font-size:15px;color:${t.amount>=0?"#218a68":"#c05c5c"}">${t.amount>0?"+":""}${financeService.formatMoney(t.amount)}</td>
<td><button class="table-action" data-edit-finance="${escapeHTML(t.id)}">Изменить</button> <button class="table-action danger-action" data-delete-finance="${escapeHTML(t.id)}">Удалить</button></td>
</tr>`).join("")}</tbody></table>
</div>
</section>`
  });
}
financeService.formatMoney = (n) => { return Math.abs(Number(n)).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }); };
financeService.formatDate = (d) => { return new Date(d).toLocaleDateString('ru-RU'); };
