import { pool } from '../db';
import {
  AddToCartInput,
  CartItem,
  MemberCartInput,
  RemoveFromCartInput,
} from './schema';

const cartItemSelect = `
  SELECT
    id,
    member,
    item,
    COALESCE((data->>'quantity')::int, 1) AS quantity
  FROM cart_item
`;

export const getCart = async (input: MemberCartInput): Promise<CartItem[]> => {
  const query = `
    ${cartItemSelect}
    WHERE member = $1
    ORDER BY id
  `;
  
  const { rows } = await pool.query<CartItem>(query, [input.member]);
  return rows;
};

export const addToCart = async (input: AddToCartInput): Promise<CartItem> => {
  const query = `
    INSERT INTO cart_item (member, item, data)
    VALUES ($1, $2, jsonb_build_object('quantity', 1))
    ON CONFLICT (member, item)
    DO UPDATE SET data = jsonb_build_object(
      'quantity',
      COALESCE((cart_item.data->>'quantity')::int, 1) + 1
    )
    RETURNING
      id,
      member,
      item,
      COALESCE((data->>'quantity')::int, 1) AS quantity
  `;

  const values = [input.member, input.item];
  const { rows } = await pool.query<CartItem>(query, values);
  return rows[0];
};

export const removeFromCart = async (
  input: RemoveFromCartInput,
): Promise<void> => {
  const query = `
    WITH existing AS (
      SELECT COALESCE((data->>'quantity')::int, 1) AS quantity
      FROM cart_item
      WHERE member = $1 AND item = $2
    ),
    deleted AS (
      DELETE FROM cart_item
      WHERE member = $1
        AND item = $2
        AND (SELECT quantity FROM existing) <= 1
    )
    UPDATE cart_item
    SET data = jsonb_build_object(
      'quantity',
      (SELECT quantity FROM existing) - 1
    )
    WHERE member = $1
      AND item = $2
      AND (SELECT quantity FROM existing) > 1
  `;

  await pool.query(query, [input.member, input.item]);
};

export const clearCart = async (input: MemberCartInput): Promise<void> => {
  const query = `
    DELETE FROM cart_item
    WHERE member = $1
  `;

  await pool.query(query, [input.member]);
};
