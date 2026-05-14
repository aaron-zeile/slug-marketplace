import { getItem, getRandomItems, getSearchItems, getSellerItems, getAllItems, deleteItembyID } from './db';
import { Item, ItemId, RandomItemsInput, SearchItemsInput, SellerId } from './schema';

export class ItemService {
  public async getAllItems(): Promise<Item[]> {
    const allItems = await getAllItems();
    return allItems;
  }

  public async deleteItem(itemId: ItemId): Promise<void> {
    await deleteItembyID(itemId);
  }

  public async getItem(itemId: ItemId): Promise<Item> {
    const item = await getItem(itemId);

    return item;
  }

  public async getSellerItems(sellerId: SellerId): Promise<Item[]> {
    const sellerItems = await getSellerItems(sellerId);
    return sellerItems;
  }

  public async getRandomItems(input: RandomItemsInput): Promise<Item[]> {
    const randomItems = await getRandomItems(input);
    return randomItems;
  }

  public async getSearchItems(input: SearchItemsInput): Promise<Item[]> {
    const searchItems = await getSearchItems(input);
    return searchItems;
  }
}
