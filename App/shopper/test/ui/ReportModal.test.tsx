import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ReportModal from '../../src/app/items/[id]/ReportModal';
import { submitReportAction } from '../../src/app/items/[id]/actions';

vi.mock('../../src/app/items/[id]/actions', () => ({
  submitReportAction: vi.fn(),
}));

vi.mock('@mui/material/Button', () => ({
  default: ({
    disabled: _disabled,
    onClick,
    children,
    ...props
  }: ComponentProps<'button'>) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@mui/material', async (importOriginal) => {
  const mui = await importOriginal<typeof import('@mui/material')>();

  return {
    ...mui,
    Button: ({
      disabled: _disabled,
      onClick,
      children,
      ...props
    }: ComponentProps<typeof mui.Button>) => (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
  };
});

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  type: 'item' as const,
  targetId: '11111111-1111-4111-8111-111111111111',
  targetName: 'Throw Pillow 336',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(submitReportAction).mockResolvedValue({ success: true });
});

describe('ReportModal', () => {
  it('renders the listing report dialog', () => {
    render(<ReportModal {...defaultProps} />);

    expect(screen.getByText('Report this listing')).toBeInTheDocument();
  });

  it('renders the review report dialog', () => {
    render(<ReportModal {...defaultProps} type="review" />);

    expect(screen.getByText('Report this review')).toBeInTheDocument();
  });

  it('closes and clears the form when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ReportModal {...defaultProps} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.type(
      screen.getByLabelText('Additional details (optional)'),
      'Looks suspicious',
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close while a report is submitting', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    let resolveSubmit: (value: { success: boolean }) => void = () => {};
    vi.mocked(submitReportAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<ReportModal {...defaultProps} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();

    resolveSubmit({ success: true });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('submits a report and shows a success message', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ReportModal {...defaultProps} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.type(
      screen.getByLabelText('Additional details (optional)'),
      '  Duplicate listing  ',
    );
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(submitReportAction).toHaveBeenCalledWith({
        type: 'item',
        targetId: defaultProps.targetId,
        targetName: defaultProps.targetName,
        reason: 'spam',
        description: 'Duplicate listing',
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('Report submitted. Thank you for your feedback.'),
    ).toBeInTheDocument();
  });

  it('shows an error message when submission fails', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReportAction).mockResolvedValue({
      success: false,
      error: 'Unable to save report',
    });

    render(<ReportModal {...defaultProps} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Other' }));
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    expect(await screen.findByText('Unable to save report')).toBeInTheDocument();
  });

  it('shows a generic error when submission fails without a message', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReportAction).mockResolvedValue({ success: false });

    render(<ReportModal {...defaultProps} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Other' }));
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    expect(await screen.findByText('Failed to submit report.')).toBeInTheDocument();
  });

  it('limits additional details to 500 characters', () => {
    render(<ReportModal {...defaultProps} />);

    const details = screen.getByLabelText('Additional details (optional)');
    fireEvent.change(details, { target: { value: 'x'.repeat(510) } });

    expect(details).toHaveValue('x'.repeat(500));
    expect(screen.getByText('500/500')).toBeInTheDocument();
  });

  it('does not submit when no reason is selected', async () => {
    render(<ReportModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    expect(submitReportAction).not.toHaveBeenCalled();
  });

  it('omits description when only whitespace is provided', async () => {
    const user = userEvent.setup();

    render(<ReportModal {...defaultProps} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.type(
      screen.getByLabelText('Additional details (optional)'),
      '   ',
    );
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => {
      expect(submitReportAction).toHaveBeenCalledWith({
        type: 'item',
        targetId: defaultProps.targetId,
        targetName: defaultProps.targetName,
        reason: 'spam',
        description: undefined,
      });
    });
  });

  it('ignores dialog close while submitting', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    let resolveSubmit: (value: { success: boolean }) => void = () => {};
    vi.mocked(submitReportAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<ReportModal {...defaultProps} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onClose).not.toHaveBeenCalled();

    resolveSubmit({ success: true });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('dismisses the snackbar when the alert close button is clicked', async () => {
    const user = userEvent.setup();

    render(<ReportModal {...defaultProps} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Spam' }));
    await user.click(screen.getByRole('button', { name: 'Submit report' }));

    const successMessage = await screen.findByText(
      'Report submitted. Thank you for your feedback.',
    );
    await user.click(
      successMessage.closest('.MuiAlert-root')!.querySelector('button')!,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Report submitted. Thank you for your feedback.'),
      ).not.toBeInTheDocument();
    });
  });
});
