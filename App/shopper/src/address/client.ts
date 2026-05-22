import type {
  AddressActionResult,
  ShippingAddress,
  ShippingAddressInput,
} from './types';

async function parseResponse<T>(response: Response): Promise<AddressActionResult<T>> {
  if (response.status === 401) {
    return { success: false, error: 'Not signed in' };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    return {
      success: false,
      error:
        body.error ??
        body.message ??
        `Address request failed (${response.status})`,
    };
  }

  if (response.status === 204) {
    return { success: true, data: undefined as T };
  }

  const data = (await response.json()) as T;
  return { success: true, data };
}

export async function listAddressesClient(): Promise<
  AddressActionResult<ShippingAddress[]>
> {
  const response = await fetch('/api/addresses', { cache: 'no-store' });
  return parseResponse<ShippingAddress[]>(response);
}

export async function createAddressClient(
  input: ShippingAddressInput,
): Promise<AddressActionResult<ShippingAddress>> {
  const response = await fetch('/api/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseResponse<ShippingAddress>(response);
}

export async function updateAddressClient(
  addressId: string,
  input: ShippingAddressInput,
): Promise<AddressActionResult<ShippingAddress>> {
  const response = await fetch(`/api/addresses/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseResponse<ShippingAddress>(response);
}

export async function deleteAddressClient(
  addressId: string,
): Promise<AddressActionResult> {
  const response = await fetch(`/api/addresses/${addressId}`, {
    method: 'DELETE',
  });
  return parseResponse(response);
}

export async function setDefaultAddressClient(
  addressId: string,
): Promise<AddressActionResult<ShippingAddress>> {
  const response = await fetch(`/api/addresses/${addressId}/default`, {
    method: 'PATCH',
  });
  return parseResponse<ShippingAddress>(response);
}
