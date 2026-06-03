import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  getViewedItemDetails,
  getViewedItems,
  recordViewedItem,
} from '../../src/viewed/service';
import { getItem } from '../../src/item/service';

vi.mock('../../src/item/service', () => ({
  getItem: vi.fn(),
}));

const member = '11111111-1111-4111-8111-111111111111';
const itemId = '22222222-2222-4222-8222-222222222222';

const viewedEntry = {
  id: '33333333-3333-4333-8333-333333333333',
  member,
  item: itemId,
  viewedAt: '2026-05-11T12:00:00.000Z',
};

const item = {
  id: itemId,
  seller: {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Avery Parks',
  },
  name: 'GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card',
  description:
    '12GB 192-bit GDDR7, PCIe 5.0, compact graphics card built for gaming and creative work.',
  images: [
    'https://m.media-amazon.com/images/I/71ii5ow8slL._AC_UY218_.jpg',
  ],
  price: 635.99,
  quantity: 1,
  created_at: '2026-05-11T12:00:00.000Z',
  status: 'active' as const,
};

function mockFetchResponse(body: unknown, ok = true, statusText = 'OK') {
  vi.mocked(fetch).mockResolvedValue({
    ok,
    statusText,
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  vi.mocked(getItem).mockResolvedValue(item);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('fetches viewed item entries for a member', async () => {
  mockFetchResponse({
    data: {
      viewedItems: [viewedEntry],
    },
  });

  const result = await getViewedItems(member);

  expect(result).toEqual([
    {
      ...viewedEntry,
      viewedAt: new Date(viewedEntry.viewedAt),
    },
  ]);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member },
      },
    }),
  );
});

it('throws when the viewed items response is not ok', async () => {
  mockFetchResponse({}, false, 'Service Unavailable');

  await expect(getViewedItems(member)).rejects.toThrow(
    'Failed to fetch viewed items: Service Unavailable',
  );
});

it('throws when viewed items GraphQL returns errors', async () => {
  mockFetchResponse({
    errors: [{ message: 'Nope' }],
  });

  await expect(getViewedItems(member)).rejects.toThrow('GraphQL error');
});

it('uses the default cart service URL when CART_SERVICE_URL is unset', async () => {
  const previousUrl = process.env.CART_SERVICE_URL;
  delete process.env.CART_SERVICE_URL;

  mockFetchResponse({
    data: {
      viewedItems: [],
    },
  });

  try {
    await getViewedItems(member);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
      'http://localhost:4600/graphql',
    );
  } finally {
    process.env.CART_SERVICE_URL = previousUrl;
  }
});

it('hydrates viewed entries with item details', async () => {
  mockFetchResponse({
    data: {
      viewedItems: [viewedEntry],
    },
  });

  const result = await getViewedItemDetails(member);

  expect(result).toEqual([
    {
      id: viewedEntry.id,
      member,
      item,
      viewedAt: new Date(viewedEntry.viewedAt),
    },
  ]);
  expect(getItem).toHaveBeenCalledWith(itemId);
});

it('records a viewed item for a member', async () => {
  mockFetchResponse({
    data: {
      recordViewedItem: viewedEntry,
    },
  });

  const result = await recordViewedItem(member, itemId);

  expect(result).toEqual({
    ...viewedEntry,
    viewedAt: new Date(viewedEntry.viewedAt),
  });

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member, item: itemId },
      },
    }),
  );
});
