import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

import * as loginActions from '../../src/app/buyer/login/actions';
import AccountAddressesPage from '../../src/app/account/addresses/page';
import AccountOrdersPage from '../../src/app/account/orders/page';
import * as orderActions from '../../src/app/order/actions';

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
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
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

it('redirects guests away from account addresses', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({});

  await expectRedirect(() => AccountAddressesPage(), '/');
});

it('renders account addresses when signed in', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });

  const tree = await AccountAddressesPage();
  render(tree);

  expect(screen.getByTestId('topbar')).toBeInTheDocument();
  expect(screen.getByTestId('account-addresses')).toBeInTheDocument();
});

it('redirects guests away from account orders', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({});

  await expectRedirect(() => AccountOrdersPage(), '/');
});

it('renders empty orders state', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.spyOn(orderActions, 'fetchCurrentUserOrdersAction').mockResolvedValue({
    success: true,
    data: [],
  });

  const tree = await AccountOrdersPage();
  render(tree);

  expect(screen.getByText('You do not have any orders yet.')).toBeInTheDocument();
});

it('renders an error when orders fail to load', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.spyOn(orderActions, 'fetchCurrentUserOrdersAction').mockResolvedValue({
    success: false,
    error: 'Nope',
  });

  const tree = await AccountOrdersPage();
  render(tree);

  expect(screen.getByRole('alert')).toHaveTextContent('Nope');
});

it('renders fallback error when orders fail without string message', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.spyOn(orderActions, 'fetchCurrentUserOrdersAction').mockResolvedValue({
    success: false,
    error: { code: 'UNKNOWN' },
  });

  const tree = await AccountOrdersPage();
  render(tree);

  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load orders.');
});

it('renders formatted order details for a single-item order', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.spyOn(orderActions, 'fetchCurrentUserOrdersAction').mockResolvedValue({
    success: true,
    data: [
      {
        id: 'order-1',
        buyer: sessionUser.id,
        purchaseAmount: 12.5,
        orderedAt: '2026-05-17T19:23:00.000Z',
        address: {
          line1: '123 Main St',
          line2: 'Apt 9',
          city: 'Santa Cruz',
          state: 'CA',
          postalCode: '95060',
          country: 'US',
        },
        items: [{ itemId: 'item-1', sellerId: 'seller-1' }],
        lineItems: [
          {
            itemId: 'item-1',
            sellerId: 'seller-1',
            quantity: 1,
            name: 'Vintage Lamp',
            image: 'https://example.com/lamp.jpg',
            price: 12.5,
          },
        ],
      },
    ],
  });

  const tree = await AccountOrdersPage();
  render(tree);

  expect(screen.getByText('Order order-1')).toBeInTheDocument();
  expect(screen.getByText('$12.50')).toBeInTheDocument();
  expect(screen.getByText('1 item')).toBeInTheDocument();
  expect(
    screen.getByText('Shipping to: 123 Main St, Apt 9, Santa Cruz, CA, 95060, US'),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /view item breakdown/i })).toBeInTheDocument();
});

it('renders plural item count and expands item breakdown', async () => {
  const user = userEvent.setup();
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.spyOn(orderActions, 'fetchCurrentUserOrdersAction').mockResolvedValue({
    success: true,
    data: [
      {
        id: 'order-2',
        buyer: sessionUser.id,
        purchaseAmount: 30,
        orderedAt: '2026-05-18T10:00:00.000Z',
        address: {
          line1: '55 Market St',
          line2: '',
          city: 'San Jose',
          state: 'CA',
          postalCode: '95112',
          country: 'US',
        },
        items: [
          { itemId: 'item-2', sellerId: 'seller-1' },
          { itemId: 'item-2', sellerId: 'seller-1' },
          { itemId: 'item-3', sellerId: 'seller-2' },
        ],
        lineItems: [
          {
            itemId: 'item-2',
            sellerId: 'seller-1',
            quantity: 2,
            name: 'Desk Chair',
            image: 'https://example.com/chair.jpg',
            price: 10,
          },
          {
            itemId: 'item-3',
            sellerId: 'seller-2',
            quantity: 1,
            name: 'Monitor Stand',
            image: 'https://example.com/stand.jpg',
            price: 20,
          },
        ],
      },
    ],
  });

  const tree = await AccountOrdersPage();
  render(tree);

  expect(screen.getByText('3 items')).toBeInTheDocument();
  expect(
    screen.getByText('Shipping to: 55 Market St, San Jose, CA, 95112, US'),
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /view item breakdown/i }));

  expect(screen.getByText('Desk Chair')).toBeInTheDocument();
  expect(screen.getByText('Monitor Stand')).toBeInTheDocument();
  expect(screen.getByText('Qty 2')).toBeInTheDocument();
  expect(screen.getByText('Qty 1')).toBeInTheDocument();
  expect(screen.getAllByText('$20.00').length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText('Order total')).toBeInTheDocument();
});
