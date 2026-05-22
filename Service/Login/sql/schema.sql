\c account
DROP TABLE IF EXISTS shipping_address;
DROP TABLE IF EXISTS corporate_api_key;
DROP TABLE IF EXISTS member;

CREATE TABLE IF NOT EXISTS member (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  google_id     TEXT        UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipping_address (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member        UUID        NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  data          JSONB       NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS shipping_address_one_default_per_member
  ON shipping_address (member)
  WHERE (data->>'is_default')::boolean IS TRUE;

CREATE TABLE IF NOT EXISTS corporate_api_key (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     UUID        NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  key_hash      TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ
);
