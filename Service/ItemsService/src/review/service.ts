import { ItemId } from '../item/schema';
import { getReviews } from './db';
import { Review } from './schema';

export class ReviewService {
  public async getReviews(item: ItemId): Promise<Review[]> {
    console.log(item);
    const reviews = await getReviews(item);
    console.log('Returning reviews');
    return reviews;
  }
}
