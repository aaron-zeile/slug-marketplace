import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reviews from '../src/app/items/[id]/Reviews';
import { Review } from '../src/item/review';

vi.mock('../src/app/items/[id]/actions', () => ({
  fetchItemReviewsAction: vi.fn(),
  fetchItemReviewSessionAction: vi.fn(),
  createItemReviewAction: vi.fn(),
}));

import {
  fetchItemReviewSessionAction,
  fetchItemReviewsAction,
} from '../src/app/items/[id]/actions';

const itemId = '550e8400-e29b-41d4-a716-446655440000';

const reviewA: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: 'u1aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Alice' },
  rating: 4,
  content: 'Great pillow, super comfy.',
  created_at: '2026-05-01T12:00:00.000Z',
};

const reviewB: Review = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  user: { id: 'u2bbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Bob' },
  rating: 5,
  content: 'Loved it!',
  created_at: '2026-05-02T12:00:00.000Z',
};

const reviewTwoWordName: Review = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  user: {
    id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    name: 'Mary Jane Watson',
  },
  rating: 5,
  content: 'Excellent.',
  created_at: '2026-05-03T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchItemReviewSessionAction).mockResolvedValue({
    loggedIn: false,
  });
});

describe('Reviews', () => {
  it('shows a progress bar while loading', () => {
    vi.mocked(fetchItemReviewsAction).mockReturnValue(new Promise(() => {}));

    render(<Reviews id={itemId} />);

    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('shows an error when the fetch action fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: false,
      error: 'network down',
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeDefined();
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('shows an error when success is true but data is undefined', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: undefined,
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeDefined();
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('shows empty state when there are no reviews', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('No reviews yet.')).toBeDefined();
    });
  });

  it('shows heading, customer rating, and plural review count for multiple reviews', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [reviewA, reviewB],
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Reviews' })).toBeDefined();
    });
    expect(screen.getByText('Customer rating')).toBeDefined();
    expect(screen.getByText('4.5')).toBeDefined();
    expect(screen.getByText(/2 reviews/)).toBeDefined();
    expect(screen.getByText(reviewA.content)).toBeDefined();
    expect(screen.getByText(reviewB.content)).toBeDefined();
  });

  it('uses singular "review" for a single rating summary', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [reviewA],
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(/1 review/)).toBeDefined();
    });
    expect(screen.queryByText(/1 reviews/)).toBeNull();
  });

  it('renders a divider between multiple review cards', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [reviewA, reviewB],
    });

    const { container } = render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewB.user.name)).toBeDefined();
    });
    expect(container.querySelectorAll('hr').length).toBeGreaterThanOrEqual(1);
  });

  it('uses two-letter initials from a multi-word display name', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [reviewTwoWordName],
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('MW')).toBeDefined();
    });
  });

  it('uses "?" initials when the display name has no usable characters', async () => {
    const blankNameReview = {
      ...reviewA,
      user: { ...reviewA.user, name: '   ' },
    } as Review;
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [blankNameReview],
    });

    const { container } = render(<Reviews id={itemId} />);

    await waitFor(() => {
      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar?.textContent).toBe('?');
    });
  });

  it('calls fetchItemReviewsAction with the item id', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(fetchItemReviewsAction).toHaveBeenCalledWith(itemId);
    });
  });

  it('refetches when id changes', async () => {
    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [reviewA],
    });

    const otherId = '6a74cd3c-0c10-4507-ab92-a700174f4b15';
    const { rerender } = render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewA.user.name)).toBeDefined();
    });

    vi.mocked(fetchItemReviewsAction).mockResolvedValue({
      success: true,
      data: [reviewB],
    });
    rerender(<Reviews id={otherId} />);

    await waitFor(() => {
      expect(fetchItemReviewsAction).toHaveBeenCalledWith(otherId);
    });
    await waitFor(() => {
      expect(screen.getByText(reviewB.user.name)).toBeDefined();
    });
  });
});
