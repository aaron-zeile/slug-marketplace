'use server';

import {
  check,
  getLoginServiceBaseUrl,
  getSessionToken,
  type SessionUser,
} from '../../../server/auth/service';
import { getLoginCookieStore } from './cookies';

export interface Authenticated {
  id: string;
  email: string;
  name: string;
}

export interface Credentials {
  credential: string;
}

interface RestAuthenticated extends Authenticated {
  token: string;
}

export interface LoginResult {
  authenticated?: Authenticated;
  error?: string;
}

export interface CheckLoginResult {
  user?: SessionUser;
}

function shouldUseSecureLoginCookie() {
  if (process.env.LOGIN_COOKIE_SECURE !== undefined) {
    return process.env.LOGIN_COOKIE_SECURE === 'true';
  }

  return process.env.NODE_ENV === 'production';
}

export async function login(credentials: Credentials): Promise<LoginResult> {
  let response: Response;
  const loginServiceUrl = getLoginServiceBaseUrl();

  // console.debug('[login] Shopper server action starting login', {
  //   hasCredential: Boolean(credentials.credential),
  //   loginServiceUrl,
  // });


  try {
    response = await fetch(`${loginServiceUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });
  } catch {
    // console.error('[login] Shopper could not reach login service', error);

    return {
      error: 'Login service unavailable',
    };
  }

  // console.debug('[login] Login service responded', {
  //   ok: response.ok,
  //   status: response.status,
  // });

  if (!response.ok) {
    // console.error('[login] Login service rejected login', {
    //   status: response.status,
    //   statusText: response.statusText,
    // });

    return {
      error: 'Login failed',
    };
  }

  const authenticated = (await response.json()) as RestAuthenticated;
  const cookieStore = await getLoginCookieStore();

  cookieStore.set('session', authenticated.token, {
    httpOnly: true,
    secure: shouldUseSecureLoginCookie(),
    sameSite: 'lax',
    path: '/',
  });

  return {
    authenticated: {
      id: authenticated.id,
      email: authenticated.email,
      name: authenticated.name,
    },
  };
}

export async function checkLogin(): Promise<CheckLoginResult> {
  const token = await getSessionToken();

  // console.debug('[login] Checking login session', {
  //   hasToken: Boolean(token),
  //   loginServiceUrl: getLoginServiceBaseUrl(),
  // });

  if (!token) {
    return {};
  }

  try {
    const user = await check(token);
    if (!user) {
      return {};
    }
    return { user };
  } catch {
    // console.error('[login] Shopper could not reach login service for session check', error);
    return {};
  }
}

export async function logout() {
  const cookieStore = await getLoginCookieStore();
  cookieStore.delete('session');
}
