# 🚀 AYAKA SYNC — Generator Alight Motion Premium

Aplikasi Full-Stack untuk mengaktifkan Alight Motion Premium secara otomatis menggunakan sistem **Magic Link**. Dilengkapi dengan sistem login, manajemen limit (Free/Pro/VIP), generator akun massal (Bulk), riwayat aktivasi, dan asisten AI (Ayaka).

Project ini menggunakan arsitektur modern:
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 Modules)
- **Backend**: Node.js & Express.js
- **Database**: Neon Tech (Serverless PostgreSQL)

---

## ✨ Fitur Utama

1. **🔐 Sistem Autentikasi**: Login & Register aman menggunakan JWT (JSON Web Token) dan enkripsi password Bcrypt.
2. **💎 Manajemen Plan**: Limit generate otomatis (Free: 20, Pro: 1000, VIP: 2000) yang tersimpan permanen di database.
3. **⚡ Auto-Aktivasi**: Kirim magic link ke email target, lalu verifikasi link untuk mengaktifkan premium secara otomatis.
4. **📦 Bulk Generator**: Fitur generate banyak akun sekaligus (khusus pengguna Plan Pro & VIP).
5. **📜 Riwayat Akun**: Menyimpan log aktivasi dan pembelian plan pengguna.
6. **🤖 Chat AI (Ayaka)**: Asisten AI terintegrasi untuk membantu pengguna yang kebingungan.
7. **📱 Responsive UI**: Desain Neo-Brutalism yang dioptimalkan untuk HP maupun Desktop.

---

## 📁 Struktur Folder

```text
ayaka-sync/
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── server/                  # BACKEND (Express.js)
│   ├── index.js             # Entry point server
│   ├── db.js                # Koneksi Neon DB
│   ├── schema.sql           # Skema database lengkap
│   ├── scripts/
│   │   └── init-db.js       # Script untuk membuat tabel
│   ├── middleware/
│   │   └── auth.js          # Middleware verifikasi JWT
│   └── routes/              # API Routes
│       ├── auth.js
│       ├── plans.js
│       ├── activation.js
│       ├── history.js
│       ├── bulk.js
│       └── chat.js
└── public/                  # FRONTEND (HTML/CSS/JS)
    ├── index.html
    ├── css/
    │   ├── reset.css
    │   ├── variables.css
    │   ├── layout.css
    │   ├── components.css
    │   ├── pages.css
    │   └── utilities.css
    ├── js/
    │   ├── main.js
    │   ├── config.js
    │   ├── api.js
    │   ├── auth.js
    │   ├── ui/
    │   └── features/
    └── assets/
        └── qris-payment.png # Gambar QRIS untuk pembayaran