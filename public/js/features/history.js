import { API } from '../api.js';

export async function refreshHistory() {
  const container = document.getElementById('historyList');
  try {
    const rows = await API.getHistory();
    if (rows.length === 0) {
      container.innerHTML = '<div style="text-align:center; font-size:12px; font-weight:600; opacity:0.5; padding:20px 0;">Belum ada riwayat aktivasi.</div>';
      return;
    }
    container.innerHTML = rows.map(r => `
      <div class="history-item">
        <div>
          <div class="h-email">${r.email}</div>
          <div class="h-order">Order: ${r.orderId || '—'}</div>
        </div>
        <div class="h-date">${r.date}</div>
      </div>
    `).join('');
  } catch (e) {
    if (!e.message.includes('401')) console.error(e);
  }
}
window.refreshHistory = refreshHistory;