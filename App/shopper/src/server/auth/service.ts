import 'server-only';

import { getLoginCookieStore } from '../../app/buyer/login/cookies';

/** Same base URL for login/check and login/sign-in flows (respects LOGIN_SERVICE_URL when set). */
export function getLoginServiceBaseUrl(): string {
  return process.env.LOGIN_SERVICE_URL || 'http://localhost:4010/api/v0';
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Reads the shopper session JWT from the httpOnly `session` cookie
 * (same value seller uses from `getCookie(req, 'session')` in auth middleware).
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await getLoginCookieStore();
  return cookieStore.get('session')?.value;
}

/** Validates a session token with the login service (same contract as seller). */
export async function check(token: string): Promise<SessionUser | undefined> {
  const response = await fetch(`${getLoginServiceBaseUrl()}/login/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    return undefined;
  }
  return (await response.json()) as SessionUser;
}
