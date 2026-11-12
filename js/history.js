// ==================================================
// RIWAYAT AKTIVASI
// ==================================================
function renderHistoryLogs() {
    const container = document.getElementById('historyList');
    if (!container) return;

    if (activationLogs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400 text-xs font-bold">
                <i class="fa-regular fa-folder-open text-2xl mb-2"></i>
                <p>Belum ada riwayat aktivasi tercatat.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activationLogs.map((log) => `
        <div class="bg-neo-bg brutal-border-sm p-3 rounded-xl flex items-center justify-between text-xs">
            <div>
                <p class="font-black text-neo-border">${log.email}</p>
                <p class="text-[10px] font-mono text-gray-500">ID: ${log.orderId} • ${log.date}</p>
            </div>
            <span class="bg-green-200 text-green-800 font-extrabold px-2 py-1 rounded border border-black text-[10px]">
                ${log.status}
            </span>
        </div>
    `).join('');
}

async function clearHistory() {
    if (confirm('Hapus semua riwayat dari database?')) {
        await tursoFetch("DELETE FROM history");
        activationLogs = [];
        renderHistoryLogs();
        showModal('Riwayat Dihapus', 'Seluruh log riwayat aktivasi berhasil dibersihkan dari database.', 'fa-circle-check');
    }
}