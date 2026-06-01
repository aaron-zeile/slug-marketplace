'use server';

import {
  addToWishlist,
  getWishlistItems,
  removeFromWishlist,
} from '../../wishlist/service';
import { check, getSessionToken } from '../../server/auth/service';

async function getCurrentUser() {
  const token = await getSessionToken();
  return token ? check(token) : undefined;
}

export async function fetchWishlistItemsAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: true, data: [] };
    }

    const wishlistItems = await getWishlistItems(user.id);
    return { success: true, data: wishlistItems };
  } catch (error) {
    console.error('fetchWishlistItemsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function addWishlistItemAction(item: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const wishlistItem = await addToWishlist(user.id, item);
    return { success: true, data: wishlistItem };
  } catch (error) {
    console.error('addWishlistItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function removeWishlistItemAction(item: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const removed = await removeFromWishlist(user.id, item);
    return { success: true, data: removed };
  } catch (error) {
    console.error('removeWishlistItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
