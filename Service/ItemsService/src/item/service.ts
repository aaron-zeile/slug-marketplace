import type { SessionUser } from '../auth/service';
import {
  createItem,
  deleteItembyID,
  getAllItems,
  getItem,
  getRandomItems,
  getSearchItems,
  getSellerItems,
  updateItem,
} from './db';
import {
  Item,
  ItemId,
  NewItem,
  RandomItemsInput,
  SearchItemsInput,
  SellerItemsInput,
  UpdateItem,
} from './schema';

export class ItemService {
  public async getAllItems(): Promise<Item[]> {
    const allItems = await getAllItems();
    return allItems;
  }

  public async deleteItem(
    sessionUser: SessionUser,
    itemId: ItemId,
  ): Promise<void> {
    const deleted = await deleteItembyID(itemId, sessionUser.id);

    if (!deleted) {
      throw new Error('Item not found or user does not own item');
    }
  }

  public async createItem(
    sessionUser: SessionUser,
    input: NewItem,
  ): Promise<Item> {
    const item = await createItem({
      input,
      seller: { id: sessionUser.id, name: sessionUser.name },
    });
    return item;
  }

  public async updateItem(
    sessionUser: SessionUser,
    input: UpdateItem,
  ): Promise<Item> {
    const item = await updateItem(input, sessionUser.id);

    if (!item) {
      throw new Error('Item not found or user does not own item');
    }

    return item;
  }

  public async getItem(itemId: ItemId): Promise<Item> {
    const item = await getItem(itemId);

    return item;
  }

  public async getSellerItems(itemsInput: SellerItemsInput): Promise<Item[]> {
    const sellerItems = await getSellerItems(itemsInput);
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
