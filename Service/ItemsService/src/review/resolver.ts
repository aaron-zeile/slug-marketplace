import { Arg, Authorized, Ctx, Float, Mutation, Query, Resolver } from 'type-graphql';

import type { ItemsGraphQLContext } from '../auth/context';
import { ItemId } from '../item/schema';
import { NewReview, Review, ReviewId, SellerId } from './schema';
import { ReviewService } from './service';

@Resolver()
export class ReviewResolver {
  @Query(() => [Review])
  async reviews(@Arg('input') item: ItemId): Promise<Review[]> {
    return new ReviewService().getReviews(item);
  }

  @Mutation(() => Review)
  @Authorized()
  async createReview(
    @Arg('input') input: NewReview,
    @Ctx() ctx: ItemsGraphQLContext,
  ): Promise<Review> {
    const user = ctx.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return new ReviewService().createReview(user, input);
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteReview(
    @Arg('input') input: ReviewId,
    @Ctx() ctx: ItemsGraphQLContext,
  ): Promise<boolean> {
    const user = ctx.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    await new ReviewService().deleteReview(user, input);
    return true;
  }

  @Query(() => Float)
  async getAvgRating(
    @Arg('input') input: SellerId
  ): Promise<number> {
    return new ReviewService().getAvgRating(input)
  }
}
