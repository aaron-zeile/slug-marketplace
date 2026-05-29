import type { SessionUser } from '../auth/service';
import { buyerHasOrderedItem } from '../order/client';
import { ItemId } from '../item/schema';
import { deleteReviewById, getReviews, insertReview, getAvgRating } from './db';
import { NewReview, Review, ReviewId, SellerId } from './schema';

export class ReviewService {
  public async getReviews(item: ItemId): Promise<Review[]> {
    return getReviews(item);
  }

  public async createReview(
    sessionUser: SessionUser,
    input: NewReview,
  ): Promise<Review> {
    const hasOrdered = await buyerHasOrderedItem(sessionUser.id, input.itemId);
    if (!hasOrdered) {
      throw new Error('You can only review items you have purchased');
    }

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

  public async getAvgRating(input: SellerId):
    Promise<GLfloat> {
      const rating = await getAvgRating(input)
      return rating
  }
}
