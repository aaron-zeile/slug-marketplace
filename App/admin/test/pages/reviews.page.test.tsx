import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.stubGlobal('fetch', vi.fn());

import ReviewsPage from '@/app/dashboard/reviews/page';

const fakeItem = {
  id: 'item-1',
  name: 'Test Listing',
  seller: { id: 'seller-1', name: 'Alice' },
  price: 19.99,
  status: 'active',
  createdAt: '2024-01-15T00:00:00.000Z',
};

const fakeReview = {
  id: 'review-1',
  itemId: 'item-1',
  itemName: 'Test Listing',
  user: { id: 'user-1', name: 'Bob' },
  content: 'Great product!',
  rating: 4,
  createdAt: '2024-03-01T00:00:00.000Z',
};

function mockFetch(items = [fakeItem], reviews = [fakeReview]) {
  vi.mocked(fetch)
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { adminItems: items } }), { status: 200 }) as never,
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { adminReviews: reviews } }), { status: 200 }) as never,
    );
}

function mockFetchError(message: string) {
  vi.mocked(fetch)
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ message }] }), { status: 200 }) as never,
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { adminReviews: [] } }), { status: 200 }) as never,
    );
}

function mockDeleteSuccess() {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { adminDeleteReview: true } }), { status: 200 }) as never,
  );
}

function mockDeleteError(message: string) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ errors: [{ message }] }), { status: 200 }) as never,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(window).confirm = vi.fn().mockReturnValue(true);
});

describe('ReviewsPage', () => {
  it('renders the Reviews heading immediately', () => {
    mockFetch();
    render(<ReviewsPage />);
    expect(screen.getByRole('heading', { name: /reviews/i })).toBeInTheDocument();
  });

  it('shows a loading spinner while fetching', () => {
    mockFetch();
    render(<ReviewsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders items with review counts after loading', async () => {
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Listing')).toBeInTheDocument();
    });
    expect(screen.getByText('1 review')).toBeInTheDocument();
    expect(screen.getByText('(1 across 1 listings)')).toBeInTheDocument();
  });

  it('shows "reviews" plural chip for multiple reviews', async () => {
    const secondReview = { ...fakeReview, id: 'review-2', content: 'Also good' };
    mockFetch([fakeItem], [fakeReview, secondReview]);
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));
    expect(screen.getByText('2 reviews')).toBeInTheDocument();
  });

  it('shows 0 reviews chip for items with no reviews', async () => {
    mockFetch([fakeItem], []);
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));
    expect(screen.getByText('0 reviews')).toBeInTheDocument();
  });

  it('shows empty state when there are no items', async () => {
    mockFetch([], []);
    render(<ReviewsPage />);
    await waitFor(() => {
      expect(screen.getByText('No listings found.')).toBeInTheDocument();
    });
  });

  it('expands to show reviews when the expand button is clicked', async () => {
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: '' })); // expand icon button
    expect(screen.getByText('Great product!')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows "No reviews" message when item is expanded but has no reviews', async () => {
    mockFetch([fakeItem], []);
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => {
      expect(screen.getByText('No reviews for this listing.')).toBeInTheDocument();
    });
  });

  it('collapses reviews when the expand button is clicked again', async () => {
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    const expandBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(expandBtn);
    expect(screen.getByText('Great product!')).toBeInTheDocument();

    fireEvent.click(expandBtn);
    await waitFor(() => {
      expect(screen.queryByText('Great product!')).not.toBeInTheDocument();
    });
  });

  it('renders star ratings correctly', async () => {
    const fiveStarReview = { ...fakeReview, rating: 5 };
    const oneStarReview = { ...fakeReview, id: 'review-2', rating: 1, content: 'Terrible', itemId: 'item-2' };
    const item2 = { ...fakeItem, id: 'item-2', name: 'Item 2' };
    mockFetch([fakeItem, item2], [fiveStarReview, oneStarReview]);
    render(<ReviewsPage />);
    await waitFor(() => screen.getAllByText(/listing/i));

    const expandBtns = screen.getAllByRole('button', { name: '' });
    fireEvent.click(expandBtns[0]);
    fireEvent.click(expandBtns[1]);

    await waitFor(() => {
      expect(screen.getByText('★★★★★')).toBeInTheDocument();
      expect(screen.getByText('★☆☆☆☆')).toBeInTheDocument();
    });
  });

  it('shows an error alert when the fetch fails', async () => {
    mockFetchError('Not authenticated');
    render(<ReviewsPage />);
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });

  it('shows a fallback error for non-Error rejections', async () => {
    vi.mocked(fetch).mockRejectedValue('network failure' as never);
    render(<ReviewsPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  it('removes a review after successful delete', async () => {
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => screen.getByText('Great product!'));

    mockDeleteSuccess();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Great product!')).not.toBeInTheDocument();
    });
  });

  it('does not delete when the user cancels', async () => {
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => screen.getByText('Great product!'));

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByText('Great product!')).toBeInTheDocument();
  });

  it('shows an error alert when delete fails', async () => {
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => screen.getByText('Great product!'));

    mockDeleteError('Review not found');
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText('Review not found')).toBeInTheDocument();
    });
    expect(screen.getByText('Great product!')).toBeInTheDocument();
  });

  it('shows a fallback delete error for non-Error rejections', async () => {
    mockFetch();
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));

    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => screen.getByText('Great product!'));

    vi.mocked(fetch).mockRejectedValueOnce('network failure' as never);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete review')).toBeInTheDocument();
    });
  });

  it('handles a review whose itemId is not in the items list', async () => {
    const orphanReview = { ...fakeReview, itemId: 'unknown-item' };
    mockFetch([fakeItem], [orphanReview]);
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Test Listing'));
    // item-1 has no matching reviews → falls back to []
    expect(screen.getByText('0 reviews')).toBeInTheDocument();
  });

  it('closes the error alert when the close button is clicked', async () => {
    mockFetchError('Some error');
    render(<ReviewsPage />);
    await waitFor(() => screen.getByText('Some error'));

    fireEvent.click(screen.getByTitle('Close'));
    expect(screen.queryByText('Some error')).not.toBeInTheDocument();
  });
});
