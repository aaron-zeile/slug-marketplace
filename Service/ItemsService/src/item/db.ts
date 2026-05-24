import { pool } from '../db';
import {
  FilteredItemsInput,
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
      COALESCE(data->'tags', '[]'::jsonb) AS tags,
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
    tags: params.input.tags ?? [],
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
      COALESCE(data->'tags', '[]'::jsonb) AS tags,
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
      COALESCE(data->'tags', '[]'::jsonb) AS tags,
      (data->>'price')::numeric AS price,
      (data->>'created_at')::timestamptz AS created_at,
      status;
  `;

  const data: Record<string, unknown> = {
    name: input.name,
    description: input.description,
    images: input.images,
    price: input.price,
  };
  if (input.tags !== undefined) {
    data.tags = input.tags;
  }

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
      COALESCE(data->'tags', '[]'::jsonb) AS tags,
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
    COALESCE(data->'tags', '[]'::jsonb) AS tags,
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
    COALESCE(data->'tags', '[]'::jsonb) AS tags,
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
    COALESCE(data->'tags', '[]'::jsonb) AS tags,
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

export const getFilteredItems = async (
  input: FilteredItemsInput,
): Promise<Item[]> => {
  const values: Array<number | string> = [];
  const where: string[] = [];
  const having: string[] = [];

  if (input.minPrice !== undefined) {
    values.push(input.minPrice);
    where.push(`(i.data->>'price')::numeric >= $${values.length}`);
  }

  if (input.maxPrice !== undefined) {
    values.push(input.maxPrice);
    where.push(`(i.data->>'price')::numeric <= $${values.length}`);
  }

  if (input.tag !== undefined) {
    values.push(input.tag);
    where.push(`COALESCE(i.data->'tags', '[]'::jsonb) ? $${values.length}`);
  }

  if (input.sellerId !== undefined) {
    values.push(input.sellerId);
    where.push(`i.data->>'sellerId' = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    where.push(`i.status = $${values.length}`);
  }

  const searchText = input.searchText?.trim();
  if (searchText) {
    values.push(searchText);
    where.push(`(
      i.data->>'name' ILIKE '%' || $${values.length} || '%'
      OR i.data->>'description' ILIKE '%' || $${values.length} || '%'
    )`);
  }

  if (input.minStars !== undefined) {
    values.push(input.minStars);
    having.push(
      `COALESCE(AVG((r.data->>'rating')::float), 0) >= $${values.length}`,
    );
  }

  const orderBy = {
    newest: `(i.data->>'created_at')::timestamptz DESC NULLS LAST`,
    priceAsc: `(i.data->>'price')::numeric ASC`,
    priceDesc: `(i.data->>'price')::numeric DESC`,
    ratingDesc: `average_rating DESC NULLS LAST`,
  }[input.sortBy ?? 'newest'];

  const limit = input.limit ?? 50;
  values.push(limit);

  const select = `
    SELECT
      i.id,
      jsonb_build_object(
        'id', i.data->>'sellerId',
        'name', i.data->>'sellerName'
      ) AS seller,
      i.data->>'name' AS name,
      i.data->>'description' AS description,
      i.data->'images' AS images,
      COALESCE(i.data->'tags', '[]'::jsonb) AS tags,
      (i.data->>'price')::numeric AS price,
      (i.data->>'created_at')::timestamptz AS created_at,
      i.status,
      AVG((r.data->>'rating')::float) AS average_rating
    FROM item i
    LEFT JOIN review r ON r.item = i.id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY i.id
    ${having.length ? `HAVING ${having.join(' AND ')}` : ''}
    ORDER BY ${orderBy}
    LIMIT $${values.length}
  `;

  const { rows } = await pool.query<Item>(select, values);
  return rows;
};
