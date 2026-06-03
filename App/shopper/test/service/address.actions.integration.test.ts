import { SignJWT } from 'jose';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { Server } from 'http';
import { Pool } from 'pg';

import {
  createAddressAction,
  deleteAddressAction,
  listAddressesAction,
  setDefaultAddressAction,
  updateAddressAction,
} from '../../src/app/account/actions';
import { setLoginCookieStoreForTest } from '../../src/app/buyer/login/cookies';

const memberId = '7b355067-1dee-4b9a-a87a-fa745332ecf8';

let server: Server | undefined;
let pool: Pool | undefined;
let sessionToken: string;
let dbReady = false;

beforeAll(async () => {
  process.env.AUTH_SECRET = 'test-secret';
  process.env.ADMIN_DATABASE_URL =
    process.env.LOGIN_DATABASE_URL ??
    process.env.ADMIN_DATABASE_URL ??
    'postgres://postgres:postgres@localhost:4005/account';

  pool = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS member (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      google_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS shipping_address (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE UNIQUE INDEX IF NOT EXISTS shipping_address_one_default_per_member
      ON shipping_address (member)
      WHERE (data->>'is_default')::boolean IS TRUE;
  `);

  const { app } = await import('../../../../Service/Login/app');
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Login service test server did not start');
  }

  process.env.LOGIN_SERVICE_URL = `http://127.0.0.1:${address.port}/api/v0`;
  sessionToken = await new SignJWT({
    id: memberId,
    email: 'buyer@example.com',
    name: 'Buyer',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode('test-secret'));
  dbReady = true;
});

beforeEach(async () => {
  if (!dbReady || !pool) {
    return;
  }
  await pool.query('TRUNCATE shipping_address, member RESTART IDENTITY CASCADE');
  await pool.query(
    `INSERT INTO member (id, email, google_id)
     VALUES ($1, $2, $3)`,
    [memberId, 'buyer@example.com', 'google-buyer'],
  );

  setLoginCookieStoreForTest(async () => ({
    get: (name: string) =>
      name === 'session' ? { value: sessionToken } : undefined,
    set: vi.fn(),
    delete: vi.fn(),
  }));
});

afterAll(async () => {
  setLoginCookieStoreForTest(undefined);
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  if (pool) {
    await pool.end();
  }
});

it.skipIf(!dbReady)('creates, lists, sets default, and deletes addresses', async () => {
  const created = await createAddressAction({
    label: 'Home',
    line1: '123 Main St',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95060',
    country: 'US',
  });

  expect(created.success).toBe(true);
  expect(created.data?.label).toBe('Home');
  expect(created.data?.is_default).toBe(true);

  const second = await createAddressAction({
    line1: '456 Oak Ave',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95064',
    country: 'US',
    is_default: false,
  });

  expect(second.success).toBe(true);

  const listed = await listAddressesAction();
  expect(listed.success).toBe(true);
  expect(listed.data).toHaveLength(2);

  const defaultResult = await setDefaultAddressAction(second.data!.id);
  expect(defaultResult.success).toBe(true);
  expect(defaultResult.data?.is_default).toBe(true);

  const deleted = await deleteAddressAction(created.data!.id);
  expect(deleted.success).toBe(true);

  const afterDelete = await listAddressesAction();
  expect(afterDelete.data).toHaveLength(1);
  expect(afterDelete.data?.[0]?.is_default).toBe(true);
});

it.skipIf(!dbReady)('returns validation error when create input is invalid', async () => {
  const result = await createAddressAction({
    line1: '',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95060',
    country: 'US',
  });

  expect(result.success).toBe(false);
  expect(result.error).toBe('Address line 1 is required.');
});

it.skipIf(!dbReady)('returns validation error when update address id is invalid', async () => {
  const result = await updateAddressAction('not-a-uuid', {
    line1: '123 Main St',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95060',
    country: 'US',
  });

  expect(result.success).toBe(false);
  expect(result.error).toContain('Invalid address id');
});

it.skipIf(!dbReady)('returns validation error when update payload is invalid', async () => {
  const created = await createAddressAction({
    line1: '123 Main St',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95060',
    country: 'US',
  });

  expect(created.success).toBe(true);

  const result = await updateAddressAction(created.data!.id, {
    line1: '456 Oak Ave',
    city: '',
    state: 'CA',
    postal_code: '95064',
    country: 'US',
  });

  expect(result.success).toBe(false);
  expect(result.error).toBe('City is required.');
});

it.skipIf(!dbReady)('updates an existing address', async () => {
  const created = await createAddressAction({
    line1: '123 Main St',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95060',
    country: 'US',
  });

  expect(created.success).toBe(true);

  const result = await updateAddressAction(created.data!.id, {
    label: 'Work',
    line1: '456 Oak Ave',
    city: 'Santa Cruz',
    state: 'CA',
    postal_code: '95064',
    country: 'US',
  });

  expect(result.success).toBe(true);
  expect(result.data?.label).toBe('Work');
  expect(result.data?.line1).toBe('456 Oak Ave');
});

it.skipIf(!dbReady)('returns validation error when delete address id is invalid', async () => {
  const result = await deleteAddressAction('not-a-uuid');

  expect(result.success).toBe(false);
  expect(result.error).toContain('Invalid address id');
});

it.skipIf(!dbReady)('returns validation error when default address id is invalid', async () => {
  const result = await setDefaultAddressAction('not-a-uuid');

  expect(result.success).toBe(false);
  expect(result.error).toContain('Invalid address id');
});

it.skipIf(!dbReady)('returns service error when login service is unavailable', async () => {
  const originalUrl = process.env.LOGIN_SERVICE_URL;
  process.env.LOGIN_SERVICE_URL = 'http://127.0.0.1:1/api/v0';

  const result = await listAddressesAction();

  expect(result.success).toBe(false);
  expect(result.error).toContain('fetch failed');
  process.env.LOGIN_SERVICE_URL = originalUrl;
});
