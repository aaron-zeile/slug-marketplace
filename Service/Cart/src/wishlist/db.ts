import { pool } from '../db';
import {
  AddToWishlistInput,
  MemberWishlistInput,
  RemoveFromWishlistInput,
  WishlistItem,
} from './schema';

const wishlistItemSelect = `
  SELECT
    id,
    member,
    item,
    created_at AS "createdAt"
  FROM wishlist_item
`;

export const getWishlist = async (
  input: MemberWishlistInput,
): Promise<WishlistItem[]> => {
  const query = `
    ${wishlistItemSelect}
    WHERE member = $1
    ORDER BY created_at DESC, id
  `;

  const { rows } = await pool.query<WishlistItem>(query, [input.member]);
  return rows;
};

export const addToWishlist = async (
  input: AddToWishlistInput,
): Promise<WishlistItem> => {
  const insertQuery = `
    INSERT INTO wishlist_item (member, item)
    VALUES ($1, $2)
    ON CONFLICT (member, item) DO NOTHING
    RETURNING
      id,
      member,
      item,
      created_at AS "createdAt"
  `;

  const values = [input.member, input.item];
  const { rows } = await pool.query<WishlistItem>(insertQuery, values);

  if (rows[0]) {
    return rows[0];
  }

  const existingQuery = `
    ${wishlistItemSelect}
    WHERE member = $1 AND item = $2
  `;
  const existing = await pool.query<WishlistItem>(existingQuery, values);
  return existing.rows[0];
};

export const removeFromWishlist = async (
  input: RemoveFromWishlistInput,
): Promise<void> => {
  const query = `
    DELETE FROM wishlist_item
    WHERE member = $1 AND item = $2
  `;

  await pool.query(query, [input.member, input.item]);
};

export const clearWishlist = async (
  input: MemberWishlistInput,
): Promise<void> => {
  const query = `
    DELETE FROM wishlist_item
    WHERE member = $1
  `;

  await pool.query(query, [input.member]);
};
