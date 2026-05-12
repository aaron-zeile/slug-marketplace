import { Arg, Query, Resolver } from 'type-graphql';
import { Review } from './schema';
import { ReviewService } from './service';
import { ItemId } from '../item/schema';

@Resolver()
export class ReviewResolver {
  @Query(() => [Review])
  async reviews(@Arg('input') item: ItemId): Promise<Review[]> {
    return new ReviewService().getReviews(item);
  }
}
