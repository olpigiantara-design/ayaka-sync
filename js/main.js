// ==================================================
// BOOTSTRAP — LOAD COMPONENTS & INIT APP
// ==================================================
async function loadComponent(id, path) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const html = await fetch(path).then(r => r.text());
        el.innerHTML = html;
    } catch (e) {
        console.error(`Gagal memuat komponen: ${path}`, e);
    }
}

async function loadAllComponents() {
    const components = [
        { id: 'app-dashboard',  path: 'components/dashboard.html' },
        { id: 'app-login',      path: 'components/login.html' },
        { id: 'app-header',     path: 'components/header.html' },
        { id: 'app-bottom-nav', path: 'components/bottom-nav.html' },
        { id: 'app-sidebar',    path: 'components/sidebar.html' },
        { id: 'app-modals',     path: 'components/modals.html' }
    ];

    for (const c of components) {
        await loadComponent(c.id, c.path);
    }

    // Load tabs
    const tabs = ['home', 'aktivasi', 'paket', 'statistik', 'panduan'];
    const mainEl = document.getElementById('app-main');
    let tabsHtml = '';
    for (const tab of tabs) {
        try {
            tabsHtml += await fetch(`components/tabs/${tab}.html`).then(r => r.text());
        } catch (e) {
            console.error(`Gagal memuat tab: ${tab}`, e);
        }
    }
    if (mainEl) mainEl.innerHTML = tabsHtml;
}

// ==================================================
// KEYBOARD HANDLER (Sembunyikan bottom nav saat fokus input)
// ==================================================
function setupKeyboardHandler() {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;

    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', () => {
            bottomNav.style.transform = 'translateY(150%)';
            bottomNav.style.opacity = '0';
            bottomNav.style.pointerEvents = 'none';
        });
        input.addEventListener('blur', () => {
            setTimeout(() => {
                bottomNav.style.transform = 'translateY(0)';
                bottomNav.style.opacity = '1';
                bottomNav.style.pointerEvents = 'auto';
            }, 100);
        });
    });
}

// ==================================================
// DASHBOARD → LOGIN FLOW
// ==================================================
function startActivationFlow() {
    document.getElementById('dashboardScreen').style.display = 'none';
    if (currentUser) {
        document.getElementById('loginScreen').style.display = 'none';
        updateUserUI();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
    }
}

// ==================================================
// INIT APP
// ==================================================
async function initApp() {
    document.getElementById('dashboardScreen').style.display = 'flex';
    document.getElementById('loginScreen').style.display = 'none';

    initClockAndSession();
    generateRandomOrderId();
    updateNavUI('home');

    await initTursoStats();
    await fetchTursoHistory();

    setupKeyboardHandler();
}

// ==================================================
// DOM READY
// ==================================================
window.addEventListener('DOMContentLoaded', async () => {
    await loadAllComponents();
    await initApp();
});