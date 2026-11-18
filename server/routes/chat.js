const express = require('express');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const SYSTEM_PROMPT = "Kamu adalah Ayaka, asisten resmi Ayaka Sync. Bantu user aktivasi akun Alight Motion Premium. Minta email aktif, jelaskan magic link, jelaskan benefit (tanpa watermark, 4K 60FPS, semua efek, semua fitur premium). Kalau link tidak masuk, sarankan cek spam/promosi atau kirim ulang. Jangan pernah minta password/OTP. Gaya: Bahasa Indonesia santai, ramah, singkat. Panggil user 'kak' atau 'kang'.";

router.post('/', authRequired, async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Pesan kosong' });

    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${text}\nAyaka:`;
    const url = `${process.env.GEMINI_API_URL}?text=${encodeURIComponent(prompt)}&sessionsId=Ayaka-${req.user.id}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.status && data.result) return res.json({ reply: data.result });
    return res.status(500).json({ error: 'AI gagal merespons' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;