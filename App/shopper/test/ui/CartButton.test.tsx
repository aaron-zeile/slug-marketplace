import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, expect, it, vi } from 'vitest';

import CartButton from '../../src/app/buyer/topbar/CartButton';
import { fetchCartItemsAction } from '../../src/app/cart/actions';
import { dispatchCartUpdated } from '../../src/cart/events';
import { routerSpy } from '../mockRouter';

vi.mock('../../src/app/cart/actions', () => ({
  fetchCartItemsAction: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: true,
    data: [
      {
        id: 'cart-1',
        member: 'member-1',
        item: {
          id: 'item-1',
          seller: { id: 'seller-1', name: 'Seller' },
          name: 'Widget',
          description: 'A widget',
          images: ['https://example.com/widget.jpg'],
          price: 10,
          quantity: 1,
          created_at: '2026-05-17T00:00:00.000Z',
          status: 'active',
        },
        quantity: 2,
      },
    ],
  });
});

it('routes to the cart page when clicked', async () => {
  render(<CartButton />);

  fireEvent.click(await screen.findByLabelText('Open cart, 2 items'));

  expect(routerSpy).toHaveBeenCalledWith('/cart');
});

it('shows the total item quantity on the cart icon', async () => {
  render(<CartButton />);

  await waitFor(() => {
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

it('hides the badge when the cart is empty', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<CartButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
  });

  expect(screen.queryByText('0')).not.toBeInTheDocument();
});

it('resets the count to zero when cart fetch fails', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: false,
    error: 'Unable to load your cart.',
  });

  render(<CartButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
  });

  expect(screen.queryByText('2')).not.toBeInTheDocument();
});

it('resets the count to zero when cart fetch succeeds without data', async () => {
  vi.mocked(fetchCartItemsAction).mockResolvedValue({
    success: true,
  } as Awaited<ReturnType<typeof fetchCartItemsAction>>);

  render(<CartButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
  });
});

it('reloads the cart count when the pathname changes', async () => {
  const pathname = vi.mocked(usePathname);
  pathname.mockReturnValue('/');

  const { rerender } = render(<CartButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open cart, 2 items')).toBeInTheDocument();
  });

  pathname.mockReturnValue('/search');
  rerender(<CartButton />);

  await waitFor(() => {
    expect(fetchCartItemsAction).toHaveBeenCalledTimes(2);
  });
});

it('refetches the cart count when the cart updated event fires', async () => {
  vi.mocked(fetchCartItemsAction)
    .mockResolvedValueOnce({
      success: true,
      data: [],
    })
    .mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'cart-1',
          member: 'member-1',
          item: {
            id: 'item-1',
            seller: { id: 'seller-1', name: 'Seller' },
            name: 'Widget',
            description: 'A widget',
            images: ['https://example.com/widget.jpg'],
            price: 10,
            quantity: 1,
            created_at: '2026-05-17T00:00:00.000Z',
            status: 'active',
          },
          quantity: 3,
        },
      ],
    });

  render(<CartButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
  });

  dispatchCartUpdated();

  await waitFor(() => {
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByLabelText('Open cart, 3 items')).toBeInTheDocument();
  });

  expect(fetchCartItemsAction).toHaveBeenCalledTimes(2);
});
