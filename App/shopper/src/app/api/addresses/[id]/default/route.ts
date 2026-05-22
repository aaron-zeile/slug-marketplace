import { NextResponse } from 'next/server';

import { setDefaultAddress } from '@/server/address/service';
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

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await requireToken();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const data = await setDefaultAddress(token, id);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to set default address';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
