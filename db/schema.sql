-- SlugMarketplace admin schema

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item(
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  price       NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);