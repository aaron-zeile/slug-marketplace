\c account
DROP TABLE IF EXISTS member;

CREATE TABLE IF NOT EXISTS member (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  google_id     TEXT        UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
