require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================
// Mengizinkan request dari luar (CORS)
app.use(cors());

// Menerima data JSON dari frontend (limit 2mb untuk jaga-jaga)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. API ROUTES
// ==========================================
// Endpoint untuk cek status server (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'Ayaka Sync API',
    time: new Date().toISOString() 
  });
});

// Daftar Route Utama
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/activation', require('./routes/activation'));
app.use('/api/history', require('./routes/history'));
app.use('/api/bulk', require('./routes/bulk'));
app.use('/api/chat', require('./routes/chat'));

// ==========================================
// 3. STATIC FILES & FRONTEND ROUTING
// ==========================================
const publicDir = path.join(__dirname, '..', 'public');

// Melayani file statis (CSS, JS, Gambar) di folder public
app.use(express.static(publicDir));

// Fallback: Jika route tidak dikenali dan bukan API, arahkan ke index.html (Single Page App)
app.get('*', (req, res) => {
  // Jangan kembalikan HTML jika yang diminta adalah API yang tidak ada (404)
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint API tidak ditemukan' });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ==========================================
// 4. GLOBAL ERROR HANDLER
// ==========================================
// Menangkap error yang tidak sengaja terjadi di route
app.use((err, req, res, next) => {
  console.error('🔥 Terjadi Error di Server:', err.stack);
  res.status(500).json({ 
    error: 'Terjadi kesalahan internal pada server.',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// 5. JALANKAN SERVER (VERCEL & LOKAL)
// ==========================================
const PORT = process.env.PORT || 3000;

if (process.env.VERCEL) {
  // ⚠️ JIKA BERJALAN DI VERCEL (Serverless)
  // Vercel tidak butuh app.listen(), cukup export app-nya saja.
  module.exports = app;
} else {
  // 💻 JIKA BERJALAN DI LOKALHOST / VPS
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ Ayaka Sync API berjalan dengan baik!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=========================================`);
  });
}