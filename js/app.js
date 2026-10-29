import { $ , toast } from "./ui/render.js";
import { authService } from "./services/auth.service.js";
import { questService } from "./services/quest.service.js";
import { financeService } from "./services/finance.service.js";
import { familyService } from "./services/family.service.js";
import { APP_CONFIG } from "./config.js";
import { events } from "./core/events.js";
import { renderHome } from "./pages/home.page.js";
import { renderQuests } from "./pages/quests.page.js";
import { renderFinance } from "./pages/finance.page.js";
import { renderFamily } from "./pages/family.page.js";
import { renderProfile } from "./pages/profile.page.js";
import { renderAdmin } from "./pages/admin.page.js";

let view = "home", authMode = "login", ipLookupId = 0;
const titles = {home:"Главная",quests:"Квесты и цели",finance:"Финансы",family:"Моя семья",admin:"Админ-панель"};
function isValidIpAddress(value) {
 const parts=value.split(".");
 if(parts.length===4&&parts.every(part=>/^\d{1,3}$/.test(part)&&Number(part)<=255))return true;
 return value.includes(":")&&/^[\da-f:]+$/i.test(value)&&value.split(":").length>=3;
}
async function loadPublicIp() {
 const requestId=++ipLookupId;
 const valueEl=$("#profileIpValue"),errorEl=$("#profileIpError"),button=$("[data-refresh-ip]");
 if(!valueEl||!errorEl||!button)return;
 valueEl.textContent="Определяем адрес…";errorEl.textContent="";button.disabled=true;
 try {
  const response=await fetch("https://api.2ip.io",{cache:"no-store"});
  if(!response.ok)throw new Error(`Сервис 2ip.io ответил с ошибкой (${response.status}).`);
  const data=await response.json();
  const ip=typeof data.ip==="string"?data.ip.trim():"";
  if(!isValidIpAddress(ip))throw new Error("Сервис 2ip.io вернул некорректный IP-адрес.");
  if(requestId!==ipLookupId||view!=="profile")return;
  valueEl.textContent=ip;
 } catch(error) {
  if(requestId!==ipLookupId||view!=="profile")return;
  valueEl.textContent="IP не определён";
  errorEl.textContent=error instanceof Error?error.message:"Не удалось получить IP от 2ip.io.";
 } finally {
  if(requestId===ipLookupId&&view==="profile"&&button.isConnected)button.disabled=false;
 }
}
function updateUserUI() {
 const user = authService.current();
 $("#miniName").textContent = user?.name || "Гость";
 $("#miniRole").textContent = user ? (user.role==="admin"?"Администратор":"Участник") : "Не авторизован";
 $("#miniAvatar").textContent = (user?.name || "Г").charAt(0).toUpperCase();
 $("#adminNav").classList.toggle("hidden", user?.role !== "admin");
 $("#profileNav").classList.toggle("hidden", !user);
 $("#authOpenBtn").textContent = user ? "Мой аккаунт" : "Войти / Регистрация";
}
function render() {
 updateUserUI();
 const user = authService.current();
 if (view === "profile" && !user) view = "home";
 if (view === "admin" && user?.role !== "admin") view = "home";
 document.querySelectorAll("[data-view]").forEach(el=>el.classList.toggle("active", el.dataset.view===view && el.classList.contains("nav-item")));
 ({home:()=>renderHome(user,authService.allUsers()),quests:()=>renderQuests(user),finance:()=>renderFinance(user),family:()=>renderFamily(user,authService.allUsers()),profile:()=>{renderProfile(user);loadPublicIp();},admin:()=>renderAdmin(user)}[view] || (()=>renderHome(user,authService.allUsers())))();
}
function navigate(next) { ipLookupId++;view=next; $("#sidebar").classList.remove("open"); render(); window.scrollTo({top:0,behavior:"smooth"}); }
function openAuth(mode="login") { setAuthMode(mode); $("#authError").textContent=""; $("#authDialog").showModal(); }
function setAuthMode(mode) {
 authMode=mode;
 document.querySelectorAll("[data-auth-mode]").forEach(btn=>btn.classList.toggle("active",btn.dataset.authMode===mode));
 $("#authName").classList.toggle("hidden",mode!=="register");
 $("#nameLabel").classList.toggle("hidden",mode!=="register");
 $("#authName").required=mode==="register";
 $("#authPassword").autocomplete=mode==="register"?"new-password":"current-password";
 $("#authTitle").textContent=mode==="register"?"Создай свой аккаунт":"С возвращением!";
 $("#authSubtitle").textContent=mode==="register"?"Начни строить семейные привычки вместе с LifeQuest.":"Войди, чтобы продолжить свой путь.";
 $("#authSubmit").textContent=mode==="register"?"Зарегистрироваться":"Войти";
}
$("#todayDate").textContent=new Intl.DateTimeFormat("ru-RU",{weekday:"short",day:"numeric",month:"short"}).format(new Date());
document.addEventListener("click", async event=>{
 const viewButton=event.target.closest("[data-view]");
 if(viewButton){event.preventDefault();navigate(viewButton.dataset.view);return;}
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
 if(deleteFinance){if(confirm("Удалить финансовую операцию?")){try{financeService.remove(deleteFinance.dataset.deleteFinance);renderFinance(authService.current());toast("Операция удалена.");}catch(error){toast(error.message);}}return;}
 const editFinance=event.target.closest("[data-edit-finance]");
 if(editFinance){const item=financeService.list().find(t=>t.id===editFinance.dataset.editFinance);if(!item){toast("Операция не найдена.");return;}const title=prompt("Описание операции:",item.title);if(title===null)return;const category=prompt("Категория:",item.category);if(category===null)return;const amount=prompt("Сумма (доход +, расход −):",String(item.amount));if(amount===null)return;try{financeService.update(item.id,{title,category,amount:Number(amount)});renderFinance(authService.current());toast("Финансовая операция изменена.");}catch(error){toast(error.message);}return;}
 const roleButton=event.target.closest("[data-role-email]");
 if(roleButton){try{await authService.setRole(roleButton.dataset.roleEmail,roleButton.dataset.roleNext);render();toast("Роль пользователя обновлена.");}catch(error){toast(error.message);}return;}
 const removeFamilyMember=event.target.closest("[data-remove-family-member]");
 if(removeFamilyMember&&confirm("Убрать участника из семьи?")){try{familyService.removeMember({email:removeFamilyMember.dataset.removeFamilyMember,actorEmail:authService.current()?.email});toast("Участник удалён из семьи.");}catch(error){toast(error.message);}return;}
 const deleteFamily=event.target.closest("[data-delete-family]");
 if(deleteFamily&&confirm("Удалить семью и список её участников? Это действие нельзя отменить.")){try{familyService.deleteFamily({actorEmail:authService.current()?.email});toast("Семья удалена.");}catch(error){toast(error.message);}return;}
});
$("#authOpenBtn").addEventListener("click",()=>authService.current()?navigate("profile"):openAuth("login"));
$("#closeAuth").addEventListener("click",()=>$("#authDialog").close());
$("#workspaceForgot").addEventListener("click",()=>{window.location.href="register.html?mode=reset";});
$("#logoutBtn").addEventListener("click",()=>{if(authService.current()){authService.logout();window.location.href="index.html";}else window.location.href="register.html?mode=login";});
document.addEventListener("click",event=>{if(event.target.closest("#profileLogoutBtn")){authService.logout();window.location.href="index.html";}});
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#authForm").addEventListener("submit",async event=>{
 event.preventDefault();$("#authError").textContent="";
 const data=new FormData(event.currentTarget);
 try {
  const user=authMode==="register"
   ? await authService.register({name:data.get("name"),email:data.get("email"),password:data.get("password")})
   : await authService.login({email:data.get("email"),password:data.get("password")});
  $("#authDialog").close();event.currentTarget.reset();navigate("home");toast(`Добро пожаловать, ${user.name}!`);
 } catch(error){$("#authError").textContent=error.message;}
});
$("#pageContent").addEventListener("submit",async event=>{
 if(event.target.id==="profileForm"){event.preventDefault();const form=event.target;const data=new FormData(form);const errorEl=$("#profileError",form);const successEl=$("#profileSuccess",form);errorEl.textContent="";successEl.textContent="";try{const updated=await authService.updateProfile({firstName:data.get("firstName"),surname:data.get("surname"),patronymic:data.get("patronymic"),email:data.get("email")});renderProfile(updated);toast("Данные профиля обновлены.");}catch(error){errorEl.textContent=error.message;}return;}
 if(event.target.id==="passwordForm"){event.preventDefault();const form=event.target;const data=new FormData(form);const errorEl=$("#passwordError",form);const successEl=$("#passwordSuccess",form);errorEl.textContent="";successEl.textContent="";try{const newPassword=String(data.get("newPassword")||"");if(newPassword!==String(data.get("confirmPassword")||""))throw new Error("Новый пароль и подтверждение не совпадают.");await authService.changePassword({currentPassword:String(data.get("currentPassword")||""),newPassword});form.reset();successEl.textContent="Пароль успешно изменён.";toast("Пароль обновлён.");}catch(error){errorEl.textContent=error.message;}return;}
 if(event.target.id==="familyCreateForm"){event.preventDefault();const data=new FormData(event.target);try{familyService.create({name:data.get("name"),creator:authService.current()});toast("Семья создана. Ты назначен взрослым.");}catch(error){toast(error.message);}return;}
 if(event.target.id==="familyAddMemberForm"){event.preventDefault();const data=new FormData(event.target);try{familyService.addMember({email:data.get("email"),role:data.get("role"),actorEmail:authService.current()?.email,users:authService.allUsers()});toast("Участник добавлен в семью.");}catch(error){toast(error.message);}return;}
 if(event.target.id==="questForm"){event.preventDefault();const data=new FormData(event.target);if(String(data.get("title")).trim()){try{questService.add(data.get("title"),data.get("category"),Number(data.get("xp")||20));renderQuests(authService.current());toast("Квест добавлен.");}catch(error){toast(error.message);}}}
 if(event.target.id==="financeForm"){event.preventDefault();const data=new FormData(event.target);const amount=Number(data.get("amount"));if(!Number.isFinite(amount)||amount===0){toast("Укажи ненулевую сумму.");return;}try{financeService.add({title:data.get("title"),category:data.get("category"),amount});renderFinance(authService.current());toast("Операция сохранена.");}catch(error){toast(error.message);}}
});
$("#pageContent").addEventListener("change",event=>{
 if(event.target.id!=="avatarInput")return;
 const file=event.target.files?.[0];if(!file)return;
 const errorEl=$("#avatarError");errorEl.textContent="";
 if(file.size>600*1024){errorEl.textContent="Файл слишком большой. Выбери фото до 600 КБ.";event.target.value="";return;}
 if(!file.type.startsWith("image/")){errorEl.textContent="Поддерживаются только изображения PNG, JPG, WEBP или GIF.";event.target.value="";return;}
 const reader=new FileReader();
 reader.onload=async()=>{try{const updated=await authService.setAvatar(String(reader.result));renderProfile(updated);toast("Аватар обновлён.");}catch(error){errorEl.textContent=error.message;}};
 reader.onerror=()=>{errorEl.textContent="Не удалось загрузить картинку.";};
 reader.readAsDataURL(file);
});
$("#pageContent").addEventListener("click",async event=>{
 if(!event.target.closest("#avatarReset"))return;
 try{const updated=await authService.setAvatar("");renderProfile(updated);toast("Фото профиля удалено.");}catch(error){$("#avatarError").textContent=error.message;}
});
$("#pageContent").addEventListener("change",event=>{
 const roleSelect=event.target.closest("[data-family-role]");
 if(!roleSelect)return;
 try{familyService.setRole({email:roleSelect.dataset.familyRole,role:roleSelect.value,actorEmail:authService.current()?.email});toast("Роль участника обновлена.");}catch(error){toast(error.message);render();}
});
events.on("auth:changed",render);
events.on("users:changed",render);
events.on("family:changed",render);
window.addEventListener("storage",event=>{
 if(event.key===APP_CONFIG.storageKeys.users)render();
});
events.on("quests:changed",()=>{if(view==="home")renderHome(authService.current(),authService.allUsers());});
events.on("finance:changed",()=>{if(view==="home")renderHome(authService.current(),authService.allUsers());});
render();