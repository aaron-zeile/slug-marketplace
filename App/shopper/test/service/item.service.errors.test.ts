import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  getFilteredItems,
  getItem,
  getRandomItems,
  getSearchItems,
} from '../../src/item/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('shopper item service errors', () => {
  let itemId: string;
  let itemsServiceUrl: string;

  beforeAll(async () => {
    const created = await seedItemsServiceItem({
      name: 'Error Path Item',
      description: 'Used before pointing at a dead endpoint.',
      images: [],
      price: 1,
    });
    itemId = created.id;
    itemsServiceUrl = process.env.ITEMS_SERVICE_URL!;
    releaseFetchStubForServiceTests();
  });

  afterEach(() => {
    process.env.ITEMS_SERVICE_URL = itemsServiceUrl;
  });

  it('throws when the item response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(getItem(itemId)).rejects.toThrow('Failed to fetch item');
  });

  it('throws when random items response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(getRandomItems(1)).rejects.toThrow('Failed to fetch random items');
  });

  it('throws when search items response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(getSearchItems('anything')).rejects.toThrow(
      'Failed to fetch search items',
    );
  });

  it('throws when filtered items response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(getFilteredItems({ tag: 'books' })).rejects.toThrow(
      'Failed to fetch filtered items',
    );
  });

  it('throws GraphQL error when the item query fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({ errors: [{ message: 'Item missing' }] }),
    } as Response);

    await expect(getItem(itemId)).rejects.toThrow('GraphQL error');
  });

  it('throws GraphQL error when random items query fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({ errors: [{ message: 'Bad count' }] }),
    } as Response);

    await expect(getRandomItems(1)).rejects.toThrow('GraphQL error');
  });

  it('throws GraphQL error when search items query fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({ errors: [{ message: 'Search failed' }] }),
    } as Response);

    await expect(getSearchItems('x')).rejects.toThrow('GraphQL error');
  });

  it('throws GraphQL error for an unknown item id', async () => {
    await expect(
      getItem('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow();
  });
});
