\c account

CREATE TABLE IF NOT EXISTS shipping_address (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member        UUID        NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  data          JSONB       NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS shipping_address_one_default_per_member
  ON shipping_address (member)
  WHERE (data->>'is_default')::boolean IS TRUE;
