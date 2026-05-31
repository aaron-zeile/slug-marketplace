import { beforeEach, expect, it, vi } from 'vitest';

import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  getWishlistItems,
  removeFromWishlist,
} from '../../src/wishlist/service';
import { getItem } from '../../src/item/service';

vi.mock('../../src/item/service', () => ({
  getItem: vi.fn(),
}));

const member = '11111111-1111-4111-8111-111111111111';
const itemId = '22222222-2222-4222-8222-222222222222';

const wishlistEntry = {
  id: '33333333-3333-4333-8333-333333333333',
  member,
  item: itemId,
  createdAt: new Date('2026-05-11T12:00:00.000Z'),
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

it('fetches wishlist entries', async () => {
  mockFetchResponse({
    data: {
      wishlist: [wishlistEntry],
    },
  });

  await getWishlist(member);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member },
      },
    }),
  );
});

it('throws when the wishlist response is not ok', async () => {
  mockFetchResponse({}, false, 'Service Unavailable');

  await expect(getWishlist(member)).rejects.toThrow(
    'Failed to fetch wishlist: Service Unavailable',
  );
});

it('throws when wishlist GraphQL returns errors', async () => {
  mockFetchResponse({
    errors: [{ message: 'Nope' }],
  });

  await expect(getWishlist(member)).rejects.toThrow('GraphQL error');
});

it('hydrates wishlist entries with item details', async () => {
  mockFetchResponse({
    data: {
      wishlist: [wishlistEntry],
    },
  });

  const result = await getWishlistItems(member);

  expect(result).toEqual([
    {
      id: wishlistEntry.id,
      member,
      item,
      createdAt: wishlistEntry.createdAt,
    },
  ]);
});

it('adds an item to the wishlist', async () => {
  mockFetchResponse({
    data: {
      addToWishlist: wishlistEntry,
    },
  });

  await addToWishlist(member, itemId);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member, item: itemId },
      },
    }),
  );
});

it('removes an item from the wishlist', async () => {
  mockFetchResponse({
    data: {
      removeFromWishlist: true,
    },
  });

  await removeFromWishlist(member, itemId);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member, item: itemId },
      },
    }),
  );
});

it('clears the wishlist for a member', async () => {
  mockFetchResponse({
    data: {
      clearWishlist: true,
    },
  });

  await clearWishlist(member);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member },
      },
    }),
  );
});
