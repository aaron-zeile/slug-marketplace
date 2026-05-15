import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import type { ItemsGraphQLContext } from '../auth/context';
import {
  Item,
  ItemId,
  NewItem,
  RandomItemsInput,
  SearchItemsInput,
  SellerId,
} from './schema';
import { ItemService } from './service';

@Resolver()
export class ItemResolver {
  @Query(() => Item)
  async item(@Arg('input') itemId: ItemId): Promise<Item> {
    return new ItemService().getItem(itemId);
  }

  @Query(() => [Item])
  async sellerItems(@Arg('input') sellerId: SellerId): Promise<Item[]> {
    return new ItemService().getSellerItems(sellerId);
  }


  @Mutation(() => Boolean)
  @Authorized()
  async deleteItem(
    @Arg('input') itemId: ItemId,
    @Ctx() ctx: ItemsGraphQLContext,
  ): Promise<boolean> {
    const user = ctx.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    await new ItemService().deleteItem(user, itemId);
    return true;
  }

  @Mutation(() => Item)
  @Authorized()
  async createItem(
    @Arg('input') input: NewItem,
    @Ctx() ctx: ItemsGraphQLContext,
  ): Promise<Item> {
    const user = ctx.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return new ItemService().createItem(user, input);
  }

  @Query(() => [Item])
  async allItems(): Promise<Item[]> {
    return new ItemService().getAllItems();
  }

  @Query(() => [Item])
  async randomItems(@Arg('input') input: RandomItemsInput): Promise<Item[]> {
    return new ItemService().getRandomItems(input);
  }

  @Query(() => [Item])
  async searchItems(@Arg('input') input: SearchItemsInput): Promise<Item[]> {
    return new ItemService().getSearchItems(input);
  }
}
