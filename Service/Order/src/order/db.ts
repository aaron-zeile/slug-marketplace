import { PoolClient } from 'pg';
import { pool } from '../db';
import {
  BuyerOrdersInput,
  CreateOrderInput,
  Order,
  OrderAddress,
  OrderIdInput,
  OrderItem,
  SellerOrdersInput,
} from './schema';

interface OrderRow {
  id: string;
  buyer: string;
  ordered_at: Date;
  purchase_amount: string;
  address: OrderAddress;
  items: OrderItem[] | null;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    buyer: row.buyer,
    items: row.items ?? [],
    orderedAt: row.ordered_at,
    purchaseAmount: Number(row.purchase_amount),
    address: row.address,
  };
}

const orderSelect = `
  SELECT
    buyer_order.id,
    buyer_order.buyer,
    buyer_order.ordered_at,
    buyer_order.purchase_amount,
    buyer_order.address,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'itemId', order_item.item,
          'sellerId', order_item.seller
        )
        ORDER BY order_item.id
      ) FILTER (WHERE order_item.id IS NOT NULL),
      '[]'::jsonb
    ) AS items
  FROM buyer_order
  LEFT JOIN order_item ON order_item.order_id = buyer_order.id
`;

async function getOrderById(client: PoolClient, id: string): Promise<Order> {
  const query = `
    ${orderSelect}
    WHERE buyer_order.id = $1
    GROUP BY buyer_order.id
  `;

  const { rows } = await client.query<OrderRow>(query, [id]);
  if (!rows[0]) {
    throw new Error('Order not found');
  }

  return mapOrder(rows[0]);
}

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query<{ id: string }>(
      `
        INSERT INTO buyer_order (buyer, purchase_amount, address)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [input.buyer, input.purchaseAmount, input.address],
    );

    const orderId = orderResult.rows[0].id;

    for (const item of input.items) {
      await client.query(
        `
          INSERT INTO order_item (order_id, item, seller)
          VALUES ($1, $2, $3)
        `,
        [orderId, item.itemId, item.sellerId],
      );
    }

    const order = await getOrderById(client, orderId);
    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getOrder = async (input: OrderIdInput): Promise<Order> => {
  const client = await pool.connect();

  try {
    return await getOrderById(client, input.id);
  } finally {
    client.release();
  }
};

export const getBuyerOrders = async (
  input: BuyerOrdersInput,
): Promise<Order[]> => {
  const query = `
    ${orderSelect}
    WHERE buyer_order.buyer = $1
    GROUP BY buyer_order.id
    ORDER BY buyer_order.ordered_at DESC
  `;

  const { rows } = await pool.query<OrderRow>(query, [input.buyer]);
  return rows.map(mapOrder);
};

export const getSellerOrders = async (
  input: SellerOrdersInput,
): Promise<Order[]> => {
  const query = `
    SELECT
      buyer_order.id,
      buyer_order.buyer,
      buyer_order.ordered_at,
      buyer_order.purchase_amount,
      buyer_order.address,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'itemId', order_item.item,
            'sellerId', order_item.seller
          )
          ORDER BY order_item.id
        ) FILTER (WHERE order_item.id IS NOT NULL),
        '[]'::jsonb
      ) AS items
    FROM buyer_order
    INNER JOIN order_item ON order_item.order_id = buyer_order.id
    WHERE order_item.seller = $1
    GROUP BY buyer_order.id
    ORDER BY buyer_order.ordered_at DESC
  `;

  const { rows } = await pool.query<OrderRow>(query, [input.seller]);
  return rows.map(mapOrder);
};
