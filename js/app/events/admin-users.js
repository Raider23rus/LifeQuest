import { adminUserFilters, updateAdminUserList } from "../runtime.js";

export function registerAdminUserHandlers() {
 document.addEventListener("input",event=>{
  if(!event.target.matches("[data-admin-user-search]"))return;
  adminUserFilters.search=event.target.value;
  updateAdminUserList();
 });
 document.addEventListener("change",event=>{
  if(!event.target.matches("[data-admin-user-role]"))return;
  adminUserFilters.role=event.target.value;
  updateAdminUserList();
 });
}
