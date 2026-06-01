\c cart

CREATE TABLE IF NOT EXISTS viewed_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member UUID NOT NULL,
  item UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member, item)
);

CREATE INDEX IF NOT EXISTS viewed_item_member_viewed_at_idx
  ON viewed_item (member, viewed_at DESC);
