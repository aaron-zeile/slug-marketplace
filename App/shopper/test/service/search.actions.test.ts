import { beforeAll, describe, expect, it } from 'vitest';

import { fetchSearchItemsAction } from '../../src/app/search/[searchText]/actions';
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
});
