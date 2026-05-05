import 'server-only'

import { createHash } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { EncryptJWT, jwtDecrypt } from 'jose'
import { cookies } from 'next/headers'
import { Pool } from 'pg'

import type { Authenticated, Credentials, SessionUser } from '.'

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const googleClient = new OAuth2Client(googleClientId)
const JWE_ALGORITHM = 'A128CBC-HS256'
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000

interface MemberRow {
  id: number
  email: string
  google_id: string
}

let db: Pool | undefined

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL')
  }

  db ??= new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  return db
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error('Missing AUTH_SECRET')
  }

  return createHash('sha256').update(secret).digest()
}

async function verifyGoogleToken(token: string) {
  if (!googleClientId) {
    throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID')
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  })

  const payload = ticket.getPayload()

  if (!payload?.sub || !payload.email) {
    throw new Error('Invalid Google token')
  }

  return payload
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

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    const authToken = await new EncryptJWT({
      id: member.id,
      email: member.email,
    })
      .setProtectedHeader({ alg: 'dir', enc: JWE_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime('2h')
      .encrypt(getSessionSecret())

    const cookieStore = await cookies()
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
      name: payload.name ?? member.email,
    }
  }

  public async check(): Promise<SessionUser> {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value

    if (!cookie) {
      throw new Error('No session cookie')
    }

    const { payload } = await jwtDecrypt(cookie, getSessionSecret(), {
      contentEncryptionAlgorithms: [JWE_ALGORITHM],
    })

    if (typeof payload.id !== 'number' || typeof payload.email !== 'string') {
      throw new Error('Invalid session cookie')
    }

    return {
      id: payload.id,
      email: payload.email,
    }
  }
}
