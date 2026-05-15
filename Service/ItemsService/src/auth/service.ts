import type { IncomingHttpHeaders } from 'http';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

function normalizeLoginServiceBaseUrl(): string {
  const base = process.env.LOGIN_SERVICE_URL;

  if (!base) {
    throw new Error(
      'LOGIN_SERVICE_URL is required for authenticated operations',
    );
  }

  return base.replace(/\/$/, '');
}

function singleHeader(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

export class AuthService {
  public async check(
    authorization?: string,
    _roles?: string[],
  ): Promise<SessionUser> {
    const url = `${normalizeLoginServiceBaseUrl()}/login/check`;
    console.log('roles: ', _roles);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Login check failed with status ${response.status}`);
    }

    const user = (await response.json()) as SessionUser;

    if (
      typeof user?.id !== 'string' ||
      typeof user?.email !== 'string' ||
      typeof user?.name !== 'string'
    ) {
      throw new Error('Invalid session payload from login service');
    }

    return user;
  }

  public static authorizationFromHeaders(
    headers: IncomingHttpHeaders,
  ): string | undefined {
    return singleHeader(headers.authorization);
  }
}
