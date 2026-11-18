import { API, setToken, getToken, clearToken } from './api.js';
import { CONFIG } from './config.js';
import { toast } from './ui/toast.js';
import { goTo } from './ui/navigation.js';

let mode = 'login'; // 'login' | 'register'

export function setupLoginUI() {
  const title = document.getElementById('loginTitle');
  const subtitle = document.getElementById('loginSubtitle');
  const submitBtn = document.getElementById('btnAuthSubmit');
  const switchBtn = document.getElementById('btnAuthSwitch');
  const switchText = document.getElementById('loginSwitchText');

  switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    mode = mode === 'login' ? 'register' : 'login';
    if (mode === 'register') {
      title.textContent = 'DAFTAR AKUN';
      subtitle.textContent = 'Buat akun baru untuk mulai menggunakan Ayaka Sync.';
      submitBtn.textContent = '📝 Daftar Sekarang';
      switchText.textContent = 'Sudah punya akun? ';
      switchBtn.textContent = 'Login di sini';
    } else {
      title.textContent = 'LOGIN AKUN';
      subtitle.textContent = 'Masuk untuk mengakses generator Alight Motion Premium.';
      submitBtn.textContent = '🔑 Masuk Sekarang';
      switchText.textContent = 'Belum punya akun? ';
      switchBtn.textContent = 'Daftar sekarang';
    }
  });

  submitBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();
    if (!email || !pass) return toast('Email & password wajib!');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Format email tidak valid!');

    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = 'Memproses...';

    try {
      const fn = mode === 'login' ? API.login : API.register;
      const data = await fn(email, pass);
      setToken(data.token);
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainApp').classList.add('logged-in');
      toast(mode === 'login' ? 'Login berhasil ✓' : 'Daftar berhasil ✓');
      document.getElementById('successModal').classList.add('show');
      goTo('dashboard');
      window.refreshPlans?.();
    } catch (e) {
      toast(e.message || 'Gagal');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

export function checkSession() {
  if (getToken()) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').classList.add('logged-in');
    return true;
  }
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('mainApp').classList.remove('logged-in');
  return false;
}

export function logout() {
  if (!confirm('Yakin ingin logout?')) return;
  clearToken();
  localStorage.removeItem(CONFIG.ACTIVE_EMAIL_KEY);
  document.getElementById('mainApp').classList.remove('logged-in');
  document.getElementById('loginScreen').style.display = 'flex';
  toast('Logout berhasil');
}