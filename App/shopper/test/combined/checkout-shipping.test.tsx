import { SignJWT } from 'jose';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { Server } from 'http';
import { Pool } from 'pg';

import CheckoutShipping from '../../src/app/checkout/shipping/CheckoutShipping';
import { setLoginCookieStoreForTest } from '../../src/app/buyer/login/cookies';

const memberId = '7b355067-1dee-4b9a-a87a-fa745332ecf8';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

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
  push.mockReset();
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

it.skipIf(!dbReady)('continues to payment with a selected address', async () => {
  await pool.query(
    `INSERT INTO shipping_address (id, member, data)
     VALUES (
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       $1,
       $2::jsonb
     )`,
    [
      memberId,
      JSON.stringify({
        label: 'Home',
        line1: '123 Main St',
        city: 'Santa Cruz',
        postal_code: '95060',
        country: 'US',
        is_default: true,
        created_at: '2026-05-17T00:00:00.000Z',
        updated_at: '2026-05-17T00:00:00.000Z',
      }),
    ],
  );

  render(<CheckoutShipping />);

  expect(await screen.findByText('123 Main St, Santa Cruz, 95060, US')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith(
      '/checkout/payment?addressId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
  });
});
