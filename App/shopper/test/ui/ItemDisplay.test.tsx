import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, it, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ItemDisplay from '../../src/app/items/[id]/ItemDisplay';
import { Item } from '../../src/item';
import { Review } from '../../src/item/review';

vi.mock('../../src/app/items/[id]/actions', () => ({
  fetchItemAction: vi.fn(),
  fetchItemReviewsAction: vi.fn(),
  fetchItemReviewSessionAction: vi.fn(),
  createItemReviewAction: vi.fn(),
}));

vi.mock('../../src/app/cart/actions', () => ({
  addCartItemAction: vi.fn(),
}));

vi.mock('../../src/cart/events', () => ({
  dispatchCartUpdated: vi.fn(),
}));

import {
  fetchItemAction,
  fetchItemReviewSessionAction,
  fetchItemReviewsAction,
} from '../../src/app/items/[id]/actions';
import { addCartItemAction } from '../../src/app/cart/actions';
import { dispatchCartUpdated } from '../../src/cart/events';

const mockItem: Item = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  seller: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  name: 'Throw Pillow 336',
  description: 'Sleek modern design that fits seamlessly into any lifestyle.',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  price: 894.74,
  created_at: '2025-10-07T18:56:33.000Z',
  status: 'active',
};

const mockRouter = {
  push: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: true,
    data: mockItem,
  });
  vi.mocked(fetchItemReviewsAction).mockResolvedValue({
    success: true,
    data: [],
  });
  vi.mocked(fetchItemReviewSessionAction).mockResolvedValue({
    loggedIn: false,
  });
  vi.mocked(addCartItemAction).mockResolvedValue({
    success: true,
    data: {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      item: mockItem.id,
      quantity: 1,
    },
  });
});

it('renders the item name', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.name)).toBeDefined();
  });
});

it('renders the item description', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.description)).toBeDefined();
  });
});

it('renders the item price formatted', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(
      screen.getByLabelText(`$${mockItem.price.toFixed(2)}`),
    ).toBeDefined();
  });
});

it('shows In stock when item status is active', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByLabelText('In stock')).toBeDefined();
  });
});

it('shows Sold when item status is sold', async () => {
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: true,
    data: { ...mockItem, status: 'sold' },
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByLabelText('Sold')).toBeDefined();
  });
});

it('disables add to cart when item status is sold', async () => {
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: true,
    data: { ...mockItem, status: 'sold' },
  });

  render(<ItemDisplay id={mockItem.id} />);

  const addButton = await screen.findByLabelText(`add ${mockItem.name} to cart`);
  expect(addButton).toBeDisabled();
});

it('renders the seller name', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(`Seller: ${mockItem.seller.name}`)).toBeDefined();
  });
});

it('renders the created date in Details', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^Details$/i })).toBeDefined();
  });

  fireEvent.click(screen.getByRole('button', { name: /^Details$/i }));

  const expectedCreated = new Date(mockItem.created_at).toLocaleString(
    undefined,
    { dateStyle: 'medium', timeStyle: 'short' },
  );

  await waitFor(() => {
    const createdLine = screen.getByText((_, element) => {
      return (
        element?.tagName === 'P' &&
        Boolean(element.textContent?.startsWith('Created:'))
      );
    });
    expect(createdLine.textContent).toContain(expectedCreated);
  });
});

it('shows seller name and item id in Details when expanded', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^Details$/i })).toBeDefined();
  });

  fireEvent.click(screen.getByRole('button', { name: /^Details$/i }));

  await waitFor(() => {
    expect(
      screen.getAllByText(`Seller: ${mockItem.seller.name}`).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(`Item ID: ${mockItem.id}`)).toBeDefined();
  });
});

it('redirects to home when fetchItemAction returns failure', async () => {
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: false,
    error: 'Item not found',
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

it('displays the first image as the main image on load', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    const mainImage = screen.getAllByAltText('thumbnail')[0];
    expect(mainImage.getAttribute('src')).toContain('image1');
  });
});

it('updates the main image when a thumbnail is clicked', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getAllByAltText('thumbnail')).toHaveLength(3);
  });

  fireEvent.click(screen.getAllByAltText('thumbnail')[2]);

  await waitFor(() => {
    const mainImage = screen.getAllByAltText('thumbnail')[0];
    expect(mainImage.getAttribute('src')).toContain('image2');
  });
});

it('shows a loading indicator until fetch resolves', async () => {
  let resolveFetch!: (value: {
    success: boolean;
    data: Item;
  }) => void;
  const deferred = new Promise<{
    success: boolean;
    data: Item;
  }>((resolve) => {
    resolveFetch = resolve;
  });
  vi.mocked(fetchItemAction).mockReturnValue(deferred);

  render(<ItemDisplay id={mockItem.id} />);

  expect(screen.getByRole('progressbar')).toBeDefined();

  resolveFetch!({ success: true, data: mockItem });

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText(mockItem.name)).toBeDefined();
  });
});

