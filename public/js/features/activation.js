import { API } from '../api.js';
import { CONFIG } from '../config.js';
import { toast } from '../ui/toast.js';
import { log } from '../ui/terminal.js';
import { refreshPlans, getState, getActivePlan } from './plans.js';

let activeEmail = localStorage.getItem(CONFIG.ACTIVE_EMAIL_KEY) || '';
let orderMode = 'auto';
let autoInput, manualInput;

function randDigits(n) { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; }
function genOrderId() { return `GPA.${randDigits(4)}-${randDigits(4)}-${randDigits(4)}-${randDigits(5)}`; }

function switchTab(tab) {
  document.getElementById('tabSendBtn').classList.toggle('active', tab === 'send');
  document.getElementById('tabVerifBtn').classList.toggle('active', tab === 'verif');
  document.getElementById('paneSend').classList.toggle('active', tab === 'send');
  document.getElementById('paneVerif').classList.toggle('active', tab === 'verif');
}

function updateSummary(success) {
  const email = activeEmail || '—';
  const order = (orderMode === 'auto' ? autoInput.value : manualInput.value).trim() || '—';
  document.getElementById('sumEmail').textContent = email;
  document.getElementById('sumOrder').textContent = order;
  const st = document.getElementById('sumStatus');
  st.textContent = success ? 'Premium Active ✓' : 'Menunggu';
  st.style.color = success ? '#5BFF8A' : '';
}

function setOrderMode(mode) {
  orderMode = mode;
  const isAuto = mode === 'auto';
  document.getElementById('modeAuto').classList.toggle('on', isAuto);
  document.getElementById('modeManual').classList.toggle('on', !isAuto);
  document.getElementById('autoOrderBox').style.display = isAuto ? 'block' : 'none';
  document.getElementById('manualOrderBox').style.display = isAuto ? 'none' : 'block';
  updateSummary();
}

function setLoading(btn, on) {
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

export function setupActivation() {
  autoInput = document.getElementById('autoOrder');
  manualInput = document.getElementById('manualOrder');
  autoInput.value = genOrderId();

  document.getElementById('tabSendBtn').addEventListener('click', () => switchTab('send'));
  document.getElementById('tabVerifBtn').addEventListener('click', () => switchTab('verif'));
  document.getElementById('modeAuto').addEventListener('click', () => setOrderMode('auto'));
  document.getElementById('modeManual').addEventListener('click', () => setOrderMode('manual'));
  document.getElementById('btnRegen').addEventListener('click', () => { autoInput.value = genOrderId(); updateSummary(); });
  [autoInput, manualInput].forEach(el => el.addEventListener('input', () => updateSummary()));

  // ==== SEND LINK ====
  const btnSend = document.getElementById('btnSend');
  btnSend.addEventListener('click', async () => {
    const email = document.getElementById('homeEmail').value.trim();
    if (!email) { toast('Email wajib diisi'); log('Gagal: Email kosong.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Email tidak valid'); log('Gagal: Format email salah.', 'error'); return; }
    if (getState().limits[getActivePlan()] <= 0) { toast('Limit habis'); log('Limit habis.', 'error'); return; }

    setLoading(btnSend, true);
    log(`Meminta magic link untuk: ${email}...`, 'info');
    try {
      await API.sendMagicLink(email);
      log(`Sukses! Link terkirim ke ${email}.`, 'success');
      activeEmail = email;
      localStorage.setItem(CONFIG.ACTIVE_EMAIL_KEY, email);
      await refreshPlans();
      toast('Link berhasil dikirim ✓');
      updateSummary();
      switchTab('verif');
    } catch (e) {
      log(`API Error: ${e.message}`, 'error');
      toast(e.message);
    } finally { setLoading(btnSend, false); }
  });

  // ==== VERIFY ====
  const btnVerif = document.getElementById('btnVerif');
  btnVerif.addEventListener('click', async () => {
    const link = document.getElementById('verifLink').value.trim().replace(/\s+/g, '').replace(/&amp;/g, '&');
    if (!activeEmail) { toast('Email belum terdeteksi. Isi di Tab 1.'); switchTab('send'); return; }
    if (!link) { toast('Link wajib diisi'); log('Gagal: Link kosong.', 'error'); return; }
    if (!link.includes('oobCode')) {
      toast('Link terpotong / tidak valid');
      log(`Gagal: 'oobCode' tidak ditemukan (panjang ${link.length}).`, 'error');
      return;
    }
    const orderId = orderMode === 'auto' ? autoInput.value : manualInput.value.trim();
    if (!orderId) { toast('Order ID wajib diisi'); return; }

    setLoading(btnVerif, true);
    log(`Memproses verifikasi untuk: ${activeEmail}...`, 'info');
    try {
      log('Login ke server Google...', 'info');
      const res = await API.verifyActivation(activeEmail, link, orderId);
      log(`Premium Berhasil Diaktifkan! Order: ${res.orderId}`, 'success');
      toast('Premium berhasil diaktifkan ✓');
      document.getElementById('homeEmail').value = '';
      document.getElementById('verifLink').value = '';
      activeEmail = '';
      localStorage.removeItem(CONFIG.ACTIVE_EMAIL_KEY);
      updateSummary(false);
      switchTab('send');
      window.refreshHistory?.();
    } catch (e) {
      log(`Gagal: ${e.message}`, 'error');
      toast(e.message);
    } finally { setLoading(btnVerif, false); }
  });

  updateSummary();
}