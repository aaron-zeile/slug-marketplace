import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  return {
    cookieSet: vi.fn(),
    getPayload: vi.fn(),
    jwtDecrypt: vi.fn(),
    query: vi.fn(),
    verifyIdToken: vi.fn(),
  }
})

vi.mock('google-auth-library', () => {
  return {
    OAuth2Client: vi.fn().mockImplementation(function () {
      return {
        verifyIdToken: mocks.verifyIdToken,
      }
    }),
  }
})

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(async () => {
      return {
        get: vi.fn(() => {
          return {
            value: 'test-session-token',
          }
        }),
        set: mocks.cookieSet,
      }
    }),
  }
})

vi.mock('jose', () => {
  class EncryptJWT {
    constructor(public payload: Record<string, unknown>) {}

    setProtectedHeader = vi.fn(() => this)
    setIssuedAt = vi.fn(() => this)
    setExpirationTime = vi.fn(() => this)
    encrypt = vi.fn(async () => 'test-session-token')
  }

  return {
    EncryptJWT,
    jwtDecrypt: mocks.jwtDecrypt,
  }
})

vi.mock('pg', () => {
  return {
    Pool: vi.fn().mockImplementation(function () {
      return {
        query: mocks.query,
      }
    }),
  }
})

async function loadAuthService() {
  vi.resetModules()
  process.env.AUTH_SECRET = 'test-secret'
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/test'
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'google-client-id'

  const { AuthService } = await import('../src/auth/service')

  return AuthService
}

function mockGooglePayload(payload: Record<string, unknown>) {
  mocks.getPayload.mockReturnValue(payload)
  mocks.verifyIdToken.mockResolvedValue({
    getPayload: mocks.getPayload,
  })
}

describe('AuthService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.jwtDecrypt.mockReset()
  })

  it('logs in an existing member and sets a session cookie', async () => {
    mockGooglePayload({
      email: 'molly@example.com',
      name: 'Molly',
      sub: 'google-id-1',
    })
    mocks.query.mockResolvedValueOnce({
      rows: [
        {
          email: 'molly@example.com',
          google_id: 'google-id-1',
          id: 7,
        },
      ],
    })

    const AuthService = await loadAuthService()
    const authenticated = await new AuthService().login({
      credential: 'google-token',
    })

    expect(mocks.verifyIdToken).toHaveBeenCalledWith({
      audience: 'google-client-id',
      idToken: 'google-token',
    })
    expect(mocks.query).toHaveBeenCalledTimes(1)
    expect(mocks.query).toHaveBeenCalledWith(
      'SELECT id, email, google_id FROM member WHERE google_id = $1',
      ['google-id-1'],
    )
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      }),
    )
    expect(authenticated).toEqual({
      email: 'molly@example.com',
      id: 7,
      name: 'Molly',
    })
  })

  it('creates a member from Google token info when none exists', async () => {
    mockGooglePayload({
      email: 'new@example.com',
      name: 'New User',
      sub: 'google-id-new',
    })
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            email: 'new@example.com',
            google_id: 'google-id-new',
            id: 12,
          },
        ],
      })

    const AuthService = await loadAuthService()
    const authenticated = await new AuthService().login({
      credential: 'new-google-token',
    })

    expect(mocks.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO member (email, google_id)'),
      ['new@example.com', 'google-id-new'],
    )
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.any(Object),
    )
    expect(authenticated).toEqual({
      email: 'new@example.com',
      id: 12,
      name: 'New User',
    })
  })

  it('rejects a Google token without required user info', async () => {
    mockGooglePayload({
      email: 'missing-sub@example.com',
    })

    const AuthService = await loadAuthService()

    await expect(
      new AuthService().login({ credential: 'bad-google-token' }),
    ).rejects.toThrow('Invalid Google token')
    expect(mocks.query).not.toHaveBeenCalled()
    expect(mocks.cookieSet).not.toHaveBeenCalled()
  })

  it('rejects an invalid session cookie payload', async () => {
    mocks.jwtDecrypt.mockResolvedValue({
      payload: {
        email: 'molly@example.com',
        id: 7,
      },
    })

    const AuthService = await loadAuthService()

    await expect(new AuthService().check()).rejects.toThrow(
      'Invalid session cookie',
    )
  })
})
