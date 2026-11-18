import { toast } from '../ui/toast.js';
import { setPlan } from './plans.js';
import { CONFIG } from '../config.js';

let selectedPlan = null;
let currentOrderId = null;
let paymentTimer = null;
let isSuccess = false;

export function setupQRModal() {
  const modal = document.getElementById('qrModal');
  document.getElementById('closeModal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.getElementById('btnCheckPay').addEventListener('click', checkPayment);
  document.getElementById('btnConfirmPay').addEventListener('click', confirmPayment);

  window.openQRModal = (plan, name, price) => {
    // --- PROTEKSI COMING SOON ---
    if (plan !== 'free' && CONFIG.PLANS[plan] && CONFIG.PLANS[plan].isAvailable === false) {
      toast(`Plan ${name} belum tersedia (Coming Soon)!`);
      return;
    }

    selectedPlan = plan;
    currentOrderId = 'ORD-' + Date.now();
    document.getElementById('modalTitle').innerHTML =
      `Beli Plan <br><span style="color:var(--blue)">${name} - Rp ${price}</span>`;
    document.getElementById('btnCheckPay').style.display = 'inline-flex';
    document.getElementById('btnCheckPay').disabled = false;
    document.getElementById('btnCheckPay').classList.remove('loading');
    document.getElementById('btnConfirmPay').style.display = 'none';
    document.getElementById('payStatusText').style.display = 'none';
    isSuccess = false;
    clearTimeout(paymentTimer);
    
    // Simulasi: pembayaran dianggap sukses setelah 8 detik (demo)
    paymentTimer = setTimeout(() => { isSuccess = true; }, CONFIG.UI.PAYMENT_SIMULATION_DELAY);
    modal.classList.add('show');
  };
}

function close() {
  document.getElementById('qrModal').classList.remove('show');
  selectedPlan = null;
}

async function checkPayment() {
  const btn = document.getElementById('btnCheckPay');
  const status = document.getElementById('payStatusText');
  btn.classList.add('loading'); btn.disabled = true;
  status.style.display = 'block';
  status.textContent = 'Menghubungkan ke server real-time...';
  status.style.color = 'var(--blue)';
  
  await new Promise(r => setTimeout(r, 2000));
  
  if (isSuccess) {
    status.textContent = 'Pembayaran Terverifikasi! ✓';
    status.style.color = 'var(--green)';
    btn.style.display = 'none';
    document.getElementById('btnConfirmPay').style.display = 'block';
  } else {
    status.textContent = 'Pembayaran belum diterima. Tunggu 1-2 menit lagi.';
    status.style.color = 'var(--red)';
    btn.disabled = false; btn.classList.remove('loading');
    document.getElementById('btnConfirmPay').style.display = 'block';
  }
}

function confirmPayment() {
  if (!selectedPlan) return;
  if (isSuccess) {
    setPlan(selectedPlan);
    close();
    toast('Plan aktif!');
  } else {
    toast('Pembayaran belum masuk.');
  }
}