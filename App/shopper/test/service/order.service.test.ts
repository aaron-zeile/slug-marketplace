import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createOrder, getBuyerOrders } from '../../src/order/service';

const buyer = '11111111-1111-4111-8111-111111111111';
const sellerId = '22222222-2222-4222-8222-222222222222';
const itemId = '33333333-3333-4333-8333-333333333333';

const order = {
  id: '44444444-4444-4444-8444-444444444444',
  buyer,
  items: [{ itemId, sellerId }],
  orderedAt: '2026-05-11T12:00:00.000Z',
  purchaseAmount: 99.5,
  status: 'ordered',
  address: {
    label: 'Home',
    line1: '123 Main St',
    line2: 'Apt 4',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'US',
  },
};

const createInput = {
  buyer,
  buyerEmail: 'buyer@example.com',
  items: [{ itemId, sellerId }],
  purchaseAmount: order.purchaseAmount,
  address: order.address,
};

function mockFetchResponse(body: unknown, ok = true, statusText = 'OK') {
  vi.mocked(fetch).mockResolvedValue({
    ok,
    statusText,
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
});

describe('order service', () => {
  it('creates an order', async () => {
    mockFetchResponse({ data: { createOrder: order } });

    const result = await createOrder(createInput);

    expect(result).toEqual(order);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options?.body as string)).toEqual(
      expect.objectContaining({
        variables: { input: createInput },
      }),
    );
  });

  it('fetches buyer orders', async () => {
    mockFetchResponse({ data: { buyerOrders: [order] } });

    const result = await getBuyerOrders(buyer);

    expect(result).toEqual([order]);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options?.body as string)).toEqual(
      expect.objectContaining({
        variables: { input: { buyer } },
      }),
    );
  });

  it('throws when the order response is not ok', async () => {
    mockFetchResponse({}, false, 'Service Unavailable');

    await expect(createOrder(createInput)).rejects.toThrow(
      'Order request failed: Service Unavailable',
    );
  });

  it('throws when order GraphQL returns errors', async () => {
    mockFetchResponse({ errors: [{ message: 'Invalid order' }] });

    await expect(getBuyerOrders(buyer)).rejects.toThrow('GraphQL error');
  });
});
