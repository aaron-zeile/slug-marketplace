\c cart

DROP TABLE IF EXISTS cart_item;

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
