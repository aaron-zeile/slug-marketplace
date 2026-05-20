import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from '../src/db';
import { deleteReviewById } from '../src/review/db';

describe('deleteReviewById', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
  });

  it('returns true when a row is deleted', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 1 } as never);

    await expect(
      deleteReviewById(
        '00000000-0000-0000-0000-000000000001',
        'user-id',
      ),
    ).resolves.toBe(true);
  });

  it('returns false when rowCount is zero', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 0 } as never);

    await expect(
      deleteReviewById(
        '00000000-0000-0000-0000-000000000001',
        'user-id',
      ),
    ).resolves.toBe(false);
  });

  it('returns false when rowCount is undefined', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({} as never);

    await expect(
      deleteReviewById(
        '00000000-0000-0000-0000-000000000001',
        'user-id',
      ),
    ).resolves.toBe(false);
  });
});
