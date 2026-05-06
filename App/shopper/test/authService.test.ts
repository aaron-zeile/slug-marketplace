// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'crypto'
import { EncryptJWT } from 'jose'
import { Pool } from 'pg'

import { setAuthCookieStoreForTest } from '../src/auth/cookies'
import { AuthService } from '../src/auth/service'

const google = vi.hoisted(() => {
  return {
    verifyGoogleToken: vi.fn(),
  }
})

vi.mock('../src/auth/google', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/auth/google')>()

  return {
    ...actual,
    verifyGoogleToken: google.verifyGoogleToken,
  }
})

const cookies: Record<string, string> = {}
const googleProfile = {
  email: 'username@example.com',
  name: 'username',
  sub: 'mock-google-user',
}
const JWE_ALGORITHM = 'A128CBC-HS256'

let pool: Pool

beforeAll(async () => {
  process.env.AUTH_SECRET = 'test-secret'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5433/test'

  pool = new Pool({ connectionString: process.env.DATABASE_URL })
})

beforeEach(async () => {
  google.verifyGoogleToken.mockReset()

  for (const name of Object.keys(cookies)) {
    delete cookies[name]
  }

  setAuthCookieStoreForTest(async () => {
    return {
      delete: (name: string) => {
        delete cookies[name]
      },
      get: (name: string) => {
        const value = cookies[name]

        return value ? { value } : undefined
      },
      set: (name: string, value: string) => {
        cookies[name] = value
      },
    }
  })

  await pool.query('TRUNCATE member RESTART IDENTITY')
})

afterAll(async () => {
  setAuthCookieStoreForTest(undefined)
  await pool.end()
})

describe('AuthService', () => {
  it('logs in an existing member and sets a session cookie', async () => {
    google.verifyGoogleToken.mockResolvedValue({
      email: 'molly@example.com',
      name: 'Molly',
      sub: 'google-id-1',
    })
    const {
      rows: [member],
    } = await pool.query<{ id: number }>(
      `INSERT INTO member (email, google_id)
       VALUES ($1, $2)
       RETURNING id`,
      ['molly@example.com', 'google-id-1'],
    )

    const authenticated = await new AuthService().login({
      credential: 'google-token',
    })

    expect(cookies.session).toEqual(expect.any(String))
    expect(authenticated).toEqual({
      email: 'molly@example.com',
      id: member.id,
      name: 'Molly',
    })
  })

  it('creates a member from Google token info when none exists', async () => {
    google.verifyGoogleToken.mockResolvedValue({
      email: 'new@example.com',
      name: 'New User',
      sub: 'google-id-new',
    })

    const authenticated = await new AuthService().login({
      credential: 'new-google-token',
    })
    const {
      rows: [member],
    } = await pool.query(
      'SELECT id, email, google_id FROM member WHERE google_id = $1',
      ['google-id-new'],
    )

    expect(cookies.session).toEqual(expect.any(String))
    expect(member).toEqual({
      email: 'new@example.com',
      google_id: 'google-id-new',
      id: authenticated.id,
    })
    expect(authenticated).toEqual({
      email: 'new@example.com',
      id: authenticated.id,
      name: 'New User',
    })
  })

  it('rejects an invalid Google token', async () => {
    google.verifyGoogleToken.mockRejectedValue(new Error('Invalid Google token'))

    await expect(
      new AuthService().login({ credential: 'bad-google-token' }),
    ).rejects.toThrow('Invalid Google token')
    await expect(pool.query('SELECT * FROM member')).resolves.toMatchObject({
      rows: [],
    })
    expect(cookies.session).toBeUndefined()
  })

  it('checks a valid session cookie', async () => {
    google.verifyGoogleToken.mockResolvedValue(googleProfile)

    const authenticated = await new AuthService().login({
      credential: 'google-token',
    })

    await expect(new AuthService().check()).resolves.toEqual(authenticated)
  })

  it('rejects an invalid session cookie payload', async () => {
    cookies.session = await new EncryptJWT({
      email: 'molly@example.com',
      id: 1,
    })
      .setProtectedHeader({ alg: 'dir', enc: JWE_ALGORITHM })
      .encrypt(
        new Uint8Array(createHash('sha256').update(process.env.AUTH_SECRET!).digest()),
      )

    await expect(new AuthService().check()).rejects.toThrow(
      'Invalid session cookie',
    )
  })
})
