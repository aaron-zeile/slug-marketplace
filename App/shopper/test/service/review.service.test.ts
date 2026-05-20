import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createReview, deleteReview, getReviews } from '../../src/item/review/service';
import { getSessionToken } from '../../src/server/auth/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
  testUser,
} from '../support/itemsService';

vi.mock('../../src/server/auth/service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/server/auth/service')>();
  return {
    ...actual,
    getSessionToken: vi.fn(),
  };
});

registerItemsServiceHooks();

describe('review service', () => {
  let itemId: string;

  beforeAll(async () => {
    const item = await seedItemsServiceItem({
      name: 'Review Service Item',
      description: 'For shopper review service tests.',
      images: [],
      price: 9,
    });
    itemId = item.id;
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
});
