export function setupStatusBar() {
  function update() {
    const now = new Date();
    document.getElementById('sb-time').textContent = now.toLocaleTimeString('id-ID', { hour12: false });
    document.getElementById('sb-date').textContent = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  update();
  setInterval(update, 1000);

  const startTime = Date.now();
  setInterval(() => {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('sb-uptime').textContent = `${h}:${m}:${s}`;
  }, 1000);

  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      const upd = () => {
        const lvl = Math.round(b.level * 100);
        document.getElementById('sb-battery').textContent = `${b.charging ? '⚡' : '🔋'} ${lvl}%`;
      };
      upd();
      b.addEventListener('levelchange', upd);
      b.addEventListener('chargingchange', upd);
    });
  }
}