import type { SessionUser } from '../auth/service';
import { ItemId } from '../item/schema';
import { deleteReviewById, getReviews, insertReview } from './db';
import { NewReview, Review, ReviewId } from './schema';

export class ReviewService {
  public async getReviews(item: ItemId): Promise<Review[]> {
    return getReviews(item);
  }

  public async createReview(
    sessionUser: SessionUser,
    input: NewReview,
  ): Promise<Review> {
    return insertReview({
      itemId: input.itemId,
      content: input.comment,
      rating: input.rating,
      user: { id: sessionUser.id, name: sessionUser.name },
    });
  }

  public async deleteReview(
    sessionUser: SessionUser,
    reviewId: ReviewId,
  ): Promise<void> {
    const deleted = await deleteReviewById(reviewId.id, sessionUser.id);

    if (!deleted) {
      throw new Error('Review not found or user does not own review');
    }
  }
}
