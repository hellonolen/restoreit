-- Webhook delivery logs for partner event tracking
CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  api_job_id TEXT REFERENCES api_jobs(id),
  event TEXT NOT NULL,
  callback_url TEXT NOT NULL,
  status_code INTEGER,
  success INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  delivered_at INTEGER NOT NULL
);

CREATE INDEX idx_webhook_logs_partner ON webhook_logs(partner_id);
CREATE INDEX idx_webhook_logs_delivered ON webhook_logs(delivered_at);
