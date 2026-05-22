import { NextResponse } from 'next/server';

import { normalizeAddressInput } from '@/address/normalize';
import type { ShippingAddressInput } from '@/address/types';
import { createAddress, listAddresses } from '@/server/address/service';
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

export async function GET() {
  const token = await requireToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const data = await listAddresses(token);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load addresses';
    const status = message.includes('(404)') ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const token = await requireToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = (await request.json()) as ShippingAddressInput;
  const normalized = normalizeAddressInput(body);
  if ('error' in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  try {
    const data = await createAddress(token, normalized);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save address';
    const status = message.includes('(404)') ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
