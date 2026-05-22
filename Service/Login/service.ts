import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { createHash, randomBytes } from 'node:crypto';

import type {
  Authenticated,
  CorporateApiKeyCreated,
  CorporateApiKeyRequest,
  Credentials,
  SessionUser,
} from './src';
import { verifyGoogleToken } from './src/google';

const SESSION_DURATION = '2h';

interface MemberRow {
  id: string;
  email: string;
  google_id: string;
}

interface CorporateApiKeyRow {
  id: string;
  name: string;
  key_hash: string;
  created_at: Date | string;
  seller_id: string;
  email: string;
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

export function getDb() {
  if (dbForTest) {
    return dbForTest;
  }

  const connectionString =
    process.env.LOGIN_DATABASE_URL ??
    process.env.ADMIN_DATABASE_URL ??
    process.env.DATABASE_URL;

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

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function createSessionToken(user: SessionUser): string {
  return jwt.sign(user, getSessionSecret(), {
    expiresIn: SESSION_DURATION,
  });
}

export class AuthService {
  public async login(credentials: Credentials): Promise<Authenticated> {
    // console.debug('[login-service] Login request received', {
    //   hasCredential: Boolean(credentials.credential),
    //   hasGoogleClientId: Boolean(
    //     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    //   ),
    //   hasDatabaseUrl: Boolean(
    //     process.env.LOGIN_DATABASE_URL ?? process.env.ADMIN_DATABASE_URL,
    //   ),
    //   hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    // });

    const payload = await verifyGoogleToken(credentials.credential);

    // console.debug('[login-service] Google token verified', {
    //   email: payload.email,
    //   hasName: Boolean(payload.name),
    //   hasSubject: Boolean(payload.sub),
    // });

    const result = await getDb().query<MemberRow>(
      'SELECT id, email, google_id FROM member WHERE google_id = $1',
      [payload.sub],
    );
    let member = result.rows[0];

    // console.debug('[login-service] Member lookup completed', {
    //   foundExistingMember: Boolean(member),
    // });

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

      // console.debug('[login-service] Member created or updated from Google login', {
      //   memberId: member.id,
      //   email: member.email,
      // });
    }

    const user: SessionUser = {
      id: member.id,
      email: member.email,
      name: payload.name ?? member.email,
    };

    return {
      ...user,
      token: createSessionToken(user),
    };
  }

  public async check(
    authorization?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _scopes?: string[],
  ): Promise<SessionUser> {
    // console.debug('[login-service] Session check received', {
    //   hasAuthorizationHeader: Boolean(authorization),
    //   hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    // });

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

    const result = await getDb().query<Pick<MemberRow, 'id' | 'email'>>(
      'SELECT id, email FROM member WHERE id = $1',
      [payload.id],
    );
    const member = result.rows[0];

    if (!member) {
      throw new Error('Member not found');
    }

    return {
      id: member.id,
      email: member.email,
      name: payload.name,
    };
  }

  public async createCorporateApiKey(
    authorization: string | undefined,
    request: CorporateApiKeyRequest,
  ): Promise<CorporateApiKeyCreated> {
    const user = await this.check(authorization, ['member']);
    const name = request.name?.trim();

    if (!name) {
      throw new Error('API key name is required');
    }

    const key = `slug_sk_${randomBytes(32).toString('base64url')}`;
    const result = await getDb().query<CorporateApiKeyRow>(
      `INSERT INTO corporate_api_key (seller_id, name, key_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, key_hash, created_at, seller_id, '' AS email`,
      [user.id, name, hashApiKey(key)],
    );
    const row = result.rows[0];

    return {
      id: row.id,
      name: row.name,
      key,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : row.created_at,
    };
  }

  public async checkCorporateApiKey(
    authorization?: string,
  ): Promise<Authenticated> {
    const key = getBearerToken(authorization);
    const result = await getDb().query<CorporateApiKeyRow>(
      `SELECT
         cak.id,
         cak.name,
         cak.key_hash,
         cak.created_at,
         cak.seller_id,
         member.email
       FROM corporate_api_key cak
       JOIN member ON member.id = cak.seller_id
       WHERE cak.key_hash = $1
         AND cak.revoked_at IS NULL
       LIMIT 1`,
      [hashApiKey(key)],
    );
    const row = result.rows[0];

    if (!row) {
      throw new Error('Invalid API key');
    }

    const user: SessionUser = {
      id: row.seller_id,
      email: row.email,
      name: row.name,
    };

    return {
      ...user,
      token: createSessionToken(user),
    };
  }
}
