import { getItem } from './db';
import { Item, ItemId } from './schema';

export class ItemService {
  public async getItem(itemId: ItemId): Promise<Item> {
    const item = await getItem(itemId);

    return item;
  }
}
