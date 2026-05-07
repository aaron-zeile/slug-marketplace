import { getItem, getSellerItems } from './db';
import { Item, ItemId, SellerId } from './schema';

export class ItemService {
  public async getItem(itemId: ItemId): Promise<Item> {
    const item = await getItem(itemId);

    return item;
  }

  public async getSellerItems(sellerId: SellerId): Promise<Item[]> {
    const sellerItems = await getSellerItems(sellerId);
    return sellerItems;
  }
}
