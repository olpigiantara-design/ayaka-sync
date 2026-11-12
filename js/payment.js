// ==================================================
// PLAN SELECTION & PAYMENT
// ==================================================
async function selectPlan(plan, limit) {
    if (!currentUser) return;

    if (currentUser.limit > 0 && currentUser.plan === plan) {
        showModal('Info', 'Anda sudah menggunakan paket ini.', 'fa-info');
        return;
    }

    if (plan === 'free') {
        if (confirm(`Apakah Anda yakin ingin beralih ke Paket FREE?\nSisa limit Anda akan di-reset menjadi 10.`)) {
            await applyPlan(plan, limit);
        }
        return;
    }

    pendingPlan = plan;
    pendingLimit = limit;
    const planEl = document.getElementById('paymentPlanName');
    if (planEl) planEl.innerText = plan.toUpperCase();
    document.getElementById('paymentModal').classList.remove('hidden');
}

async function confirmPayment() {
    await applyPlan(pendingPlan, pendingLimit);
    closePaymentModal();
    showModal('Pembayaran Berhasil', `Terima kasih! Paket ${pendingPlan.toUpperCase()} Anda telah aktif dengan limit ${pendingLimit}.`, 'fa-circle-check');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    pendingPlan = null;
    pendingLimit = 0;
}

async function applyPlan(plan, limit) {
    currentUser.plan = plan;
    currentUser.limit = limit;
    await tursoFetch("UPDATE users SET plan = ?, limit_count = ? WHERE username = ?", [plan, limit, currentUser.username]);
    updateUserUI();
    if (plan === 'free') {
        showModal('Paket Diperbarui', `Berhasil beralih ke Paket FREE dengan limit ${limit}.`, 'fa-circle-check');
    }
}