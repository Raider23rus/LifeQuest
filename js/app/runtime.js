import { $ } from "../ui/render.js";
import { authService } from "../services/auth.service.js";
import { renderHome } from "../pages/home.page.js";
import { renderQuests } from "../pages/quests.page.js";
import { renderFinance } from "../pages/finance.page.js";
import { renderFamily } from "../pages/family.page.js";
import { renderProfile } from "../pages/profile.page.js";
import { renderAdmin } from "../pages/admin.page.js";
import { renderLifePage } from "../pages/life.page.js";


export let view = "home", authMode = "login", ipLookupId = 0;
export const adminUserFilters = { search: "", role: "all" };
const lifeViews = new Set(["today","week","month","spheres","goals","projects","tasks","habits","quit","care","sport","familyTime","hobbies","character","levels","achievements","rewards"]);
const sidebar=$("#sidebar"),appShell=$("#app"),desktopSidebar=window.matchMedia("(min-width: 761px)");
export function updateAdminUserList() {
 const panel=$("[data-admin-user-panel]");
 if(!panel)return;
 const search=adminUserFilters.search.trim().toLocaleLowerCase("ru");
 const rows=panel.querySelectorAll("[data-admin-user-row]");
 let visibleCount=0;
 rows.forEach(row=>{
  const matches=(adminUserFilters.role==="all"||row.dataset.role===adminUserFilters.role)&&row.dataset.search.includes(search);
  row.hidden=!matches;
  if(matches)visibleCount++;
 });
 $("[data-admin-user-empty]",panel).hidden=visibleCount>0;
 $("[data-admin-user-count]",panel).textContent=`Показано ${visibleCount} из ${rows.length}`;
}
function setSidebarCollapsed(collapsed) {
 appShell.classList.toggle("sidebar-collapsed",collapsed);
 sidebar.querySelectorAll(".nav-item[data-view]").forEach(item=>{
  if(collapsed){
   item.dataset.sidebarTitle=item.title;
   item.title=item.textContent.replace(item.querySelector("span")?.textContent||"","").trim();
  }else{
   item.title=item.dataset.sidebarTitle||"";
   delete item.dataset.sidebarTitle;
  }
 });
}
setSidebarCollapsed(desktopSidebar.matches);
sidebar.addEventListener("mouseenter",()=>{if(desktopSidebar.matches)setSidebarCollapsed(false);});
sidebar.addEventListener("mouseleave",()=>{if(desktopSidebar.matches)setSidebarCollapsed(true);});
sidebar.addEventListener("focusin",()=>{if(desktopSidebar.matches)setSidebarCollapsed(false);});
sidebar.addEventListener("focusout",event=>{
 if(desktopSidebar.matches&&!sidebar.contains(event.relatedTarget))setSidebarCollapsed(true);
});
desktopSidebar.addEventListener("change",event=>{
 setSidebarCollapsed(event.matches&&!sidebar.matches(":hover")&&!sidebar.contains(document.activeElement));
});
function isValidIpAddress(value) {
 const parts=value.split(".");
 if(parts.length===4&&parts.every(part=>/^\d{1,3}$/.test(part)&&Number(part)<=255))return true;
 return value.includes(":")&&/^[\da-f:]+$/i.test(value)&&value.split(":").length>=3;
}
export async function loadPublicIp() {
 const requestId=++ipLookupId;
 const valueEl=$("#profileIpValue"),errorEl=$("#profileIpError"),button=$("[data-refresh-ip]");
 if(!valueEl||!errorEl)return;
 valueEl.textContent="Определяем адрес…";errorEl.textContent="";if(button)button.disabled=true;
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
  if(requestId===ipLookupId&&view==="profile"&&button?.isConnected)button.disabled=false;
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
export function render() {
 updateUserUI();
 const user = authService.current();
 if (view === "profile" && !user) view = "home";
 if (view === "admin" && user?.role !== "admin") view = "home";
 document.querySelectorAll("[data-view]").forEach(el=>el.classList.toggle("active", el.dataset.view===view && el.classList.contains("nav-item")));
 ({home:()=>renderHome(user,authService.allUsers()),quests:()=>renderQuests(user),finance:()=>renderFinance(),family:()=>renderFamily(user,authService.allUsers()),profile:()=>{renderProfile(user);loadPublicIp();},admin:()=>renderAdmin(user,adminUserFilters)}[view] || (lifeViews.has(view) ? (()=>renderLifePage(view)) : (()=>renderHome(user,authService.allUsers()))))();
}
export function navigate(next) { ipLookupId++;view=next; $("#sidebar").classList.remove("open"); render(); window.scrollTo({top:0,behavior:"smooth"}); }
export function openAuth(mode="login") { setAuthMode(mode); $("#authError").textContent=""; $("#authDialog").showModal(); }
export function setAuthMode(mode) {
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
