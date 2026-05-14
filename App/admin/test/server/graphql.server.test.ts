import { describe, it, expect, vi } from 'vitest';
import 'reflect-metadata';

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mockSql }));

import { getYoga } from '@/graphql/server';

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
});
