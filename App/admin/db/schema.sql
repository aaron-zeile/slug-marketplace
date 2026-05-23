\c admindb

-- SlugMarketplace admin schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS admins (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_fees (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       UUID           NOT NULL,
  seller_id     UUID           NOT NULL,
  sale_price    NUMERIC(10, 2) NOT NULL,
  fee_percent   NUMERIC(5, 2)  NOT NULL DEFAULT 5.00,
  fee_amount    NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND(sale_price * fee_percent / 100, 2)) STORED,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id    TEXT        NOT NULL,
  seller_name  TEXT        NOT NULL,
  seller_email TEXT        NOT NULL,
  subject      TEXT        NOT NULL,
  body         TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);