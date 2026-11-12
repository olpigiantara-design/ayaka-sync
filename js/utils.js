// ==================================================
// GENERATE RANDOM ORDER ID
// ==================================================
function generateRandomOrderId() {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    const part4 = Math.floor(10000 + Math.random() * 90000);
    const randomCode = `GPA_${part1}-${part2}-${part3}-${part4}`;
    const input = document.getElementById('verifOrderIdInput');
    if (input) input.value = randomCode;
}

// ==================================================
// TERMINAL LOGGING
// ==================================================
function appendTerminal(elementId, text, type = 'info') {
    const container = document.getElementById(elementId);
    if (!container) return;

    const time = new Date().toLocaleTimeString();
    let colorClass = 'text-green-400';
    if (type === 'error') colorClass = 'text-red-400';
    if (type === 'warn') colorClass = 'text-yellow-400';
    if (type === 'json') colorClass = 'text-cyan-300';

    const line = document.createElement('div');
    line.className = `${colorClass} mb-1`;
    line.innerHTML = `<span class="text-gray-500">[${time}]</span> ${text}`;

    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
}

function clearTerminal(elementId) {
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = `<span class="text-gray-500">[SYSTEM] Log dibersihkan.</span>`;
    }
}

// ==================================================
// CLIPBOARD PASTE HELPER
// ==================================================
function pasteToInput(inputId) {
    navigator.clipboard.readText().then(text => {
        if (text) document.getElementById(inputId).value = text.trim();
    }).catch(() => {
        showModal('Peringatan', 'Gagal mengakses clipboard secara otomatis. Silakan tempel secara manual.', 'fa-triangle-exclamation');
    });
}