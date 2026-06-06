import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.stubGlobal('fetch', vi.fn());

import ListingsPage from '@/app/dashboard/listings/page';

const fakeItem = {
  id: 'item-1',
  name: 'Test Listing',
  seller: { id: 'seller-1', name: 'Alice' },
  price: 19.99,
  status: 'active',
  createdAt: '2024-01-15T00:00:00.000Z',
};

function mockFetchItems(items = [fakeItem]) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(
      JSON.stringify({ data: { adminItems: items } }),
      { status: 200 },
    ) as never,
  );
}

function mockFetchError(message: string) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(
      JSON.stringify({ errors: [{ message }] }),
      { status: 200 },
    ) as never,
  );
}

function mockDeleteSuccess() {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(
      JSON.stringify({ data: { adminDeleteItem: true } }),
      { status: 200 },
    ) as never,
  );
}

function mockDeleteError(message: string) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(
      JSON.stringify({ errors: [{ message }] }),
      { status: 200 },
    ) as never,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(window).confirm = vi.fn().mockReturnValue(true);
});

describe('ListingsPage', () => {
  it('renders the Listings heading immediately', () => {
    mockFetchItems();
    render(<ListingsPage />);
    expect(screen.getByRole('heading', { name: /listings/i })).toBeInTheDocument();
  });

  it('shows a loading spinner while fetching', () => {
    mockFetchItems();
    render(<ListingsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders items after data loads', async () => {
    mockFetchItems();
    render(<ListingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Listing')).toBeInTheDocument();
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });

  it('shows empty state when there are no listings', async () => {
    mockFetchItems([]);
    render(<ListingsPage />);
    await waitFor(() => {
      expect(screen.getByText('No listings found.')).toBeInTheDocument();
    });
    expect(screen.getByText('(0)')).toBeInTheDocument();
  });

  it('shows an error alert when the fetch fails', async () => {
    mockFetchError('Not authenticated');
    render(<ListingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });

  it('shows a fallback error message for non-Error rejections', async () => {
    vi.mocked(fetch).mockRejectedValueOnce('network failure' as never);
    render(<ListingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load listings')).toBeInTheDocument();
    });
  });

  it('removes a listing after successful delete', async () => {
    mockFetchItems();
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    mockDeleteSuccess();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Test Listing')).not.toBeInTheDocument();
    });
  });

  it('does not delete when the user cancels the confirm dialog', async () => {
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    mockFetchItems();
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(fetch).toHaveBeenCalledTimes(1); // only the initial fetch
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });

  it('shows an error alert when delete fails', async () => {
    mockFetchItems();
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    mockDeleteError('Item not found');
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText('Item not found')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });

  it('shows a fallback delete error for non-Error rejections', async () => {
    mockFetchItems();
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    vi.mocked(fetch).mockRejectedValueOnce('network failure' as never);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete listing')).toBeInTheDocument();
    });
  });

  it('closes the error alert when the close button is clicked', async () => {
    mockFetchError('Some error');
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Some error'));

    fireEvent.click(screen.getByTitle('Close'));
    expect(screen.queryByText('Some error')).not.toBeInTheDocument();
  });

  it('filters listings by name via the search box', async () => {
    const otherItem = {
      ...fakeItem,
      id: 'item-2',
      name: 'Vintage Lamp',
      seller: { id: 'seller-2', name: 'Bob' },
    };
    mockFetchItems([fakeItem, otherItem]);
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by listing name or seller'),
      { target: { value: 'vintage' } },
    );

    expect(screen.getByText('Vintage Lamp')).toBeInTheDocument();
    expect(screen.queryByText('Test Listing')).not.toBeInTheDocument();
  });

  it('filters listings by seller name via the search box', async () => {
    const otherItem = {
      ...fakeItem,
      id: 'item-2',
      name: 'Vintage Lamp',
      seller: { id: 'seller-2', name: 'Bob' },
    };
    mockFetchItems([fakeItem, otherItem]);
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by listing name or seller'),
      { target: { value: 'alice' } },
    );

    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.queryByText('Vintage Lamp')).not.toBeInTheDocument();
  });

  it('shows a no-match message when the search matches nothing', async () => {
    mockFetchItems([fakeItem]);
    render(<ListingsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by listing name or seller'),
      { target: { value: 'zzzzz' } },
    );

    expect(screen.getByText(/No listings match/i)).toBeInTheDocument();
  });
});
