import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const postgresMock = vi.fn(() => 'mock-sql-client');

vi.mock('postgres', () => ({
  default: postgresMock,
}));

describe('lib/db', () => {
  const originalUrl = process.env.ADMIN_DATABASE_URL;

  beforeEach(() => {
    vi.resetModules();
    postgresMock.mockClear();
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.ADMIN_DATABASE_URL;
    } else {
      process.env.ADMIN_DATABASE_URL = originalUrl;
    }
  });

  it('throws when ADMIN_DATABASE_URL is not set', async () => {
    delete process.env.ADMIN_DATABASE_URL;

    await expect(import('@/lib/db')).rejects.toThrow(
      'ADMIN_DATABASE_URL environment variable is not set',
    );
  });

  it('creates a postgres client when ADMIN_DATABASE_URL is set', async () => {
    process.env.ADMIN_DATABASE_URL = 'postgresql://user:pass@localhost:5432/admin';

    const module = await import('@/lib/db');

    expect(postgresMock).toHaveBeenCalledWith(
      'postgresql://user:pass@localhost:5432/admin',
    );
    expect(module.default).toBe('mock-sql-client');
  });
});
