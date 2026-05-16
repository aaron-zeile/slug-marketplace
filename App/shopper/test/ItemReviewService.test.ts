import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createReview, getReviews } from '../src/item/review/service';
import { getSessionToken } from '../src/server/auth/service';

vi.mock('../src/server/auth/service', () => ({
  getSessionToken: vi.fn(),
}));

const itemId = '550e8400-e29b-41d4-a716-446655440000';

const review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  rating: 5,
  content: 'Great item.',
  created_at: '2025-10-07T18:56:33.000Z',
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
  vi.mocked(getSessionToken).mockResolvedValue('session-token');
});

describe('getReviews', () => {
  it('fetches and returns reviews for an item', async () => {
    mockFetchResponse({
      data: { reviews: [review] },
    });

    const result = await getReviews(itemId);

    expect(result).toEqual([review]);
  });

  it('sends the item id in the GraphQL variables', async () => {
    mockFetchResponse({
      data: { reviews: [] },
    });

    await getReviews(itemId);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options?.body as string)).toEqual(
      expect.objectContaining({
        variables: {
          input: { id: itemId },
        },
      }),
    );
  });

  it('returns an empty array when reviews are missing', async () => {
    mockFetchResponse({
      data: {},
    });

    const result = await getReviews(itemId);

    expect(result).toEqual([]);
  });

  it('throws when the reviews response is not ok', async () => {
    mockFetchResponse({}, false, 'Service Unavailable');

    await expect(getReviews(itemId)).rejects.toThrow(
      'Failed to fetch reviews: Service Unavailable',
    );
  });

  it('throws when reviews GraphQL returns errors', async () => {
    mockFetchResponse({
      errors: [{ message: 'Nope' }],
    });

    await expect(getReviews(itemId)).rejects.toThrow('GraphQL error');
  });
});

describe('createReview', () => {
  it('creates a review with the session token', async () => {
    mockFetchResponse({
      data: { createReview: review },
    });

    const result = await createReview(itemId, 5, 'Great item.');

    expect(result).toEqual(review);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer session-token',
      }),
    );
    expect(JSON.parse(options?.body as string)).toEqual(
      expect.objectContaining({
        variables: {
          input: { itemId, rating: 5, comment: 'Great item.' },
        },
      }),
    );
  });

  it('throws when the user is not signed in', async () => {
    vi.mocked(getSessionToken).mockResolvedValue(undefined);

    await expect(createReview(itemId, 5, 'Great item.')).rejects.toThrow(
      'Not signed in',
    );
  });

  it('throws when the create review response is not ok', async () => {
    mockFetchResponse({}, false, 'Service Unavailable');

    await expect(createReview(itemId, 5, 'Great item.')).rejects.toThrow(
      'Failed to create review: Service Unavailable',
    );
  });

  it('throws the GraphQL error message when present', async () => {
    mockFetchResponse({
      errors: [{ message: 'Already reviewed' }],
    });

    await expect(createReview(itemId, 5, 'Great item.')).rejects.toThrow(
      'Already reviewed',
    );
  });

  it('throws a generic message for GraphQL errors without a message', async () => {
    mockFetchResponse({
      errors: [{}],
    });

    await expect(createReview(itemId, 5, 'Great item.')).rejects.toThrow(
      'GraphQL error',
    );
  });
});
