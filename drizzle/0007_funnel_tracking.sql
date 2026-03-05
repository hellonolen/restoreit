-- Conversion funnel tracking + payment attribution + admin flag

CREATE TABLE IF NOT EXISTS funnel_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  scan_id TEXT REFERENCES scans(id),
  event TEXT NOT NULL,
  tier TEXT,
  channel TEXT NOT NULL DEFAULT 'consumer',
  metadata TEXT,
  created_at INTEGER NOT NULL
);

ALTER TABLE payments ADD COLUMN scan_id TEXT REFERENCES scans(id);
ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_funnel_events_user ON funnel_events(user_id);
CREATE INDEX idx_funnel_events_event ON funnel_events(event);
CREATE INDEX idx_funnel_events_created ON funnel_events(created_at);
CREATE INDEX idx_funnel_events_channel ON funnel_events(channel);
CREATE INDEX idx_payments_scan ON payments(scan_id);
