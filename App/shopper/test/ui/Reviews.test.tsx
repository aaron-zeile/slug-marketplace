import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reviews from '../../src/app/items/[id]/Reviews';
import { Review } from '../../src/item/review';

vi.mock('../../src/item/review/service', () => ({
  getReviews: vi.fn(),
  createReview: vi.fn(),
  deleteReview: vi.fn(),
}));

vi.mock('../../src/app/buyer/login/actions', () => ({
  checkLogin: vi.fn(),
}));

import { checkLogin } from '../../src/app/buyer/login/actions';
import {
  createReview,
  deleteReview,
  getReviews,
} from '../../src/item/review/service';

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

const newReview: Review = {
  id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  user: { id: 'u3dddddd-dddd-4ddd-8ddd-dddddddddddd', name: 'Casey' },
  rating: 5,
  content: 'Just bought this — works great!',
  created_at: '2026-05-10T12:00:00.000Z',
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
  vi.mocked(checkLogin).mockResolvedValue({});
  vi.mocked(getReviews).mockResolvedValue([]);
});

describe('Reviews', () => {
  it('shows a progress bar while loading', () => {
    vi.mocked(getReviews).mockReturnValue(new Promise(() => {}));

    render(<Reviews id={itemId} />);

    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('shows an error when the fetch action fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getReviews).mockRejectedValue(new Error('network down'));

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeDefined();
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('shows an error when success is true but data is undefined', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getReviews).mockResolvedValue(undefined as unknown as Review[]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeDefined();
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('shows empty state when there are no reviews', async () => {
    vi.mocked(getReviews).mockResolvedValue([]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('No reviews yet.')).toBeDefined();
    });
  });

  it('shows heading, customer rating, and plural review count for multiple reviews', async () => {
    vi.mocked(getReviews).mockResolvedValue([reviewA, reviewB]);

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
    vi.mocked(getReviews).mockResolvedValue([reviewA]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(/1 review/)).toBeDefined();
    });
    expect(screen.queryByText(/1 reviews/)).toBeNull();
  });

  it('renders a divider between multiple review cards', async () => {
    vi.mocked(getReviews).mockResolvedValue([reviewA, reviewB]);

    const { container } = render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewB.user.name)).toBeDefined();
    });
    expect(container.querySelectorAll('hr').length).toBeGreaterThanOrEqual(1);
  });

  it('uses two-letter initials from a multi-word display name', async () => {
    vi.mocked(getReviews).mockResolvedValue([reviewTwoWordName]);

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
    vi.mocked(getReviews).mockResolvedValue([blankNameReview]);

    const { container } = render(<Reviews id={itemId} />);

    await waitFor(() => {
      const avatar = container.querySelector('.MuiAvatar-root');
      expect(avatar?.textContent).toBe('?');
    });
  });

  it('calls getReviews with the item id', async () => {
    vi.mocked(getReviews).mockResolvedValue([]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(getReviews).toHaveBeenCalledWith(itemId);
    });
  });

  it('shows a sign-in prompt when logged out', async () => {
    vi.mocked(getReviews).mockResolvedValue([]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Sign in with the account button in the top bar to write a review.',
        ),
      ).toBeDefined();
    });
    expect(screen.queryByText('Write a review')).toBeNull();
  });

  it('shows the write form when logged in', async () => {
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
        email: 'riley@example.com',
        name: 'Riley',
      },
    });
    vi.mocked(getReviews).mockResolvedValue([]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('Write a review')).toBeDefined();
    });
    expect(screen.getByLabelText('Comment')).toBeDefined();
    expect(
      screen.queryByText(
        'Sign in with the account button in the top bar to write a review.',
      ),
    ).toBeNull();
  });

  it('submits a review and prepends it to the list', async () => {
    const user = userEvent.setup();
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
        email: 'riley@example.com',
        name: 'Riley',
      },
    });
    vi.mocked(getReviews).mockResolvedValue([reviewA]);
    vi.mocked(createReview).mockResolvedValue(newReview);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewA.content)).toBeDefined();
    });

    fireEvent.click(screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'Just bought this — works great!' },
    });
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith(
        itemId,
        5,
        'Just bought this — works great!',
      );
    });
    await waitFor(() => {
      expect(screen.getByText(newReview.content)).toBeDefined();
    });
    expect(screen.getByText(reviewA.content)).toBeDefined();
    expect(screen.getByText(/2 reviews/)).toBeDefined();
  });

  it('prepends a review when the previous list state was null', async () => {
    const user = userEvent.setup();
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
        email: 'riley@example.com',
        name: 'Riley',
      },
    });
    vi.mocked(getReviews).mockResolvedValue(null as unknown as Review[]);
    vi.mocked(createReview).mockResolvedValue(newReview);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('Write a review')).toBeDefined();
    });
    expect(screen.getByText('No reviews yet.')).toBeDefined();

    fireEvent.click(screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'Just bought this — works great!' },
    });
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    await waitFor(() => {
      expect(screen.getByText(newReview.content)).toBeDefined();
    });
    expect(screen.queryByText('No reviews yet.')).toBeNull();
    expect(screen.getByText(/1 review/)).toBeDefined();
  });

  it('submits the first review when the list was empty', async () => {
    const user = userEvent.setup();
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
        email: 'riley@example.com',
        name: 'Riley',
      },
    });
    vi.mocked(getReviews).mockResolvedValue([]);
    vi.mocked(createReview).mockResolvedValue(newReview);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText('No reviews yet.')).toBeDefined();
    });

    fireEvent.click(screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'Just bought this — works great!' },
    });
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    await waitFor(() => {
      expect(screen.getByText(newReview.content)).toBeDefined();
    });
    expect(screen.queryByText('No reviews yet.')).toBeNull();
    expect(screen.getByText(/1 review/)).toBeDefined();
  });

  it('shows delete only on reviews owned by the signed-in user', async () => {
    const currentUserId = reviewA.user.id;
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: currentUserId,
        email: 'alice@example.com',
        name: 'Alice',
      },
    });
    vi.mocked(getReviews).mockResolvedValue([reviewA, reviewB]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewB.user.name)).toBeDefined();
    });

    expect(screen.getByRole('button', { name: 'Delete review' })).toBeDefined();
    expect(screen.getAllByRole('button', { name: 'Delete review' })).toHaveLength(
      1,
    );
  });

  it('removes a review from the list after a successful delete', async () => {
    const user = userEvent.setup();
    vi.mocked(checkLogin).mockResolvedValue({
      user: {
        id: reviewA.user.id,
        email: 'alice@example.com',
        name: 'Alice',
      },
    });
    vi.mocked(getReviews).mockResolvedValue([reviewA, reviewB]);
    vi.mocked(deleteReview).mockResolvedValue(undefined);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewA.content)).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: 'Delete review' }));

    await waitFor(() => {
      expect(screen.queryByText(reviewA.content)).toBeNull();
    });
    expect(screen.getByText(reviewB.content)).toBeDefined();
    expect(screen.getByText(/1 review/)).toBeDefined();
  });

  it('does not show delete buttons when logged out', async () => {
    vi.mocked(getReviews).mockResolvedValue([reviewA]);

    render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewA.content)).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: 'Delete review' })).toBeNull();
  });

  it('refetches when id changes', async () => {
    vi.mocked(getReviews).mockResolvedValue([reviewA]);

    const otherId = '6a74cd3c-0c10-4507-ab92-a700174f4b15';
    const { rerender } = render(<Reviews id={itemId} />);

    await waitFor(() => {
      expect(screen.getByText(reviewA.user.name)).toBeDefined();
    });

    vi.mocked(getReviews).mockResolvedValue([reviewB]);
    rerender(<Reviews id={otherId} />);

    await waitFor(() => {
      expect(getReviews).toHaveBeenCalledWith(otherId);
    });
    await waitFor(() => {
      expect(screen.getByText(reviewB.user.name)).toBeDefined();
    });
  });
});
