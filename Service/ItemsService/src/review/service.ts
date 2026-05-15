import type { SessionUser } from '../auth/service';
import { ItemId } from '../item/schema';
import { getReviews, insertReview } from './db';
import { NewReview, Review } from './schema';

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
}
