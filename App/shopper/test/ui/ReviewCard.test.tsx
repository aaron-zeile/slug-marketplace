import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewCard from '../../src/app/items/[id]/ReviewCard';
import { Review } from '../../src/item/review';

vi.mock('../../src/item/review/service', () => ({
  deleteReview: vi.fn(),
}));

import { deleteReview } from '../../src/item/review/service';

const review: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: 'u1aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Alice' },
  rating: 4,
  content: 'Great pillow, super comfy.',
  created_at: '2026-05-01T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReviewCard', () => {
  it('does not show a delete button when canDelete is false', () => {
    render(
      <ReviewCard review={review} canDelete={false} onDeleted={vi.fn()} />,
    );

    expect(screen.queryByRole('button', { name: 'Delete review' })).toBeNull();
  });

  it('shows a delete button when canDelete is true', () => {
    render(
      <ReviewCard review={review} canDelete={true} onDeleted={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Delete review' })).toBeDefined();
  });

  it('calls onDeleted after a successful delete', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    vi.mocked(deleteReview).mockResolvedValue(undefined);

    render(
      <ReviewCard review={review} canDelete={true} onDeleted={onDeleted} />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete review' }));

    await waitFor(() => {
      expect(deleteReview).toHaveBeenCalledWith(review.id);
    });
    expect(onDeleted).toHaveBeenCalledWith(review.id);
  });

  it('does not call onDeleted when delete fails', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    vi.mocked(deleteReview).mockRejectedValue(
      new Error('Review not found or user does not own review'),
    );

    render(
      <ReviewCard review={review} canDelete={true} onDeleted={onDeleted} />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete review' }));

    await waitFor(() => {
      expect(deleteReview).toHaveBeenCalledWith(review.id);
    });
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('disables the delete button while a delete is in progress', async () => {
    const user = userEvent.setup();
    let resolveDelete: (value: { success: true }) => void = () => {};
    vi.mocked(deleteReview).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
    );

    render(
      <ReviewCard review={review} canDelete={true} onDeleted={vi.fn()} />,
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete review' });
    await user.click(deleteButton);

    expect(deleteButton).toHaveProperty('disabled', true);

    resolveDelete({ success: true });
    await waitFor(() => {
      expect(deleteButton).toHaveProperty('disabled', false);
    });
  });
});
