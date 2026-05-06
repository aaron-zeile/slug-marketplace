import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, beforeEach, vi } from 'vitest';
import ItemDisplay from '../src/app/items/[id]/ItemDisplay';
import { Item } from '../src/item';

const mockItem: Item = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  seller: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  name: 'Throw Pillow 336',
  description: 'Sleek modern design that fits seamlessly into any lifestyle.',
  images: [],
  price: 894.74,
  created_at: '2025-10-07T18:56:33.000Z',
};

const mockGraphQLResponse = {
  data: {
    item: mockItem,
  },
};

const mockRouter = {
  push: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGraphQLResponse),
      }),
    ),
  );
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
    expect(screen.getByText(`$${mockItem.price.toFixed(2)}`)).toBeDefined();
  });
});

it('renders the item id', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.id)).toBeDefined();
  });
});

it('renders the seller name', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.seller.name)).toBeDefined();
  });
});

it('renders the seller id', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.seller.id)).toBeDefined();
  });
});

it('renders the created date', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  const expectedDate = new Date(mockItem.created_at).toLocaleString();

  await waitFor(() => {
    expect(screen.getByText(expectedDate)).toBeDefined();
  });
});

it('redirects to home when GraphQL returns errors', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            errors: [{ message: 'Item not found' }],
          }),
      }),
    ),
  );

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

it('redirects to home when fetch fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      }),
    ),
  );

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});
