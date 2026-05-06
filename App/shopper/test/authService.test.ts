// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../src/auth/service'

const google = vi.hoisted(() => {
  return {
    verifyGoogleToken: vi.fn(),
  }
})

vi.mock('../src/auth/google', () => {
  return {
    verifyGoogleToken: google.verifyGoogleToken,
  }
})

interface Query {
  text: string
  values?: unknown[]
}

const cookies: Record<string, string> = {}
const cookieSets: {
  name: string
  options: Record<string, unknown>
  value: string
}[] = []
const queries: Query[] = []
let queryResults: { rows: unknown[] }[] = []

const cookieStore = async () => {
  return {
    get: (name: string) => {
      const value = cookies[name]

      return value ? { value } : undefined
    },
    set: (name: string, value: string, options: Record<string, unknown>) => {
      cookies[name] = value
      cookieSets.push({ name, options, value })
    },
  }
}

const db = {
  query: async <T>(text: string, values?: unknown[]) => {
    queries.push({ text, values })

    return queryResults.shift() as { rows: T[] }
  },
}

function authService() {
  return new AuthService({
    cookieStore,
    db,
  })
}

function mockGoogleProfile(profile: {
  email: string
  name?: string
  sub: string
}) {
  google.verifyGoogleToken.mockResolvedValue(profile)
}

describe('AuthService', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    google.verifyGoogleToken.mockReset()
    queryResults = []
    queries.length = 0
    cookieSets.length = 0

    for (const name of Object.keys(cookies)) {
      delete cookies[name]
    }
  })

  it('logs in an existing member and sets a session cookie', async () => {
    mockGoogleProfile({
      email: 'molly@example.com',
      name: 'Molly',
      sub: 'google-id-1',
    })
    queryResults = [
      {
        rows: [
          {
            email: 'molly@example.com',
            google_id: 'google-id-1',
            id: 7,
          },
        ],
      },
    ]

    const authenticated = await authService().login({
      credential: 'google-token',
    })

    expect(cookieSets).toEqual([
      {
        name: 'session',
        value: expect.any(String),
        options: expect.objectContaining({
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        }),
      },
    ])
    expect(authenticated).toEqual({
      email: 'molly@example.com',
      id: 7,
      name: 'Molly',
    })
  })

  it('creates a member from Google token info when none exists', async () => {
    mockGoogleProfile({
      email: 'new@example.com',
      name: 'New User',
      sub: 'google-id-new',
    })
    queryResults = [
      { rows: [] },
      {
        rows: [
          {
            email: 'new@example.com',
            google_id: 'google-id-new',
            id: 12,
          },
        ],
      },
    ]

    const authenticated = await authService().login({
      credential: 'new-google-token',
    })

    expect(cookieSets[0]).toEqual({
      name: 'session',
      value: expect.any(String),
      options: expect.any(Object),
    })
    expect(authenticated).toEqual({
      email: 'new@example.com',
      id: 12,
      name: 'New User',
    })
  })

  it('rejects an invalid Google token', async () => {
    google.verifyGoogleToken.mockRejectedValue(new Error('Invalid Google token'))

    await expect(
      authService().login({ credential: 'bad-google-token' }),
    ).rejects.toThrow('Invalid Google token')
    expect(queries).toEqual([])
    expect(cookieSets).toEqual([])
  })

  it('checks a valid session cookie', async () => {
    mockGoogleProfile({
      email: 'molly@example.com',
      name: 'Molly',
      sub: 'google-id-1',
    })
    queryResults = [
      {
        rows: [
          {
            email: 'molly@example.com',
            google_id: 'google-id-1',
            id: 7,
          },
        ],
      },
    ]
    await authService().login({ credential: 'google-token' })

    await expect(authService().check()).resolves.toEqual({
      email: 'molly@example.com',
      id: 7,
      name: 'Molly',
    })
  })
})
