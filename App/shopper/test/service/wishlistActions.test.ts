import { beforeEach, expect, it, vi } from 'vitest';

import {
  addWishlistItemAction,
  fetchWishlistItemsAction,
  removeWishlistItemAction,
} from '../../src/app/wishlist/actions';
import {
  addToWishlist,
  getWishlistItems,
  removeFromWishlist,
} from '../../src/wishlist/service';
import { check, getSessionToken } from '../../src/server/auth/service';

vi.mock('../../src/wishlist/service', () => ({
  addToWishlist: vi.fn(),
  getWishlistItems: vi.fn(),
  removeFromWishlist: vi.fn(),
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

const wishlistItem = {
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
  createdAt: new Date('2026-05-11T12:00:00.000Z'),
};

const wishlistEntry = {
  id: wishlistItem.id,
  member: user.id,
  item: wishlistItem.item.id,
  createdAt: wishlistItem.createdAt,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(getSessionToken).mockResolvedValue('session-token');
  vi.mocked(check).mockResolvedValue(user);
  vi.mocked(getWishlistItems).mockResolvedValue([wishlistItem]);
  vi.mocked(addToWishlist).mockResolvedValue(wishlistEntry);
  vi.mocked(removeFromWishlist).mockResolvedValue(true);
});

it('fetches wishlist items for the signed in user', async () => {
  const result = await fetchWishlistItemsAction();

  expect(result).toEqual({ success: true, data: [wishlistItem] });
});

it('returns an empty wishlist when there is no signed in user', async () => {
  vi.mocked(getSessionToken).mockResolvedValue(undefined);

  const result = await fetchWishlistItemsAction();

  expect(result).toEqual({ success: true, data: [] });
});

it('returns a failed result when fetching wishlist items throws', async () => {
  vi.mocked(getWishlistItems).mockRejectedValue(new Error('Failed to fetch'));

  const result = await fetchWishlistItemsAction();

  expect(result).toEqual({ success: false, error: 'Failed to fetch' });
});

it('adds an item to the signed in user wishlist', async () => {
  const result = await addWishlistItemAction(wishlistItem.item.id);

  expect(result).toEqual({ success: true, data: wishlistEntry });
});

it('does not add an item when the user is not signed in', async () => {
  vi.mocked(check).mockResolvedValue(undefined);

  const result = await addWishlistItemAction(wishlistItem.item.id);

  expect(result).toEqual({ success: false, error: 'Not signed in' });
});

it('returns a failed result when adding an item throws', async () => {
  vi.mocked(addToWishlist).mockRejectedValue(new Error('Wishlist unavailable'));

  const result = await addWishlistItemAction(wishlistItem.item.id);

  expect(result).toEqual({ success: false, error: 'Wishlist unavailable' });
});

it('removes an item from the signed in user wishlist', async () => {
  const result = await removeWishlistItemAction(wishlistItem.item.id);

  expect(result).toEqual({ success: true, data: true });
});

it('does not remove an item when the user is not signed in', async () => {
  vi.mocked(check).mockResolvedValue(undefined);

  const result = await removeWishlistItemAction(wishlistItem.item.id);

  expect(result).toEqual({ success: false, error: 'Not signed in' });
});

it('returns a failed result when removing an item throws', async () => {
  vi.mocked(removeFromWishlist).mockRejectedValue(
    new Error('Wishlist unavailable'),
  );

  const result = await removeWishlistItemAction(wishlistItem.item.id);

  expect(result).toEqual({ success: false, error: 'Wishlist unavailable' });
});
