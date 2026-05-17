import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getItem, getSearchItems } from '../src/item/service';

const itemId = '550e8400-e29b-41d4-a716-446655440000';

const item = {
  id: itemId,
  seller: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  name: 'Throw Pillow 336',
  description: 'Sleek modern design that fits seamlessly into any lifestyle.',
  images: ['https://example.com/image1.jpg'],
  price: 894.74,
  created_at: '2025-10-07T18:56:33.000Z',
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
});

describe('getItem', () => {
it('fetches and returns a parsed item', async () => {
  mockFetchResponse({
    data: { item },
  });

  const result = await getItem(itemId);

  expect(result).toEqual(item);
});

it('sends the item id in the GraphQL variables', async () => {
  mockFetchResponse({
    data: { item },
  });

  await getItem(itemId);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(JSON.parse(options?.body as string)).toEqual(
    expect.objectContaining({
      variables: {
        input: { id: itemId },
      },
    }),
  );
});

it('throws when the item response is not ok', async () => {
  mockFetchResponse({}, false, 'Service Unavailable');

  await expect(getItem(itemId)).rejects.toThrow(
    'Failed to fetch item: Service Unavailable',
  );
});

it('throws when item GraphQL returns errors', async () => {
  mockFetchResponse({
    errors: [{ message: 'Item not found' }],
  });

  await expect(getItem(itemId)).rejects.toThrow('GraphQL error');
});
});

describe('getSearchItems', () => {
  const searchText = 'desk lamp';

  it('fetches and returns parsed search results', async () => {
    mockFetchResponse({
      data: { searchItems: [item] },
    });

    const result = await getSearchItems(searchText);

    expect(result).toEqual([item]);
  });

  it('sends the search text in the GraphQL variables', async () => {
    mockFetchResponse({
      data: { searchItems: [] },
    });

    await getSearchItems(searchText);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options?.body as string)).toEqual(
      expect.objectContaining({
        variables: {
          input: { searchText },
        },
      }),
    );
  });

  it('throws when the search response is not ok', async () => {
    mockFetchResponse({}, false, 'Service Unavailable');

    await expect(getSearchItems(searchText)).rejects.toThrow(
      'Failed to fetch search items: Service Unavailable',
    );
  });

  it('throws when search GraphQL returns errors', async () => {
    mockFetchResponse({
      errors: [{ message: 'Search failed' }],
    });

    await expect(getSearchItems(searchText)).rejects.toThrow('GraphQL error');
  });
});
