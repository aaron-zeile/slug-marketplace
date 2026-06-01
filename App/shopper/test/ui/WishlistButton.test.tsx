import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import WishlistButton from '../../src/app/buyer/topbar/WishlistButton';
import { fetchWishlistItemsAction } from '../../src/app/wishlist/actions';
import { dispatchWishlistUpdated } from '../../src/wishlist/events';
import { routerSpy } from '../mockRouter';

vi.mock('../../src/app/wishlist/actions', () => ({
  fetchWishlistItemsAction: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(fetchWishlistItemsAction).mockResolvedValue({
    success: true,
    data: [
      {
        id: 'wishlist-1',
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
        createdAt: new Date('2026-05-17T00:00:00.000Z'),
      },
      {
        id: 'wishlist-2',
        member: 'member-1',
        item: {
          id: 'item-2',
          seller: { id: 'seller-1', name: 'Seller' },
          name: 'Gadget',
          description: 'A gadget',
          images: ['https://example.com/gadget.jpg'],
          price: 20,
          quantity: 1,
          created_at: '2026-05-17T00:00:00.000Z',
          status: 'active',
        },
        createdAt: new Date('2026-05-17T00:00:00.000Z'),
      },
    ],
  });
});

it('routes to the wishlist page when clicked', async () => {
  render(<WishlistButton />);

  fireEvent.click(await screen.findByLabelText('Open wishlist, 2 items'));

  expect(routerSpy).toHaveBeenCalledWith('/wishlist');
});

it('shows the item count on the wishlist icon', async () => {
  render(<WishlistButton />);

  await waitFor(() => {
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

it('hides the badge when the wishlist is empty', async () => {
  vi.mocked(fetchWishlistItemsAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<WishlistButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open wishlist')).toBeInTheDocument();
  });

  expect(screen.queryByText('0')).not.toBeInTheDocument();
});

it('refetches the wishlist count when the wishlist updated event fires', async () => {
  vi.mocked(fetchWishlistItemsAction)
    .mockResolvedValueOnce({
      success: true,
      data: [],
    })
    .mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'wishlist-1',
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
          createdAt: new Date('2026-05-17T00:00:00.000Z'),
        },
      ],
    });

  render(<WishlistButton />);

  await waitFor(() => {
    expect(screen.getByLabelText('Open wishlist')).toBeInTheDocument();
  });

  dispatchWishlistUpdated();

  await waitFor(() => {
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByLabelText('Open wishlist, 1 items')).toBeInTheDocument();
  });

  expect(fetchWishlistItemsAction).toHaveBeenCalledTimes(2);
});
