import { Arg, Query, Resolver } from 'type-graphql';
import { Item, ItemId, RandomItemsInput, SellerId } from './schema';
import { ItemService } from './service';

@Resolver()
export class ItemResolver {
  @Query((returns) => Item)
  async item(@Arg('input') itemId: ItemId): Promise<Item> {
    return new ItemService().getItem(itemId);
  }

  @Query((returns) => [Item])
  async sellerItems(@Arg('input') sellerId: SellerId): Promise<Item[]> {
    return new ItemService().getSellerItems(sellerId);
  }

  @Query((returns) => [Item])
  async randomItems(@Arg('input') input: RandomItemsInput): Promise<Item[]> {
    return new ItemService().getRandomItems(input);
  }
}
