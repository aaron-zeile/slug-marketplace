import { pool } from '../db';
import { Item, ItemId, RandomItemsInput, SearchItemsInput, SellerId } from './schema';


export const getAllItems = async (): Promise<Item[]> => {
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
    ORDER BY (data->>'created_at')::timestamptz DESC NULLS LAST
  `;
  const { rows } = await pool.query<Item>(select);
  return rows;
};

export const deleteItembyID = async (itemId: ItemId): Promise<void> => {
  const select = `
    DELETE FROM item
    WHERE id = $1;
  `;
  const values = [itemId.id];
  await pool.query(select, values);
}

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

export const getRandomItems = async (input: RandomItemsInput): Promise<Item[]> => {
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
  ORDER BY random()
  LIMIT $1
  `
  const query = {
    text: select,
    values: [input.count],
  }
  const {rows} = await pool.query<Item>(query)
  return rows
}

export const getSearchItems = async (input: SearchItemsInput): Promise<Item[]> => {
  const searchText = input.searchText.trim();

  if (!searchText) {
    return [];
  }

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
  WHERE data->>'name' ILIKE '%' || $1 || '%'
    OR data->>'description' ILIKE '%' || $1 || '%'
  ORDER BY data->>'name'
  `
  const query = {
    text: select,
    values: [searchText],
  }
  const {rows} = await pool.query<Item>(query)
  return rows
}
