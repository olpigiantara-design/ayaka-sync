# 🌸 AYAKA SYNC — Portal Aktivasi Akun VIP

Portal generator & aktivasi premium **Alight Motion** dengan UI bertema **Neo-Brutalism**. Aplikasi client-side murni (HTML + CSS + JS) dengan backend database **Turso (libSQL)** untuk autentikasi user, riwayat aktivasi, dan statistik server.

---

## ✨ Fitur Utama

- 🎨 **UI Neo-Brutalism** — Responsif, mobile-first, anti-bug untuk Chrome mobile.
- 🔐 **Login / Register Otomatis** — Username baru otomatis didaftarkan (mode demo).
- ⚡ **Generator Magic Link** — Kirim tautan aktivasi ke email Alight Motion.
- ✅ **Verifikasi Premium** — Eksekusi Order ID & Magic Link untuk aktivasi VIP.
- 📦 **Bulk Batch Send** — Kirim link ke banyak email sekaligus (Plan Pro & VIP).
- 📊 **Statistik Server** — Total aktivasi, success rate, pengunjung (real-time via Turso).
- 💎 **Sistem Plan** — Free / Pro / VIP dengan limit harian.
- 🕑 **Log Riwayat** — Tersimpan di database, bisa di-clear admin.
- 📱 **Session & Battery Widget** — Info jam, tanggal, sesi, dan baterai real-time.

---

## 📂 Struktur Folder

```
ayaka-sync/
├── index.html                 # Skeleton utama
├── vercel.json                # Konfigurasi deploy Vercel
├── README.md                  # Dokumentasi ini
├── .gitignore                 # Ignore rules
├── package.json               # Script dev server
│
├── css/
│   ├── main.css               # Style utama & brutal-border
│   └── animations.css         # Semua @keyframes & animasi
│
├── js/
│   ├── tailwind.config.js     # Konfigurasi Tailwind CDN
│   ├── config.js              # Turso URL, API Key, Endpoint
│   ├── utils.js               # Helper: clipboard, terminal, OrderID
│   ├── turso.js               # Fetch wrapper database Turso
│   ├── state.js               # Global state (currentUser, logs, dll)
│   ├── modal.js               # Custom modal & payment modal
│   ├── clock.js               # Jam, tanggal, baterai, sesi timer
│   ├── navigation.js          # switchTab & sub-tab aktivasi
│   ├── sidebar.js             # Buka/tutup sidebar
│   ├── auth.js                # Login, logout, update UI user, limit
│   ├── history.js             # Render riwayat & clear history
│   ├── activation.js          # Send API, Verif API, Bulk Send
│   ├── payment.js             # Pilih plan, QR payment, apply plan
│   └── main.js                # Bootstrap: load komponen & init app
│
├── components/
│   ├── dashboard.html         # Overlay panduan awal
│   ├── login.html             # Overlay form login
│   ├── header.html            # Header + status widget
│   ├── bottom-nav.html        # Bottom navigation
│   ├── sidebar.html           # Sidebar + backdrop
│   ├── modals.html            # Modal umum + modal QR
│   └── tabs/
│       ├── home.html
│       ├── aktivasi.html
│       ├── paket.html
│       ├── statistik.html
│       └── panduan.html
│
└── assets/
    ├── qris-payment.png       # ← taruh QR pembayaran di sini
    └── tutorial.mp4           # ← taruh video tutorial di sini
```

---

## 🚀 Setup Lokal

Karena menggunakan `fetch()` untuk memuat komponen HTML, **WAJIB menggunakan HTTP server** (bukan `file://`).

### Opsi 1: `npx serve`
```bash
npx serve .
```

### Opsi 2: `python`
```bash
python -m http.server 3000
```

### Opsi 3: VS Code Live Server
Klik kanan `index.html` → **Open with Live Server**.

Buka `http://localhost:3000`.

---

## ⚙️ Konfigurasi Turso Database

1. Buat akun di [turso.tech](https://turso.tech) → buat database baru.
2. Jalankan SQL berikut di dashboard Turso (shell/SQL console):

```sql
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT,
    plan TEXT DEFAULT 'free',
    limit_count INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    order_id TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_aktivasi INTEGER DEFAULT 0,
    total_success INTEGER DEFAULT 0,
    total_pengunjung INTEGER DEFAULT 0
);

INSERT OR IGNORE INTO stats (id, total_aktivasi, total_success, total_pengunjung) VALUES (1, 0, 0, 0);
```

3. Edit `js/config.js`:

```js
const TURSO_URL = "https://your-database-name.turso.io";
const TURSO_AUTH_TOKEN = "your-turso-auth-token";
```

Jika `TURSO_URL` masih placeholder, app otomatis jalan dalam **mode simulasi** (tanpa database).

---

## ☁️ Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

Atau hubungkan repo GitHub ke Vercel dashboard → import project → deploy. Semua file statis langsung tersaji otomatis.

File `vercel.json` sudah menambahkan **security headers** & **cache-control** untuk folder `assets`, `css`, `js`, `components`.

---

## 🗂️ Asset yang Perlu Kamu Tambahkan

| File | Keterangan |
|------|------------|
| `assets/qris-payment.png` | Gambar QR pembayaran (rename dari `AM QR [9BD5A32].png`) |
| `assets/tutorial.mp4` | Video tutorial aktivasi (opsional, fallback otomatis ke sample online) |

Ubah path di `components/modals.html` dan `components/tabs/panduan.html` jika nama file berbeda.

---

## 🔌 API Endpoint

| Endpoint | Method | Parameter |
|----------|--------|-----------|
| `https://api.izzxd.my.id/api/am/send` | GET | `email`, `apikey` |
| `https://api.izzxd.my.id/api/am/verif` | GET | `link`, `email`, `orderId`, `apikey` |

API Key default tersimpan di `js/config.js`.

---

## 🎨 Kustomisasi Tema

Semua warna neo-brutalism ada di `js/tailwind.config.js`:

```js
colors: {
    neo: {
        bg: '#EBF4FF',
        accentBlue: '#2563EB',
        yellow: '#FDE047',
        border: '#0F172A',
        // ...
    }
}
```

Ubah nilai hex sesuai selera — seluruh UI otomatis ikut.

---

## 📌 Catatan

- Session login **tidak** disimpan di `localStorage` (hilang saat refresh) — sesuai keamanan default.
- `limit_count` akan **berkurang hanya saat verifikasi berhasil**, bukan saat send email.
- Bulk Send tersedia hanya untuk Plan Pro / VIP.
- Mode simulasi aktif jika Turso belum dikonfigurasi — berguna untuk preview cepat.

---

## 📜 Lisensi

© 2026 AYAKA SYNC — All Rights Reserved.