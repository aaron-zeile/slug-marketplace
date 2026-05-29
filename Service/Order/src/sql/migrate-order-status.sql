\c orders

ALTER TABLE buyer_order
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ordered'
    CHECK (status IN ('ordered', 'shipping', 'delivered'));

ALTER TABLE buyer_order
  ADD COLUMN IF NOT EXISTS buyer_email TEXT;

UPDATE buyer_order
SET buyer_email = 'unknown@example.com'
WHERE buyer_email IS NULL;

ALTER TABLE buyer_order
  ALTER COLUMN buyer_email SET NOT NULL;
