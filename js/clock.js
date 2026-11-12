// ==================================================
// CLOCK, DATE, BATTERY, SESSION TIMER
// ==================================================
function initClockAndSession() {
    const updateClock = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const clockEl = document.getElementById('clockStatus');
        if (clockEl) clockEl.innerText = `${hours}:${minutes}`;

        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const dateEl = document.getElementById('dateStatus');
        if (dateEl) dateEl.innerText = `${now.getDate()} ${months[now.getMonth()]}`;

        const elapsedMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
        const sesEl = document.getElementById('sessionTimer');
        if (sesEl) sesEl.innerText = `${elapsedMinutes}m`;
    };

    updateClock();
    setInterval(updateClock, 30000);

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                const level = Math.round(battery.level * 100);
                const batEl = document.getElementById('batteryStatus');
                if (batEl) batEl.innerText = `${level}%`;
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
        });
    }
}