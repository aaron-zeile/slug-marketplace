-- THIS IS SINCE WE CANNOT HAVE A FK IN A MICROSERVICE OF MEMBER SINCE AUTH IS ITS OWN M.S

-- async function createItem(sellerId: string, input: CreateItemInput) {
--   // 1. verify seller exists via member service
--   const memberRes = await fetch(`http://member-service/members/${sellerId}`);
  
--   if (!memberRes.ok) {
--     throw new Error(`Seller ${sellerId} does not exist`);
--   }

--   // 2. insert item
--   const result = await pool.query(
--     `INSERT INTO item (seller, name, description, price)
--      VALUES ($1, $2, $3, $4)
--      RETURNING *`,
--     [sellerId, input.name, input.description, input.price]
--   );

--   return result.rows[0];
-- }
-- The flow is:
-- Client → Items Service → Member Service (does this seller exist?)
--                        ← yes/no
--        → INSERT into item table
--        ← return item
\c items

DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS item;

CREATE TABLE item(
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb
);

CREATE TABLE review(
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item UUID NOT NULL REFERENCES item(id) ON DELETE CASCADE,
  data    jsonb
);