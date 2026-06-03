import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import * as loginActions from '../../src/app/buyer/login/actions';
import { fetchCurrentUserOrdersAction } from '../../src/app/order/actions';
import AccountOrdersPage from '../../src/app/account/orders/page';
import type { OrderWithDetails } from '../../src/order/enrich';

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

vi.mock('../../src/app/order/actions', () => ({
  fetchCurrentUserOrdersAction: vi.fn(),
}));

const sessionUser = {
  id: '7b355067-1dee-4b9a-a87a-fa745332ecf8',
  email: 'buyer@example.com',
  name: 'Buyer',
};

const sampleOrder: OrderWithDetails = {
  id: 'order-1',
  buyer: sessionUser.id,
  status: 'ordered',
  purchaseAmount: 25,
  orderedAt: '2026-05-17T19:23:00.000Z',
  address: {
    line1: '123 Main St',
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
      price: 25,
    },
  ],
};

beforeEach(() => {
  redirectMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url });
  });
  vi.restoreAllMocks();
  vi.mocked(fetchCurrentUserOrdersAction).mockReset();
});

async function expectRedirect(run: () => Promise<unknown>, url: string) {
  await expect(run()).rejects.toMatchObject({ url });
  expect(redirectMock).toHaveBeenCalledWith(url);
}

it('redirects guests away from the account orders page', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({});

  await expectRedirect(() => AccountOrdersPage(), '/');
});

it('renders order history when orders load successfully', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.mocked(fetchCurrentUserOrdersAction).mockResolvedValue({
    success: true,
    data: [sampleOrder],
  });

  const tree = await AccountOrdersPage();

  render(tree);

  expect(screen.getByTestId('topbar')).toBeInTheDocument();
  expect(screen.getByText('Orders')).toBeInTheDocument();
  expect(screen.getByText('Order order-1')).toBeInTheDocument();
});

it('shows an empty state when the buyer has no orders', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.mocked(fetchCurrentUserOrdersAction).mockResolvedValue({
    success: true,
    data: [],
  });

  const tree = await AccountOrdersPage();

  render(tree);

  expect(
    screen.getByText('You do not have any orders yet.'),
  ).toBeInTheDocument();
});

it('shows an error when orders fail to load', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.mocked(fetchCurrentUserOrdersAction).mockResolvedValue({
    success: false,
    error: 'Service unavailable',
  });

  const tree = await AccountOrdersPage();

  render(tree);

  expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
});

it('shows fallback error text when load fails without a message', async () => {
  vi.spyOn(loginActions, 'checkLogin').mockResolvedValue({ user: sessionUser });
  vi.mocked(fetchCurrentUserOrdersAction).mockResolvedValue({
    success: false,
  });

  const tree = await AccountOrdersPage();

  render(tree);

  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load orders.');
});
