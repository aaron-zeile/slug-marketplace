import { pool } from '../db';
import { ItemId } from '../item/schema';
import { Review } from './schema';

const reviewSelectShape = `
  r.id,
  r.data->'user' AS user,
  r.data->>'content' AS content,
  (r.data->>'rating')::float AS rating,
  (r.data->>'created_at')::timestamptz AS created_at
`;

export const getReviews = async (item: ItemId) => {
  const select = `
    SELECT ${reviewSelectShape}
    FROM review r
    WHERE r.item = $1;
  `;
  const values = [item.id];
  const { rows } = await pool.query<Review>(select, values);
  return rows;
};

export const insertReview = async (params: {
  itemId: string;
  content: string;
  rating: number;
  user: { id: string; name: string };
}): Promise<Review> => {
  const data = {
    user: params.user,
    content: params.content,
    rating: params.rating,
    created_at: new Date().toISOString(),
  };

  const insert = `
    INSERT INTO review (item, data)
    VALUES ($1, $2::jsonb)
    RETURNING
      id,
      data->'user' AS user,
      data->>'content' AS content,
      (data->>'rating')::float AS rating,
      (data->>'created_at')::timestamptz AS created_at;
  `;

  const { rows } = await pool.query<Review>(insert, [
    params.itemId,
    JSON.stringify(data),
  ]);

  const row = rows[0];
  if (!row) {
    throw new Error('Failed to create review');
  }

  return row;
};
