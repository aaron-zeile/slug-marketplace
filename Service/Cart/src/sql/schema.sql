\c cart

DROP TABLE IF EXISTS cart_item;
DROP TABLE IF EXISTS viewed_item;

CREATE TABLE cart_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member UUID NOT NULL,
  item UUID NOT NULL,
  data jsonb,
  UNIQUE (member, item)
);

DROP TABLE IF EXISTS wishlist_item;

CREATE TABLE wishlist_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member UUID NOT NULL,
  item UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member, item)
);

CREATE TABLE viewed_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member UUID NOT NULL,
  item UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member, item)
);

CREATE INDEX viewed_item_member_viewed_at_idx
  ON viewed_item (member, viewed_at DESC);
