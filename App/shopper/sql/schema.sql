DROP TABLE IF EXISTS member;

CREATE TABLE IF NOT EXISTS member (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  google_id     TEXT        UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
