import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

import CartList from '../src/app/cart/CartList';
import { fetchCartItemsAction } from '../src/app/cart/actions';
import type { CartItem as CartItemType } from '../src/cart';

vi.mock('../src/app/cart/actions', () => ({
  fetchCartItemsAction: vi.fn(),
}));

vi.mock('../src/app/cart/CartItem', () => ({
  default: function MockCartItem({
    item,
    quantity,
    onQuantityChange,
  }: {
    item: CartItemType['item'];
    quantity: number;
    onQuantityChange?: (itemId: string, quantity: number) => void;
  }) {
    return (
      <div data-testid="cart-item">
        <span>{item.name}</span>
        <span>Quantity: {quantity}</span>
        <button onClick={() => onQuantityChange?.(item.id, quantity + 1)}>
          increase {item.name}
        </button>
        <button onClick={() => onQuantityChange?.(item.id, quantity - 1)}>
          decrease {item.name}
        </button>
      </div>
    );
  },
}));

const cartItems: CartItemType[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
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
    },
    quantity: 2,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
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
    },
    quantity: 1,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: true,
    data: cartItems,
  });
});

it('fetches and renders cart items', async () => {
  render(<CartList />);

  expect(screen.getByText('Loading your cart...')).toBeDefined();

  await waitFor(() => {
    expect(fetchCartItemsAction).toHaveBeenCalled();
    expect(screen.getByText(cartItems[0].item.name)).toBeDefined();
    expect(screen.getByText(cartItems[1].item.name)).toBeDefined();
  });
  expect(screen.getAllByTestId('cart-item')).toHaveLength(2);
  expect(screen.getByText('3 items in your cart')).toBeDefined();
});

it('renders a failed fetch message when the cart cannot load', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: false,
    error: 'Failed to fetch',
  });

  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText('Unable to load your cart.')).toBeDefined();
  });
  expect(screen.queryByTestId('cart-item')).toBeNull();
});

it('renders empty state after fetching an empty cart', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText('Your cart is empty.')).toBeDefined();
  });
});

it('updates quantity when CartItem reports an increase', async () => {
  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText('Quantity: 2')).toBeDefined();
  });

  await userEvent.click(screen.getByText(`increase ${cartItems[0].item.name}`));

  expect(screen.getByText('Quantity: 3')).toBeDefined();
  expect(screen.getByText('4 items in your cart')).toBeDefined();
});

it('removes an item when CartItem reports quantity zero', async () => {
  render(<CartList />);

  await waitFor(() => {
    expect(screen.getByText(cartItems[1].item.name)).toBeDefined();
  });

  await userEvent.click(screen.getByText(`decrease ${cartItems[1].item.name}`));

  expect(screen.queryByText(cartItems[1].item.name)).toBeNull();
  expect(screen.getAllByTestId('cart-item')).toHaveLength(1);
  expect(screen.getByText('2 items in your cart')).toBeDefined();
});
