import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, expect, it, describe, vi } from 'vitest';

import FrontPage from '../../src/app/FrontPage';
import { setLoginCookieStoreForTest } from '../../src/app/buyer/login/cookies';
import {
  getItemsServiceGraphqlUrl,
  registerItemsServiceHooks,
  releaseFetchStubForServiceTests,
  resetItemsServiceDatabaseForTests,
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

function sessionCookieStore() {
  return {
    get: (name: string) =>
      name === 'session' ? { value: 'test-session-token' } : undefined,
    set: () => {},
    delete: () => {},
  };
}

function stubViewedItemsFetchFailure() {
  const realFetch = globalThis.fetch.bind(globalThis);
  const itemsGraphqlUrl = getItemsServiceGraphqlUrl();

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const body = typeof init?.body === 'string' ? init.body : '';

      if (url.includes('/login/check')) {
        const headers = init?.headers;
        const authHeader =
          headers instanceof Headers
            ? headers.get('Authorization')
            : headers && typeof headers === 'object' && 'Authorization' in headers
              ? (headers as { Authorization?: string }).Authorization
              : undefined;

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }

        return new Response(JSON.stringify(testUser), { status: 200 });
      }

      if (
        url !== itemsGraphqlUrl &&
        body.includes('viewedItems') &&
        !body.includes('recordViewedItem')
      ) {
        return new Response('Service Unavailable', { status: 503 });
      }

      return realFetch(input, init);
    }),
  );
}

function stubViewedItemsFetch(itemIds: string[]) {
  const realFetch = globalThis.fetch.bind(globalThis);
  const itemsGraphqlUrl = getItemsServiceGraphqlUrl();

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const body = typeof init?.body === 'string' ? init.body : '';

      if (url.includes('/login/check')) {
        const headers = init?.headers;
        const authHeader =
          headers instanceof Headers
            ? headers.get('Authorization')
            : headers && typeof headers === 'object' && 'Authorization' in headers
              ? (headers as { Authorization?: string }).Authorization
              : undefined;

        if (!authHeader?.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }

        return new Response(JSON.stringify(testUser), { status: 200 });
      }

      if (
        url !== itemsGraphqlUrl &&
        body.includes('viewedItems') &&
        !body.includes('recordViewedItem')
      ) {
        return new Response(
          JSON.stringify({
            data: {
              viewedItems: itemIds.map((itemId, index) => ({
                id: `11111111-1111-4111-8111-${(index + 1).toString().padStart(12, '0')}`,
                member: testUser.id,
                item: itemId,
                viewedAt: '2026-06-03T12:00:00.000Z',
              })),
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return realFetch(input, init);
    }),
  );
}

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
    releaseFetchStubForServiceTests();
  });

  afterEach(() => {
    setLoginCookieStoreForTest(undefined);
    vi.unstubAllGlobals();
    releaseFetchStubForServiceTests();
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
    setLoginCookieStoreForTest(async () => sessionCookieStore());
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

  it('deduplicates buy again items from multiple orders', async () => {
    setLoginCookieStoreForTest(async () => sessionCookieStore());
    await seedBuyerOrderForItem(
      testUser.id,
      buyAgainItem.id,
      buyAgainItem.seller.id,
    );
    await seedBuyerOrderForItem(
      testUser.id,
      buyAgainItem.id,
      buyAgainItem.seller.id,
    );

    render(<FrontPage />);

    await waitFor(() => {
      const carousel = screen.getByLabelText('Carousel Buy again');

      expect(
        within(carousel).getAllByText('Previously Bought Headphones'),
      ).toHaveLength(1);
    });
  });

  it('omits unavailable items from the buy again carousel', async () => {
    setLoginCookieStoreForTest(async () => sessionCookieStore());
    await seedBuyerOrderForItem(
      testUser.id,
      buyAgainItem.id,
      buyAgainItem.seller.id,
    );
    await seedBuyerOrderForItem(
      testUser.id,
      '00000000-0000-0000-0000-000000009999',
      buyAgainItem.seller.id,
    );

    render(<FrontPage />);

    await waitFor(() => {
      const carousel = screen.getByLabelText('Carousel Buy again');

      expect(
        within(carousel).getByText('Previously Bought Headphones'),
      ).toBeDefined();
      expect(
        within(carousel).queryByText('Item 00000000-0000-0000-0000-000000009999'),
      ).toBeNull();
    });
  });

  it('renders a recently viewed carousel when viewed items exist', async () => {
    setLoginCookieStoreForTest(async () => sessionCookieStore());
    stubViewedItemsFetch([buyAgainItem.id]);

    render(<FrontPage />);

    await waitFor(() => {
      const carousel = screen.getByLabelText('Carousel Recently viewed');

      expect(
        within(carousel).getByText('Previously Bought Headphones'),
      ).toBeDefined();
    });
  });

  it('hides recently viewed when viewed items cannot be loaded', async () => {
    setLoginCookieStoreForTest(async () => sessionCookieStore());
    stubViewedItemsFetchFailure();

    render(<FrontPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Carousel Featured items')).toBeDefined();
      expect(screen.queryByLabelText('Carousel Recently viewed')).toBeNull();
    });
  });

  it('renders the empty spotlight state when the catalog has no items', async () => {
    await resetItemsServiceDatabaseForTests();
    releaseFetchStubForServiceTests();

    render(<FrontPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Our spotlight pick is loading soon. Explore featured items below.',
        ),
      ).toBeDefined();
      expect(screen.queryByLabelText('Carousel Featured items')).toBeNull();
    });
  });
});
