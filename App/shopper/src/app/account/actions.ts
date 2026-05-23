'use server';



import {

  createAddress,

  deleteAddress,

  listAddresses,

  setDefaultAddress,

  updateAddress,

} from '../../server/address/service';

import { parseAddressId, parseShippingAddressInput } from '../../address';

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



export async function createAddressAction(input: unknown) {

  try {

    const user = await requireSession();

    if (!user) {

      return { success: false as const, error: 'Not signed in' };

    }



    const parsed = parseShippingAddressInput(input);

    if (!parsed.success) {

      return { success: false as const, error: parsed.error };

    }



    const token = await getSessionToken();

    const data = await createAddress(token!, parsed.data);

    return { success: true as const, data };

  } catch (error) {

    const message = error instanceof Error ? error.message : 'Unable to save address';

    return { success: false as const, error: message };

  }

}



export async function updateAddressAction(addressId: unknown, input: unknown) {

  try {

    const user = await requireSession();

    if (!user) {

      return { success: false as const, error: 'Not signed in' };

    }



    const idParsed = parseAddressId(addressId);

    if (!idParsed.success) {

      return { success: false as const, error: idParsed.error };

    }



    const parsed = parseShippingAddressInput(input);

    if (!parsed.success) {

      return { success: false as const, error: parsed.error };

    }



    const token = await getSessionToken();

    const data = await updateAddress(token!, idParsed.data, parsed.data);

    return { success: true as const, data };

  } catch (error) {

    const message = error instanceof Error ? error.message : 'Unable to save address';

    return { success: false as const, error: message };

  }

}



export async function deleteAddressAction(addressId: unknown) {

  try {

    const user = await requireSession();

    if (!user) {

      return { success: false as const, error: 'Not signed in' };

    }



    const idParsed = parseAddressId(addressId);

    if (!idParsed.success) {

      return { success: false as const, error: idParsed.error };

    }



    const token = await getSessionToken();

    await deleteAddress(token!, idParsed.data);

    return { success: true as const };

  } catch (error) {

    const message = error instanceof Error ? error.message : 'Unable to delete address';

    return { success: false as const, error: message };

  }

}



export async function setDefaultAddressAction(addressId: unknown) {

  try {

    const user = await requireSession();

    if (!user) {

      return { success: false as const, error: 'Not signed in' };

    }



    const idParsed = parseAddressId(addressId);

    if (!idParsed.success) {

      return { success: false as const, error: idParsed.error };

    }



    const token = await getSessionToken();

    const data = await setDefaultAddress(token!, idParsed.data);

    return { success: true as const, data };

  } catch (error) {

    const message = error instanceof Error ? error.message : 'Unable to set default address';

    return { success: false as const, error: message };

  }

}

