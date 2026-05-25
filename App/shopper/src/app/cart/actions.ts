'use server';

import {
  addToCart,
  clearCart,
  getCartItems,
  removeFromCart,
} from '../../cart/service';
import { check, getSessionToken } from '../../server/auth/service';

async function getCurrentUser() {
  const token = await getSessionToken();
  return token ? check(token) : undefined;
}

export async function fetchCartItemsAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: true, data: [] };
    }

    const cartItems = await getCartItems(user.id);
    return { success: true, data: cartItems };
  } catch (error) {
    console.error('fetchCartItemsAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function addCartItemAction(item: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const cartItem = await addToCart(user.id, item);
    return { success: true, data: cartItem };
  } catch (error) {
    console.error('addCartItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function removeCartItemAction(item: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const removed = await removeFromCart(user.id, item);
    return { success: true, data: removed };
  } catch (error) {
    console.error('removeCartItemAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}

export async function clearCartAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not signed in' };
    }

    const cleared = await clearCart(user.id);
    return { success: true, data: cleared };
  } catch (error) {
    console.error('clearCartAction error:', error);
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
