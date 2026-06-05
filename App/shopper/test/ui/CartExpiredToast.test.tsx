import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';

import CartExpiredToast from '../../src/app/buyer/components/CartExpiredToast';

let latestSnackbarOnClose: (() => void) | undefined;
let latestAlertOnClose: (() => void) | undefined;

vi.mock('@mui/material', () => ({
  Snackbar: ({
    open,
    onClose,
    children,
  }: {
    open: boolean;
    onClose?: () => void;
    children: React.ReactNode;
  }) =>
    open ? (
      <div>
        <button
          aria-label="snackbar-close"
          onClick={() => {
            latestSnackbarOnClose = onClose;
            onClose?.();
          }}
          type="button"
        >
          close snackbar
        </button>
        {children}
      </div>
    ) : null,
  Alert: ({
    children,
    onClose,
    ...props
  }: {
    children: React.ReactNode;
    onClose?: () => void;
  }) => (
    <div role="alert" {...props}>
      <button
        aria-label="alert-close"
        onClick={() => {
          latestAlertOnClose = onClose;
          onClose?.();
        }}
        type="button"
      >
        close alert
      </button>
      {children}
    </div>
  ),
}));

describe('CartExpiredToast', () => {
  afterEach(() => {
    vi.useRealTimers();
    latestSnackbarOnClose = undefined;
    latestAlertOnClose = undefined;
  });

  it('renders nothing when no expiration query params are present', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams());

    const { container } = render(<CartExpiredToast />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows insufficient stock warning and clears query params', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('outOfStock=1&cartExpired=1'),
    );
    const replaceState = vi
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => undefined);

    render(<CartExpiredToast />);

    expect(
      await screen.findByLabelText('One or more items are out of stock.'),
    ).toBeInTheDocument();

    replaceState.mockRestore();
  });

  it('shows cart expired warning when cartExpired is in query', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('cartExpired=1'),
    );

    render(<CartExpiredToast />);

    expect(await screen.findByLabelText('Cart expired')).toBeInTheDocument();
  });
});
