import 'reflect-metadata';

import type { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const buyerId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const sellerId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const itemId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

let pool: Pool;
let OrderService: typeof import('../src/order/service').OrderService;
let dbReady = false;

describe('OrderService.createOrder', () => {
  beforeAll(async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => '',
    } as Response));

    try {
      const dbModule = await import('../src/db');
      const serviceModule = await import('../src/order/service');
      pool = dbModule.pool;
      OrderService = serviceModule.OrderService;
      await pool.query('SELECT 1');
      dbReady = true;
    } catch {
      dbReady = false;
    }
  });

  afterEach(async () => {
    if (!dbReady) {
      return;
    }

    await pool.query('TRUNCATE order_item, buyer_order');
    vi.clearAllMocks();
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    if (dbReady) {
      await pool.end();
    }
  });

  it.skipIf(!dbReady)(
    'persists status ordered and sends a purchase confirmation email',
    async () => {
      process.env.MAILGUN_API_KEY = 'key-test';
      process.env.MAILGUN_DOMAIN = 'mg.example.com';
      process.env.MAILGUN_FROM = 'orders@mg.example.com';

      const order = await new OrderService().createOrder({
        buyer: buyerId,
        buyerEmail: 'buyer@example.com',
        purchaseAmount: 42.5,
        address: {
          line1: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'US',
        },
        items: [{ itemId, sellerId }],
      });

      expect(order.status).toBe('ordered');
      expect(order.purchaseAmount).toBe(42.5);
      expect(fetch).toHaveBeenCalled();

      const { rows } = await pool.query<{ status: string; buyer_email: string }>(
        'SELECT status, buyer_email FROM buyer_order WHERE id = $1',
        [order.id],
      );
      expect(rows[0]).toEqual({
        status: 'ordered',
        buyer_email: 'buyer@example.com',
      });
    },
  );
});
