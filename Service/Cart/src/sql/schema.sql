\c cart

DROP TABLE IF EXISTS cart_item;

CREATE TABLE cart_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member UUID NOT NULL,
  item UUID NOT NULL,
  data jsonb,
  UNIQUE (member, item)
);
