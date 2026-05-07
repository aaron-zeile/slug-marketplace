import { Arg, Query, Resolver } from 'type-graphql';
import { Item, ItemId, SellerId } from './schema';
import { ItemService } from './service';

@Resolver()
export class ItemResolver {
  @Query((returns) => Item)
  async item(@Arg('input') itemId: ItemId): Promise<Item> {
    return new ItemService().getItem(itemId);
  }

  @Query((returns) => [Item])
  async sellerItems(@Arg('input') sellerId: SellerId): Promise<Item[]> {
    return new ItemService().getSellerItems(sellerId)
  }
}
