/**
 * AYAKA SYNC - FRONTEND CONFIGURATION
 * Pusat konfigurasi untuk seluruh aplikasi frontend.
 * ⚠️ JANGAN SIMPAN API KEY / TOKEN RAHASIA DI SINI! (Simpan di backend .env)
 */

export const CONFIG = {
  // ==========================================
  // 1. APP INFO
  // ==========================================
  APP_NAME: 'Ayaka Sync',
  APP_VERSION: '1.0.0',
  APP_DESC: 'Generator Alight Motion Premium',

  // ==========================================
  // 2. API CONFIG
  // ==========================================
  API_BASE: '/api',
  
  // Endpoint mapping (mempermudah pemanggilan di api.js)
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me'
    },
    PLANS: {
      GET: '/plans',
      ACTIVATE: '/plans/activate',
      CONSUME: '/plans/consume',
      RESET: '/plans/reset'
    },
    ACTIVATION: {
      SEND_LINK: '/activation/send-link',
      VERIFY: '/activation/verify'
    },
    HISTORY: '/history',
    BULK: '/bulk/generate',
    CHAT: '/chat'
  },

  // ==========================================
  // 3. LOCAL STORAGE KEYS
  // ==========================================
  STORAGE: {
    TOKEN: 'am_token',
    ACTIVE_EMAIL: 'am_active_email',
    THEME: 'am_theme',
    HISTORY_CACHE: 'am_history_cache'
  },
  // Alias (backward compatibility dengan kode api.js sebelumnya)
  TOKEN_KEY: 'am_token',
  ACTIVE_EMAIL_KEY: 'am_active_email',

  // ==========================================
  // 4. PLAN DETAILS (Harga & Label UI)
  // ==========================================
  PLANS: {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      priceString: '0',
      badge: 'Gratis',
      color: 'var(--black)',
      limit: 20
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 10000,
      priceString: '10.000',
      badge: 'Populer',
      color: 'var(--blue)',
      limit: 1000
    },
    vip: {
      id: 'vip',
      name: 'VIP',
      price: 15000,
      priceString: '15.000',
      badge: 'Terbaik',
      color: 'var(--yellow-deep)',
      limit: 2000
    }
  },

  // ==========================================
  // 5. VALIDATION REGEX
  // ==========================================
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ORDER_ID: /^GPA\.\d{4}-\d{4}-\d{4}-\d{5}$/,
    OOB_CODE: /oobCode=([a-zA-Z0-9_-]+)/i
  },

  // ==========================================
  // 6. UI & BEHAVIOR SETTINGS
  // ==========================================
  UI: {
    TOAST_DURATION: 3000,          // Durasi notifikasi muncul (ms)
    TERMINAL_MAX_LINES: 150,       // Maksimal baris log di terminal
    REVEAL_DELAY_BASE: 60,         // Delay animasi pertama (ms)
    REVEAL_DELAY_STEP: 70,         // Jarak antar item animasi (ms)
    PAYMENT_SIMULATION_DELAY: 8000 // Simulasi sukses bayar (8 detik)
  },

  // ==========================================
  // 7. EXTERNAL LINKS (Ganti dengan punya kamu)
  // ==========================================
  LINKS: {
    TELEGRAM_ADMIN: 'https://t.me/username_admin_kamu',
    WHATSAPP_ADMIN: 'https://wa.me/6281234567890',
    TUTORIAL_VIDEO: 'https://youtube.com'
  }
};