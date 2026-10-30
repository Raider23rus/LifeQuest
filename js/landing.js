import { authService } from "./services/auth.service.js";
if (authService.current()) {
  document.querySelectorAll('.public-nav').forEach(nav => {
    const link = document.createElement('a'); link.className = 'primary-button'; link.href = 'workspace.html'; link.textContent = 'Открыть пространство'; nav.append(link);
  });
}
