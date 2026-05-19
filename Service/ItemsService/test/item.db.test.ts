import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from '../src/db';
import { createItem, deleteItembyID } from '../src/item/db';

describe('createItem', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
  });

  it('throws when INSERT returns no row', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      createItem({
        input: {
          name: 'Ghost Item',
          description: 'Never persisted.',
          images: [],
          price: 1,
        },
        seller: { id: 'seller-id', name: 'Seller' },
      }),
    ).rejects.toThrow('Failed to create item');
  });
});

describe('deleteItembyID', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
  });

  it('returns true when a row is deleted', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 1 } as never);

    await expect(
      deleteItembyID({ id: '00000000-0000-0000-0000-000000000001' }, 'seller-id'),
    ).resolves.toBe(true);
  });

  it('returns false when rowCount is zero', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 0 } as never);

    await expect(
      deleteItembyID({ id: '00000000-0000-0000-0000-000000000001' }, 'seller-id'),
    ).resolves.toBe(false);
  });

  it('returns false when rowCount is undefined', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({} as never);

    await expect(
      deleteItembyID({ id: '00000000-0000-0000-0000-000000000001' }, 'seller-id'),
    ).resolves.toBe(false);
  });
});
