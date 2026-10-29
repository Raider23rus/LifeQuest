import { authService } from "./services/auth.service.js";
const startLinks = document.querySelectorAll('a[href="register.html?mode=login"]');
if (authService.current()) {
  document.querySelectorAll('.public-nav').forEach(nav => {
    const link = document.createElement('a'); link.className = 'primary-button'; link.href = 'workspace.html'; link.textContent = 'Открыть пространство'; nav.append(link);
  });
}
