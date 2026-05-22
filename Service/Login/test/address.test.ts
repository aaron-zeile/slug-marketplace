import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { AddressService } from '../address-service';
import { setAuthDbForTest } from '../service';

const memberId = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-secret';
});

afterEach(() => {
  setAuthDbForTest(undefined);
  delete process.env.AUTH_SECRET;
});

interface AddressData {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

function createMockDb() {
  const addresses: Array<{
    id: string;
    member: string;
    data: AddressData;
  }> = [];

  return {
    addresses,
    async query<T>(sql: string, params?: unknown[]) {
      if (sql.includes('COUNT(*)')) {
        const count = addresses.filter((row) => row.member === params?.[0]).length;
        return { rows: [{ count: String(count) }] as T[] };
      }

      if (sql.includes("jsonb_set(data, '{is_default}'")) {
        for (const row of addresses) {
          if (row.member === params?.[0]) {
            row.data.is_default = false;
          }
        }
        return { rows: [] as T[] };
      }

      if (sql.startsWith('INSERT INTO shipping_address')) {
        const data = JSON.parse(params?.[1] as string) as AddressData;
        const row = {
          id: `addr-${addresses.length + 1}`,
          member: params?.[0] as string,
          data,
        };
        addresses.push(row);
        return { rows: [row] as T[] };
      }

      if (sql.startsWith('SELECT') && sql.includes('WHERE member = $1') && !sql.includes('AND member')) {
        const rows = addresses
          .filter((row) => row.member === params?.[0])
          .sort((left, right) => {
            if (left.data.is_default !== right.data.is_default) {
              return left.data.is_default ? -1 : 1;
            }
            return left.data.created_at.localeCompare(right.data.created_at);
          });
        return { rows: rows as T[] };
      }

      if (sql.includes('WHERE id = $1 AND member = $2') && sql.startsWith('SELECT')) {
        const row = addresses.find(
          (entry) => entry.id === params?.[0] && entry.member === params?.[1],
        );
        return { rows: row ? [row] as T[] : [] as T[] };
      }

      if (sql.startsWith('DELETE FROM shipping_address')) {
        const index = addresses.findIndex(
          (entry) => entry.id === params?.[0] && entry.member === params?.[1],
        );
        if (index >= 0) {
          addresses.splice(index, 1);
        }
        return { rows: [] as T[] };
      }

      if (sql.startsWith('UPDATE shipping_address') && sql.includes('SET data = $2::jsonb WHERE id = $1')) {
        const row = addresses.find((entry) => entry.id === params?.[0]);
        if (row) {
          row.data = JSON.parse(params?.[1] as string) as AddressData;
        }
        return { rows: [] as T[] };
      }

      if (sql.startsWith('UPDATE shipping_address') && sql.includes('SET data = $3::jsonb')) {
        const row = addresses.find(
          (entry) => entry.id === params?.[0] && entry.member === params?.[1],
        );
        if (row) {
          row.data = JSON.parse(params?.[2] as string) as AddressData;
        }
        return { rows: row ? [row] as T[] : [] as T[] };
      }

      throw new Error(`Unhandled SQL in mock db: ${sql}`);
    },
  };
}

test('create makes the first address the default', async () => {
  const mockDb = createMockDb();
  setAuthDbForTest(mockDb);

  const created = await new AddressService().create(memberId, {
    line1: '123 Main St',
    city: 'Santa Cruz',
    postal_code: '95060',
    country: 'us',
  });

  expect(created.is_default).toBe(true);
  expect(created.country).toBe('US');
  expect(created.member).toBe(memberId);
  expect(created.line1).toBe('123 Main St');
});

test('create rejects invalid country codes', async () => {
  setAuthDbForTest(createMockDb());

  await expect(
    new AddressService().create(memberId, {
      line1: '123 Main St',
      city: 'Santa Cruz',
      postal_code: '95060',
      country: 'USA',
    }),
  ).rejects.toThrow('Country must be a 2-letter ISO code');
});

test('setDefault marks one address as default', async () => {
  const mockDb = createMockDb();
  setAuthDbForTest(mockDb);
  const service = new AddressService();

  const first = await service.create(memberId, {
    line1: '123 Main St',
    city: 'Santa Cruz',
    postal_code: '95060',
  });
  const second = await service.create(memberId, {
    line1: '456 Oak Ave',
    city: 'Santa Cruz',
    postal_code: '95064',
    is_default: false,
  });

  const updated = await service.setDefault(memberId, second.id);

  expect(updated.id).toBe(second.id);
  expect(updated.is_default).toBe(true);
  expect(mockDb.addresses.find((row) => row.id === first.id)?.data.is_default).toBe(false);
});

test('remove promotes another address when deleting the default', async () => {
  const mockDb = createMockDb();
  setAuthDbForTest(mockDb);
  const service = new AddressService();

  const first = await service.create(memberId, {
    line1: '123 Main St',
    city: 'Santa Cruz',
    postal_code: '95060',
  });
  await service.create(memberId, {
    line1: '456 Oak Ave',
    city: 'Santa Cruz',
    postal_code: '95064',
    is_default: false,
  });

  await service.remove(memberId, first.id);

  expect(mockDb.addresses).toHaveLength(1);
  expect(mockDb.addresses[0]?.data.is_default).toBe(true);
});

test('check still validates session tokens for address routes', async () => {
  const authToken = jwt.sign(
    {
      id: memberId,
      email: 'buyer@example.com',
      name: 'Buyer',
    },
    'test-secret',
  );

  const { AuthService } = await import('../service');
  const user = await new AuthService().check(`Bearer ${authToken}`, ['member']);

  expect(user.id).toBe(memberId);
});
