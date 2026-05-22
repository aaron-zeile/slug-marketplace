import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import AddressList from '../../src/app/account/AddressList';
import {
  deleteAddressAction,
  setDefaultAddressAction,
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
