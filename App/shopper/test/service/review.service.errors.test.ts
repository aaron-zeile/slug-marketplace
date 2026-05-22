import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  createReview,
  deleteReview,
  getReviews,
} from '../../src/item/review/service';
import { getSessionToken } from '../../src/server/auth/service';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
} from '../support/itemsService';

vi.mock('../../src/server/auth/service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../src/server/auth/service')>();
  return {
    ...actual,
    getSessionToken: vi.fn(),
  };
});

registerItemsServiceHooks();

describe('review service errors', () => {
  let itemId: string;
  let itemsServiceUrl: string;

  beforeAll(async () => {
    const item = await seedItemsServiceItem({
      name: 'Review Error Item',
      description: 'For HTTP failure coverage.',
      images: [],
      price: 5,
    });
    itemId = item.id;
    itemsServiceUrl = process.env.ITEMS_SERVICE_URL!;
    vi.mocked(getSessionToken).mockResolvedValue('test-session-token');
    releaseFetchStubForServiceTests();
  });

  afterEach(() => {
    process.env.ITEMS_SERVICE_URL = itemsServiceUrl;
  });

  it('throws when reviews response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(getReviews(itemId)).rejects.toThrow('Failed to fetch reviews');
  });

  it('throws GraphQL error when reviews query fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({ errors: [{ message: 'Bad item' }] }),
    } as Response);

    await expect(getReviews(itemId)).rejects.toThrow('GraphQL error');
  });

  it('throws when create review response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(createReview(itemId, 5, 'Nope')).rejects.toThrow(
      'Failed to create review',
    );
  });

  it('throws GraphQL error message from create review', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({
        errors: [{ message: 'Access denied! You need to be authenticated' }],
      }),
    } as Response);

    await expect(createReview(itemId, 5, 'Nope')).rejects.toThrow(/Access denied/);
  });

  it('throws when delete review response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Gateway',
      json: async () => ({}),
    } as Response);

    await expect(
      deleteReview('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Failed to delete review');
  });

  it('throws GraphQL error message from delete review', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({ errors: [{ message: 'Forbidden' }] }),
    } as Response);

    await expect(
      deleteReview('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Forbidden');
  });

  it('uses a generic GraphQL error when delete errors omit a message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
      json: async () => ({ errors: [{}] }),
    } as Response);

    await expect(
      deleteReview('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('GraphQL error');
  });
});
