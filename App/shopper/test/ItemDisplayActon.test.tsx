import { expect, it, vi, describe, beforeEach } from 'vitest';
import {
  fetchItemAction,
  fetchItemReviewsAction,
  fetchRandomItemsAction,
} from '../src/app/items/[id]/actions';
import { Item } from '../src/item';
import { Review } from '../src/item/review';

vi.mock('../src/item/service', () => ({
  getItem: vi.fn(),
  getRandomItems: vi.fn(),
}));

vi.mock('../src/item/review/service', () => ({
  getReviews: vi.fn(),
}));

import { getItem, getRandomItems } from '../src/item/service';
import { getReviews } from '../src/item/review/service';

const mockItem: Item = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  seller: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  name: 'Throw Pillow 336',
  description: 'Sleek modern design that fits seamlessly into any lifestyle.',
  images: ['https://example.com/image1.jpg'],
  price: 894.74,
  created_at: '2025-10-07T18:56:33.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchItemAction', () => {
  it('returns success and data when getItem resolves', async () => {
    vi.mocked(getItem).mockResolvedValue(mockItem);

    const result = await fetchItemAction(mockItem.id);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockItem);
  });

  it('returns success false when getItem throws', async () => {
    vi.mocked(getItem).mockRejectedValue(new Error('DB connection failed'));

    const result = await fetchItemAction(mockItem.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
  });

  it('returns success false when getItem throws a non-Error', async () => {
    vi.mocked(getItem).mockRejectedValue('unavailable');

    const result = await fetchItemAction(mockItem.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe(false);
  });

  it('calls getItem with the correct id', async () => {
    vi.mocked(getItem).mockResolvedValue(mockItem);

    await fetchItemAction(mockItem.id);

    expect(getItem).toHaveBeenCalledWith(mockItem.id);
  });
});

describe('fetchRandomItemsAction', () => {
  it('returns success and data when getRandomItems resolves', async () => {
    vi.mocked(getRandomItems).mockResolvedValue([mockItem]);

    const result = await fetchRandomItemsAction(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([mockItem]);
  });

  it('returns success false when getRandomItems throws', async () => {
    vi.mocked(getRandomItems).mockRejectedValue(
      new Error('DB connection failed'),
    );

    const result = await fetchRandomItemsAction(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
  });

  it('returns success false when getRandomItems throws a non-Error', async () => {
    vi.mocked(getRandomItems).mockRejectedValue(503);

    const result = await fetchRandomItemsAction(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe(false);
  });

  it('calls getRandomItems with the correct count', async () => {
    vi.mocked(getRandomItems).mockResolvedValue([mockItem]);

    await fetchRandomItemsAction(5);

    expect(getRandomItems).toHaveBeenCalledWith(5);
  });
});

describe('fetchItemReviewsAction', () => {
  const mockReview: Review = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    user: { id: '6a74cd3c-0c10-4507-ab92-a700174f4b15', name: 'Riley' },
    rating: 5,
    content: 'Nice item.',
    created_at: '2025-10-07T18:56:33.000Z',
  };

  it('returns success and data when getReviews resolves', async () => {
    vi.mocked(getReviews).mockResolvedValue([mockReview]);

    const result = await fetchItemReviewsAction(mockItem.id);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([mockReview]);
  });

  it('returns success false when getReviews throws an Error', async () => {
    vi.mocked(getReviews).mockRejectedValue(new Error('GraphQL down'));

    const result = await fetchItemReviewsAction(mockItem.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('GraphQL down');
  });

  it('returns success false when getReviews throws a non-Error', async () => {
    vi.mocked(getReviews).mockRejectedValue('timeout');

    const result = await fetchItemReviewsAction(mockItem.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe(false);
  });

  it('calls getReviews with the item id', async () => {
    vi.mocked(getReviews).mockResolvedValue([]);

    await fetchItemReviewsAction(mockItem.id);

    expect(getReviews).toHaveBeenCalledWith(mockItem.id);
  });
});
