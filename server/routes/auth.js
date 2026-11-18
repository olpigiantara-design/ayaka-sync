const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ==========================================
// REGISTER (Daftar Akun Baru)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    // Validasi
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Semua kolom (Nama, Username, Email, Password) wajib diisi' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password minimal 4 karakter' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username minimal 3 karakter' });
    }

    // Cek apakah email atau username sudah dipakai
    const existingEmail = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existingEmail.length > 0) return res.status(409).json({ error: 'Email sudah terdaftar' });

    const existingUsername = await sql`SELECT id FROM users WHERE username = ${username.toLowerCase()}`;
    if (existingUsername.length > 0) return res.status(409).json({ error: 'Username sudah dipakai orang lain' });

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Simpan user baru
    const [user] = await sql`
      INSERT INTO users (name, username, email, password_hash)
      VALUES (${name}, ${username.toLowerCase()}, ${email.toLowerCase()}, ${hash})
      RETURNING id, name, username, email, created_at
    `;

    // Buat plan default (Free) untuk user baru
    await sql`INSERT INTO user_plans (user_id) VALUES (${user.id})`;

    // Buat JWT Token (Otomatis Login setelah daftar)
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

// ==========================================
// LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib' });

    const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email atau password salah' });

    // Update waktu login terakhir
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, username: user.username, email: user.email } 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

// ==========================================
// GET PROFILE (/me)
// ==========================================
router.get('/me', authRequired, async (req, res) => {
  try {
    const [user] = await sql`SELECT id, name, username, email, created_at, last_login FROM users WHERE id = ${req.user.id}`;
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    const [plan] = await sql`SELECT * FROM user_plans WHERE user_id = ${req.user.id}`;
    res.json({ user, plan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;