it('redirects when fetch succeeds but data is missing', async () => {
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: true,
    data: undefined,
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

it('fetches again when id changes', async () => {
  const { rerender } = render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(fetchItemAction).toHaveBeenCalledWith(mockItem.id);
  });

  const otherId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
  rerender(<ItemDisplay id={otherId} />);

  await waitFor(() => {
    expect(fetchItemAction).toHaveBeenCalledWith(otherId);
  });

  expect(vi.mocked(fetchItemAction).mock.calls.length).toBeGreaterThanOrEqual(2);
});

const listingReviewOne: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: '11111111-1111-4111-8111-111111111111', name: 'Riley' },
  rating: 5,
  content: 'Nice.',
  created_at: '2026-05-01T12:00:00.000Z',
};

const listingReviewTwo: Review = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  user: { id: '22222222-2222-4222-8222-222222222222', name: 'Sam' },
  rating: 3,
  content: 'Okay.',
  created_at: '2026-05-02T12:00:00.000Z',
};

it('shows listing review summary when reviews are returned', async () => {
  vi.mocked(fetchItemReviewsAction).mockResolvedValue({
    success: true,
    data: [listingReviewOne, listingReviewTwo],
  });

  render(<ItemDisplay id={mockItem.id} />);

  let summary: HTMLElement | undefined;
  await waitFor(() => {
    summary = screen.getByRole('status', {
        name: 'Average 4.0 stars, 2 reviews',
      });
    expect(summary).toBeDefined();
  });
  expect(summary?.textContent).toContain('4.0');
  expect(summary?.textContent).toContain('2 reviews');
});

it('uses singular review in listing summary when there is one review', async () => {
  vi.mocked(fetchItemReviewsAction).mockResolvedValue({
    success: true,
    data: [listingReviewOne],
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(
      screen.getByRole('status', {
        name: 'Average 5.0 stars, 1 review',
      }),
    ).toBeDefined();
  });
});

it('does not show listing review summary when reviews fetch fails', async () => {
  vi.mocked(fetchItemReviewsAction).mockResolvedValue({
    success: false,
    error: 'unavailable',
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.name)).toBeDefined();
  });
  expect(screen.queryByRole('status')).toBeNull();
});

it('does not show listing review summary when reviews data is undefined', async () => {
  vi.mocked(fetchItemReviewsAction).mockResolvedValue({
    success: true,
    data: undefined,
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.name)).toBeDefined();
  });
  expect(screen.queryByRole('status')).toBeNull();
});

it('does not apply review summary after unmount when reviews resolve late', async () => {
  let resolveReviews!: (value: unknown) => void;
  vi.mocked(fetchItemReviewsAction).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveReviews = resolve;
      }),
  );

  const { unmount } = render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.name)).toBeDefined();
  });

  unmount();

  await act(async () => {
    await new Promise<void>((r) => {
      queueMicrotask(() => {
        resolveReviews!({
          success: true,
          data: [listingReviewOne],
        });
        r();
      });
    });
  });
});

it('calls fetchItemReviewsAction when id changes', async () => {
  const { rerender } = render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(fetchItemReviewsAction).toHaveBeenCalledWith(mockItem.id);
  });

  const otherId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
  rerender(<ItemDisplay id={otherId} />);

  await waitFor(() => {
    expect(fetchItemReviewsAction).toHaveBeenCalledWith(otherId);
  });
});

it('adds the item to cart when Add to cart is clicked', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await userEvent.click(
    await screen.findByLabelText(`add ${mockItem.name} to cart`),
  );

  expect(addCartItemAction).toHaveBeenCalledWith(mockItem.id);
  expect(dispatchCartUpdated).toHaveBeenCalledTimes(1);
  expect(await screen.findByLabelText('Added to cart.')).toBeDefined();
});

it('shows a sign in alert when Add to cart is clicked while signed out', async () => {
  vi.mocked(addCartItemAction).mockResolvedValue({
    success: false,
    error: 'Not signed in',
  });

  render(<ItemDisplay id={mockItem.id} />);

  await userEvent.click(
    await screen.findByLabelText(`add ${mockItem.name} to cart`),
  );

  expect(
    await screen.findByLabelText('Please sign in to add to cart.'),
  ).toBeDefined();
});

it('does not show added message when signed out add to cart fails', async () => {
  vi.mocked(addCartItemAction).mockResolvedValue({
    success: false,
    error: 'Not signed in',
  });

  render(<ItemDisplay id={mockItem.id} />);

  await userEvent.click(
    await screen.findByLabelText(`add ${mockItem.name} to cart`),
  );

  expect(addCartItemAction).toHaveBeenCalledWith(mockItem.id);
  expect(dispatchCartUpdated).not.toHaveBeenCalled();
  await screen.findByLabelText('Please sign in to add to cart.');
  expect(screen.queryByLabelText('Added to cart.')).toBeNull();
});
