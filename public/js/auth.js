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
  
  // Elemen form baru
  const nameField = document.getElementById('nameField');
  const usernameField = document.getElementById('usernameField');

  switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    mode = mode === 'login' ? 'register' : 'login';
    
    if (mode === 'register') {
      title.textContent = 'DAFTAR AKUN';
      subtitle.textContent = 'Buat akun baru untuk mulai menggunakan Ayaka Sync.';
      submitBtn.textContent = '📝 Daftar Sekarang';
      switchText.textContent = 'Sudah punya akun? ';
      switchBtn.textContent = 'Login di sini';
      
      // Tampilkan input name & username
      nameField.style.display = 'block';
      usernameField.style.display = 'block';
    } else {
      title.textContent = 'LOGIN AKUN';
      subtitle.textContent = 'Masuk untuk mengakses generator Alight Motion Premium.';
      submitBtn.textContent = '🔑 Masuk Sekarang';
      switchText.textContent = 'Belum punya akun? ';
      switchBtn.textContent = 'Daftar sekarang';
      
      // Sembunyikan input name & username
      nameField.style.display = 'none';
      usernameField.style.display = 'none';
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
      let data;
      if (mode === 'login') {
        data = await API.login(email, pass);
      } else {
        // Ambil data tambahan untuk register
        const name = document.getElementById('loginName').value.trim();
        const username = document.getElementById('loginUsername').value.trim();
        
        if (!name || !username) throw new Error('Nama Lengkap dan Username wajib diisi!');
        
        data = await API.register(name, username, email, pass);
      }

      // 1. Simpan Token
      setToken(data.token);
      
      // 2. Sembunyikan layar login & Tampilkan aplikasi
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainApp').classList.add('logged-in');
      
      toast(mode === 'login' ? 'Login berhasil ✓' : 'Pendaftaran berhasil, otomatis masuk ✓');
      document.getElementById('successModal').classList.add('show');
      
      // 3. Update UI Profil
      if (window.refreshProfile) await window.refreshProfile();
      
      // 4. Lempar ke Dashboard
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

// Fungsi untuk mengambil dan menampilkan data profil
export async function refreshProfile() {
  try {
    const data = await API.me();
    
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    
    setTxt('profName', data.user.name);
    setTxt('profUsername', data.user.username);
    setTxt('profEmail', data.user.email);
    
    if (data.user.last_login) {
      const date = new Date(data.user.last_login);
      setTxt('profTime', date.toLocaleString('id-ID'));
    }
  } catch (e) {
    console.error('Gagal memuat profil:', e);
  }
}
window.refreshProfile = refreshProfile;