-- Real Engine: scan fields + vault_files updates + carve_jobs

-- Add relay/chunk columns to scans
ALTER TABLE scans ADD COLUMN chunk_size_bytes INTEGER NOT NULL DEFAULT 16777216;
ALTER TABLE scans ADD COLUMN total_chunks INTEGER;
ALTER TABLE scans ADD COLUMN chunks_received INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scans ADD COLUMN bytes_received INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scans ADD COLUMN relay_token_hash TEXT;

-- Add carving metadata to vault_files
ALTER TABLE vault_files ADD COLUMN start_offset INTEGER;
ALTER TABLE vault_files ADD COLUMN end_offset INTEGER;
ALTER TABLE vault_files ADD COLUMN sha256 TEXT;
ALTER TABLE vault_files ADD COLUMN confidence INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vault_files ADD COLUMN integrity TEXT NOT NULL DEFAULT 'intact';

-- Carve jobs table
CREATE TABLE IF NOT EXISTS carve_jobs (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL REFERENCES scans(id),
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_carve_jobs_scan ON carve_jobs(scan_id);
CREATE INDEX IF NOT EXISTS idx_carve_jobs_status ON carve_jobs(status);
CREATE INDEX IF NOT EXISTS idx_vault_files_scan ON vault_files(scan_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_integrity ON vault_files(integrity);
