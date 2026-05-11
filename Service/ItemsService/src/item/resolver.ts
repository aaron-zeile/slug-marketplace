import { Arg, Query, Resolver } from 'type-graphql';
import {
  Item,
  ItemId,
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

  @Query(() => [Item])
  async randomItems(@Arg('input') input: RandomItemsInput): Promise<Item[]> {
    return new ItemService().getRandomItems(input);
  }

  @Query(() => [Item])
  async searchItems(@Arg('input') input: SearchItemsInput): Promise<Item[]> {
    return new ItemService().getSearchItems(input);
  }
}
