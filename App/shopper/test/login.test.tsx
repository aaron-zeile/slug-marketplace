import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { Server } from 'http';
import { Pool } from 'pg';

import { checkLogin, login } from '../src/app/buyer/login/actions';
import { setLoginCookieStoreForTest } from '../src/app/buyer/login/cookies';
import GoogleLogin from '../src/app/buyer/login/GoogleLogin';
import Topbar from '../src/app/buyer/topbar/Topbar';

const googleButtonLabel = 'mock-google-login';
const cookies: Record<string, string> = {};
const deletedCookies: string[] = [];
const serviceUser = {
  id: '7b355067-1dee-4b9a-a87a-fa745332ecf8',
  email: 'username@example.com',
  name: 'username',
  token: 'service-token',
};

const google = vi.hoisted(() => {
  return {
    credential: 'google-token' as string | undefined,
    lastLogin: undefined as Promise<void> | undefined,
  };
});

const loginService = vi.hoisted(() => {
  return {
    verifyIdToken: vi.fn(),
  };
});

vi.mock('@react-oauth/google', () => {
  return {
    GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
    GoogleLogin: ({
      onSuccess,
    }: {
      onSuccess: (response: { credential?: string }) => Promise<void>;
    }) => (
      <button
        aria-label={googleButtonLabel}
        onClick={() => {
          google.lastLogin = onSuccess({ credential: google.credential }).catch(
            () => {},
          );
        }}
      >
        Sign in with Google
      </button>
    ),
  };
});

let server: Server;
let originalLoginServiceUrl: string | undefined;
let originalAuthSecret: string | undefined;
let originalDatabaseUrl: string | undefined;
let originalGoogleClientId: string | undefined;
let pool: Pool;

beforeAll(async () => {
  originalLoginServiceUrl = process.env.LOGIN_SERVICE_URL;
  originalAuthSecret = process.env.AUTH_SECRET;
  originalDatabaseUrl = process.env.ADMIN_DATABASE_URL;
  originalGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  process.env.AUTH_SECRET = 'test-secret';
  process.env.ADMIN_DATABASE_URL =
    process.env.LOGIN_DATABASE_URL ??
    process.env.ADMIN_DATABASE_URL ??
    'postgres://postgres:postgres@localhost:4005/account';
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';
  pool = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      google_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const [{ app }, { setGoogleTokenVerifierForTest }] = await Promise.all([
    import('../../../Service/Login/app'),
    import('../../../Service/Login/src/google'),
  ]);
  setGoogleTokenVerifierForTest(async (token: string) => {
    const ticket = await loginService.verifyIdToken({
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      idToken: token,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new Error('Invalid Google token');
    }

    return {
      email: payload.email,
      name: payload.name,
      sub: payload.sub,
    };
  });
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Login service test server did not start');
  }

  process.env.LOGIN_SERVICE_URL = `http://127.0.0.1:${address.port}/api/v0`;
});

beforeEach(async () => {
  google.credential = 'google-token';
  google.lastLogin = undefined;
  await pool.query('TRUNCATE member RESTART IDENTITY');
  loginService.verifyIdToken.mockReset();
  loginService.verifyIdToken.mockResolvedValue({
    getPayload: () => {
      return {
        email: serviceUser.email,
        name: serviceUser.name,
        sub: 'mock-google-user',
      };
    },
  });
  window.sessionStorage.clear();
  deletedCookies.length = 0;

  for (const name of Object.keys(cookies)) {
    delete cookies[name];
  }

  setLoginCookieStoreForTest(async () => {
    return {
      delete: (name: string) => {
        deletedCookies.push(name);
        delete cookies[name];
      },
      get: (name: string) => {
        const value = cookies[name];

        return value ? { value } : undefined;
      },
      set: (name: string, value: string) => {
        cookies[name] = value;
      },
    };
  });
});

afterAll(async () => {
  const [{ closeAuthDbForTest }, { setGoogleTokenVerifierForTest }] =
    await Promise.all([
      import('../../../Service/Login/service'),
      import('../../../Service/Login/src/google'),
    ]);
  setGoogleTokenVerifierForTest(undefined);
  await closeAuthDbForTest();

  if (pool) {
    await pool.end();
  }
  setLoginCookieStoreForTest(undefined);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  if (originalLoginServiceUrl === undefined) {
    delete process.env.LOGIN_SERVICE_URL;
  } else {
    process.env.LOGIN_SERVICE_URL = originalLoginServiceUrl;
  }

  if (originalAuthSecret === undefined) {
    delete process.env.AUTH_SECRET;
  } else {
    process.env.AUTH_SECRET = originalAuthSecret;
  }

  if (originalDatabaseUrl === undefined) {
    delete process.env.ADMIN_DATABASE_URL;
  } else {
    process.env.ADMIN_DATABASE_URL = originalDatabaseUrl;
  }

  if (originalGoogleClientId === undefined) {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  } else {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalGoogleClientId;
  }
});

it('Renders Page', async () => {
  render(<Topbar />);

  await screen.findByText('SlugMarketplace');
});

it('shows login when logged out', async () => {
  render(<Topbar />);

  fireEvent.click(screen.getByLabelText('profile'));

  expect(await screen.findByLabelText('login')).toBeTruthy();
  expect(screen.queryByLabelText('logout')).toBeNull();
});

