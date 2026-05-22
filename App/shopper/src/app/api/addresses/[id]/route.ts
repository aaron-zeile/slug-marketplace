import { NextResponse } from 'next/server';

import { normalizeAddressInput } from '@/address/normalize';
import type { ShippingAddressInput } from '@/address/types';
import { deleteAddress, updateAddress } from '@/server/address/service';
import { check, getSessionToken } from '@/server/auth/service';

async function requireToken() {
  const token = await getSessionToken();
  if (!token) {
    return undefined;
  }
  const user = await check(token);
  if (!user) {
    return undefined;
  }
  return token;
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await requireToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as ShippingAddressInput;
  const normalized = normalizeAddressInput(body);
  if ('error' in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  try {
    const data = await updateAddress(token, id, normalized);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save address';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await requireToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteAddress(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete address';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
