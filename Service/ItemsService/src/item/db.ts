import { pool } from '../db';
import {
  Item,
  ItemId,
  NewItem,
  RandomItemsInput,
  SearchItemsInput,
  SellerItemsInput,
  UpdateItem,
} from './schema';


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
      (data->>'created_at')::timestamptz AS created_at,
      status
    FROM item
    ORDER BY (data->>'created_at')::timestamptz DESC NULLS LAST
  `;
  const { rows } = await pool.query<Item>(select);
  return rows;
};

export const deleteItembyID = async (
  itemId: ItemId,
  sellerId: string,
): Promise<boolean> => {
  const select = `
    DELETE FROM item
    WHERE id = $1
      AND data->>'sellerId' = $2;
  `;
  const values = [itemId.id, sellerId];
  const result = await pool.query(select, values);
  return (result.rowCount ?? 0) > 0;
}

export const createItem = async (params: {
  input: NewItem;
  seller: { id: string; name: string };
}): Promise<Item> => {
  const data = {
    sellerId: params.seller.id,
    sellerName: params.seller.name,
    name: params.input.name,
    description: params.input.description,
    images: params.input.images,
    price: params.input.price,
    created_at: new Date().toISOString(),
  };

  const insert = `
    INSERT INTO item (data)
    VALUES ($1::jsonb)
    RETURNING
      id,
      jsonb_build_object(
        'id', data->>'sellerId',
        'name', data->>'sellerName'
      ) AS seller,
      data->>'name' AS name,
      data->>'description' AS description,
      data->'images' AS images,
      (data->>'price')::numeric AS price,
      (data->>'created_at')::timestamptz AS created_at,
      status
  `;

  const { rows } = await pool.query<Item>(insert, [JSON.stringify(data)]);

  const item = rows[0];
  if (!item) {
    throw new Error('Failed to create item');
  }

  return item;
};

export const updateItem = async (
  input: UpdateItem,
  sellerId: string,
): Promise<Item | undefined> => {
  const update = `
    UPDATE item
    SET data = data || $3::jsonb
    WHERE id = $1
      AND data->>'sellerId' = $2
    RETURNING
      id,
      jsonb_build_object(
        'id', data->>'sellerId',
        'name', data->>'sellerName'
      ) AS seller,
      data->>'name' AS name,
      data->>'description' AS description,
      data->'images' AS images,
      (data->>'price')::numeric AS price,
      (data->>'created_at')::timestamptz AS created_at,
      status;
  `;

  const data = {
    name: input.name,
    description: input.description,
    images: input.images,
    price: input.price,
  };

  const { rows } = await pool.query<Item>(update, [
    input.id,
    sellerId,
    JSON.stringify(data),
  ]);

  return rows[0];
};

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
      (data->>'created_at')::timestamptz AS created_at,
      status
    FROM item
    WHERE id = $1;
  `;

  const values = [itemId.id];
  const { rows } = await pool.query<Item>(select, values);
  return rows[0];
};

export const getSellerItems = async (input: SellerItemsInput): Promise<Item[]> => {
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
    (data->>'created_at')::timestamptz AS created_at,
    status
  FROM item
  WHERE data->>'sellerId' = $1
    AND status = $2
  `
  const query = {
    text: select,
    values: [input.id, input.status],
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
    (data->>'created_at')::timestamptz AS created_at,
    status
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
    (data->>'created_at')::timestamptz AS created_at,
    status
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
