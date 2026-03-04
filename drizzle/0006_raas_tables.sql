-- Recovery-as-a-Service: partners, API jobs, usage metering

CREATE TABLE partners (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  webhook_secret TEXT,
  tier TEXT NOT NULL DEFAULT 'starter' CHECK(tier IN ('starter', 'growth', 'enterprise')),
  rate_limit INTEGER NOT NULL DEFAULT 100,
  monthly_gb_limit REAL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE api_jobs (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  external_ref TEXT,
  image_url TEXT,
  scan_mode TEXT NOT NULL DEFAULT 'deep' CHECK(scan_mode IN ('quick', 'deep')),
  file_types TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'downloading', 'processing', 'completed', 'failed')),
  callback_url TEXT,
  scan_id TEXT REFERENCES scans(id),
  files_found INTEGER NOT NULL DEFAULT 0,
  data_recovered INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE TABLE api_usage (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  api_job_id TEXT REFERENCES api_jobs(id),
  event TEXT NOT NULL CHECK(event IN ('job_created', 'gb_scanned', 'files_restored')),
  quantity REAL NOT NULL,
  recorded_at INTEGER NOT NULL
);

CREATE INDEX idx_partners_api_key_hash ON partners(api_key_hash);
CREATE INDEX idx_api_jobs_partner_id ON api_jobs(partner_id);
CREATE INDEX idx_api_jobs_status ON api_jobs(status);
CREATE INDEX idx_api_usage_partner_id ON api_usage(partner_id);
CREATE INDEX idx_api_usage_recorded_at ON api_usage(recorded_at);
