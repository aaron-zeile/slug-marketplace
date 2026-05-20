import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getReviews, insertReview, deleteReviewById } = vi.hoisted(() => ({
  getReviews: vi.fn(),
  insertReview: vi.fn(),
  deleteReviewById: vi.fn(),
}));

vi.mock('../src/review/db', () => ({
  getReviews,
  insertReview,
  deleteReviewById,
}));

import { ReviewService } from '../src/review/service';
import { testUser } from './helpers';

describe('ReviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReview', () => {
    it('maps session user and input to insertReview', async () => {
      const input = {
        itemId: '00000000-0000-0000-0000-000000000001',
        rating: 4.5,
        comment: 'Solid purchase.',
      };
      const review = {
        id: '00000000-0000-0000-0000-000000000002',
        user: { id: testUser.id, name: testUser.name },
        content: input.comment,
        rating: input.rating,
        created_at: new Date(),
      };

      insertReview.mockResolvedValueOnce(review);

      await expect(
        new ReviewService().createReview(testUser, input),
      ).resolves.toEqual(review);

      expect(insertReview).toHaveBeenCalledWith({
        itemId: input.itemId,
        content: input.comment,
        rating: input.rating,
        user: { id: testUser.id, name: testUser.name },
      });
    });
  });

  describe('getReviews', () => {
    it('delegates to the database layer', async () => {
      const itemId = { id: '00000000-0000-0000-0000-000000000001' };
      const reviews = [
        {
          id: '00000000-0000-0000-0000-000000000003',
          user: { id: testUser.id, name: testUser.name },
          content: 'Nice.',
          rating: 5,
          created_at: new Date(),
        },
      ];

      getReviews.mockResolvedValueOnce(reviews);

      await expect(new ReviewService().getReviews(itemId)).resolves.toEqual(
        reviews,
      );
      expect(getReviews).toHaveBeenCalledWith(itemId);
    });
  });

  describe('deleteReview', () => {
    it('throws when the review is not found or not owned by the user', async () => {
      deleteReviewById.mockResolvedValueOnce(false);

      await expect(
        new ReviewService().deleteReview(testUser, {
          id: '00000000-0000-0000-0000-000000000002',
        }),
      ).rejects.toThrow('Review not found or user does not own review');
    });

    it('delegates to the database layer when the review is owned', async () => {
      deleteReviewById.mockResolvedValueOnce(true);

      await expect(
        new ReviewService().deleteReview(testUser, {
          id: '00000000-0000-0000-0000-000000000002',
        }),
      ).resolves.toBeUndefined();

      expect(deleteReviewById).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000002',
        testUser.id,
      );
    });
  });
});
