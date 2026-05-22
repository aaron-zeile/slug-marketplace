import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ItemService } from '../src/item/service';
import { ReviewService } from '../src/review/service';
import { testUser } from './helpers';
import { resetServiceDatabase, shutdownServiceDatabase } from './service.setup';

describe('ReviewService', () => {
  let itemId: string;

  beforeAll(async () => {
    await resetServiceDatabase();

    const item = await new ItemService().createItem(testUser, {
      name: 'Reviewed Item',
      description: 'For review service tests.',
      images: [],
      price: 12,
    });
    itemId = item.id;
  });

  afterAll(() => {
    shutdownServiceDatabase();
  });

  it('creates a review for the session user', async () => {
    const review = await new ReviewService().createReview(testUser, {
      itemId,
      rating: 4.5,
      comment: 'Solid purchase.',
    });

    expect(review).toMatchObject({
      user: { id: testUser.id, name: testUser.name },
      content: 'Solid purchase.',
      rating: 4.5,
    });
  });

  it('returns reviews for an item', async () => {
    await new ReviewService().createReview(testUser, {
      itemId,
      rating: 5,
      comment: 'Excellent.',
    });

    const reviews = await new ReviewService().getReviews({ id: itemId });

    expect(reviews.length).toBeGreaterThanOrEqual(1);
    expect(reviews[0].user.id).toBe(testUser.id);
  });

  it('deletes a review owned by the session user', async () => {
    const review = await new ReviewService().createReview(testUser, {
      itemId,
      rating: 3,
      comment: 'Will delete.',
    });

    await expect(
      new ReviewService().deleteReview(testUser, { id: review.id }),
    ).resolves.toBeUndefined();

    const reviews = await new ReviewService().getReviews({ id: itemId });
    expect(reviews.map((entry) => entry.id)).not.toContain(review.id);
  });

  it('throws when deleting a review the user does not own', async () => {
    const review = await new ReviewService().createReview(testUser, {
      itemId,
      rating: 2,
      comment: 'Protected.',
    });

    await expect(
      new ReviewService().deleteReview(
        {
          ...testUser,
          id: '00000000-0000-0000-0000-000000000099',
        },
        { id: review.id },
      ),
    ).rejects.toThrow('Review not found or user does not own review');
  });
});
