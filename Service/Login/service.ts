import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

import type { Authenticated, Credentials, SessionUser } from './src';
import { verifyGoogleToken } from './src/google';

const SESSION_DURATION = '2h';

interface MemberRow {
  id: string;
  email: string;
  google_id: string;
}

interface TokenPayload extends SessionUser {
  exp: number;
  iat: number;
}

interface DbClient {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

let db: Pool | undefined;
let dbForTest: DbClient | undefined;

export function setAuthDbForTest(testDb: DbClient | undefined) {
  dbForTest = testDb;
}

export async function closeAuthDbForTest() {
  if (db) {
    await db.end();
    db = undefined;
  }
}

function getDb() {
  if (dbForTest) {
    return dbForTest;
  }

  const connectionString =
    process.env.LOGIN_DATABASE_URL ?? process.env.ADMIN_DATABASE_URL;

  db ??= new Pool({
    connectionString,
  });

  return db;
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is required');
  }

  return secret;
}

function getBearerToken(authorization?: string) {
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    throw new Error('Missing bearer token');
  }

  return token;
}

export class AuthService {
  public async login(credentials: Credentials): Promise<Authenticated> {
    const payload = await verifyGoogleToken(credentials.credential);
    const result = await getDb().query<MemberRow>(
      'SELECT id, email, google_id FROM member WHERE google_id = $1',
      [payload.sub],
    );
    let member = result.rows[0];

    if (!member) {
      const newMember = await getDb().query<MemberRow>(
        `INSERT INTO member (email, google_id)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE
         SET google_id = EXCLUDED.google_id
         RETURNING id, email, google_id`,
        [payload.email, payload.sub],
      );
      member = newMember.rows[0];
    }

    const user: SessionUser = {
      id: member.id,
      email: member.email,
      name: payload.name ?? member.email,
    };

    return {
      ...user,
      token: jwt.sign(user, getSessionSecret(), {
        expiresIn: SESSION_DURATION,
      }),
    };
  }

  public async check(
    authorization?: string,
    _scopes?: string[],
  ): Promise<SessionUser> {
    const token = getBearerToken(authorization);
    const payload = jwt.verify(
      token,
      getSessionSecret(),
    ) as Partial<TokenPayload>;

    if (
      typeof payload.id !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      throw new Error('Invalid authorization token');
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  }
}
