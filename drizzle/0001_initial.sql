-- RestoreIt D1 Initial Migration

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 1,
  whop_customer_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  drive_name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('quick', 'deep')),
  status TEXT NOT NULL CHECK(status IN ('in-progress', 'completed', 'cancelled', 'paused')),
  files_found INTEGER NOT NULL DEFAULT 0,
  data_size INTEGER NOT NULL DEFAULT 0,
  restore_rate REAL NOT NULL DEFAULT 0,
  started_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  whop_payment_id TEXT,
  tier TEXT NOT NULL CHECK(tier IN ('standard', 'pro')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  whop_subscription_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('active', 'cancelled', 'expired')),
  started_at INTEGER NOT NULL,
  cancelled_at INTEGER
);

CREATE TABLE IF NOT EXISTS vault_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  scan_id TEXT REFERENCES scans(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_user ON vault_files(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_scan ON vault_files(scan_id);
