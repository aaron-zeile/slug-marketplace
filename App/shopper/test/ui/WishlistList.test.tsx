import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

import WishlistList from '../../src/app/wishlist/WishlistList';
import { checkLogin } from '../../src/app/buyer/login/actions';
import { fetchWishlistItemsAction, removeWishlistItemAction } from '../../src/app/wishlist/actions';
import type { WishlistItem } from '../../src/wishlist';

vi.mock('../../src/app/wishlist/actions', () => ({
  fetchWishlistItemsAction: vi.fn(),
  removeWishlistItemAction: vi.fn(),
  addWishlistItemAction: vi.fn(),
}));

vi.mock('../../src/app/cart/actions', () => ({
  addCartItemAction: vi.fn(),
}));

vi.mock('../../src/app/buyer/login/actions', () => ({
  checkLogin: vi.fn(),
}));

const user = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'buyer@example.com',
  name: 'Buyer',
};

const wishlistItems: WishlistItem[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    member: user.id,
    item: {
      id: '11111111-1111-4111-8111-111111111111',
      seller: {
        id: '22222222-2222-4222-8222-222222222222',
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
      status: 'active',
    },
    createdAt: new Date('2026-05-11T12:00:00.000Z'),
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    member: user.id,
    item: {
      id: '33333333-3333-4333-8333-333333333333',
      seller: {
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Morgan Lee',
      },
      name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      description:
        'Lightweight wireless headphones with adaptive noise canceling and long battery life.',
      images: [
        'https://m.media-amazon.com/images/I/61+btxzpfDL._AC_UY218_.jpg',
      ],
      price: 328,
      quantity: 1,
      created_at: '2026-05-10T12:00:00.000Z',
      status: 'active',
    },
    createdAt: new Date('2026-05-10T12:00:00.000Z'),
  },
];

beforeEach(() => {
  vi.mocked(checkLogin).mockResolvedValue({ user });
  vi.mocked(fetchWishlistItemsAction).mockResolvedValue({
    success: true,
    data: wishlistItems,
  });
  vi.mocked(removeWishlistItemAction).mockResolvedValue({
    success: true,
    data: true,
  });
});

it('fetches and renders wishlist items', async () => {
  render(<WishlistList />);

  expect(screen.getByText('Loading your wishlist...')).toBeDefined();

  await waitFor(() => {
    expect(fetchWishlistItemsAction).toHaveBeenCalled();
    expect(screen.getByText(wishlistItems[0].item.name)).toBeDefined();
    expect(screen.getByText(wishlistItems[1].item.name)).toBeDefined();
  });
  expect(screen.getByText('2 items in your wishlist')).toBeDefined();
});

it('renders a failed fetch message when the wishlist cannot load', async () => {
  vi.mocked(fetchWishlistItemsAction).mockResolvedValue({
    success: false,
    error: 'Failed to fetch',
  });

  render(<WishlistList />);

  await waitFor(() => {
    expect(screen.getByText('Unable to load your wishlist.')).toBeDefined();
  });
});

it('renders empty state after fetching an empty wishlist', async () => {
  vi.mocked(fetchWishlistItemsAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<WishlistList />);

  await waitFor(() => {
    expect(screen.getByText('Your wishlist is empty.')).toBeDefined();
  });
});

it('prompts the shopper to sign in when not authenticated', async () => {
  vi.mocked(checkLogin).mockResolvedValue({});
  vi.mocked(fetchWishlistItemsAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<WishlistList />);

  await waitFor(() => {
    expect(screen.getByText('Sign in to view your wishlist.')).toBeDefined();
  });
});

it('removes an item from the list when remove succeeds', async () => {
  render(<WishlistList />);

  await waitFor(() => {
    expect(screen.getByText(wishlistItems[1].item.name)).toBeDefined();
  });

  await userEvent.click(
    screen.getByRole('button', {
      name: `Remove ${wishlistItems[1].item.name} from wishlist`,
    }),
  );

  expect(removeWishlistItemAction).toHaveBeenCalledWith(
    wishlistItems[1].item.id,
  );
  expect(screen.queryByText(wishlistItems[1].item.name)).toBeNull();
  expect(screen.getByText(wishlistItems[0].item.name)).toBeDefined();
});
