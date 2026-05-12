import { pool } from '../db';
import { ItemId } from '../item/schema';
import { Review } from './schema';

export const getReviews = async (item: ItemId) => {
  console.log(item.id);
  const select = `
                  SELECT 
                    r.id,
                    r.data->'user' AS user,
                    r.data->>'content' AS content,
                    (r.data->>'rating')::float AS rating,
                    (r.data->>'created_at')::timestamptz AS created_at
                  FROM review r
                  WHERE r.item = $1;
                `;
  const values = [item.id];
  const { rows } = await pool.query<Review>(select, values);
  console.log(rows);
  return rows;
};
