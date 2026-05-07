import { pool } from '../db';
import { Item, ItemId, SellerId } from './schema';

export const getItem = async (itemId: ItemId): Promise<Item> => {
  const select = `
    SELECT
      id,
      jsonb_build_object(
        'id', data->>'sellerId',
        'name', data->>'sellerName'
      ) AS seller,
      data->>'name' AS name,
      data->>'description' AS description,
      data->'images' AS images,
      (data->>'price')::numeric AS price,
      (data->>'created_at')::timestamptz AS created_at
    FROM item
    WHERE id = $1;
  `;

  const values = [itemId.id];
  const { rows } = await pool.query<Item>(select, values);
  return rows[0];
};

export const getSellerItems = async (sellerId: SellerId): Promise<Item[]> => {
  const select = `
  SELECT
    id,
    jsonb_build_object(
      'id', data->>'sellerId',
      'name', data->>'sellerName'
    ) AS seller,
    data->>'name' AS name,
    data->>'description' AS description,
    data->'images' AS images,
    (data->>'price')::numeric AS price,
    (data->>'created_at')::timestamptz AS created_at
  FROM item
  WHERE data->>'sellerId' = $1
  `
  const query = {
    text: select,
    values: [sellerId.id],
  }
  const {rows} = await pool.query<Item>(query)
  return rows
}
