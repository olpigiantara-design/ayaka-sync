import { API, setToken, getToken, clearToken } from './api.js';
import { CONFIG } from './config.js';
import { toast } from './ui/toast.js';
import { goTo } from './ui/navigation.js';

export function setupLoginUI() {
  const submitBtn = document.getElementById('btnAuthSubmit');
  const nameField = document.getElementById('nameField');

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail')?.value.trim();
      const pass = document.getElementById('loginPassword')?.value.trim();
      
      // Deteksi otomatis: kalau kolom nama tampil, berarti mode DAFTAR
      const isRegisterMode = nameField && nameField.style.display !== 'none';

      if (!email || !pass) return toast('Email & password wajib!');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Format email tidak valid!');

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Memproses...';

      try {
        let data;
        if (!isRegisterMode) {
          // --- PROSES LOGIN ---
          data = await API.login(email, pass);
        } else {
          // --- PROSES DAFTAR ---
          const name = document.getElementById('loginName')?.value.trim();
          const username = document.getElementById('loginUsername')?.value.trim();
          
          if (!name || !username) throw new Error('Nama Lengkap dan Username wajib diisi!');
          
          data = await API.register(name, username, email, pass);
        }

        // 1. Simpan Token
        setToken(data.token);
        
        // 2. Sembunyikan layar login & Tampilkan aplikasi
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').classList.add('logged-in');
        
        toast(isRegisterMode ? 'Pendaftaran berhasil, otomatis masuk ✓' : 'Login berhasil ✓');
        document.getElementById('successModal').classList.add('show');
        
        // 3. Update UI Profil
        if (window.refreshProfile) await window.refreshProfile();
        
        // 4. Lempar ke Dashboard
        goTo('dashboard');
        window.refreshPlans?.();
        
      } catch (e) {
        // Jika error (misal email sudah dipakai / server mati)
        toast(e.message || 'Terjadi kesalahan sistem');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
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