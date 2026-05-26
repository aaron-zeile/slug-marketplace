import { beforeEach, expect, it, vi } from 'vitest';

import {
  addCartItemAction,
  fetchCartItemsAction,
  removeCartItemAction,
} from '../../src/app/cart/actions';
import {
  addToCart,
  getCartItems,
  removeFromCart,
} from '../../src/cart/service';
import { check, getSessionToken } from '../../src/server/auth/service';

vi.mock('../../src/cart/service', () => ({
  addToCart: vi.fn(),
  getCartItems: vi.fn(),
  removeFromCart: vi.fn(),
}));

vi.mock('../../src/server/auth/service', () => ({
  check: vi.fn(),
  getSessionToken: vi.fn(),
}));

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'riley@example.com',
  name: 'Riley',
};

const cartItem = {
  id: '22222222-2222-4222-8222-222222222222',
  member: user.id,
  item: {
    id: '33333333-3333-4333-8333-333333333333',
    seller: {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Avery Parks',
    },
    name: 'GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card',
    description:
      '12GB 192-bit GDDR7, PCIe 5.0, compact graphics card built for gaming and creative work.',
    images: [
      'https://m.media-amazon.com/images/I/71ii5ow8slL._AC_UY218_.jpg',
    ],
    price: 635.99,
    quantity: 1,
    created_at: '2026-05-11T12:00:00.000Z',
  },
  quantity: 2,
};

const cartEntry = {
  id: cartItem.id,
  member: user.id,
  item: cartItem.item.id,
  quantity: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(getSessionToken).mockResolvedValue('session-token');
  vi.mocked(check).mockResolvedValue(user);
  vi.mocked(getCartItems).mockResolvedValue([cartItem]);
  vi.mocked(addToCart).mockResolvedValue(cartEntry);
  vi.mocked(removeFromCart).mockResolvedValue(true);
});

it('fetches cart items for the signed in user', async () => {
  const result = await fetchCartItemsAction();

  expect(result).toEqual({ success: true, data: [cartItem] });
});

it('returns an empty cart when there is no signed in user', async () => {
  vi.mocked(getSessionToken).mockResolvedValue(undefined);

  const result = await fetchCartItemsAction();

  expect(result).toEqual({ success: true, data: [] });
});

it('returns a failed result when fetching cart items throws', async () => {
  vi.mocked(getCartItems).mockRejectedValue(new Error('Failed to fetch'));

  const result = await fetchCartItemsAction();

  expect(result).toEqual({ success: false, error: 'Failed to fetch' });
});

it('adds an item to the signed in user cart', async () => {
  const result = await addCartItemAction(cartItem.item.id);

  expect(result).toEqual({ success: true, data: cartEntry });
});

it('does not add an item when the user is not signed in', async () => {
  vi.mocked(check).mockResolvedValue(undefined);

  const result = await addCartItemAction(cartItem.item.id);

  expect(result).toEqual({ success: false, error: 'Not signed in' });
});

it('returns a failed result when adding an item throws', async () => {
  vi.mocked(addToCart).mockRejectedValue(new Error('Cart unavailable'));

  const result = await addCartItemAction(cartItem.item.id);

  expect(result).toEqual({ success: false, error: 'Cart unavailable' });
});

it('removes an item from the signed in user cart', async () => {
  const result = await removeCartItemAction(cartItem.item.id);

  expect(result).toEqual({ success: true, data: true });
});

it('does not remove an item when the user is not signed in', async () => {
  vi.mocked(check).mockResolvedValue(undefined);

  const result = await removeCartItemAction(cartItem.item.id);

  expect(result).toEqual({ success: false, error: 'Not signed in' });
});

it('returns a failed result when removing an item throws', async () => {
  vi.mocked(removeFromCart).mockRejectedValue(new Error('Cart unavailable'));

  const result = await removeCartItemAction(cartItem.item.id);

  expect(result).toEqual({ success: false, error: 'Cart unavailable' });
});
