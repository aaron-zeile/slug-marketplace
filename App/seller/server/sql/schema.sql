DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS item;

CREATE TABLE IF NOT EXISTS member (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  google_id     TEXT        UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller      UUID NOT NULL REFERENCES member(id),
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  price       NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);