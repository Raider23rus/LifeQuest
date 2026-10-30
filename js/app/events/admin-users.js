import { adminUserFilters, updateAdminUserList } from "../runtime.js";
import { $ } from "../../ui/render.js";

export function registerAdminUserHandlers() {
 document.addEventListener("click",event=>{
  const editButton=event.target.closest("[data-edit-user-credentials]");
  if(editButton){
   const dialog=$("#adminUserCredentialsDialog");
   if(!dialog)return;
   const form=$("#adminUserCredentialsForm",dialog);
   form.reset();
   form.elements.currentEmail.value=editButton.dataset.editUserCredentials;
   form.elements.email.value=editButton.dataset.editUserCredentials;
   $("[data-admin-user-error]",form).textContent="";
   dialog.showModal();
   form.elements.email.focus();
   return;
  }
  if(event.target.closest("[data-close-user-credentials]"))$("#adminUserCredentialsDialog")?.close();
 });
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
