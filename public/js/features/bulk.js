import { API } from '../api.js';
import { toast } from '../ui/toast.js';
import { log } from '../ui/terminal.js';
import { refreshPlans, getState, getActivePlan } from './plans.js';

export function setupBulk() {
  const input = document.getElementById('bulkAmount');
  const hint = document.getElementById('bulkLimitHint');

  function updateHint() {
    hint.textContent = `Memakai ${input.value} limit.`;
  }

  window.updateBulkAmount = (dir) => {
    let v = parseInt(input.value) || 1;
    v = Math.max(1, Math.min(100, v + dir));
    input.value = v;
    updateHint();
  };

  const btn = document.getElementById('btnProcessBulk');
  btn.addEventListener('click', async () => {
    if (getActivePlan() === 'free') {
      toast('Bulk khusus Pro & VIP!');
      log('Akses ditolak: Bulk butuh Plan Pro/VIP.', 'warn');
      return;
    }
    const amount = parseInt(input.value);
    if (amount > getState().limits[getActivePlan()]) {
      toast(`Limit kurang! Sisa: ${getState().limits[getActivePlan()]}`);
      return;
    }

    btn.classList.add('loading'); btn.disabled = true;
    const rc = document.getElementById('bulkResult');
    rc.style.display = 'block';
    rc.innerHTML = '<div style="text-align:center; font-size:12px; font-weight:600; opacity:.7;">Memproses...</div>';

    try {
      const data = await API.bulkGenerate(amount);
      rc.innerHTML = '';
      data.accounts.forEach((acc, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom:10px;padding-bottom:10px;' + (idx < data.accounts.length - 1 ? 'border-bottom:1px dashed #ccc;' : '');
        div.innerHTML = `
          <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:4px;">${acc.type || 'Premium'} (${acc.email})</div>
          <div style="font-size:11px;font-family:monospace;opacity:.7;margin-bottom:4px;">Order: ${acc.orderId}</div>
          <a href="${acc.login_url}" target="_blank" style="font-size:11px;color:var(--green);text-decoration:underline;font-weight:700;">Buka Link Login</a>
        `;
        rc.appendChild(div);
      });
      await refreshPlans();
      toast(`Berhasil generate ${data.accounts.length} akun`);
      log(`Bulk sukses: ${data.accounts.length} akun, limit -${amount}`, 'success');
      window.refreshHistory?.();
    } catch (e) {
      rc.innerHTML = `<div style="color:var(--red);font-size:12px;text-align:center;font-weight:700;">${e.message}</div>`;
      toast(e.message);
    } finally { btn.classList.remove('loading'); btn.disabled = false; }
  });
}