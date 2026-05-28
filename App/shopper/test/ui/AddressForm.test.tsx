import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import AddressForm from '../../src/app/account/AddressForm';
import { createAddressAction, updateAddressAction } from '../../src/app/account/actions';

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
      state: 'CA',
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
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
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
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save address.');
});

it('strips non-numeric characters from the postal code field', () => {
  render(<AddressForm onSaved={vi.fn()} />);

  const postalField = screen.getByLabelText(/Postal code/i) as HTMLInputElement;
  fireEvent.change(postalField, { target: { value: '95a06b0' } });

  expect(postalField.value).toBe('95060');
});

it('validates required fields before submitting', async () => {
  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '   ' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/State/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(createAddressAction).not.toHaveBeenCalled();
});

it('validates city required branch', async () => {
  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: '   ' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));
  expect(await screen.findByText('City is required.')).toBeInTheDocument();
});

it('validates state required branch', async () => {
  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: '   ' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  expect(await screen.findByText('State is required.')).toBeInTheDocument();
});

it('validates postal code required branch', async () => {
  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '   ' },
  });
  const form = screen
    .getByRole('button', { name: 'Add address' })
    .closest('form') as HTMLFormElement;
  fireEvent.submit(form);

  expect(await screen.findByText('Postal code is required.')).toBeInTheDocument();
});

it('uses fallback saveError when action returns no error message', async () => {
  vi.mocked(createAddressAction).mockResolvedValue({
    success: false,
  });
  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save address.');
});

it('trims optional fields and resets form on create success', async () => {
  vi.mocked(createAddressAction).mockResolvedValue({
    success: true,
    data: {
      id: 'addr-1',
      member: 'member-1',
      label: 'Home',
      line1: '123 Main St',
      city: 'Santa Cruz',
      state: 'CA',
      postal_code: '95060',
      country: 'US',
      is_default: true,
      created_at: '2026-05-17T00:00:00.000Z',
      updated_at: '2026-05-17T00:00:00.000Z',
    },
  });

  render(<AddressForm onSaved={vi.fn()} />);

  const label = screen.getByLabelText(/Label/i) as HTMLInputElement;
  const line2 = screen.getByLabelText(/Address line 2/i) as HTMLInputElement;
  const country = screen.getByLabelText(/Country/i) as HTMLInputElement;
  const isDefault = screen.getByRole('checkbox', {
    name: /Use as default shipping address/i,
  }) as HTMLInputElement;

  fireEvent.change(label, { target: { value: '  Home  ' } });
  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: ' 123 Main St ' },
  });
  fireEvent.change(line2, { target: { value: ' Apt 9 ' } });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: ' Santa Cruz ' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: ' CA ' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });
  fireEvent.change(country, { target: { value: '  ' } });
  fireEvent.click(isDefault);
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  await waitFor(() => {
    expect(createAddressAction).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Home',
        line2: 'Apt 9',
        country: 'US',
        is_default: true,
      }),
    );
  });
  expect(label.value).toBe('');
  expect(line2.value).toBe('');
});

it('prevents duplicate submit while request is in flight', async () => {
  let resolveCall: ((value: unknown) => void) | undefined;
  vi.mocked(createAddressAction).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveCall = resolve;
      }) as Promise<{
        success: true;
        data: {
          id: string;
          member: string;
          line1: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          created_at: string;
          updated_at: string;
        };
      }>,
  );

  render(<AddressForm onSaved={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95060' },
  });

  const submit = screen.getByRole('button', { name: 'Add address' });
  const form = submit.closest('form') as HTMLFormElement;
  fireEvent.click(submit);
  fireEvent.submit(form);

  expect(createAddressAction).toHaveBeenCalledTimes(1);

  resolveCall?.({
    success: true,
    data: {
      id: 'addr-1',
      member: 'member-1',
      line1: '123 Main St',
      city: 'Santa Cruz',
      state: 'CA',
      postal_code: '95060',
      country: 'US',
      created_at: '2026-05-17T00:00:00.000Z',
      updated_at: '2026-05-17T00:00:00.000Z',
    },
  });
});

it('updates an existing address and shows a cancel button', async () => {
  vi.mocked(updateAddressAction).mockResolvedValueOnce({
    success: true,
    data: {
      id: 'addr-1',
      member: 'member-1',
      label: 'Home',
      line1: '999 Elm St',
      city: 'Santa Cruz',
      state: 'CA',
      postal_code: '95060',
      country: 'US',
      is_default: true,
      created_at: '2026-05-17T00:00:00.000Z',
      updated_at: '2026-05-17T00:00:00.000Z',
    },
  });

  const onSaved = vi.fn();
  const onCancel = vi.fn();
  render(
    <AddressForm
      address={{
        id: 'addr-1',
        member: 'member-1',
        label: 'Home',
        line1: '123 Main St',
        city: 'Santa Cruz',
        state: 'CA',
        postal_code: '95060',
        country: 'US',
        is_default: true,
        created_at: '2026-05-17T00:00:00.000Z',
        updated_at: '2026-05-17T00:00:00.000Z',
      }}
      onSaved={onSaved}
      onCancel={onCancel}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '999 Elm St' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

  await waitFor(() => {
    expect(updateAddressAction).toHaveBeenCalledWith(
      'addr-1',
      expect.objectContaining({ line1: '999 Elm St' }),
    );
    expect(onSaved).toHaveBeenCalled();
  });
});

it('falls back to empty state and US country when editing malformed address data', () => {
  render(
    <AddressForm
      address={{
        id: 'addr-1',
        member: 'member-1',
        label: 'Home',
        line1: '123 Main St',
        city: 'Santa Cruz',
        state: undefined as unknown as string,
        postal_code: '95060',
        country: undefined as unknown as string,
        is_default: false,
        created_at: '2026-05-17T00:00:00.000Z',
        updated_at: '2026-05-17T00:00:00.000Z',
      }}
      onSaved={vi.fn()}
    />,
  );

  expect(screen.getByLabelText(/State \/ Province/i)).toHaveValue('');
  expect(screen.getByLabelText(/Country/i)).toHaveValue('US');
});
