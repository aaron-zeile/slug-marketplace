'use server';

import {
  getViewedItemDetails,
  recordViewedItem,
} from '../../viewed/service';
import { check, getSessionToken } from '../../server/auth/service';

async function getCurrentUser() {
  const token = await getSessionToken();
  return token ? check(token) : undefined;
}

export async function fetchViewedItemsAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: true as const, data: [] };
    }

    const viewedItems = await getViewedItemDetails(user.id);
    return { success: true as const, data: viewedItems };
  } catch (error) {
    console.error('fetchViewedItemsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false as const, error: message };
  }
}

export async function recordViewedItemAction(item: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const viewedItem = await recordViewedItem(user.id, item);
    return { success: true as const, data: viewedItem };
  } catch (error) {
    console.error('recordViewedItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false as const, error: message };
  }
}
