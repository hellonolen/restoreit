-- Engine Conversations Table

CREATE TABLE IF NOT EXISTS engine_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  scan_id TEXT REFERENCES scans(id),
  messages TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_engine_conversations_user ON engine_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_engine_conversations_scan ON engine_conversations(scan_id);
