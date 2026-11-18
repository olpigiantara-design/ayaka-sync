-- ==========================================
-- AYAKA SYNC - COMPLETE DATABASE SCHEMA
-- ==========================================

-- 1. TABLE: users (Akun Pengguna)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. TABLE: user_plans (Status Plan & Limit)
CREATE TABLE IF NOT EXISTS user_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'vip')),
  free_limit INTEGER NOT NULL DEFAULT 20,
  pro_limit INTEGER NOT NULL DEFAULT 1000,
  vip_limit INTEGER NOT NULL DEFAULT 2000,
  used_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: payments (Riwayat Pembayaran QRIS)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_bought VARCHAR(20) NOT NULL CHECK (plan_bought IN ('pro', 'vip')),
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  payment_method VARCHAR(50) DEFAULT 'qris',
  order_id VARCHAR(100) UNIQUE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: activations (Riwayat Aktivasi Alight Motion)
CREATE TABLE IF NOT EXISTS activations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(100),
  plan_at_time VARCHAR(30) DEFAULT 'premium',
  status VARCHAR(30) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: bulk_jobs (Riwayat Generate Massal)
CREATE TABLE IF NOT EXISTS bulk_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE: chat_logs (Riwayat Chat AI Ayaka)
CREATE TABLE IF NOT EXISTS chat_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE: system_settings (Pengaturan Website / QRIS)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_activations_user_id ON activations(user_id);
CREATE INDEX IF NOT EXISTS idx_activations_created_at ON activations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_user_id ON bulk_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);

-- ==========================================
-- DATA AWAL (DEFAULT SETTINGS)
-- ==========================================
INSERT INTO system_settings (key, value) 
VALUES ('qris_image', '/assets/qris-payment.png')
ON CONFLICT (key) DO NOTHING;