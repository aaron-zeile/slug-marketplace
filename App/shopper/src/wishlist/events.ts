export const WISHLIST_UPDATED_EVENT = 'slugmarketplace:wishlist-updated';

export function dispatchWishlistUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
  }
}
