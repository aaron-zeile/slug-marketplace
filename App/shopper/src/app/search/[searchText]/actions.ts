'use server';

import {
  type FilteredItemsInput,
  getFilteredItems,
  getSearchItems,
} from '../../../item/service';

export async function fetchSearchItemsAction(searchText: string) {
  try {
    const items = await getSearchItems(searchText);
    return { success: true, data: items };
  } catch (error) {
    console.error('fetchSearchItemsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function fetchFilteredItemsAction(input: FilteredItemsInput) {
  try {
    const items = await getFilteredItems(input);
    return { success: true, data: items };
  } catch (error) {
    console.error('fetchFilteredItemsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
