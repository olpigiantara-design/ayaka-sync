// ==================================================
// MAIN TAB NAVIGATION
// ==================================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');
    updateNavUI(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavUI(tabId) {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-neo-accentBlue', 'text-white', 'shadow-neo', 'brutal-border');
        btn.classList.add('text-neo-border', 'hover:bg-slate-100');
    });
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('hover:bg-slate-100', 'text-neo-border');
        activeBtn.classList.add('bg-neo-accentBlue', 'text-white', 'shadow-neo', 'brutal-border');
    }
}

// ==================================================
// ACTIVATION SUB-TAB
// ==================================================
function switchActivationSub(subId) {
    document.querySelectorAll('.sub-tab-content').forEach(el => {
        el.classList.add('hidden');
    });
    const targetSub = document.getElementById(`activation-${subId}`);
    if (targetSub) targetSub.classList.remove('hidden');

    const subBtns = ['btnSubStep1', 'btnSubStep2', 'btnSubHistory', 'btnSubBulk'];
    subBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.remove('bg-neo-accentBlue', 'text-white');
        btn.classList.add('bg-white', 'text-neo-border');
    });

    let activeSubBtnId = 'btnSubStep1';
    if (subId === 'step2') activeSubBtnId = 'btnSubStep2';
    if (subId === 'history') activeSubBtnId = 'btnSubHistory';
    if (subId === 'bulk') activeSubBtnId = 'btnSubBulk';

    const activeBtn = document.getElementById(activeSubBtnId);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-neo-border');
        activeBtn.classList.add('bg-neo-accentBlue', 'text-white');
    }
}