import { $, toast } from "../../ui/render.js";
import { authService } from "../../services/auth.service.js";
import { questService } from "../../services/quest.service.js";
import { financeService } from "../../services/finance.service.js";
import { familyService } from "../../services/family.service.js";
import { lifeService } from "../../services/life.service.js";
import { renderQuests } from "../../pages/quests.page.js";
import { renderFinance } from "../../pages/finance.page.js";
import { adjustPlanner, setProjectFilter } from "../../pages/life.page.js";
import { render, navigate, view, setAuthMode, loadPublicIp } from "../runtime.js";

export function registerClickHandlers() {
 document.addEventListener("click", async event=>{
  const viewButton=event.target.closest("[data-view]");
  if(viewButton){event.preventDefault();navigate(viewButton.dataset.view);return;}
  const openQuickTask=event.target.closest("[data-open-quick-task]");
  if(openQuickTask){const dialog=$("#quickTaskDialog");if(dialog){dialog.showModal();$("input[name='title']",dialog).focus();}return;}
  const closeQuickTask=event.target.closest("[data-close-quick-task]");
  if(closeQuickTask){$("#quickTaskDialog")?.close();return;}
  const openSphereDialog=event.target.closest("[data-open-sphere-dialog]");
  if(openSphereDialog){const dialog=$("#sphereDialog");if(dialog){dialog.showModal();$("input[name='title']",dialog).focus();}return;}
  const closeSphereDialog=event.target.closest("[data-close-sphere-dialog]");
  if(closeSphereDialog){$("#sphereDialog")?.close();return;}
  const openProjectDialog=event.target.closest("[data-open-project-dialog]");
  if(openProjectDialog){const dialog=$("#projectDialog");if(dialog){dialog.showModal();$("input[name='title']",dialog).focus();}return;}
  const closeProjectDialog=event.target.closest("[data-close-project-dialog]");
  if(closeProjectDialog){$("#projectDialog")?.close();return;}
  const projectTab=event.target.closest("[data-project-filter]");
  if(projectTab){setProjectFilter(projectTab.dataset.projectFilter);render();return;}
  const activateProject=event.target.closest("[data-life-activate-project]");
  if(activateProject){try{lifeService.activateProject(activateProject.dataset.lifeActivateProject);render();toast("Проект активирован.");}catch(error){toast(error.message);}return;}
  const openLifeDialog=event.target.closest("[data-open-life-dialog]");
  if(openLifeDialog){const dialog=$("#lifeFormDialog");if(dialog){dialog.showModal();$("input[name='title']",dialog).focus();}return;}
  const closeLifeDialog=event.target.closest("[data-close-life-dialog]");
  if(closeLifeDialog){$("#lifeFormDialog")?.close();return;}
  const completeTask=event.target.closest("[data-life-complete]");
  if(completeTask){try{lifeService.completeTask(completeTask.dataset.lifeComplete);render();}catch(error){toast(error.message);}return;}
  const markDaily=event.target.closest("[data-life-mark]");
  if(markDaily){try{lifeService.markDaily(markDaily.dataset.lifeMark,markDaily.dataset.id);render();}catch(error){toast(error.message);}return;}
  const deleteLifeItem=event.target.closest("[data-life-delete]");
  if(deleteLifeItem){if(confirm("Удалить эту запись?")){try{lifeService.remove(deleteLifeItem.dataset.lifeDelete,deleteLifeItem.dataset.id);render();toast("Запись удалена.");}catch(error){toast(error.message);}}return;}
  const changeLifeStatus=event.target.closest("[data-life-status]");
  if(changeLifeStatus){try{lifeService.toggleStatus(changeLifeStatus.dataset.lifeStatus,changeLifeStatus.dataset.id);render();}catch(error){toast(error.message);}return;}
  const purchaseReward=event.target.closest("[data-life-purchase]");
  if(purchaseReward){try{lifeService.purchase(purchaseReward.dataset.lifePurchase);render();toast("Награда обменена.");}catch(error){toast(error.message);}return;}
  const plannerButton=event.target.closest("[data-life-week], [data-life-month]");
  if(plannerButton){adjustPlanner(view,Number(plannerButton.dataset.lifeWeek ?? plannerButton.dataset.lifeMonth));render();return;}
  const refreshIp=event.target.closest("[data-refresh-ip]");
  if(refreshIp){loadPublicIp();return;}
  const openRegister=event.target.closest("[data-open-register]");
  if(openRegister){window.location.href="register.html";return;}
  const modeButton=event.target.closest("[data-auth-mode]");
  if(modeButton){setAuthMode(modeButton.dataset.authMode);return;}
  const toggle=event.target.closest("[data-toggle-quest]");
  if(toggle){try{questService.toggle(toggle.dataset.toggleQuest);renderQuests(authService.current());toast("Прогресс квеста обновлён.");}catch(error){toast(error.message);}return;}
  const deleteQuest=event.target.closest("[data-delete-quest]");
  if(deleteQuest){if(confirm("Убрать этот квест без возможности восстановления?")){try{questService.remove(deleteQuest.dataset.deleteQuest);renderQuests(authService.current());toast("Квест убран.");}catch(error){toast(error.message);}}return;}
  const editQuest=event.target.closest("[data-edit-quest]");
  if(editQuest){if(authService.current()?.role!=="admin"){toast("Недостаточно прав.");return;}const q=questService.list().find(item=>item.id===editQuest.dataset.editQuest);if(!q)return;const title=prompt("Название квеста:",q.title);if(title===null)return;const category=prompt("Категория:",q.category);if(category===null)return;const xp=prompt("Опыт XP:",String(q.xp));if(xp===null)return;try{questService.update(q.id,{title,category,xp:Number(xp)});renderQuests(authService.current());toast("Квест изменён.");}catch(error){toast(error.message);}return;}
  const deleteFinance=event.target.closest("[data-delete-finance]");
  if(deleteFinance){if(confirm("Удалить финансовую операцию?")){try{financeService.remove(deleteFinance.dataset.deleteFinance);renderFinance();toast("Операция удалена.");}catch(error){toast(error.message);}}return;}
  const editFinance=event.target.closest("[data-edit-finance]");
  if(editFinance){const item=financeService.list().find(t=>t.id===editFinance.dataset.editFinance);if(!item){toast("Операция не найдена.");return;}const title=prompt("Описание операции:",item.title);if(title===null)return;const category=prompt("Категория:",item.category);if(category===null)return;const amount=prompt("Сумма (доход +, расход −):",String(item.amount));if(amount===null)return;try{financeService.update(item.id,{title,category,amount:Number(amount)});renderFinance();toast("Финансовая операция изменена.");}catch(error){toast(error.message);}return;}
  const roleButton=event.target.closest("[data-role-email]");
  if(roleButton){try{await authService.setRole(roleButton.dataset.roleEmail,roleButton.dataset.roleNext);render();toast("Роль пользователя обновлена.");}catch(error){toast(error.message);}return;}
  const deleteUser=event.target.closest("[data-delete-user]");
  if(deleteUser){
   if(!confirm(`Удалить аккаунт ${deleteUser.dataset.deleteUser}? Это действие нельзя отменить.`))return;
   try{await authService.deleteUser(deleteUser.dataset.deleteUser);render();toast("Пользователь удалён.");}catch(error){toast(error.message);}
   return;
  }
  const removeFamilyMember=event.target.closest("[data-remove-family-member]");
  if(removeFamilyMember&&confirm("Убрать участника из семьи?")){try{familyService.removeMember({email:removeFamilyMember.dataset.removeFamilyMember,actorEmail:authService.current()?.email});toast("Участник удалён из семьи.");}catch(error){toast(error.message);}return;}
  const deleteFamily=event.target.closest("[data-delete-family]");
  if(deleteFamily&&confirm("Удалить семью и список её участников? Это действие нельзя отменить.")){try{familyService.deleteFamily({actorEmail:authService.current()?.email});toast("Семья удалена.");}catch(error){toast(error.message);}return;}
 });
}
