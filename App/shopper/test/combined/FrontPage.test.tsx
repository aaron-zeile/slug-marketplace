import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, expect, it, describe } from 'vitest';

import FrontPage from '../../src/app/FrontPage';
import { setLoginCookieStoreForTest } from '../../src/app/buyer/login/cookies';
import {
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  seedItemsServiceItem,
  testUser,
} from '../support/itemsService';
import {
  registerOrderServiceHooks,
  resetOrderDatabase,
  seedBuyerOrderForItem,
} from '../support/orderService';

registerOrderServiceHooks();
registerItemsServiceHooks();

describe('FrontPage', () => {
  let buyAgainItem: Awaited<ReturnType<typeof seedItemsServiceItem>>;

  beforeAll(async () => {
    await seedItemsServiceItem({
      name: 'Headphones',
      description: 'Wireless headphones for the home page.',
      images: ['https://example.com/headphones.jpg'],
      price: 59.99,
    });
    await seedItemsServiceItem({
      name: 'Backpack',
      description: 'A sturdy backpack.',
      images: ['https://example.com/backpack.jpg'],
      price: 34.5,
    });
    await seedItemsServiceItem({
      name: 'Desk Lamp',
      description: 'A bright desk lamp.',
      images: ['https://example.com/lamp.jpg'],
      price: 18.25,
    });
    buyAgainItem = await seedItemsServiceItem({
      name: 'Previously Bought Headphones',
      description: 'An item that should appear in Buy again.',
      images: ['https://example.com/ordered-headphones.jpg'],
      price: 59.99,
    });
    releaseFetchStubForServiceTests();
  });

  beforeEach(async () => {
    await resetOrderDatabase();
    setLoginCookieStoreForTest(undefined);
  });

  afterEach(() => {
    setLoginCookieStoreForTest(undefined);
  });

  it('renders item card', async () => {
    render(<FrontPage />);

    await waitFor(() => {
      expect(screen.getByText('Headphones')).toBeDefined();
    });
  });

  it('renders carousel items', async () => {
    render(<FrontPage />);

    await waitFor(() => {
      const carousel = screen.getByLabelText('Carousel Featured items');

      expect(within(carousel).getByText('Desk Lamp')).toBeDefined();
      expect(within(carousel).getAllByText('Backpack').length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  it('renders category links above featured items', async () => {
    render(<FrontPage />);

    const categoryCarousel = screen.getByLabelText('Carousel Shop by category');

    expect(within(categoryCarousel).getByText('Electronics')).toBeDefined();
  });

  it('renders a buy again carousel from previous orders', async () => {
    setLoginCookieStoreForTest(async () => ({
      get: (name: string) =>
        name === 'session' ? { value: 'test-session-token' } : undefined,
      set: () => {},
      delete: () => {},
    }));
    await seedBuyerOrderForItem(
      testUser.id,
      buyAgainItem.id,
      buyAgainItem.seller.id,
    );

    render(<FrontPage />);

    await waitFor(() => {
      const carousel = screen.getByLabelText('Carousel Buy again');

      expect(
        within(carousel).getByText('Previously Bought Headphones'),
      ).toBeDefined();
      expect(
        within(carousel).getAllByText('Previously Bought Headphones'),
      ).toHaveLength(1);
    });
  });
});
