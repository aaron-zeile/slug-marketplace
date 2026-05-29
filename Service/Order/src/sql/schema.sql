\c orders

DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS buyer_order;

CREATE TABLE buyer_order(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer UUID NOT NULL,
  buyer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ordered'
    CHECK (status IN ('ordered', 'shipping', 'delivered')),
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purchase_amount NUMERIC(12, 2) NOT NULL CHECK (purchase_amount >= 0),
  address jsonb NOT NULL
);

CREATE TABLE order_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES buyer_order(id) ON DELETE CASCADE,
  item UUID NOT NULL,
  seller UUID NOT NULL
);

CREATE INDEX buyer_order_buyer_ordered_at_idx
  ON buyer_order (buyer, ordered_at DESC);

CREATE INDEX order_item_order_id_idx
  ON order_item (order_id);
