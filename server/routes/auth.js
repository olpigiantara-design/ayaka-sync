const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Format email tidak valid' });
    if (password.length < 4) return res.status(400).json({ error: 'Password minimal 4 karakter' });

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) return res.status(409).json({ error: 'Email sudah terdaftar' });

    const hash = await bcrypt.hash(password, 10);
    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email.toLowerCase()}, ${hash})
      RETURNING id, email, created_at
    `;
    await sql`INSERT INTO user_plans (user_id) VALUES (${user.id})`;

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib' });

    const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email atau password salah' });

    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const [user] = await sql`SELECT id, email, created_at, last_login FROM users WHERE id = ${req.user.id}`;
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    const [plan] = await sql`SELECT * FROM user_plans WHERE user_id = ${req.user.id}`;
    res.json({ user, plan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;