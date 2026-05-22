import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import AddressForm from '../../src/app/account/AddressForm';
import { createAddressAction } from '../../src/app/account/actions';

vi.mock('../../src/app/account/actions', () => ({
  createAddressAction: vi.fn(),
  updateAddressAction: vi.fn(),
}));

it('submits a new address', async () => {
  vi.mocked(createAddressAction).mockResolvedValue({
    success: true,
    data: {
      id: 'addr-1',
      member: 'member-1',
      label: 'Home',
      line1: '123 Main St',
      city: 'Santa Cruz',
      postal_code: '95060',
      country: 'US',
      is_default: true,
      created_at: '2026-05-17T00:00:00.000Z',
      updated_at: '2026-05-17T00:00:00.000Z',
    },
  });

  const onSaved = vi.fn();
  render(<AddressForm onSaved={onSaved} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  await waitFor(() => {
    expect(createAddressAction).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
  });
});

it('shows an error when save fails', async () => {
  vi.mocked(createAddressAction).mockResolvedValue({
    success: false,
    error: 'Unable to save address.',
  });

  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save address.');
});
