import { beforeAll, describe, expect, it } from 'vitest';

import {
  getFilteredItems,
  getItem,
  getRandomItems,
  getSearchItems,
} from '../../src/item/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceDiscount,
  seedItemsServiceItem,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('shopper item service', () => {
  let itemId: string;

  beforeAll(async () => {
    const created = await seedItemsServiceItem({
      name: 'Shopper Service Item',
      description: 'Fetched through the real ItemsService.',
      images: ['https://example.com/shopper-item.webp'],
      price: 42.5,
    });
    itemId = created.id;
    await seedItemsServiceDiscount({
      itemId,
      discountPercent: 15,
      duration: 7,
    });

    await seedItemsServiceItem({
      name: 'Unique Shopper Search Lamp',
      description: 'Only found by search text.',
      images: ['https://example.com/lamp.webp'],
      price: 18,
    });

    await seedItemsServiceItem({
      name: 'Tagged Shopper Book',
      description: 'Only found by category tag.',
      images: ['https://example.com/book.webp'],
      price: 12,
      tags: ['books'],
    });

    releaseFetchStubForServiceTests();
  });

  it('fetches and returns a parsed item', async () => {
    const result = await getItem(itemId);

    expect(result.name).toBe('Shopper Service Item');
    expect(result.status).toBe('active');
    expect(Number(result.price)).toBe(36.13);
    expect(result.activeDiscount).toMatchObject({
      itemId,
      discountPercent: 15,
      duration: 7,
      originalPrice: 42.5,
    });
    expect(result.activeDiscount?.ends_at).toBeDefined();
  });

  it('sends the item id in the GraphQL variables', async () => {
    const result = await getItem(itemId);

    expect(result.id).toBe(itemId);
  });

  it('fetches and returns parsed search results', async () => {
    const result = await getSearchItems('Unique Shopper Search');

    expect(result.some((entry) => entry.name.includes('Unique Shopper Search'))).toBe(
      true,
    );
  });

  it('fetches random items from the catalog', async () => {
    const result = await getRandomItems(2);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.status).toBe('active');
  });

  it('fetches filtered items by tag', async () => {
    const result = await getFilteredItems({ tag: 'books', status: 'active' });

    expect(result.some((entry) => entry.name === 'Tagged Shopper Book')).toBe(
      true,
    );
  });
});
