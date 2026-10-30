import { APP_CONFIG } from "../config.js";
import { events } from "../core/events.js";
import { $ } from "../ui/render.js";
import { authService } from "../services/auth.service.js";
import { renderHome } from "../pages/home.page.js";
import { render, navigate, openAuth, view } from "./runtime.js";
import { registerAdminUserHandlers } from "./events/admin-users.js";
import { registerClickHandlers } from "./events/click.js";
import { registerFormHandlers } from "./events/forms.js";

export function initializeWorkspace() {
 $("#authOpenBtn").addEventListener("click",()=>authService.current()?navigate("profile"):openAuth("login"));
 $("#closeAuth").addEventListener("click",()=>$("#authDialog").close());
 $("#workspaceForgot").addEventListener("click",()=>{window.location.href="register.html?mode=reset";});
 $("#logoutBtn").addEventListener("click",()=>{if(authService.current()){authService.logout();window.location.href="index.html";}else window.location.href="register.html?mode=login";});
 document.addEventListener("click",event=>{if(event.target.closest("#profileLogoutBtn")){authService.logout();window.location.href="index.html";}});
 $("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
 registerAdminUserHandlers();
 registerClickHandlers();
 registerFormHandlers();
 events.on("auth:changed",render);
 events.on("users:changed",render);
 events.on("family:changed",render);
 window.addEventListener("storage",event=>{
  if(event.key===APP_CONFIG.storageKeys.users)render();
 });
 events.on("quests:changed",()=>{if(view==="home")renderHome(authService.current(),authService.allUsers());});
 events.on("finance:changed",()=>{if(view==="home")renderHome(authService.current(),authService.allUsers());});
 render();
}
