import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getItem } from '../../src/item/service';
import { enrichOrdersWithDetails } from '../../src/order/enrich';
import type { Order } from '../../src/order/service';

vi.mock('../../src/item/service', () => ({
  getItem: vi.fn(),
}));

const itemId = '11111111-1111-4111-8111-111111111111';
const sellerId = '22222222-2222-4222-8222-222222222222';

const baseOrder: Order = {
  id: '33333333-3333-4333-8333-333333333333',
  buyer: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  items: [{ itemId, sellerId }],
  orderedAt: '2026-06-03T12:00:00.000Z',
  purchaseAmount: 99.99,
  status: 'ordered',
  address: {
    line1: '123 Main St',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95060',
    country: 'US',
  },
};

const catalogItem = {
  id: itemId,
  seller: { id: sellerId, name: 'Avery Parks' },
  name: 'Test Widget',
  description: 'A test listing',
  images: ['https://cdn.example.com/widget.jpg'],
  price: 49.99,
  quantity: 3,
  created_at: '2026-05-11T12:00:00.000Z',
  status: 'active' as const,
};

beforeEach(() => {
  vi.mocked(getItem).mockResolvedValue(catalogItem);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('enrichOrdersWithDetails', () => {
  it('adds catalog details to order line items', async () => {
    const [enriched] = await enrichOrdersWithDetails([baseOrder]);

    expect(enriched.lineItems).toEqual([
      {
        itemId,
        sellerId,
        quantity: 1,
        name: 'Test Widget',
        image: 'https://cdn.example.com/widget.jpg',
        price: 49.99,
      },
    ]);
  });

  it('marks line items unavailable when item lookup fails', async () => {
    vi.mocked(getItem).mockRejectedValue(new Error('Item not found'));

    const [enriched] = await enrichOrdersWithDetails([baseOrder]);

    expect(enriched.lineItems[0]).toEqual({
      itemId,
      sellerId,
      quantity: 1,
      name: `Item ${itemId}`,
      price: 0,
      unavailable: true,
    });
  });

  it('merges quantity for repeated lines with the same item and seller', async () => {
    const order: Order = {
      ...baseOrder,
      items: [
        { itemId, sellerId },
        { itemId, sellerId },
      ],
    };

    const [enriched] = await enrichOrdersWithDetails([order]);

    expect(enriched.lineItems).toHaveLength(1);
    expect(enriched.lineItems[0].quantity).toBe(2);
  });

  it('marks line items unavailable when resolution was skipped', async () => {
    vi.spyOn(Array.prototype, 'find').mockReturnValueOnce(undefined);

    const [enriched] = await enrichOrdersWithDetails([baseOrder]);

    expect(enriched.lineItems[0]).toEqual({
      itemId,
      sellerId,
      quantity: 1,
      name: `Item ${itemId}`,
      price: 0,
      unavailable: true,
    });
  });
});
