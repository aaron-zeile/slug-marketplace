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

export async function login(credentials: Credentials): Promise<LoginResult> {
  let response: Response;

  try {
    response = await fetch(`${getLoginServiceUrl()}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });
  } catch {
    return {
      error: 'Login service unavailable',
    };
  }

  if (!response.ok) {
    return {
      error: 'Login failed',
    };
  }

  const authenticated = (await response.json()) as RestAuthenticated;
  const cookieStore = await getLoginCookieStore();

  cookieStore.set('session', authenticated.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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

  if (!token) {
    return {};
  }

  let response: Response;

  try {
    response = await fetch(`${getLoginServiceUrl()}/login/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  } catch {
    return {};
  }

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
