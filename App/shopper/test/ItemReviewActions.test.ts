import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createItemReviewAction,
  deleteItemReviewAction,
  fetchItemReviewSessionAction,
} from '../src/app/items/[id]/actions';
import { Review } from '../src/item/review';

vi.mock('../src/app/buyer/login/actions', () => ({
  checkLogin: vi.fn(),
}));

vi.mock('../src/item/review/service', () => ({
  createReview: vi.fn(),
  deleteReview: vi.fn(),
}));

import { checkLogin } from '../src/app/buyer/login/actions';
import { createReview, deleteReview } from '../src/item/review/service';

const itemId = '550e8400-e29b-41d4-a716-446655440000';

const mockReview: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: '6a74cd3c-0c10-4507-ab92-a700174f4b15', name: 'Riley' },
  rating: 5,
  content: 'Nice item.',
  created_at: '2025-10-07T18:56:33.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchItemReviewSessionAction', () => {
  it('returns loggedIn true when checkLogin returns a user', async () => {
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
        email: 'riley@example.com',
        name: 'Riley',
      },
    });

    const result = await fetchItemReviewSessionAction();

    expect(result).toEqual({
      loggedIn: true,
      userId: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    });
  });

  it('returns loggedIn false when checkLogin returns no user', async () => {
    vi.mocked(checkLogin).mockResolvedValue({});

    const result = await fetchItemReviewSessionAction();

    expect(result).toEqual({ loggedIn: false });
  });

  it('returns loggedIn false when checkLogin throws', async () => {
    vi.mocked(checkLogin).mockRejectedValue(new Error('Service down'));

    const result = await fetchItemReviewSessionAction();

    expect(result).toEqual({ loggedIn: false });
  });
});

describe('createItemReviewAction', () => {
  it('returns success and data when createReview resolves', async () => {
    vi.mocked(createReview).mockResolvedValue(mockReview);

    const result = await createItemReviewAction(
      itemId,
      5,
      '  Nice item.  ',
    );

    expect(result).toEqual({ success: true, data: mockReview });
    expect(createReview).toHaveBeenCalledWith(itemId, 5, 'Nice item.');
  });

  it('returns success false with the error message when createReview throws', async () => {
    vi.mocked(createReview).mockRejectedValue(new Error('Not signed in'));

    const result = await createItemReviewAction(itemId, 5, 'Nice item.');

    expect(result).toEqual({ success: false, error: 'Not signed in' });
  });

  it('returns a default error message when createReview throws a non-Error', async () => {
    vi.mocked(createReview).mockRejectedValue('timeout');

    const result = await createItemReviewAction(itemId, 5, 'Nice item.');

    expect(result).toEqual({
      success: false,
      error: 'Could not submit review',
    });
  });

  it('calls createReview with the item id, rating, and trimmed comment', async () => {
    vi.mocked(createReview).mockResolvedValue(mockReview);

    await createItemReviewAction(itemId, 4, 'Solid purchase.');

    expect(createReview).toHaveBeenCalledWith(itemId, 4, 'Solid purchase.');
  });
});

describe('deleteItemReviewAction', () => {
  const reviewId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  it('returns success when deleteReview resolves', async () => {
    vi.mocked(deleteReview).mockResolvedValue(undefined);

    const result = await deleteItemReviewAction(reviewId);

    expect(result).toEqual({ success: true });
    expect(deleteReview).toHaveBeenCalledWith(reviewId);
  });

  it('returns success false with the error message when deleteReview throws', async () => {
    vi.mocked(deleteReview).mockRejectedValue(
      new Error('Review not found or user does not own review'),
    );

    const result = await deleteItemReviewAction(reviewId);

    expect(result).toEqual({
      success: false,
      error: 'Review not found or user does not own review',
    });
  });

  it('returns a default error message when deleteReview throws a non-Error', async () => {
    vi.mocked(deleteReview).mockRejectedValue('timeout');

    const result = await deleteItemReviewAction(reviewId);

    expect(result).toEqual({
      success: false,
      error: 'Could not delete review',
    });
  });
});
