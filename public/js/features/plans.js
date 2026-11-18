import { API } from '../api.js';
import { toast } from '../ui/toast.js';
import { log } from '../ui/terminal.js';
import { CONFIG } from '../config.js';

const LABEL = { free: 'FREE', pro: 'PRO', vip: 'VIP' };
let state = { plan: 'free', limits: { free: 20, pro: 1000, vip: 2000 }, used: 0 };

export function getState() { return state; }
export function getActivePlan() { return state.plan; }

export async function refreshPlans() {
  try {
    state = await API.getPlan();
    render();
  } catch (e) {
    if (e.message.includes('401')) return;
    console.error(e);
  }
}
window.refreshPlans = refreshPlans;

function render() {
  document.querySelectorAll('[data-limit]').forEach(el => {
    el.textContent = state.limits[el.dataset.limit];
  });
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.toggle('active', card.dataset.plan === state.plan);
  });
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('statPlan', LABEL[state.plan]);
  set('statUsed', state.used);
  set('statLeft', state.limits[state.plan]);
  set('sumPlan', LABEL[state.plan]);
  set('profPlan', LABEL[state.plan]);
  set('profLimit', state.limits[state.plan]);
}

export async function setPlan(plan) {
  // --- PROTEKSI COMING SOON ---
  if (plan !== 'free' && CONFIG.PLANS[plan] && CONFIG.PLANS[plan].isAvailable === false) {
    toast(`Plan ${LABEL[plan]} belum tersedia (Coming Soon)!`);
    return;
  }

  try {
    state = await API.activatePlan(plan);
    render();
    toast(`Plan ${LABEL[plan]} diaktifkan`);
  } catch (e) { 
    toast(e.message); 
  }
}

export async function resetStats() {
  if (!confirm('Reset semua statistik & limit ke default?')) return;
  try {
    state = await API.resetStats();
    render();
    toast('Statistik direset');
  } catch (e) { toast(e.message); }
}

export async function consumeLimit() {
  try {
    state = await API.consumeLimit();
    render();
    return true;
  } catch (e) {
    toast(e.message);
    log(`Gagal consume limit: ${e.message}`, 'error');
    return false;
  }
}

export function setupPlansPage() {
  document.querySelectorAll('[data-plan]').forEach(card => {
    const btn = card.querySelector('button');
    if (btn && !btn.hasAttribute('disabled')) { 
      btn.removeAttribute('onclick'); 
      btn.addEventListener('click', () => setPlan(card.dataset.plan)); 
    }
  });
  const resetBtn = document.querySelector('button[onclick*="resetStats"]');
  if (resetBtn) { resetBtn.removeAttribute('onclick'); resetBtn.addEventListener('click', resetStats); }
}