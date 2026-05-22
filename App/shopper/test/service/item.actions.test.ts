import { beforeAll, describe, expect, it } from 'vitest';

import {
  fetchItemAction,
  fetchItemReviewsAction,
  fetchRandomItemsAction,
} from '../../src/app/items/[id]/actions';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
} from '../support/itemsService';

registerItemsServiceHooks();

describe('item actions', () => {
  let itemId: string;

  beforeAll(async () => {
    const created = await seedItemsServiceItem({
      name: 'Action Layer Item',
      description: 'Exercised through server actions.',
      images: ['https://example.com/action-item.webp'],
      price: 21,
    });
    itemId = created.id;
    releaseFetchStubForServiceTests();
  });

  it('fetchItemAction returns success and data for a real item', async () => {
    const result = await fetchItemAction(itemId);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Action Layer Item');
  });

  it('fetchItemAction returns success false for an unknown item', async () => {
    const result = await fetchItemAction(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(result.success).toBe(false);
  });

  it('fetchRandomItemsAction returns seeded items', async () => {
    const result = await fetchRandomItemsAction(1);

    expect(result.success).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });

  it('fetchRandomItemsAction returns success false when the service is down', async () => {
    const previous = process.env.ITEMS_SERVICE_URL;
    process.env.ITEMS_SERVICE_URL = 'http://127.0.0.1:9/graphql';

    const result = await fetchRandomItemsAction(1);

    process.env.ITEMS_SERVICE_URL = previous;

    expect(result.success).toBe(false);
  });

  it('fetchItemReviewsAction returns an empty list before reviews exist', async () => {
    const fresh = await seedItemsServiceItem({
      name: 'No Reviews Yet',
      description: 'No reviews on this listing.',
      images: [],
      price: 3,
    });

    const result = await fetchItemReviewsAction(fresh.id);

    expect(result).toEqual({ success: true, data: [] });
  });
});
