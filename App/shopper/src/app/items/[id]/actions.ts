'use server';

import { getItem, getRandomItems } from '../../../item/service';

export async function fetchItemAction(id: string) {
  try {
    const item = await getItem(id);
    return { success: true, data: item };
  } catch (error) {
    console.error('fetchItemAction error:', error); // add this
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function fetchRandomItemsAction(count: number) {
  try {
    const items = await getRandomItems(count);
    return { success: true, data: items };
  } catch (error) {
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
