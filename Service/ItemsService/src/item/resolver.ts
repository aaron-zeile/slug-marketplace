import { Arg, Query, Resolver } from 'type-graphql';
import { Item, ItemId } from './schema';
import { ItemService } from './service';

@Resolver()
export class ItemResolver {
  @Query((returns) => Item)
  async item(@Arg('input') itemId: ItemId): Promise<Item> {
    return new ItemService().getItem(itemId);
  }
}
