import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import FrontPage from '../src/app/FrontPage';
import { Item } from '../src/item';

const singleItem: Item = {
  id: '11111111-1111-4111-8111-111111111111',
  seller: {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Riley Quinn',
  },
  name: 'Headphones',
  description: 'Wireless headphones',
  images: ['https://example.com/headphones.jpg'],
  price: 59.99,
  created_at: '2025-10-07T18:56:33.000Z',
};

const carouselItems: Item[] = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    seller: {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Avery Parks',
    },
    name: 'Backpack',
    description: 'A sturdy backpack',
    images: ['https://example.com/backpack.jpg'],
    price: 34.5,
    created_at: '2025-10-08T18:56:33.000Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    seller: {
      id: '66666666-6666-4666-8666-666666666666',
      name: 'Jordan Lee',
    },
    name: 'Desk Lamp',
    description: 'A bright desk lamp',
    images: ['https://example.com/lamp.jpg'],
    price: 18.25,
    created_at: '2025-10-09T18:56:33.000Z',
  },
];

const stubSuccessfulFetch = () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              randomItems: [singleItem],
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              randomItems: carouselItems,
            },
          }),
      }),
  );
};

beforeEach(() => {
  stubSuccessfulFetch();
});

it('renders item card', async () => {
  render(<FrontPage />);

  await waitFor(() => {
    screen.getByText('Headphones');
  });
});

it('fetches', async () => {
  render(<FrontPage />);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

it('renders carousel items', async () => {
  render(<FrontPage />);

  await waitFor(() => {
    screen.getByText('Backpack');
  });
});

it('does not render the item card when fetch errors', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            errors: [{ message: 'GraphQL error' }],
          }),
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })
  );

  render(<FrontPage />);

  expect(screen.queryByText('Headphones')).toBeNull();
});
