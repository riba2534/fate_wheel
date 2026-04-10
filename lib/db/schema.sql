CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expire_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shares_expire ON shares(expire_at);
