'use server';

import { getLoginCookieStore } from './cookies';

export interface Authenticated {
  id: string;
  email: string;
  name: string;
}

export interface Credentials {
  credential: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
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

function getLoginServiceUrl() {
  return process.env.LOGIN_SERVICE_URL;
}

function shouldUseSecureLoginCookie() {
  if (process.env.LOGIN_COOKIE_SECURE !== undefined) {
    return process.env.LOGIN_COOKIE_SECURE === 'true';
  }

  return process.env.NODE_ENV === 'production';
}

export async function login(credentials: Credentials): Promise<LoginResult> {
  let response: Response;
  const loginServiceUrl = getLoginServiceUrl();

  // console.debug('[login] Shopper server action starting login', {
  //   hasCredential: Boolean(credentials.credential),
  //   loginServiceUrl,
  // });

  if (!loginServiceUrl) {
    // console.error('[login] LOGIN_SERVICE_URL is not configured for shopper');

    return {
      error: 'Login service unavailable',
    };
  }

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
    const responseBody = await response.text();
    let loginError: string | undefined;

    try {
      const parsedBody = JSON.parse(responseBody) as { message?: unknown };
      loginError =
        typeof parsedBody.message === 'string' ? parsedBody.message : undefined;
    } catch {
      loginError = undefined;
    }

    // console.error('[login] Login service rejected login', {
    //   status: response.status,
    //   statusText: response.statusText,
    //   loginError,
    //   responseBody,
    // });

    return {
      error: loginError
        ? `Login failed: ${loginError}`
        : `Login failed with status ${response.status}`,
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
  const cookieStore = await getLoginCookieStore();
  const token = cookieStore.get('session')?.value;
  const loginServiceUrl = getLoginServiceUrl();

  // console.debug('[login] Checking login session', {
  //   hasToken: Boolean(token),
  //   loginServiceUrl,
  // });

  if (!token) {
    return {};
  }

  if (!loginServiceUrl) {
    // console.error('[login] LOGIN_SERVICE_URL is not configured for session check');

    return {};
  }

  let response: Response;

  try {
    response = await fetch(`${loginServiceUrl}/login/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  } catch {
    // console.error('[login] Shopper could not reach login service for session check', error);

    return {};
  }

  // console.debug('[login] Login check responded', {
  //   ok: response.ok,
  //   status: response.status,
  // });

  if (!response.ok) {
    return {};
  }

  return {
    user: (await response.json()) as SessionUser,
  };
}

export async function logout() {
  const cookieStore = await getLoginCookieStore();
  cookieStore.delete('session');
}
