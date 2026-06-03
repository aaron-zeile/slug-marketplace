import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createReview, deleteReview, getReviews } from '../../src/item/review/service';
import { getSessionToken } from '../../src/server/auth/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  restubLoginFetchForServiceTests,
  seedItemsServiceItem,
  testUser,
} from '../support/itemsService';
import {
  registerOrderServiceHooks,
  resetOrderDatabase,
  seedBuyerOrderForItem,
} from '../support/orderService';

vi.mock('../../src/server/auth/service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/server/auth/service')>();
  return {
    ...actual,
    getSessionToken: vi.fn(),
  };
});

registerOrderServiceHooks();
registerItemsServiceHooks();

describe('review service', () => {
  let itemId: string;

  beforeAll(async () => {
    await resetOrderDatabase();
    restubLoginFetchForServiceTests();

    const item = await seedItemsServiceItem({
      name: 'Review Service Item',
      description: 'For shopper review service tests.',
      images: [],
      price: 9,
    });
    itemId = item.id;

    await seedBuyerOrderForItem(testUser.id, itemId, testUser.id);

    vi.mocked(getSessionToken).mockResolvedValue('test-session-token');
    releaseFetchStubForServiceTests();
  });

  it('fetches reviews for an item', async () => {
    const reviews = await getReviews(itemId);

    expect(Array.isArray(reviews)).toBe(true);
  });

  it('creates and deletes a review with the session token', async () => {
    const created = await createReview(itemId, 5, 'Great item.');

    expect(created.user.id).toBe(testUser.id);

    await expect(deleteReview(created.id)).resolves.toBeUndefined();

    const reviews = await getReviews(itemId);
    expect(reviews.map((review) => review.id)).not.toContain(created.id);
  });

  it('throws when the user is not signed in', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    await expect(createReview(itemId, 5, 'No auth')).rejects.toThrow(
      'Not signed in',
    );
  });

  it('throws when deleting a review without a session', async () => {
    vi.mocked(getSessionToken).mockResolvedValueOnce(undefined);

    await expect(
      deleteReview('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Not signed in');
  });
});
