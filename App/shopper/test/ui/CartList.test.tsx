import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

import CartList from '../../src/app/cart/CartList';
import { addToCart, getCartItems, removeFromCart } from '../../src/cart/service';
import type { CartItem as CartItemType } from '../../src/cart';
import { check, getSessionToken } from '../../src/server/auth/service';

vi.mock('../../src/cart/service', () => ({
  getCartItems: vi.fn(),
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
}));

vi.mock('../../src/server/auth/service', () => ({
  getSessionToken: vi.fn(),
  check: vi.fn(),
}));

const user = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'buyer@example.com',
  name: 'Buyer',
};

const cartItems: CartItemType[] = [
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
      created_at: '2026-05-11T12:00:00.000Z',
      status: 'active',
    },
    quantity: 2,
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
      created_at: '2026-05-10T12:00:00.000Z',
      status: 'active',
    },
    quantity: 1,
  },
];

beforeEach(() => {
  vi.mocked(getSessionToken).mockResolvedValue('session-token');
  vi.mocked(check).mockResolvedValue(user);
  vi.mocked(getCartItems).mockResolvedValue(cartItems);
  vi.mocked(addToCart).mockResolvedValue({
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    member: user.id,
    item: cartItems[0].item.id,
    quantity: 1,
  });
  vi.mocked(removeFromCart).mockResolvedValue(true);
});

it('fetches and renders cart items', async () => {
  render(<CartList />);

  expect(screen.getByText('Loading your cart...')).toBeDefined();

  await waitFor(() => {
    expect(getCartItems).toHaveBeenCalledWith(user.id);
    expect(screen.getByText(cartItems[0].item.name)).toBeDefined();
    expect(screen.getByText(cartItems[1].item.name)).toBeDefined();
  });
  expect(screen.getByText('3 items in your cart')).toBeDefined();
});

it('renders a failed fetch message when the cart cannot load', async () => {
  vi.mocked(getCartItems).mockRejectedValue(new Error('Failed to fetch'));

  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText('Unable to load your cart.')).toBeDefined();
  });
});

it('renders empty state after fetching an empty cart', async () => {
  vi.mocked(getCartItems).mockResolvedValue([]);

  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText('Your cart is empty.')).toBeDefined();
  });
});

it('updates quantity when the shopper increases an item', async () => {
  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText('2')).toBeDefined();
  });

  await userEvent.click(
    screen.getByRole('button', {
      name: `Increase quantity for ${cartItems[0].item.name}`,
    }),
  );

  expect(addToCart).toHaveBeenCalledWith(user.id, cartItems[0].item.id);
  expect(screen.getByText('4 items in your cart')).toBeDefined();
});

it('removes an item when quantity reaches zero', async () => {
  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText(cartItems[1].item.name)).toBeDefined();
  });

  await userEvent.click(
    screen.getByRole('button', {
      name: `Decrease quantity for ${cartItems[1].item.name}`,
    }),
  );

  expect(removeFromCart).toHaveBeenCalledWith(user.id, cartItems[1].item.id);
  expect(screen.queryByText(cartItems[1].item.name)).toBeNull();
  expect(screen.getByText('2 items in your cart')).toBeDefined();
});
