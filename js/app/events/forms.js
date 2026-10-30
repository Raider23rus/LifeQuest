import { $, toast } from "../../ui/render.js";
import { authService } from "../../services/auth.service.js";
import { questService } from "../../services/quest.service.js";
import { financeService } from "../../services/finance.service.js";
import { familyService } from "../../services/family.service.js";
import { lifeService } from "../../services/life.service.js";
import { renderProfile } from "../../pages/profile.page.js";
import { renderQuests } from "../../pages/quests.page.js";
import { renderFinance } from "../../pages/finance.page.js";
import { setProjectFilter } from "../../pages/life.page.js";
import { render, navigate, authMode } from "../runtime.js";

export function registerFormHandlers() {
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
  if(event.target.id==="adminUserCredentialsForm"){
   event.preventDefault();
   const form=event.target;
   const data=new FormData(form);
   const errorEl=$("[data-admin-user-error]",form);
   errorEl.textContent="";
   const password=String(data.get("password")||"");
   if(password!==String(data.get("passwordConfirm")||"")){
    errorEl.textContent="Пароли не совпадают.";
    return;
   }
   try{
    await authService.updateMemberCredentials({
     currentEmail:data.get("currentEmail"),
     email:data.get("email"),
     password
    });
    $("#adminUserCredentialsDialog").close();
    render();
    toast("Данные пользователя обновлены.");
   }catch(error){errorEl.textContent=error.message;}
   return;
  }
  if(event.target.id==="profileForm"){event.preventDefault();const form=event.target;const data=new FormData(form);const errorEl=$("#profileError",form);const successEl=$("#profileSuccess",form);errorEl.textContent="";successEl.textContent="";try{const updated=await authService.updateProfile({firstName:data.get("firstName"),surname:data.get("surname"),patronymic:data.get("patronymic"),email:data.get("email")});renderProfile(updated);toast("Данные профиля обновлены.");}catch(error){errorEl.textContent=error.message;}return;}
  if(event.target.id==="passwordForm"){event.preventDefault();const form=event.target;const data=new FormData(form);const errorEl=$("#passwordError",form);const successEl=$("#passwordSuccess",form);errorEl.textContent="";successEl.textContent="";try{const newPassword=String(data.get("newPassword")||"");if(newPassword!==String(data.get("confirmPassword")||""))throw new Error("Новый пароль и подтверждение не совпадают.");await authService.changePassword({currentPassword:String(data.get("currentPassword")||""),newPassword});form.reset();successEl.textContent="Пароль успешно изменён.";toast("Пароль обновлён.");}catch(error){errorEl.textContent=error.message;}return;}
  if(event.target.id==="familyCreateForm"){event.preventDefault();const data=new FormData(event.target);try{familyService.create({name:data.get("name"),creator:authService.current()});toast("Семья создана. Ты назначен взрослым.");}catch(error){toast(error.message);}return;}
  if(event.target.id==="familyAddMemberForm"){event.preventDefault();const data=new FormData(event.target);try{familyService.addMember({email:data.get("email"),role:data.get("role"),actorEmail:authService.current()?.email,users:authService.allUsers()});toast("Участник добавлен в семью.");}catch(error){toast(error.message);}return;}
  if(event.target.id==="questForm"){event.preventDefault();const data=new FormData(event.target);if(String(data.get("title")).trim()){try{questService.add(data.get("title"),data.get("category"),Number(data.get("xp")||20));renderQuests(authService.current());toast("Квест добавлен.");}catch(error){toast(error.message);}}}
  if(event.target.matches("[data-life-quick-task]")){event.preventDefault();const form=event.target;const data=Object.fromEntries(new FormData(form));try{lifeService.add("tasks",data);$("#quickTaskDialog").close();render();toast("Задача добавлена.");}catch(error){toast(error.message);}}
  if(event.target.matches("[data-life-sphere-form]")){event.preventDefault();const form=event.target;const data=Object.fromEntries(new FormData(form));try{lifeService.add("spheres",data);$("#sphereDialog").close();render();toast("Сфера жизни создана.");}catch(error){toast(error.message);}}
  if(event.target.matches("[data-life-project-form]")){event.preventDefault();const form=event.target;const data=Object.fromEntries(new FormData(form));try{lifeService.add("projects",data);setProjectFilter("planned");$("#projectDialog").close();render();toast("Проект запланирован.");}catch(error){toast(error.message);}}
  if(event.target.matches("[data-life-form]")){event.preventDefault();const form=event.target;const collection=form.dataset.lifeForm;const data=Object.fromEntries(new FormData(form));try{lifeService.add(collection,data);$("#lifeFormDialog")?.close();render();toast(collection==="habits"?"Привычка сохранена.":collection==="quit"?"Цель отказа сохранена.":collection==="care"?"Объект заботы создан.":collection==="sport"?"Активность создана.":collection==="familyTime"?"Семейное дело создано.":collection==="hobbies"?"Хобби создано.":collection==="rewards"?"Награда создана.":"Запись добавлена.");}catch(error){toast(error.message);}}
  if(event.target.id==="financeForm"){event.preventDefault();const data=new FormData(event.target);const amount=Number(data.get("amount"));if(!Number.isFinite(amount)||amount===0){toast("Укажи ненулевую сумму.");return;}try{financeService.add({title:data.get("title"),category:data.get("category"),amount});renderFinance();toast("Операция сохранена.");}catch(error){toast(error.message);}}
 });
 $("#pageContent").addEventListener("change",event=>{
  const scheduleToggle=event.target.closest("[data-toggle-life-schedule]");
  if(scheduleToggle){const optional=scheduleToggle.closest("form").querySelector(".life-optional-schedule");optional.hidden=!scheduleToggle.checked;optional.querySelectorAll("input,select").forEach(field=>{field.disabled=!scheduleToggle.checked;});return;}
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
}
