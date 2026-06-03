import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import type { ItemsGraphQLContext } from '../auth/context';
import { ItemId } from '../item/schema';
import { Discount, DiscountId, NewDiscount } from './schema';
import { DiscountService } from './service';

@Resolver()
export class DiscountResolver {
  @Query(() => Discount, { nullable: true })
  async discount(@Arg('input') input: DiscountId): Promise<Discount | undefined> {
    return new DiscountService().getDiscount(input);
  }

  @Query(() => [Discount])
  async discountsByItem(@Arg('input') input: ItemId): Promise<Discount[]> {
    return new DiscountService().getDiscountsByItem(input);
  }

  @Mutation(() => Discount)
  @Authorized()
  async createDiscount(
    @Arg('input') input: NewDiscount,
    @Ctx() ctx: ItemsGraphQLContext,
  ): Promise<Discount> {
    const user = ctx.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return new DiscountService().createDiscount(user, input);
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteDiscount(
    @Arg('input') input: DiscountId,
    @Ctx() ctx: ItemsGraphQLContext,
  ): Promise<boolean> {
    const user = ctx.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    await new DiscountService().deleteDiscount(user, input);
    return true;
  }
}
