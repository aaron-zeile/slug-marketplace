'use server';

import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from '../../server/address/service';
import { normalizeAddressInput } from '../../address/normalize';
import type { ShippingAddressInput } from '../../address/types';
import { check, getSessionToken } from '../../server/auth/service';

async function requireSession() {
  const token = await getSessionToken();
  if (!token) {
    return undefined;
  }
  return check(token);
}

export async function listAddressesAction() {
  try {
    const user = await requireSession();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const token = await getSessionToken();
    const data = await listAddresses(token!);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load addresses';
    return { success: false as const, error: message };
  }
}

export async function createAddressAction(input: ShippingAddressInput) {
  try {
    const user = await requireSession();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const normalized = normalizeAddressInput(input);
    if ('error' in normalized) {
      return { success: false as const, error: normalized.error };
    }

    const token = await getSessionToken();
    const data = await createAddress(token!, normalized);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save address';
    return { success: false as const, error: message };
  }
}

export async function updateAddressAction(
  addressId: string,
  input: ShippingAddressInput,
) {
  try {
    const user = await requireSession();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const normalized = normalizeAddressInput(input);
    if ('error' in normalized) {
      return { success: false as const, error: normalized.error };
    }

    const token = await getSessionToken();
    const data = await updateAddress(token!, addressId, normalized);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save address';
    return { success: false as const, error: message };
  }
}

export async function deleteAddressAction(addressId: string) {
  try {
    const user = await requireSession();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const token = await getSessionToken();
    await deleteAddress(token!, addressId);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete address';
    return { success: false as const, error: message };
  }
}

export async function setDefaultAddressAction(addressId: string) {
  try {
    const user = await requireSession();
    if (!user) {
      return { success: false as const, error: 'Not signed in' };
    }

    const token = await getSessionToken();
    const data = await setDefaultAddress(token!, addressId);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to set default address';
    return { success: false as const, error: message };
  }
}
