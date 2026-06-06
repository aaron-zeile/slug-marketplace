import 'reflect-metadata';

import {beforeEach, describe, expect, it, vi} from 'vitest';

const sellerId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const dbMocks = vi.hoisted(() => ({
  getSellerOrders: vi.fn(),
}));

vi.mock('../src/order/db', async () => {
  const actual = await vi.importActual<typeof import('../src/order/db')>(
    '../src/order/db',
  );
  return {
    ...actual,
    getSellerOrders: dbMocks.getSellerOrders,
  };
});

describe('OrderService.getSellerSalesStats', () => {
  beforeEach(() => {
    dbMocks.getSellerOrders.mockReset();
  });

  it('groups seller order earnings by month in chronological order', async () => {
    const {OrderService} = await import('../src/order/service');
    dbMocks.getSellerOrders.mockResolvedValue([
      {
        id: 'order-2',
        buyer: 'buyer-1',
        items: [],
        orderedAt: new Date('2026-06-18T10:00:00.000Z'),
        purchaseAmount: 20.255,
        status: 'ordered',
        address: {},
      },
      {
        id: 'order-1',
        buyer: 'buyer-1',
        items: [],
        orderedAt: new Date('2026-05-03T10:00:00.000Z'),
        purchaseAmount: 10,
        status: 'ordered',
        address: {},
      },
      {
        id: 'order-3',
        buyer: 'buyer-2',
        items: [],
        orderedAt: new Date('2026-06-19T10:00:00.000Z'),
        purchaseAmount: 30.255,
        status: 'shipping',
        address: {},
      },
    ]);

    const stats = await new OrderService().getSellerSalesStats({seller: sellerId});

    expect({
      stats,
      dbCall: dbMocks.getSellerOrders.mock.calls[0],
    }).toEqual({
      stats: [
        {month: 'May 2026', earnings: 10, orders: 1},
        {month: 'Jun 2026', earnings: 50.51, orders: 2},
      ],
      dbCall: [{seller: sellerId}],
    });
  });
});
