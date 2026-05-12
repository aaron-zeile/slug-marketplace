import { expect, it, vi, describe, beforeEach } from 'vitest';
import {
  fetchItemAction,
  fetchRandomItemsAction,
} from '../src/app/items/[id]/actions';
import { Item } from '../src/item';

vi.mock('../src/item/service', () => ({
  getItem: vi.fn(),
  getRandomItems: vi.fn(),
}));

import { getItem, getRandomItems } from '../src/item/service';

const mockItem: Item = {
  id: '550e8400-e29b-41d4-a716-446655440000',
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchItemAction', () => {
  it('returns success and data when getItem resolves', async () => {
    vi.mocked(getItem).mockResolvedValue(mockItem);

    const result = await fetchItemAction(mockItem.id);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockItem);
  });

  it('returns success false and error message when getItem throws', async () => {
    vi.mocked(getItem).mockRejectedValue(new Error('DB connection failed'));

    const result = await fetchItemAction(mockItem.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
  });

  it('calls getItem with the correct id', async () => {
    vi.mocked(getItem).mockResolvedValue(mockItem);

    await fetchItemAction(mockItem.id);

    expect(getItem).toHaveBeenCalledWith(mockItem.id);
  });
});

describe('fetchRandomItemsAction', () => {
  it('returns success and data when getRandomItems resolves', async () => {
    vi.mocked(getRandomItems).mockResolvedValue([mockItem]);

    const result = await fetchRandomItemsAction(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([mockItem]);
  });

  it('returns success false and error message when getRandomItems throws', async () => {
    vi.mocked(getRandomItems).mockRejectedValue(
      new Error('DB connection failed'),
    );

    const result = await fetchRandomItemsAction(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
  });

  it('calls getRandomItems with the correct count', async () => {
    vi.mocked(getRandomItems).mockResolvedValue([mockItem]);

    await fetchRandomItemsAction(5);

    expect(getRandomItems).toHaveBeenCalledWith(5);
  });
});
