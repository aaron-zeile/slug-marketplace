import { pool } from '../db';
import { Item, ItemId } from './schema';

export const getItem = async (itemId: ItemId): Promise<Item> => {
  const select = `SELECT * FROM item
                    WHERE id = $1;`;

  const values = [itemId.id];
  const { rows } = await pool.query<Item>(select, values);

  return rows[0];
};
