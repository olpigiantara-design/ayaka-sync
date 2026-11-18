import { setupLoginUI, checkSession, logout } from './auth.js';
import { setupNav, toggleSidebar } from './ui/navigation.js';
import { setupStatusBar } from './ui/status-bar.js';
import { setupAccordion } from './ui/accordion.js';
import { observeReveals } from './ui/reveal.js';
import { refreshPlans, setupPlansPage, setPlan, resetStats } from './features/plans.js';
import { setupActivation } from './features/activation.js';
import { refreshHistory } from './features/history.js';
import { setupBulk } from './features/bulk.js';
import { setupChat } from './features/chat.js';
import { setupQRModal } from './features/qr-modal.js';
import { log } from './ui/terminal.js';

// ==== EXPOSE UNTUK onclick DI HTML ====
window.toggleSidebar = toggleSidebar;
window.doLogout = logout;
window.closeSuccessModal = () => document.getElementById('successModal').classList.remove('show');
window.setPlan = setPlan;
window.resetStats = resetStats;
window.goTo = (id) => import('./ui/navigation.js').then(m => m.goTo(id));
window.requireLogin = (target) => {
  if (localStorage.getItem('am_token')) window.goTo(target);
  else {
    document.getElementById('mainApp').classList.remove('logged-in');
    document.getElementById('loginScreen').style.display = 'flex';
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  setupStatusBar();
  setupLoginUI();
  setupNav();
  setupAccordion();
  setupActivation();
  setupBulk();
  setupChat();
  setupQRModal();
  setupPlansPage();

  if (checkSession()) {
    await refreshPlans();
    await refreshHistory();
  }

  observeReveals();
  log('Sistem terhubung ke backend Neon DB.', 'info');
});