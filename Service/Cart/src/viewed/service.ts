import { getViewedItems, recordViewedItem } from './db';
import {
  MemberViewedItemsInput,
  RecordViewedItemInput,
  ViewedItem,
} from './schema';

export class ViewedItemsService {
  public async getViewedItems(
    input: MemberViewedItemsInput,
  ): Promise<ViewedItem[]> {
    return getViewedItems(input);
  }

  public async recordViewedItem(
    input: RecordViewedItemInput,
  ): Promise<ViewedItem> {
    return recordViewedItem(input);
  }
}
