import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewCard from '../../src/app/items/[id]/ReviewCard';
import { Review } from '../../src/item/review';
import {
  deleteItemReviewAction,
  submitReportAction,
} from '../../src/app/items/[id]/actions';

vi.mock('../../src/app/items/[id]/actions', () => ({
  deleteItemReviewAction: vi.fn(),
  submitReportAction: vi.fn(),
}));

const review: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: 'u1aaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Alice' },
  rating: 4,
  content: 'Great pillow, super comfy.',
  created_at: '2026-05-01T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(deleteItemReviewAction).mockResolvedValue({ success: true });
  vi.mocked(submitReportAction).mockResolvedValue({ success: true });
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

    render(
      <ReviewCard review={review} canDelete={true} onDeleted={onDeleted} />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete review' }));

    await waitFor(() => {
      expect(deleteItemReviewAction).toHaveBeenCalledWith(review.id);
    });
    expect(onDeleted).toHaveBeenCalledWith(review.id);
  });

  it('does not call onDeleted when delete fails', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    vi.mocked(deleteItemReviewAction).mockResolvedValue({
      success: false,
      error: 'Review not found or user does not own review',
    });

    render(
      <ReviewCard review={review} canDelete={true} onDeleted={onDeleted} />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete review' }));

    await waitFor(() => {
      expect(deleteItemReviewAction).toHaveBeenCalledWith(review.id);
    });
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('disables the delete button while a delete is in progress', async () => {
    const user = userEvent.setup();
    let resolveDelete: (value: { success: true }) => void = () => {};
    vi.mocked(deleteItemReviewAction).mockImplementation(
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

  it('opens and closes the report review dialog', async () => {
    const user = userEvent.setup();

    render(
      <ReviewCard review={review} canDelete={false} onDeleted={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Report review' }));
    expect(screen.getByText('Report this review')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText('Report this review')).not.toBeInTheDocument();
    });
  });

  it('submits a review report from the card', async () => {
    const user = userEvent.setup();

    render(
      <ReviewCard review={review} canDelete={false} onDeleted={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Report review' }));
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(submitReportAction).toHaveBeenCalledWith({
        type: 'review',
        targetId: review.id,
        targetName: `Review by ${review.user.name}`,
        reason: 'spam',
        description: undefined,
      });
    });
  });
});
