import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from '../../src/server/address/service';

const token = 'session-token';
const baseUrl = 'http://localhost:4010/api/v0';

const sampleAddress = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  label: 'Home',
  line1: '123 Main St',
  city: 'Santa Cruz',
  state: 'CA',
  postal_code: '95060',
  country: 'US',
  is_default: true,
  created_at: '2026-05-17T00:00:00.000Z',
  updated_at: '2026-05-17T00:00:00.000Z',
};

const addressInput = {
  line1: '123 Main St',
  city: 'Santa Cruz',
  state: 'CA',
  postal_code: '95060',
  country: 'US',
};

function mockFetchResponse(
  body: unknown,
  init?: { ok?: boolean; status?: number; statusText?: string },
) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? (ok ? 200 : 500);
  vi.mocked(fetch).mockResolvedValue({
    ok,
    status,
    statusText: init?.statusText ?? (ok ? 'OK' : 'Error'),
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  process.env.LOGIN_SERVICE_URL = baseUrl;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.LOGIN_SERVICE_URL;
});

it('lists addresses from the login service', async () => {
  mockFetchResponse([sampleAddress]);

  const addresses = await listAddresses(token);

  expect(addresses).toEqual([sampleAddress]);
  expect(fetch).toHaveBeenCalledWith(`${baseUrl}/addresses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
});

it('lists legacy addresses with empty state', async () => {
  mockFetchResponse([
    {
      ...sampleAddress,
      state: '',
    },
  ]);

  const addresses = await listAddresses(token);

  expect(addresses[0]?.state).toBe('');
});

it('creates an address with POST', async () => {
  mockFetchResponse(sampleAddress);

  const created = await createAddress(token, addressInput);

  expect(created).toEqual(sampleAddress);
  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(options?.method).toBe('POST');
  expect(JSON.parse(options?.body as string)).toEqual(addressInput);
});

it('updates an address with PUT', async () => {
  mockFetchResponse(sampleAddress);

  await updateAddress(token, sampleAddress.id, addressInput);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(options?.method).toBe('PUT');
  expect(String(options?.body)).toContain('123 Main St');
});

it('deletes an address with DELETE', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    status: 204,
    statusText: 'No Content',
    json: async () => {
      throw new Error('no body');
    },
  } as Response);

  await deleteAddress(token, sampleAddress.id);

  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(options?.method).toBe('DELETE');
});

it('sets the default address with PATCH', async () => {
  mockFetchResponse({ ...sampleAddress, is_default: true });

  const updated = await setDefaultAddress(token, sampleAddress.id);

  expect(updated.is_default).toBe(true);
  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect(options?.method).toBe('PATCH');
});

it('throws when the login service is unreachable', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('connection refused'));

  await expect(listAddresses(token)).rejects.toThrow(
    /Login service unavailable at http:\/\/localhost:4010\/api\/v0/,
  );
});

it('throws a helpful message when the addresses route is missing', async () => {
  mockFetchResponse({}, { ok: false, status: 404 });

  await expect(listAddresses(token)).rejects.toThrow(
    /Login service has no \/addresses route/,
  );
});

it('throws when the response includes an error message', async () => {
  mockFetchResponse({ message: 'Member not found' }, { ok: false, status: 500 });

  await expect(listAddresses(token)).rejects.toThrow('Member not found (500)');
});

it('throws a generic message when the response has no detail', async () => {
  mockFetchResponse({}, { ok: false, status: 500, statusText: 'Server Error' });

  await expect(listAddresses(token)).rejects.toThrow('Address request failed (500)');
});

it('rejects invalid address payloads from the login service', async () => {
  mockFetchResponse({ id: 'not-a-uuid', member: sampleAddress.member });

  await expect(listAddresses(token)).rejects.toThrow();
});
