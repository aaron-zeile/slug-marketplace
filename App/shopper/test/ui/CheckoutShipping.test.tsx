import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';

import CheckoutShipping from '../../src/app/checkout/shipping/CheckoutShipping';
import { listAddressesAction } from '../../src/app/account/actions';
import type { ShippingAddress } from '../../src/address/types';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@mui/material', async (importOriginal) => {
  const mui = await importOriginal<typeof import('@mui/material')>();

  return {
    ...mui,
    Button: ({
      disabled: _disabled,
      ...props
    }: ComponentProps<typeof mui.Button>) => (
      <mui.Button {...props} />
    ),
  };
});

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
      <button
        type="button"
        onClick={() => onSaved({ ...savedAddress, is_default: true })}
      >
        Save mock default address
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

const workAddress: ShippingAddress = {
  ...savedAddress,
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  label: 'Office',
  is_default: false,
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

it('shows the generic load error when fetch fails without a message', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: false,
  } as Awaited<ReturnType<typeof listAddressesAction>>);

  render(<CheckoutShipping />);

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to load addresses.',
  );
});

it('shows the generic load error when fetch succeeds without address data', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
  } as Awaited<ReturnType<typeof listAddressesAction>>);

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
  expect(screen.getByRole('button', { name: 'Continue to payment' })).toBeInTheDocument();
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

it('shows select required when continuing without a selected address', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [],
  });

  render(<CheckoutShipping />);

  await screen.findByRole('button', { name: 'Save mock address' });

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Select or add a shipping address to continue.',
  );
  expect(push).not.toHaveBeenCalled();
});

it('continues with a newly selected address', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [homeAddress, workAddress],
  });

  render(<CheckoutShipping />);

  await screen.findByText('123 Main St, Santa Cruz, CA, 95060, US');

  fireEvent.click(screen.getByRole('radio', { name: /Office/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith(
      '/checkout/payment?addressId=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    );
  });
});

it('clears a validation error when the shopper picks an address', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [{ ...homeAddress, id: '' }, workAddress],
  });

  render(<CheckoutShipping />);

  await screen.findByText('456 Oak Ave, San Jose, CA, 95112, US');

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Select or add a shipping address to continue.',
  );

  fireEvent.click(screen.getByRole('radio', { name: /Office/i }));

  await waitFor(() => {
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

it('hides the address form when the shopper cancels', async () => {
  render(<CheckoutShipping />);

  await screen.findByRole('button', { name: 'Add a new address' });
  fireEvent.click(screen.getByRole('button', { name: 'Add a new address' }));
  expect(screen.getByRole('button', { name: 'Save mock address' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel form' }));

  expect(screen.queryByRole('button', { name: 'Save mock address' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add a new address' })).toBeInTheDocument();
});

it('shows an untitled label when an address has no label', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [{ ...homeAddress, label: '' }],
  });

  render(<CheckoutShipping />);

  expect(await screen.findByText('Address')).toBeInTheDocument();
});

it('includes optional address lines in the formatted address', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [{ ...homeAddress, line2: 'Apt 4B' }],
  });

  render(<CheckoutShipping />);

  expect(
    await screen.findByText('123 Main St, Apt 4B, Santa Cruz, CA, 95060, US'),
  ).toBeInTheDocument();
});

it('selects the first address when none is marked default', async () => {
  vi.mocked(listAddressesAction).mockResolvedValue({
    success: true,
    data: [
      { ...homeAddress, is_default: false },
      { ...workAddress, is_default: false },
    ],
  });

  render(<CheckoutShipping />);

  await screen.findByText('123 Main St, Santa Cruz, CA, 95060, US');
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith(
      '/checkout/payment?addressId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
  });
});

it('selects the first refreshed address when the saved id is missing from refresh', async () => {
  let calls = 0;
  vi.mocked(listAddressesAction).mockImplementation(async () => {
    calls += 1;
    if (calls === 1) {
      return { success: true, data: [homeAddress] };
    }
    return { success: true, data: [workAddress] };
  });

  render(<CheckoutShipping />);

  await screen.findByRole('button', { name: 'Add a new address' });
  fireEvent.click(screen.getByRole('button', { name: 'Add a new address' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save mock address' }));

  await waitFor(() => {
    expect(screen.getByText('456 Oak Ave, San Jose, CA, 95112, US')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith(
      '/checkout/payment?addressId=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    );
  });
});

it('leaves no selection when refresh after save returns an empty list', async () => {
  let calls = 0;
  vi.mocked(listAddressesAction).mockImplementation(async () => {
    calls += 1;
    if (calls === 1) {
      return { success: true, data: [homeAddress] };
    }
    return { success: true, data: [] };
  });

  render(<CheckoutShipping />);

  await screen.findByRole('button', { name: 'Add a new address' });
  fireEvent.click(screen.getByRole('button', { name: 'Add a new address' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save mock address' }));

  await waitFor(() => {
    expect(screen.queryByText('123 Main St, Santa Cruz, CA, 95060, US')).not.toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Select or add a shipping address to continue.',
  );
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

it('clears prior default flags when a new default is saved locally', async () => {
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
  fireEvent.click(
    screen.getByRole('button', { name: 'Save mock default address' }),
  );

  await waitFor(() => {
    expect(screen.getByText('456 Oak Ave, San Jose, CA, 95112, US')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Santa Cruz, CA, 95060, US')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith(
      '/checkout/payment?addressId=cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    );
  });
});
