'use server';

import { getSearchItems } from '../../../item/service';

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