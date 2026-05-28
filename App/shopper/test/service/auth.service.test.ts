import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { setLoginCookieStoreForTest } from '../../src/app/buyer/login/cookies';
import {
  check,
  getLoginServiceBaseUrl,
  getSessionToken,
} from '../../src/server/auth/service';

afterEach(() => {
  setLoginCookieStoreForTest(undefined);
  vi.unstubAllGlobals();
  delete process.env.LOGIN_SERVICE_URL;
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

it('uses default login service base url when env is unset', () => {
  expect(getLoginServiceBaseUrl()).toBe('http://localhost:4010/api/v0');
});

it('uses login service base url from env when provided', () => {
  process.env.LOGIN_SERVICE_URL = 'http://localhost:4999/api/v0';

  expect(getLoginServiceBaseUrl()).toBe('http://localhost:4999/api/v0');
});

it('returns undefined session token when session cookie is missing', async () => {
  setLoginCookieStoreForTest(async () => ({
    get: () => undefined,
    set: vi.fn(),
    delete: vi.fn(),
  }));

  expect(await getSessionToken()).toBeUndefined();
});

it('returns session token from login cookie store', async () => {
  setLoginCookieStoreForTest(async () => ({
    get: (name: string) => (name === 'session' ? { value: 'abc-token' } : undefined),
    set: vi.fn(),
    delete: vi.fn(),
  }));

  expect(await getSessionToken()).toBe('abc-token');
});

it('returns undefined when login check fails', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    json: async () => ({}),
  } as Response);

  const user = await check('bad-token');

  expect(user).toBeUndefined();
});

it('returns session user when login check succeeds', async () => {
  const payload = {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    email: 'buyer@example.com',
    name: 'Buyer',
  };
  process.env.LOGIN_SERVICE_URL = 'http://localhost:4999/api/v0';

  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => payload,
  } as Response);

  const user = await check('good-token');

  expect(user).toEqual(payload);
  expect(fetch).toHaveBeenCalledWith('http://localhost:4999/api/v0/login/check', {
    headers: {
      Authorization: 'Bearer good-token',
    },
    cache: 'no-store',
  });
});
