import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchSearchItemsAction } from '../src/app/search/[searchText]/actions';
import { Item } from '../src/item';

vi.mock('../src/item/service', () => ({
  getSearchItems: vi.fn(),
}));

import { getSearchItems } from '../src/item/service';

const mockItem: Item = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  seller: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  name: 'Desk Lamp',
  description: 'A bright lamp for late-night study sessions.',
  images: ['https://example.com/image1.jpg'],
  price: 24.99,
  created_at: '2026-05-11T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('returns success and data when getSearchItems resolves', async () => {
  vi.mocked(getSearchItems).mockResolvedValue([mockItem]);

  const result = await fetchSearchItemsAction('desk lamp');

  expect(result.success).toBe(true);
  expect(result.data).toEqual([mockItem]);
});

it('returns success false and error message when getSearchItems throws', async () => {
  vi.mocked(getSearchItems).mockRejectedValue(
    new Error('DB connection failed'),
  );

  const result = await fetchSearchItemsAction('desk lamp');

  expect(result.success).toBe(false);
  expect(result.error).toBe('DB connection failed');
});

it('calls getSearchItems with the correct search text', async () => {
  vi.mocked(getSearchItems).mockResolvedValue([mockItem]);

  await fetchSearchItemsAction('desk lamp');

  expect(getSearchItems).toHaveBeenCalledWith('desk lamp');
});
