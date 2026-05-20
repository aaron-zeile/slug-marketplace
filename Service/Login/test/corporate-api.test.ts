import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { AuthService, setAuthDbForTest } from '../service';

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-secret';
});

afterEach(() => {
  setAuthDbForTest(undefined);
  delete process.env.AUTH_SECRET;
});

test('createCorporateApiKey stores a hashed key and returns the raw key once', async () => {
  const authToken = jwt.sign(
    {
      id: 'seller-123',
      email: 'seller@example.com',
      name: 'Seller Name',
    },
    'test-secret',
  );

  setAuthDbForTest({
    async query<T>(sql: string, params?: unknown[]) {
      return {
        rows: [
          {
            id: 'key-123',
            name: params?.[1],
            key_hash: params?.[2],
            created_at: new Date('2026-05-17T00:00:00.000Z'),
            seller_id: params?.[0],
            email: '',
          },
        ] as T[],
      };
    },
  });

  const result = await new AuthService().createCorporateApiKey(
    `Bearer ${authToken}`,
    { name: ' Bulk uploader ' },
  );

  expect(result.name).toBe('Bulk uploader');
});

test('createCorporateApiKey rejects blank key names', async () => {
  const authToken = jwt.sign(
    {
      id: 'seller-123',
      email: 'seller@example.com',
      name: 'Seller Name',
    },
    'test-secret',
  );

  setAuthDbForTest({
    async query<T>() {
      return { rows: [] as T[] };
    },
  });

  await expect(
    new AuthService().createCorporateApiKey(`Bearer ${authToken}`, {
      name: '   ',
    }),
  ).rejects.toThrow('API key name is required');
});

test('checkCorporateApiKey returns seller identity and a forwardable session token', async () => {
  setAuthDbForTest({
    async query<T>(sql: string, params?: unknown[]) {
      return {
        rows: [
          {
            id: 'key-123',
            name: 'Corporate Seller',
            key_hash: params?.[0],
            created_at: new Date('2026-05-17T00:00:00.000Z'),
            seller_id: 'seller-123',
            email: 'seller@example.com',
          },
        ] as T[],
      };
    },
  });

  const result = await new AuthService().checkCorporateApiKey(
    'Bearer slug_sk_valid',
  );

  expect(result.id).toBe('seller-123');
});

test('checkCorporateApiKey rejects invalid keys', async () => {
  setAuthDbForTest({
    async query<T>() {
      return { rows: [] as T[] };
    },
  });

  await expect(
    new AuthService().checkCorporateApiKey('Bearer slug_sk_bad'),
  ).rejects.toThrow('Invalid API key');
});

test('checkCorporateApiKey rejects missing bearer tokens', async () => {
  setAuthDbForTest({
    async query<T>() {
      return { rows: [] as T[] };
    },
  });

  await expect(
    new AuthService().checkCorporateApiKey(undefined),
  ).rejects.toThrow('Missing bearer token');
});
