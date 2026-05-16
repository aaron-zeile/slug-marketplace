import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ReviewWriteForm from '../src/app/items/[id]/ReviewWriteForm';
import { Review } from '../src/item/review';
import { createItemReviewAction } from '../src/app/items/[id]/actions';

vi.mock('../src/app/items/[id]/actions', () => ({
  createItemReviewAction: vi.fn(),
}));

const itemId = '550e8400-e29b-41d4-a716-446655440000';

const mockReview: Review = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  user: { id: '6a74cd3c-0c10-4507-ab92-a700174f4b15', name: 'Riley' },
  rating: 5,
  content: 'Nice item.',
  created_at: '2025-10-07T18:56:33.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createItemReviewAction).mockResolvedValue({
    success: true,
    data: mockReview,
  });
});

describe('ReviewWriteForm', () => {
  it('renders the review form fields', () => {
    render(<ReviewWriteForm itemId={itemId} onReviewCreated={vi.fn()} />);

    expect(screen.getByText('Write a review')).toBeDefined();
    expect(screen.getByText('Your rating')).toBeDefined();
    expect(screen.getByLabelText('Comment')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Submit review' })).toBeDefined();
  });

  it('shows a validation error when no rating is selected', async () => {
    const user = userEvent.setup();

    render(<ReviewWriteForm itemId={itemId} onReviewCreated={vi.fn()} />);

    await user.type(screen.getByLabelText('Comment'), 'Great pillow.');
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(screen.getByText('Please choose a star rating.')).toBeDefined();
    expect(createItemReviewAction).not.toHaveBeenCalled();
  });

  it('shows a validation error when the comment is empty', async () => {
    const user = userEvent.setup();

    render(<ReviewWriteForm itemId={itemId} onReviewCreated={vi.fn()} />);

    fireEvent.click(screen.getByDisplayValue('4'));
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(screen.getByText('Please write a short review.')).toBeDefined();
    expect(createItemReviewAction).not.toHaveBeenCalled();
  });

  it('shows a validation error when the comment exceeds 1024 characters', async () => {
    const user = userEvent.setup();

    render(<ReviewWriteForm itemId={itemId} onReviewCreated={vi.fn()} />);

    fireEvent.click(screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'a'.repeat(1025) },
    });
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(
      screen.getByText('Review must be at most 1024 characters.'),
    ).toBeDefined();
    expect(createItemReviewAction).not.toHaveBeenCalled();
  });

  it('submits a review and notifies the parent on success', async () => {
    const user = userEvent.setup();
    const onReviewCreated = vi.fn();

    render(
      <ReviewWriteForm itemId={itemId} onReviewCreated={onReviewCreated} />,
    );

    fireEvent.click(screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: '  Nice item.  ' },
    });
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    await waitFor(() => {
      expect(createItemReviewAction).toHaveBeenCalledWith(
        itemId,
        5,
        'Nice item.',
      );
    });
    expect(onReviewCreated).toHaveBeenCalledWith(mockReview);
    expect(screen.getByLabelText('Comment')).toHaveValue('');
  });

  it('shows an error when the submit action fails', async () => {
    const user = userEvent.setup();
    vi.mocked(createItemReviewAction).mockResolvedValue({
      success: false,
      error: 'Not signed in',
    });

    render(<ReviewWriteForm itemId={itemId} onReviewCreated={vi.fn()} />);

    fireEvent.click(screen.getByDisplayValue('3'));
    await user.type(screen.getByLabelText('Comment'), 'Okay product.');
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeDefined();
    });
  });

  it('disables the submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolveSubmit: (value: {
      success: true;
      data: Review;
    }) => void = () => {};
    vi.mocked(createItemReviewAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<ReviewWriteForm itemId={itemId} onReviewCreated={vi.fn()} />);

    fireEvent.click(screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'Nice item.' },
    });
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled();

    resolveSubmit({ success: true, data: mockReview });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Submit review' }),
      ).not.toBeDisabled();
    });
  });
});
