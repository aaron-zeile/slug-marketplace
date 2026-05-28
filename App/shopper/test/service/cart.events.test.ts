import { afterEach, expect, it, vi } from 'vitest';

import { CART_UPDATED_EVENT, dispatchCartUpdated } from '../../src/cart/events';

afterEach(() => {
  vi.restoreAllMocks();
});

it('dispatches the cart updated event on window', () => {
  const listener = vi.fn();
  window.addEventListener(CART_UPDATED_EVENT, listener);

  dispatchCartUpdated();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener.mock.calls[0]?.[0]).toBeInstanceOf(Event);
  expect(listener.mock.calls[0]?.[0].type).toBe(CART_UPDATED_EVENT);

  window.removeEventListener(CART_UPDATED_EVENT, listener);
});

it('does not throw when window is unavailable', () => {
  const originalWindow = globalThis.window;
  // Cover the non-browser branch in the event helper.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = undefined;

  expect(() => dispatchCartUpdated()).not.toThrow();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = originalWindow;
});

it('uses a stable event name constant', () => {
  expect(CART_UPDATED_EVENT).toBe('slugmarketplace:cart-updated');
});
