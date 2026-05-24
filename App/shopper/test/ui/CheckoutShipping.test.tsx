import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import CheckoutShipping from '../../src/app/checkout/shipping/CheckoutShipping';
import { listAddressesAction } from '../../src/app/account/actions';
import type { ShippingAddress } from '../../src/address/types';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('../../src/app/account/actions', () => ({
  listAddressesAction: vi.fn(),
}));

vi.mock('../../src/app/account/AddressForm', () => ({
  default: ({
    onSaved,
    onCancel,
  }: {
    onSaved: (address: ShippingAddress) => void;
    onCancel?: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onSaved(savedAddress)}>
        Save mock address
      </button>
      {onCancel ? (
        <button type="button" onClick={onCancel}>
          Cancel form
        </button>
      ) : null}
    </div>
  ),
}));

const savedAddress: ShippingAddress = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  label: 'Work',
  line1: '456 Oak Ave',
  city: 'San Jose',
  state: 'CA',
  postal_code: '95112',
  country: 'US',
  is_default: false,
  created_at: '2026-05-18T00:00:00.000Z',
  updated_at: '2026-05-18T00:00:00.000Z',
};

const homeAddress: ShippingAddress = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  label: 'Home',
  line1: '123 Main St',
  city: 'Santa Cruz',
  state: 'CA',
  postal_code: '95060',
  country: 'US',
  is_default: true,
  created_at: '2026-05-17T00:00:00.000Z',
  updated_at: '2026-05-17T00:00:00.000Z',
};

beforeEach(() => {
  push.mockReset();
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [homeAddress],
  });
});

it('shows a loading state then the shipping step', async () => {
  render(<CheckoutShipping />);

  expect(screen.getByText('Loading addresses...')).toBeInTheDocument();

  expect(await screen.findByText('Shipping address')).toBeInTheDocument();
  expect(screen.getByText('123 Main St, Santa Cruz, CA, 95060, US')).toBeInTheDocument();
});

it('shows a load error when addresses cannot be fetched', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: false,
    error: 'Unable to load addresses.',
  });

  render(<CheckoutShipping />);

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to load addresses.',
  );
});

it('shows the address form when the member has no saved addresses', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<CheckoutShipping />);

  expect(await screen.findByRole('button', { name: 'Save mock address' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Continue to payment' })).toBeDisabled();
});

it('continues to payment with the selected address', async () => {
  render(<CheckoutShipping />);

  await screen.findByText('123 Main St, Santa Cruz, CA, 95060, US');

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith(
      '/checkout/payment?addressId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
  });
});

it('can reveal the add-address form when addresses already exist', async () => {
  render(<CheckoutShipping />);

  await screen.findByRole('button', { name: 'Continue to payment' });

  fireEvent.click(screen.getByRole('button', { name: 'Add a new address' }));

  expect(screen.getByRole('button', { name: 'Save mock address' })).toBeInTheDocument();
});

it('refreshes the list after saving a new address', async () => {
  let calls = 0;
  vi.mocked(listAddressesAction).mockImplementation(async () => {
    calls += 1;
    if (calls === 1) {
      return { success: true, data: [] };
    }
    return { success: true, data: [savedAddress] };
  });

  render(<CheckoutShipping />);

  fireEvent.click(await screen.findByRole('button', { name: 'Save mock address' }));

  await waitFor(() => {
    expect(screen.getByText('456 Oak Ave, San Jose, CA, 95112, US')).toBeInTheDocument();
  });

  expect(listAddressesAction).toHaveBeenCalledTimes(2);

  expect(screen.queryByRole('button', { name: 'Save mock address' })).not.toBeInTheDocument();
});

it('falls back to local state when refresh after save fails', async () => {
  let calls = 0;
  vi.mocked(listAddressesAction).mockImplementation(async () => {
    calls += 1;
    if (calls === 1) {
      return { success: true, data: [homeAddress] };
    }
    return { success: false, error: 'Unable to load addresses.' };
  });

  render(<CheckoutShipping />);

  await screen.findByRole('button', { name: 'Add a new address' });
  fireEvent.click(screen.getByRole('button', { name: 'Add a new address' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save mock address' }));

  await waitFor(() => {
    expect(screen.getByText('456 Oak Ave, San Jose, CA, 95112, US')).toBeInTheDocument();
  });
});
