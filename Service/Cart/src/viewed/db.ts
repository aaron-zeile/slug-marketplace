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
  const query = `
    WITH upserted AS (
      INSERT INTO viewed_item (member, item)
      VALUES ($1, $2)
      ON CONFLICT (member, item)
      DO UPDATE SET viewed_at = now()
      RETURNING
        id,
        member,
        item,
        viewed_at AS "viewedAt"
    ),
    trimmed AS (
      DELETE FROM viewed_item
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            row_number() OVER (
              PARTITION BY member
              ORDER BY viewed_at DESC, id DESC
            ) AS view_rank
          FROM viewed_item
          WHERE member = $1
        ) ranked
        WHERE view_rank > $3
      )
    )
    SELECT * FROM upserted
  `;

  const { rows } = await pool.query<ViewedItem>(query, [
    input.member,
    input.item,
    MAX_VIEWED_ITEMS,
  ]);
  return rows[0];
};
