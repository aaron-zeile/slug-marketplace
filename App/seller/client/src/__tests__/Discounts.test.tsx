import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import React from 'react';

import Discounts from '../dashboard/Discounts';
import { renderWithProviders } from '../test/renderWithProviders';

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A useful hub.',
  price: 24.99,
  quantity: 1,
  created_at: '2026-06-03T12:00:00.000Z',
  images: [],
  status: 'active',
};

const discount = {
  id: 'discount-1',
  itemId: 'item-1',
  discountPercent: 15,
  duration: 7,
  created_at: '2026-06-03T12:00:00.000Z',
};

it('creates discounts for seller listings', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ listings: [listing] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discounts: [] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discount }),
    });

  vi.stubGlobal('fetch', fetchMock);

  renderWithProviders(<Discounts />);

  expect(await screen.findByText('USB Hub')).toBeInTheDocument();

  fireEvent.change(screen.getByRole('spinbutton', { name: /Discount %/ }), {
    target: { value: '15' },
  });
  fireEvent.change(
    screen.getByRole('spinbutton', { name: /Duration in days/ }),
    {
      target: { value: '7' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create Discount' }));

  await waitFor(() => {
    if (!screen.queryByText('Discount created for USB Hub.')) {
      throw new Error('Expected success message');
    }
  });

  expect({
    createCall: fetchMock.mock.calls[2],
    percentCellVisible: screen.getByText('15%') !== null,
    durationCellVisible: screen.getByText('7 days') !== null,
  }).toEqual({
    createCall: [
      '/seller/api/listings/item-1/discounts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          discountPercent: 15,
          duration: 7,
        }),
      }),
    ],
    percentCellVisible: true,
    durationCellVisible: true,
  });
});

it('changes selected listing before creating a discount', async () => {
  const secondListing = { ...listing, id: 'item-2', name: 'Laptop Stand' };
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ listings: [listing, secondListing] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discounts: [] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discounts: [] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discount: { ...discount, itemId: 'item-2' } }),
    });

  vi.stubGlobal('fetch', fetchMock);

  renderWithProviders(<Discounts />);

  fireEvent.mouseDown(await screen.findByRole('combobox', { name: 'Listing' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Laptop Stand' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: /Discount %/ }), {
    target: { value: '20' },
  });
  fireEvent.change(
    screen.getByRole('spinbutton', { name: /Duration in days/ }),
    {
      target: { value: '5' },
    },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create Discount' }));

  await waitFor(() =>
    expect(fetchMock.mock.calls[3]?.[0]).toBe(
      '/seller/api/listings/item-2/discounts',
    ),
  );
});

it('does not submit when the discount form is invalid', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ listings: [listing] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discounts: [] }),
    });

  vi.stubGlobal('fetch', fetchMock);

  renderWithProviders(<Discounts />);

  await screen.findByText('USB Hub');
  const form = screen
    .getByRole('spinbutton', { name: /Discount %/ })
    .closest('form');
  if (!form) {
    throw new Error('form not found');
  }
  fireEvent.submit(form);

  expect(fetchMock.mock.calls).toHaveLength(2);
});

it('shows validation messages for invalid discount values', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ listings: [listing] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discounts: [] }),
    });

  vi.stubGlobal('fetch', fetchMock);

  renderWithProviders(<Discounts />);

  await screen.findByText('USB Hub');
  fireEvent.change(screen.getByRole('spinbutton', { name: /Discount %/ }), {
    target: { value: '101' },
  });
  fireEvent.change(
    screen.getByRole('spinbutton', { name: /Duration in days/ }),
    {
      target: { value: '0' },
    },
  );

  expect({
    percentErrorVisible:
      screen.queryByText('Discount must be between 0 and 100.') !== null,
    durationErrorVisible:
      screen.queryByText('Duration must be at least 1 day.') !== null,
  }).toEqual({
    percentErrorVisible: true,
    durationErrorVisible: true,
  });
});

it('shows the empty discount state when the seller has no listings', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ listings: [] }),
    })),
  );

  renderWithProviders(<Discounts />);

  expect(
    await screen.findByText('No discounts for this listing.'),
  ).toBeInTheDocument();
});
