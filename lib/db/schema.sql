CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expire_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shares_expire ON shares(expire_at);

-- 观命专属分享表：仅存干支脱敏命盘 + LLM 解读快照，绝不存阳历出生信息
CREATE TABLE IF NOT EXISTS destiny_shares (
  id TEXT PRIMARY KEY,
  -- 命盘脱敏快照（compact JSON），含干支、十神、五行、大运、紫微宫位等
  compact_json TEXT NOT NULL,
  -- LLM 解读快照
  reading_json TEXT NOT NULL,
  -- 性别（紫微大限方向需要）
  gender TEXT NOT NULL,
  -- 用户问题（可选，已在 compact 内但为查询便利冗余存一份）
  question TEXT,
  created_at INTEGER NOT NULL,
  expire_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_destiny_shares_expire ON destiny_shares(expire_at);
