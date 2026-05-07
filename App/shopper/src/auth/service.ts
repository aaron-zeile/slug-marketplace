import 'server-only'

import { createHash } from 'crypto'
import { EncryptJWT, jwtDecrypt } from 'jose'
import { Pool } from 'pg'

import type { Authenticated, Credentials, SessionUser } from '.'
import { getAuthCookieStore } from './cookies'
import { verifyGoogleToken } from './google'

const JWE_ALGORITHM = 'A128CBC-HS256'
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000

interface MemberRow {
  id: number
  email: string
  google_id: string
}

let db: Pool | undefined

function getDb() {
  db ??= new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  return db
}

function getSessionSecret() {
  return new Uint8Array(
    createHash('sha256').update(process.env.AUTH_SECRET!).digest(),
  )
}

export class AuthService {
  public async login(credentials: Credentials): Promise<Authenticated> {
    const payload = await verifyGoogleToken(credentials.credential)
    const result = await getDb().query<MemberRow>(
      'SELECT id, email, google_id FROM member WHERE google_id = $1',
      [payload.sub],
    )
    let member = result.rows[0]

    if (!member) {
      const newMember = await getDb().query<MemberRow>(
        `INSERT INTO member (email, google_id)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE
         SET google_id = EXCLUDED.google_id
         RETURNING id, email, google_id`,
        [payload.email, payload.sub],
      )
      member = newMember.rows[0]
    }

    const name = payload.name!
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    const authToken = await new EncryptJWT({
      id: member.id,
      email: member.email,
      name,
    })
      .setProtectedHeader({ alg: 'dir', enc: JWE_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime('2h')
      .encrypt(getSessionSecret())

    const cookieStore = await getAuthCookieStore()
    cookieStore.set('session', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })

    return {
      id: member.id,
      email: member.email,
      name,
    }
  }

  public async check(): Promise<SessionUser> {
    const cookieStore = await getAuthCookieStore()
    const cookie = cookieStore.get('session')?.value

    if (!cookie) {
      throw new Error('No session cookie')
    }

    const { payload } = await jwtDecrypt(cookie, getSessionSecret(), {
      contentEncryptionAlgorithms: [JWE_ALGORITHM],
    })

    if (
      typeof payload.id !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      throw new Error('Invalid session cookie')
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    }
  }
}
