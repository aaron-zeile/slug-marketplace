import { pool } from '../db';
import { ItemId } from '../item/schema';
import { Review, SellerId } from './schema';

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
    WHERE r.item = $1
    ORDER BY (r.data->>'created_at')::timestamptz DESC NULLS LAST;
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

export const deleteReviewById = async (
  reviewId: string,
  userId: string,
): Promise<boolean> => {
  const del = `
    DELETE FROM review
    WHERE id = $1
      AND data->'user'->>'id' = $2;
  `;
  const result = await pool.query(del, [reviewId, userId]);
  return (result.rowCount ?? 0) > 0;
};

export async function getAvgRating(sellerId: SellerId):
  Promise<number> {
    const select = `
    SELECT AVG((r.data->>'rating')::float) AS rating
    FROM review r
    JOIN item i ON i.id = r.item
    WHERE i.data->>'sellerId' = $1;
    `
    const query = {
      text: select,
      values: [sellerId.id]
    }
    const {rows} = await pool.query(query)
    return rows[0]?.rating ?? 0
}

export const getAllReviewsAdmin = async (): Promise<Array<{
  id: string;
  itemId: string;
  itemName: string;
  user: { id: string; name: string };
  content: string;
  rating: number;
  created_at: Date;
}>> => {
  const select = `
    SELECT
      r.id,
      r.item AS "itemId",
      i.data->>'name' AS "itemName",
      r.data->'user' AS user,
      r.data->>'content' AS content,
      (r.data->>'rating')::float AS rating,
      (r.data->>'created_at')::timestamptz AS created_at
    FROM review r
    JOIN item i ON r.item = i.id
    ORDER BY (r.data->>'created_at')::timestamptz DESC NULLS LAST
  `;
  const { rows } = await pool.query(select);
  return rows;
};

export const deleteReviewAsAdmin = async (reviewId: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM review WHERE id = $1`, [reviewId]);
  return (result.rowCount ?? 0) > 0;
};
