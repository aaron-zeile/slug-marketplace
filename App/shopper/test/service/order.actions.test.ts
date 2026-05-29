import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createOrderAction,
  fetchCurrentUserOrdersAction,
} from '../../src/app/order/actions';
import { enrichOrdersWithDetails } from '../../src/order/enrich';
import { createOrder, getBuyerOrders } from '../../src/order/service';
import { check, getSessionToken } from '../../src/server/auth/service';
import { testUser } from '../support/itemsService';

vi.mock('../../src/order/service', () => ({
  createOrder: vi.fn(),
  getBuyerOrders: vi.fn(),
}));

vi.mock('../../src/order/enrich', () => ({
  enrichOrdersWithDetails: vi.fn(),
}));

vi.mock('../../src/server/auth/service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../src/server/auth/service')>();
  return {
    ...actual,
    getSessionToken: vi.fn(),
    check: vi.fn(),
  };
});

const order = {
  id: '44444444-4444-4444-8444-444444444444',
  buyer: testUser.id,
  items: [
    {
      itemId: '33333333-3333-4333-8333-333333333333',
      sellerId: '22222222-2222-4222-8222-222222222222',
    },
  ],
  orderedAt: '2026-05-11T12:00:00.000Z',
  purchaseAmount: 42,
  address: {
    line1: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'US',
  },
};

const orderInput = {
  items: order.items,
  purchaseAmount: order.purchaseAmount,
  address: order.address,
};

const orderWithDetails = {
  ...order,
  lineItems: [
    {
      itemId: order.items[0].itemId,
      sellerId: order.items[0].sellerId,
      quantity: 1,
      name: 'Test item',
      image: 'https://example.com/item.jpg',
      price: 42,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(enrichOrdersWithDetails).mockImplementation(async (orders) =>
    orders.map((entry) => ({
      ...entry,
      lineItems: orderWithDetails.lineItems,
    })),
  );
  vi.mocked(getSessionToken).mockResolvedValue('test-session-token');
  vi.mocked(check).mockResolvedValue(testUser);
});

describe('order actions', () => {
  it('createOrderAction returns an error when not signed in', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    const result = await createOrderAction(orderInput);

    expect(result).toEqual({ success: false, error: 'Not signed in' });
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('createOrderAction creates an order for the signed-in buyer', async () => {
    vi.mocked(createOrder).mockResolvedValueOnce(order);

    const result = await createOrderAction(orderInput);

    expect(result).toEqual({ success: true, data: order });
    expect(createOrder).toHaveBeenCalledWith({
      buyer: testUser.id,
      items: orderInput.items,
      purchaseAmount: orderInput.purchaseAmount,
      address: orderInput.address,
    });
  });

  it('createOrderAction returns service errors', async () => {
    vi.mocked(createOrder).mockRejectedValueOnce(
      new Error('Order request failed: Bad Gateway'),
    );

    const result = await createOrderAction(orderInput);

    expect(result).toEqual({
      success: false,
      error: 'Order request failed: Bad Gateway',
    });
  });

  it('fetchCurrentUserOrdersAction returns an error when not signed in', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    const result = await fetchCurrentUserOrdersAction();

    expect(result).toEqual({ success: false, error: 'Not signed in' });
    expect(getBuyerOrders).not.toHaveBeenCalled();
  });

  it('fetchCurrentUserOrdersAction returns orders for the signed-in buyer', async () => {
    vi.mocked(getBuyerOrders).mockResolvedValueOnce([order]);

    const result = await fetchCurrentUserOrdersAction();

    expect(result).toEqual({ success: true, data: [orderWithDetails] });
    expect(getBuyerOrders).toHaveBeenCalledWith(testUser.id);
    expect(enrichOrdersWithDetails).toHaveBeenCalledWith([order]);
  });

  it('fetchCurrentUserOrdersAction returns service errors', async () => {
    vi.mocked(getBuyerOrders).mockRejectedValueOnce(new Error('GraphQL error'));

    const result = await fetchCurrentUserOrdersAction();

    expect(result).toEqual({ success: false, error: 'GraphQL error' });
  });
});
