import 'server-only';

import { ShippingAddressSchema } from '../../address';
import { getLoginServiceBaseUrl } from '../auth/service';
import type { ShippingAddress, ShippingAddressInput } from './types';

async function addressFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const baseUrl = getLoginServiceBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  }).catch((error) => {
    const detail = error instanceof Error ? error.message : 'fetch failed';
    throw new Error(
      `Login service unavailable at ${baseUrl} (${detail}). Is it running on port 4010?`,
    );
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    const detail = body.message ?? body.error;
    if (response.status === 404) {
      throw new Error(
        `Login service has no /addresses route (${baseUrl}${path}). Restart Login after npm run build in Service/Login, or use npm run dev-login from the repo root.`,
      );
    }

    throw new Error(
      detail
        ? `${detail} (${response.status})`
        : `Address request failed (${response.status})`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listAddresses(token: string): Promise<ShippingAddress[]> {
  const data = await addressFetch<unknown>(token, '/addresses');
  return ShippingAddressSchema.array().parse(data);
}

export async function createAddress(
  token: string,
  input: ShippingAddressInput,
): Promise<ShippingAddress> {
  const data = await addressFetch<unknown>(token, '/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return ShippingAddressSchema.parse(data);
}

export async function updateAddress(
  token: string,
  addressId: string,
  input: ShippingAddressInput,
): Promise<ShippingAddress> {
  const data = await addressFetch<unknown>(token, `/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return ShippingAddressSchema.parse(data);
}

export async function deleteAddress(
  token: string,
  addressId: string,
): Promise<void> {
  await addressFetch<void>(token, `/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultAddress(
  token: string,
  addressId: string,
): Promise<ShippingAddress> {
  const data = await addressFetch<unknown>(token, `/addresses/${addressId}/default`, {
    method: 'PATCH',
  });
  return ShippingAddressSchema.parse(data);
}
