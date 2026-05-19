import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from '../src/db';
import { insertReview } from '../src/review/db';

describe('insertReview', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
  });

  it('throws Failed to create review when INSERT returns no row', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      insertReview({
        itemId: '00000000-0000-0000-0000-000000000001',
        content: 'ok',
        rating: 5,
        user: { id: 'u1', name: 'User' },
      }),
    ).rejects.toThrow('Failed to create review');
  });
});
