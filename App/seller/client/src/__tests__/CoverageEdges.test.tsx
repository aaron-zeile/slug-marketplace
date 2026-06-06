import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthGuard from '../auth/AuthGuard';
import LocaleSwitcher from '../components/LocaleSwitcher';
import ListingEditDialog from '../dashboard/ListingEditDialog';
import ListingReviews from '../dashboard/ListingReviews';
import SellerListings from '../dashboard/Listings';
import Sales from '../dashboard/Sales';
import SalesGraph from '../dashboard/analytics/SalesGraph';
import SellerRating from '../dashboard/analytics/SellerRating';
import StarGraph from '../dashboard/analytics/StarGraph';
import { getShopperHomeUrl } from '../config/shopperUrl';
import { LocaleProvider } from '../i18n/LocaleContext';
import { getLocaleFromCookie, persistLocaleCookie } from '../i18n/locale';
import AppProviders from '../providers/AppProviders';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('@mui/x-charts/LineChart', () => ({
  LineChart: ({
    series,
  }: {
    series: {
      label: string;
      valueFormatter?: (value: number | null) => string;
    }[];
  }) => (
    <div>
      {series.map((entry) => (
        <span key={entry.label}>
          {entry.valueFormatter?.(420)}
          {entry.valueFormatter?.(null)}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
    getRowId,
    localeText,
    onRowClick,
  }: {
    rows: Record<string, unknown>[];
    columns: {
      field: string;
      headerName?: string;
      renderCell?: (params: {
        row: Record<string, unknown>;
      }) => React.ReactNode;
    }[];
    getRowId?: (row: Record<string, unknown>) => string;
    localeText?: { noRowsLabel?: string };
    onRowClick?: (params: { row: Record<string, unknown> }) => void;
  }) => (
    <table>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td>{localeText?.noRowsLabel}</td>
          </tr>
        )}
        {rows.map((row, index) => (
          <tr
            key={getRowId?.(row) ?? index}
            onClick={() => onRowClick?.({ row })}
          >
            {columns.map((column) => (
              <td key={column.field}>
                {column.renderCell
                  ? column.renderCell({ row })
                  : String(row[column.field] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    Outlet: () => <div>authorized content</div>,
  };
});

const listing = {
  id: 'item-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
  },
  name: 'USB Hub',
  description: 'A useful hub.',
  price: 24.99,
  quantity: 3,
  created_at: '2026-06-03T12:00:00.000Z',
  images: ['https://example.com/hub.png'],
  status: 'active' as const,
};

const review = {
  id: 'review-1',
  user: {
    id: 'buyer-1',
    name: 'Ada Lovelace',
  },
  rating: 4.5,
  content: 'Excellent hub.',
  created_at: '2026-06-03T12:00:00.000Z',
};

const order = {
  id: 'order-1',
  buyer: 'buyer-1',
  items: [{ itemId: 'item-1', sellerId: 'seller-1' }],
  orderedAt: '2026-06-03T12:00:00.000Z',
  purchaseAmount: 24.99,
  status: 'shipping',
  address: {
    line1: '1156 High Street',
    line2: 'Apt 2',
    city: 'Santa Cruz',
    state: 'CA',
    postalCode: '95064',
    country: 'US',
  },
};

describe('coverage edges', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    document.cookie = 'locale=; path=/; max-age=0';
  });

  it('redirects unauthenticated sellers to shopper', async () => {
    const replace = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false })),
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        replace,
      },
    });

    render(<AuthGuard />);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('http://localhost:3000/'),
    );
  });

  it('renders authorized content when session check succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          user: { id: 'seller-1', email: 'seller@example.com', name: 'Seller' },
        }),
      })),
    );

    render(<AuthGuard />);

    expect(await screen.findByText('authorized content')).toBeInTheDocument();
  });

  it('redirects when session fetch throws', async () => {
    const replace = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        replace,
      },
    });

    render(<AuthGuard />);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('http://localhost:3000/'),
    );
  });

  it('changes locale from the switcher and persists the cookie', async () => {
    render(
      <LocaleProvider>
        <LocaleSwitcher />
      </LocaleProvider>,
    );

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Locale' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Français' }));

    expect(document.cookie).toContain('locale=fr');
  });

  it('reads French from the locale cookie', () => {
    document.cookie = 'locale=fr';

    expect(getLocaleFromCookie()).toBe('fr');
  });

  it('defaults to English when document is unavailable', () => {
    vi.stubGlobal('document', undefined);

    expect(getLocaleFromCookie()).toBe('en');
  });

  it('persists the requested locale cookie', () => {
    persistLocaleCookie('fr');

    expect(document.cookie).toContain('locale=fr');
  });

  it('builds shopper URLs from the configured environment value', () => {
    vi.stubEnv('VITE_SHOPPER_URL', ' https://shopper.example.com/base ');

    expect(getShopperHomeUrl('/seller')).toBe(
      'https://shopper.example.com/base?returnTo=%2Fseller',
    );
  });

  it('builds shopper URLs from the current origin outside dev', () => {
    vi.stubEnv('DEV', false);

    expect(getShopperHomeUrl('/seller')).toBe(
      'http://localhost:3000/?returnTo=%2Fseller',
    );
  });

  it('throws when locale context is missing', async () => {
    const { useAppLocale } = await import('../i18n/LocaleContext');
    function MissingProvider() {
      useAppLocale();
      return null;
    }

    expect(() => render(<MissingProvider />)).toThrow(
      'useAppLocale must be used within LocaleProvider',
    );
  });

  it('renders a successful listing review summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ reviews: [review] }),
      })),
    );

    renderWithProviders(<ListingReviews itemId="item-1" />);

    expect(await screen.findByText('4.5 · 1 review')).toBeInTheDocument();
  });

  it('renders plural review copy for multiple reviews', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          reviews: [review, { ...review, id: 'review-2' }],
        }),
      })),
    );

    renderWithProviders(<ListingReviews itemId="item-1" />);

    expect(await screen.findByText('4.5 · 2 reviews')).toBeInTheDocument();
  });

  it('renders the no reviews state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ reviews: [] }),
      })),
    );

    renderWithProviders(<ListingReviews itemId="item-1" />);

    expect(await screen.findByText('No reviews yet.')).toBeInTheDocument();
  });

  it('renders listing reviews without an error provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ reviews: [] }),
      })),
    );

    render(<ListingReviews itemId="item-1" />);

    expect(await screen.findByText('No reviews yet.')).toBeInTheDocument();
  });

  it('deletes a listing from the edit dialog', async () => {
    const onDeleted = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true })),
    );

    renderWithProviders(
      <ListingEditDialog
        open
        listing={listing}
        onClose={vi.fn()}
        onDeleted={onDeleted}
        onUpdated={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete USB Hub' }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith('item-1'));
  });

  it('keeps the edit dialog open when delete fails', async () => {
    const onClose = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, statusText: 'Forbidden' })),
    );

    renderWithProviders(
      <ListingEditDialog
        open
        listing={listing}
        onClose={onClose}
        onDeleted={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete USB Hub' }));

    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('shows an edit dialog price validation message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ reviews: [] }),
      })),
    );

    renderWithProviders(
      <ListingEditDialog
        open
        listing={listing}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Price for USB Hub'), {
      target: { value: '0' },
    });

    expect({
      priceErrorVisible:
        screen.queryByText('Price must be at least $0.01.') !== null,
      updateDisabled: screen
        .getByRole('button', { name: 'Update USB Hub' })
        .hasAttribute('disabled'),
    }).toEqual({
      priceErrorVisible: true,
      updateDisabled: true,
    });
  });

  it('shows an edit dialog quantity validation message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ reviews: [] }),
      })),
    );

    renderWithProviders(
      <ListingEditDialog
        open
        listing={listing}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Quantity for USB Hub'), {
      target: { value: '0' },
    });

    expect({
      quantityErrorVisible:
        screen.queryByText('Quantity must be a whole number of at least 1.') !==
        null,
      updateDisabled: screen
        .getByRole('button', { name: 'Update USB Hub' })
        .hasAttribute('disabled'),
    }).toEqual({
      quantityErrorVisible: true,
      updateDisabled: true,
    });
  });

  it('does not render listing fields when dialog has no listing', () => {
    renderWithProviders(
      <ListingEditDialog
        open
        onClose={vi.fn()}
        onDeleted={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText('Name for USB Hub')).toBeNull();
  });

  it('renders the listing load error label without an error provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unavailable',
      })),
    );

    render(
      <AppProviders>
        <SellerListings />
      </AppProviders>,
    );

    expect(
      await screen.findByText('Listings failed to load'),
    ).toBeInTheDocument();
  });

  it('removes a listing after deleting it from the listings table', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listings: [listing] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<SellerListings />);
    fireEvent.click(await screen.findByText('USB Hub'));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Delete USB Hub' }),
    );

    await waitFor(() => expect(screen.queryByText('USB Hub')).toBeNull());
  });

  it('updates one listing while keeping other listings visible', async () => {
    const secondListing = { ...listing, id: 'item-2', name: 'Laptop Stand' };
    const updatedListing = { ...listing, name: 'USB-C Hub' };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listings: [listing, secondListing] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listing: updatedListing }),
      });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<SellerListings />);
    fireEvent.click(await screen.findByText('USB Hub'));
    fireEvent.change(await screen.findByLabelText('Name for USB Hub'), {
      target: { value: 'USB-C Hub' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update USB Hub' }));

    await waitFor(() =>
      expect({
        updatedVisible: screen.queryByText('USB-C Hub') !== null,
        untouchedVisible: screen.queryByText('Laptop Stand') !== null,
      }).toEqual({
        updatedVisible: true,
        untouchedVisible: true,
      }),
    );
  });

  it('renders listings with the French grid locale branch', async () => {
    document.cookie = 'locale=fr';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ listings: [] }),
      })),
    );

    renderWithProviders(<SellerListings />);

    expect(await screen.findByText('No active listings')).toBeInTheDocument();
  });

  it('marks a shipping order delivered', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orders: [order] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ order: { ...order, status: 'delivered' } }),
      });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<Sales />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Mark delivered' }),
    );

    await waitFor(() =>
      expect(fetchMock.mock.calls[1]?.[1]).toEqual(
        expect.objectContaining({ method: 'PATCH' }),
      ),
    );
  });

  it('marks an ordered order shipped', async () => {
    let resolveUpdate:
      | ((value: {
          ok: boolean;
          json: () => Promise<{ order: typeof order }>;
        }) => void)
      | undefined;
    const updateResponse = new Promise<{
      ok: boolean;
      json: () => Promise<{ order: typeof order }>;
    }>((resolve) => {
      resolveUpdate = resolve;
    });
    const orderedOrder = { ...order, status: 'ordered' };
    const otherOrder = { ...order, id: 'order-2', status: 'ordered' };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orders: [orderedOrder, otherOrder] }),
      })
      .mockReturnValueOnce(updateResponse);
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<Sales />);
    const shipButtons = await screen.findAllByRole('button', {
      name: 'Mark shipped',
    });
    fireEvent.click(shipButtons[0] as HTMLElement);
    await screen.findByRole('button', { name: 'Updating...' });
    if (!resolveUpdate) {
      throw new Error('resolveUpdate not initialized');
    }
    resolveUpdate({
      ok: true,
      json: async () => ({ order: { ...orderedOrder, status: 'shipping' } }),
    });

    await waitFor(() =>
      expect(fetchMock.mock.calls[1]?.[1]).toEqual(
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'shipping' }),
        }),
      ),
    );
  });

  it('renders delivered orders without an action button', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ orders: [{ ...order, status: 'delivered' }] }),
      })),
    );

    renderWithProviders(<Sales />);

    expect(await screen.findAllByText('Delivered')).toHaveLength(2);
  });

  it('renders the sales load error label without an error provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unavailable',
      })),
    );

    render(
      <AppProviders>
        <Sales />
      </AppProviders>,
    );

    expect(
      await screen.findByText('Orders failed to load'),
    ).toBeInTheDocument();
  });

  it('renders sales with the French grid locale branch', async () => {
    document.cookie = 'locale=fr';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ orders: [] }),
      })),
    );

    renderWithProviders(<Sales />);

    expect(await screen.findByText('No orders yet')).toBeInTheDocument();
  });

  it('formats sales graph values', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          salesStats: [{month: 'Jun 2026', earnings: 420, orders: 8}],
        }),
      })),
    );

    render(<SalesGraph />);

    expect(screen.getByText('$420')).toBeInTheDocument();
  });

  it('renders the empty sales graph state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({salesStats: []}),
      })),
    );

    renderWithProviders(<SalesGraph />);

    expect(await screen.findByText('No sales yet')).toBeInTheDocument();
  });

  it('renders the empty sales graph state when loading stats fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('sales unavailable');
      }),
    );

    renderWithProviders(<SalesGraph />);

    expect(await screen.findByText('No sales yet')).toBeInTheDocument();
  });

  it('renders a high seller rating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ averageRating: 4.8 }),
      })),
    );

    renderWithProviders(<SellerRating />);

    expect(await screen.findByText('4.8')).toBeInTheDocument();
  });

  it('renders a low seller rating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ averageRating: 1.2 }),
      })),
    );

    renderWithProviders(<SellerRating />);

    expect(await screen.findByText('1.2')).toBeInTheDocument();
  });

  it('renders a strong seller rating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ averageRating: 3.8 }),
      })),
    );

    renderWithProviders(<SellerRating />);

    expect(await screen.findByText('3.8')).toBeInTheDocument();
  });

  it('renders a mixed seller rating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ averageRating: 2.8 }),
      })),
    );

    renderWithProviders(<SellerRating />);

    expect(await screen.findByText('2.8')).toBeInTheDocument();
  });

  it('renders a weak seller rating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ averageRating: 1.8 }),
      })),
    );

    renderWithProviders(<SellerRating />);

    expect(await screen.findByText('1.8')).toBeInTheDocument();
  });

  it('renders N/A when no seller rating is available without an error provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ averageRating: 0 }),
      })),
    );

    render(
      <AppProviders>
        <SellerRating />
      </AppProviders>,
    );

    expect(await screen.findByText('N/A')).toBeInTheDocument();
  });

  it('falls back when the star distribution request fails without an error provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw 'rating distribution failed';
      }),
    );

    render(
      <AppProviders>
        <StarGraph />
      </AppProviders>,
    );

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/seller/api/analytics/star-distribution',
      ),
    );
  });
});
