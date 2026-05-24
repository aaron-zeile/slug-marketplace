import { beforeAll, describe, expect, it } from 'vitest';

import {
  fetchFilteredItemsAction,
  fetchSearchItemsAction,
} from '../../src/app/search/[searchText]/actions';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('search actions', () => {
  beforeAll(async () => {
    await seedItemsServiceItem({
      name: 'Ceramic Vase Search Target',
      description: 'Unique search phrase for integration tests.',
      images: ['https://example.com/vase.webp'],
      price: 33,
    });
    await seedItemsServiceItem({
      name: 'Category Books Search Target',
      description: 'Unique category phrase for integration tests.',
      images: ['https://example.com/book.webp'],
      price: 21,
      tags: ['books'],
    });
    releaseFetchStubForServiceTests();
  });

  it('returns success and data for a real search', async () => {
    const result = await fetchSearchItemsAction('Ceramic Vase Search');

    expect(result.success).toBe(true);
    expect(
      result.data?.some((item) => item.name.includes('Ceramic Vase Search')),
    ).toBe(true);
  });

  it('returns success false when the search service is unreachable', async () => {
    const previous = process.env.ITEMS_SERVICE_URL;
    process.env.ITEMS_SERVICE_URL = 'http://127.0.0.1:9/graphql';

    const result = await fetchSearchItemsAction('anything');

    process.env.ITEMS_SERVICE_URL = previous;

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns success and data for filtered category search', async () => {
    const result = await fetchFilteredItemsAction({
      status: 'active',
      tag: 'books',
    });

    expect(result.success).toBe(true);
    expect(
      result.data?.some((item) => item.name === 'Category Books Search Target'),
    ).toBe(true);
  });

  it('returns success false when filtered search fails', async () => {
    const result = await fetchFilteredItemsAction({
      maxPrice: 1,
      minPrice: 10,
      status: 'active',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
