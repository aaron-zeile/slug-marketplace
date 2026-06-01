import { afterEach, expect, it, vi } from 'vitest';

import {
  WISHLIST_UPDATED_EVENT,
  dispatchWishlistUpdated,
} from '../../src/wishlist/events';

afterEach(() => {
  vi.restoreAllMocks();
});

it('dispatches the wishlist updated event on window', () => {
  const listener = vi.fn();
  window.addEventListener(WISHLIST_UPDATED_EVENT, listener);

  dispatchWishlistUpdated();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener.mock.calls[0]?.[0]).toBeInstanceOf(Event);
  expect(listener.mock.calls[0]?.[0].type).toBe(WISHLIST_UPDATED_EVENT);

  window.removeEventListener(WISHLIST_UPDATED_EVENT, listener);
});

it('does not throw when window is unavailable', () => {
  const originalWindow = globalThis.window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = undefined;

  expect(() => dispatchWishlistUpdated()).not.toThrow();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = originalWindow;
});

it('uses a stable event name constant', () => {
  expect(WISHLIST_UPDATED_EVENT).toBe('slugmarketplace:wishlist-updated');
});
