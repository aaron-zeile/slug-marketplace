import { pool } from '../db';
import {
  MemberViewedItemsInput,
  RecordViewedItemInput,
  ViewedItem,
} from './schema';

const MAX_VIEWED_ITEMS = 100;

const viewedItemSelect = `
  SELECT
    id,
    member,
    item,
    viewed_at AS "viewedAt"
  FROM viewed_item
`;

export const getViewedItems = async (
  input: MemberViewedItemsInput,
): Promise<ViewedItem[]> => {
  const query = `
    ${viewedItemSelect}
    WHERE member = $1
    ORDER BY viewed_at DESC, id DESC
  `;

  const { rows } = await pool.query<ViewedItem>(query, [input.member]);
  return rows;
};

export const recordViewedItem = async (
  input: RecordViewedItemInput,
): Promise<ViewedItem> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const upsert = await client.query<ViewedItem>(
      `
        INSERT INTO viewed_item (member, item)
        VALUES ($1, $2)
        ON CONFLICT (member, item)
        DO UPDATE SET viewed_at = now()
        RETURNING
          id,
          member,
          item,
          viewed_at AS "viewedAt"
      `,
      [input.member, input.item],
    );

    await client.query(
      `
        DELETE FROM viewed_item
        WHERE member = $1
          AND id NOT IN (
            SELECT id
            FROM viewed_item
            WHERE member = $1
            ORDER BY viewed_at DESC, id DESC
            LIMIT $2
          )
      `,
      [input.member, MAX_VIEWED_ITEMS],
    );

    await client.query('COMMIT');

    const row = upsert.rows[0];
    if (!row) {
      throw new Error('Failed to record viewed item');
    }

    return row;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
