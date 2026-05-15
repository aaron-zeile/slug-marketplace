import { beforeEach, expect, it, vi } from 'vitest';

import {
  addToCart,
  getCart,
  getCartItems,
  removeFromCart,
} from '../src/cart/service';
import { getItem } from '../src/item/service';

vi.mock('../src/item/service', () => ({
  getItem: vi.fn(),
}));

const member = '11111111-1111-4111-8111-111111111111';
const itemId = '22222222-2222-4222-8222-222222222222';

const cartEntry = {
  id: '33333333-3333-4333-8333-333333333333',
  member,
  item: itemId,
  quantity: 2,
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

it('fetches cart entries', async () => {
  mockFetchResponse({
    data: {
      cart: [cartEntry],
    },
  });

  await getCart(member);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member },
      },
    }),
  );
});

it('throws when the cart response is not ok', async () => {
  mockFetchResponse({}, false, 'Service Unavailable');

  await expect(getCart(member)).rejects.toThrow(
    'Failed to fetch cart: Service Unavailable',
  );
});

it('throws when cart GraphQL returns errors', async () => {
  mockFetchResponse({
    errors: [{ message: 'Nope' }],
  });

  await expect(getCart(member)).rejects.toThrow('GraphQL error');
});

it('hydrates cart entries with item details', async () => {
  mockFetchResponse({
    data: {
      cart: [cartEntry],
    },
  });

  const result = await getCartItems(member);

  expect(result).toEqual([
    {
      id: cartEntry.id,
      member,
      item,
      quantity: cartEntry.quantity,
    },
  ]);
});

it('adds an item to the cart', async () => {
  mockFetchResponse({
    data: {
      addToCart: cartEntry,
    },
  });

  await addToCart(member, itemId);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member, item: itemId },
      },
    }),
  );
});

it('removes an item from the cart', async () => {
  mockFetchResponse({
    data: {
      removeFromCart: true,
    },
  });

  await removeFromCart(member, itemId);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { member, item: itemId },
      },
    }),
  );
});
