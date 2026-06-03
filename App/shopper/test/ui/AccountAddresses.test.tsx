import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AccountAddresses from '../../src/app/account/addresses/AccountAddresses';
import { listAddressesAction } from '../../src/app/account/actions';

vi.mock('../../src/app/account/actions', () => ({
  listAddressesAction: vi.fn(),
}));

describe('AccountAddresses', () => {
  it('shows loading state while addresses are fetched', () => {
    vi.mocked(listAddressesAction).mockImplementation(
      () => new Promise(() => undefined),
    );

    render(<AccountAddresses />);

    expect(screen.getByText('Loading addresses...')).toBeInTheDocument();
  });

  it('renders address list after successful load', async () => {
    vi.mocked(listAddressesAction).mockResolvedValue({
      success: true,
      data: [
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
      ],
    });

    render(<AccountAddresses />);

    expect(
      await screen.findByText('123 Main St, Santa Cruz, CA, 95060, US'),
    ).toBeInTheDocument();
  });

  it('shows fallback error text when load fails without message', async () => {
    vi.mocked(listAddressesAction).mockResolvedValue({
      success: false,
    });

    render(<AccountAddresses />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load addresses.',
    );
  });

  it('shows explicit error text when load fails with message', async () => {
    vi.mocked(listAddressesAction).mockResolvedValue({
      success: false,
      error: 'Session expired.',
    });

    render(<AccountAddresses />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Session expired.');
  });

  it('renders an empty address list when the user has no addresses', async () => {
    vi.mocked(listAddressesAction).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<AccountAddresses />);

    expect(await screen.findByRole('button', { name: 'Add new address' })).toBeInTheDocument();
  });
});