it('updates the greeting after Google login succeeds', async () => {
  render(<Topbar />);

  fireEvent.click(screen.getByLabelText('profile'));
  fireEvent.click(await screen.findByLabelText(googleButtonLabel));

  expect(await screen.findByText('Hello username')).toBeTruthy();
  expect(window.sessionStorage.getItem('name')).toBe('username');
  expect(loginService.verifyIdToken).toHaveBeenCalledWith({
    audience: 'test-client-id',
    idToken: 'google-token',
  });
});

it('stays logged out when Google login fails', async () => {
  loginService.verifyIdToken.mockRejectedValueOnce(
    new Error('Invalid Google token'),
  );

  render(<Topbar />);

  fireEvent.click(screen.getByLabelText('profile'));
  fireEvent.click(await screen.findByLabelText(googleButtonLabel));

  await google.lastLogin;
  expect(await screen.findByText('Hello Guest')).toBeTruthy();
  expect(window.sessionStorage.getItem('name')).toBeNull();
  expect(screen.queryByLabelText('logout')).toBeNull();
});

it('stays logged out when Google does not return a credential', async () => {
  google.credential = undefined;

  render(<Topbar />);

  fireEvent.click(screen.getByLabelText('profile'));
  fireEvent.click(await screen.findByLabelText(googleButtonLabel));

  await google.lastLogin;
  expect(await screen.findByText('Hello Guest')).toBeTruthy();
  expect(window.sessionStorage.getItem('name')).toBeNull();
  expect(loginService.verifyIdToken).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('logout')).toBeNull();
});

// it('returns a generic login error when the service response has no message', async () => {
//   loginService.verifyIdToken.mockRejectedValueOnce(
//     new Error('Invalid Google token'),
//   );

//   await expect(login({ credential: 'google-token' })).resolves.toEqual({
//     error: 'Login failed',
//   });
// });

it('returns an unavailable error when the login service cannot be reached', async () => {
  process.env.LOGIN_SERVICE_URL = 'http://127.0.0.1:1/api/v0';

  await expect(login({ credential: 'google-token' })).resolves.toEqual({
    error: 'Login service unavailable',
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Login service test server is not listening');
  }

  process.env.LOGIN_SERVICE_URL = `http://127.0.0.1:${address.port}/api/v0`;
});

it('returns logged out when the session check service cannot be reached', async () => {
  cookies.session = 'service-token';
  process.env.LOGIN_SERVICE_URL = 'http://127.0.0.1:1/api/v0';

  await expect(checkLogin()).resolves.toEqual({});

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Login service test server is not listening');
  }

  process.env.LOGIN_SERVICE_URL = `http://127.0.0.1:${address.port}/api/v0`;
});

it('returns logged out when the session check is rejected', async () => {
  cookies.session = 'bad-service-token';

  await expect(checkLogin()).resolves.toEqual({});
});

it('logs in without a menu close callback', async () => {
  const setName = vi.fn();

  render(<GoogleLogin setName={setName} />);

  fireEvent.click(await screen.findByLabelText(googleButtonLabel));
  await google.lastLogin;

  expect(setName).toHaveBeenCalledWith('username');
  expect(window.sessionStorage.getItem('name')).toBe('username');
});

it('does not show login when logged in', async () => {
  window.sessionStorage.setItem('name', 'username');
  await login({ credential: 'google-token' });

  render(<Topbar />);

  await screen.findByText('Hello username');
  fireEvent.click(screen.getByLabelText('profile'));

  await waitFor(() => {
    expect(screen.queryByLabelText('login')).toBeNull();
  });
  expect(await screen.findByLabelText('logout')).toBeTruthy();
});

it('uses the session cookie when opening a new tab', async () => {
  await login({ credential: 'google-token' });

  render(<Topbar />);

  await screen.findByText('Hello username');
  fireEvent.click(screen.getByLabelText('profile'));

  expect(await screen.findByLabelText('logout')).toBeTruthy();
  expect(screen.queryByLabelText('login')).toBeNull();
});

it('ignores a session check result after unmount', async () => {
  await login({ credential: 'google-token' });

  let resolveCookieStore: () => void = () => {};
  setLoginCookieStoreForTest(
    () =>
      new Promise((resolve) => {
        resolveCookieStore = () => {
          resolve({
            delete: (name: string) => {
              deletedCookies.push(name);
              delete cookies[name];
            },
            get: (name: string) => {
              const value = cookies[name];

              return value ? { value } : undefined;
            },
            set: (name: string, value: string) => {
              cookies[name] = value;
            },
          });
        };
      }),
  );

  const { unmount } = render(<Topbar />);

  unmount();
  resolveCookieStore();

  await waitFor(() => {
    expect(screen.queryByText('Hello username')).toBeNull();
  });
});

it('shows login after logging out', async () => {
  window.sessionStorage.setItem('name', 'username');
  await login({ credential: 'google-token' });

  render(<Topbar />);

  await screen.findByText('Hello username');
  fireEvent.click(screen.getByLabelText('profile'));

  fireEvent.click(screen.getByLabelText('logout'));

  await screen.findByText('Hello Guest');
  expect(deletedCookies).toEqual(['session']);
  fireEvent.click(screen.getByLabelText('profile'));
  expect(await screen.findByLabelText('login')).toBeTruthy();
  expect(screen.queryByLabelText('logout')).toBeNull();
});
