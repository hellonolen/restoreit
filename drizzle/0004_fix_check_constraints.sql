-- Fix CHECK constraints on scans.status and payments.tier to match Drizzle schema

-- Step 1: Recreate scans table with correct status enum
CREATE TABLE scans_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  drive_name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('quick', 'deep')),
  status TEXT NOT NULL CHECK(status IN ('created', 'uploading', 'finalized', 'carving', 'ready', 'failed', 'cancelled')),
  files_found INTEGER NOT NULL DEFAULT 0,
  data_size INTEGER NOT NULL DEFAULT 0,
  restore_rate REAL NOT NULL DEFAULT 0,
  chunk_size_bytes INTEGER NOT NULL DEFAULT 16777216,
  total_chunks INTEGER,
  chunks_received INTEGER NOT NULL DEFAULT 0,
  bytes_received INTEGER NOT NULL DEFAULT 0,
  relay_token_hash TEXT,
  started_at INTEGER NOT NULL,
  completed_at INTEGER
);

-- Migrate data (map old statuses to new)
INSERT INTO scans_new SELECT
  id, user_id, drive_name, mode,
  CASE status
    WHEN 'in-progress' THEN 'carving'
    WHEN 'completed' THEN 'ready'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'paused' THEN 'created'
    ELSE 'created'
  END,
  files_found, data_size, restore_rate,
  chunk_size_bytes, total_chunks, chunks_received, bytes_received, relay_token_hash,
  started_at, completed_at
FROM scans;

DROP TABLE scans;
ALTER TABLE scans_new RENAME TO scans;

-- Step 2: Recreate payments table with correct tier enum
CREATE TABLE payments_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  whop_payment_id TEXT,
  tier TEXT NOT NULL CHECK(tier IN ('standard', 'pro', 'protection')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at INTEGER NOT NULL
);

INSERT INTO payments_new SELECT * FROM payments;
DROP TABLE payments;
ALTER TABLE payments_new RENAME TO payments;
