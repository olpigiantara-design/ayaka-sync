// ==================================================
// LOGIN / LOGOUT / USER UI
// ==================================================
async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        showModal('Login Gagal', 'Username dan Password tidak boleh kosong!', 'fa-triangle-exclamation');
        return;
    }

    let res = await tursoFetch("SELECT * FROM users WHERE username = ?", [username]);

    if (res && res.rows && res.rows.length > 0) {
        const user = res.rows[0];
        currentUser = {
            username: user[0].value,
            plan: user[2].value,
            limit: parseInt(user[3].value)
        };
    } else {
        await tursoFetch("INSERT INTO users (username, password, plan, limit_count) VALUES (?, ?, 'free', 10)", [username, password]);
        currentUser = {
            username: username,
            plan: 'free',
            limit: 10
        };
    }

    document.getElementById('loginScreen').style.display = 'none';
    updateUserUI();
    showModal('Login Berhasil', `Selamat datang, ${currentUser.username}! Sesi Anda telah dimulai.`, 'fa-circle-check');
}

function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sesi ini?')) {
        currentUser = null;
        closeSidebar();
        const u = document.getElementById('loginUsername');
        const p = document.getElementById('loginPassword');
        if (u) u.value = '';
        if (p) p.value = '';
        document.getElementById('dashboardScreen').style.display = 'flex';
        document.getElementById('loginScreen').style.display = 'none';
    }
}

function updateUserUI() {
    if (!currentUser) return;

    const u = document.getElementById('sidebarUsername');
    const pl = document.getElementById('sidebarPlan');
    const lm = document.getElementById('sidebarLimit');
    if (u) u.innerText = currentUser.username;
    if (pl) pl.innerText = currentUser.plan;
    if (lm) lm.innerText = currentUser.limit;

    ['free', 'pro', 'vip'].forEach(p => {
        const card = document.getElementById(`planCard-${p}`);
        if (!card) return;
        const btn = card.querySelector('button');
        if (p === currentUser.plan) {
            card.classList.add('ring-4', 'ring-blue-500', 'ring-offset-2');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Paket Aktif';
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            card.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2');
            btn.innerHTML = `Pilih ${p.toUpperCase()}`;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

async function deductLimit() {
    if (currentUser && currentUser.limit > 0) {
        currentUser.limit -= 1;
        await tursoFetch("UPDATE users SET limit_count = ? WHERE username = ?", [currentUser.limit, currentUser.username]);
        updateUserUI();
        return true;
    }
    return false;
}