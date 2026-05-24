import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mockSql }));
vi.mock('bcryptjs', () => ({ default: { compare: vi.fn() } }));
vi.mock('iron-session', () => ({ getIronSession: vi.fn() }));

import { getYoga } from '@/graphql/server';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';

describe('getYoga', () => {
  it('returns an object with a handleRequest function', async () => {
    const yoga = await getYoga();

    expect(yoga).toBeDefined();
    expect(typeof yoga.handleRequest).toBe('function');
  });

  it('returns the same singleton instance on repeated calls', async () => {
    const yoga1 = await getYoga();
    const yoga2 = await getYoga();

    expect(yoga1).toBe(yoga2);
  });

  it('returns an instance that handles GraphQL requests', async () => {
    const yoga = await getYoga();

    const req = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ health }' }),
    });

    const response = await yoga.handleRequest(req, {
      request: req,
      responseHeaders: new Headers(),
    });

    expect(response.status).toBe(200);
    const body = await response.json() as { data: { health: boolean } };
    expect(body.data.health).toBe(true);
  });

  it('appends responseHeaders from context onto the HTTP response', async () => {
    mockSql.mockResolvedValue([
      { id: 1, email: 'admin@test.com', password_hash: 'hash' },
    ]);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(getIronSession).mockImplementation(
      async (_req, tempResponse: Response) => ({
        adminId: 0,
        email: '',
        save: vi.fn(async () => {
          tempResponse.headers.append('Set-Cookie', 'admin-session=yoga-test');
        }),
      }) as never,
    );

    const yoga = await getYoga();
    const req = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) { success }
        }`,
        variables: { email: 'admin@test.com', password: 'secret' },
      }),
    });

    const response = await yoga.handleRequest(req, {
      request: req,
      responseHeaders: new Headers(),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toContain('admin-session=yoga-test');
  });
});
