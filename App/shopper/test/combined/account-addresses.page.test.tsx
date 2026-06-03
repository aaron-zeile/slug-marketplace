import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import * as loginActions from '../../src/app/buyer/login/actions';
import AccountAddressesPage from '../../src/app/account/addresses/page';

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  );
  return {
    ...actual,
    redirect: redirectMock,
  };
});

vi.mock('../../src/app/buyer/topbar', () => ({
  default: () => <div data-testid="topbar" />,
}));

vi.mock('../../src/app/account/addresses/AccountAddresses', () => ({
  default: () => <div data-testid="account-addresses" />,
}));

const sessionUser = {
  id: '7b355067-1dee-4b9a-a87a-fa745332ecf8',
  email: 'buyer@example.com',
  name: 'Buyer',
};

beforeEach(() => {
  redirectMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url });
  });
  vi.restoreAllMocks();
});

async function expectRedirect(run: () => Promise<unknown>, url: string) {
  await expect(run()).rejects.toMatchObject({ url });
  expect(redirectMock).toHaveBeenCalledWith(url);
}

it('redirects guests away from the account addresses page', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({});

  await expectRedirect(() => AccountAddressesPage(), '/');
});

it('renders the addresses page for signed-in users', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });

  const tree = await AccountAddressesPage();

  render(tree);

  expect(screen.getByTestId('topbar')).toBeInTheDocument();
  expect(screen.getByTestId('account-addresses')).toBeInTheDocument();
});
