import { pool } from '../db';
import { ItemId } from '../item/schema';
import { Discount, NewDiscount } from './schema';

const discountSelectShape = `
  d.id,
  d.item AS "itemId",
  (d.data->>'discountPercent')::float AS "discountPercent",
  (d.data->>'duration')::int AS duration,
  (d.data->>'created_at')::timestamptz AS created_at
`;

export const insertDiscount = async (params: {
  input: NewDiscount;
  sellerId: string;
}): Promise<Discount | undefined> => {
  const data = {
    discountPercent: params.input.discountPercent,
    duration: params.input.duration,
    created_at: new Date().toISOString(),
  };

  const insert = `
    INSERT INTO discount (item, data)
    SELECT i.id, $3::jsonb
    FROM item i
    WHERE i.id = $1
      AND i.data->>'sellerId' = $2
    RETURNING
      id,
      item AS "itemId",
      (data->>'discountPercent')::float AS "discountPercent",
      (data->>'duration')::int AS duration,
      (data->>'created_at')::timestamptz AS created_at;
  `;

  const { rows } = await pool.query<Discount>(insert, [
    params.input.itemId,
    params.sellerId,
    JSON.stringify(data),
  ]);

  return rows[0];
};

export const getDiscount = async (
  discountId: string,
): Promise<Discount | undefined> => {
  const select = `
    SELECT ${discountSelectShape}
    FROM discount d
    WHERE d.id = $1;
  `;

  const { rows } = await pool.query<Discount>(select, [discountId]);
  return rows[0];
};

export const getDiscountsByItem = async (
  item: ItemId,
): Promise<Discount[]> => {
  const select = `
    SELECT ${discountSelectShape}
    FROM discount d
    WHERE d.item = $1
    ORDER BY (d.data->>'created_at')::timestamptz DESC NULLS LAST;
  `;

  const { rows } = await pool.query<Discount>(select, [item.id]);
  return rows;
};

export const deleteDiscountById = async (
  discountId: string,
  sellerId: string,
): Promise<boolean> => {
  const del = `
    DELETE FROM discount d
    USING item i
    WHERE d.id = $1
      AND d.item = i.id
      AND i.data->>'sellerId' = $2;
  `;

  const result = await pool.query(del, [discountId, sellerId]);
  return (result.rowCount ?? 0) > 0;
};
