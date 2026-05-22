export const CART_UPDATED_EVENT = 'slugmarketplace:cart-updated';

export function dispatchCartUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}
