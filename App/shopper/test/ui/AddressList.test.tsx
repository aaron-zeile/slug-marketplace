import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import AddressList from '../../src/app/account/AddressList';
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from '../../src/app/account/actions';

vi.mock('../../src/app/account/actions', () => ({
  deleteAddressAction: vi.fn(),
  setDefaultAddressAction: vi.fn(),
  createAddressAction: vi.fn(),
  updateAddressAction: vi.fn(),
}));

const addresses = [
  {
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
  {
    id: 'addr-2',
    member: 'member-1',
    label: 'Work',
    line1: '456 Oak Ave',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95064',
    country: 'US',
    is_default: false,
    created_at: '2026-05-18T00:00:00.000Z',
    updated_at: '2026-05-18T00:00:00.000Z',
  },
];

it('sets another address as default', async () => {
  vi.mocked(setDefaultAddressAction).mockResolvedValue({
    success: true,
    data: { ...addresses[1], is_default: true },
  });

  const onChange = vi.fn();
  render(<AddressList addresses={addresses} onChange={onChange} />);

  fireEvent.click(screen.getByRole('button', { name: 'Set as default' }));

  await waitFor(() => {
    expect(setDefaultAddressAction).toHaveBeenCalledWith('addr-2');
    expect(onChange).toHaveBeenCalled();
  });
});

it('deletes an address', async () => {
  vi.mocked(deleteAddressAction).mockResolvedValue({ success: true });

  const onChange = vi.fn();
  render(<AddressList addresses={addresses} onChange={onChange} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

  await waitFor(() => {
    expect(deleteAddressAction).toHaveBeenCalledWith('addr-1');
    expect(onChange).toHaveBeenCalled();
  });
});

it('shows an error when delete fails', async () => {
  vi.mocked(deleteAddressAction).mockResolvedValue({
    success: false,
    error: 'Unable to delete address.',
  });

  render(<AddressList addresses={addresses} onChange={vi.fn()} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to delete address.',
  );
});

it('shows fallback error when delete fails without a message', async () => {
  vi.mocked(deleteAddressAction).mockResolvedValue({
    success: false,
  } as { success: false; error?: string });

  render(<AddressList addresses={addresses} onChange={vi.fn()} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete address.');
});

it('shows the edit form and can cancel editing', async () => {
  render(<AddressList addresses={addresses} onChange={vi.fn()} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

  expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
});

it('shows an error when set default fails', async () => {
  vi.mocked(setDefaultAddressAction).mockResolvedValue({
    success: false,
    error: 'Unable to set default address.',
  });

  render(<AddressList addresses={addresses} onChange={vi.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: 'Set as default' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to set default address.',
  );
});

it('shows fallback error when set default returns no data', async () => {
  vi.mocked(setDefaultAddressAction).mockResolvedValue({
    success: true,
  } as { success: true; data?: (typeof addresses)[number] });

  render(<AddressList addresses={addresses} onChange={vi.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: 'Set as default' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to set default address.',
  );
});

it('adds a new address from the add form', async () => {
  vi.mocked(createAddressAction).mockResolvedValue({
    success: true,
    data: {
      id: 'addr-3',
      member: 'member-1',
      label: 'Studio',
      line1: '789 Pine Rd',
      city: 'Santa Cruz',
      state: 'CA',
      postal_code: '95062',
      country: 'US',
      is_default: false,
      created_at: '2026-05-19T00:00:00.000Z',
      updated_at: '2026-05-19T00:00:00.000Z',
    },
  });

  const onChange = vi.fn();
  render(<AddressList addresses={addresses} onChange={onChange} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add new address' }));

  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '789 Pine Rd' },
  });
  fireEvent.change(screen.getByLabelText(/City/i), {
    target: { value: 'Santa Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
    target: { value: 'CA' },
  });
  fireEvent.change(screen.getByLabelText(/Postal code/i), {
    target: { value: '95062' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

  await waitFor(() => {
    expect(createAddressAction).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'addr-3', line1: '789 Pine Rd' }),
      ]),
    );
  });
  expect(screen.queryByRole('button', { name: 'Add new address' })).toBeInTheDocument();
});

it('cancels adding a new address', async () => {
  render(<AddressList addresses={addresses} onChange={vi.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add new address' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

  expect(screen.getByRole('button', { name: 'Add new address' })).toBeInTheDocument();
});

it('updates an existing address without changing default flags', async () => {
  vi.mocked(updateAddressAction).mockResolvedValue({
    success: true,
    data: {
      ...addresses[1],
      line1: '500 Cedar Ln',
      is_default: false,
    },
  });

  const onChange = vi.fn();
  render(<AddressList addresses={addresses} onChange={onChange} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '500 Cedar Ln' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

  await waitFor(() => {
    expect(onChange).toHaveBeenCalledWith([
      addresses[0],
      expect.objectContaining({ id: 'addr-2', line1: '500 Cedar Ln', is_default: false }),
    ]);
  });
});

it('updates an existing address from the edit form', async () => {
  vi.mocked(updateAddressAction).mockResolvedValue({
    success: true,
    data: {
      ...addresses[1],
      line1: '500 Cedar Ln',
      is_default: true,
    },
  });

  const onChange = vi.fn();
  render(<AddressList addresses={addresses} onChange={onChange} />);

  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
  fireEvent.change(screen.getByLabelText(/Address line 1/i), {
    target: { value: '500 Cedar Ln' },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: /Use as default shipping address/i }));
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

  await waitFor(() => {
    expect(updateAddressAction).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'addr-1', is_default: false }),
      expect.objectContaining({ id: 'addr-2', line1: '500 Cedar Ln', is_default: true }),
    ]);
  });
});

it('renders untitled label when address has no label', () => {
  render(
    <AddressList
      addresses={[
        {
          ...addresses[1],
          label: undefined,
        },
      ]}
      onChange={vi.fn()}
    />,
  );

  expect(screen.getByText('Address')).toBeInTheDocument();
});
