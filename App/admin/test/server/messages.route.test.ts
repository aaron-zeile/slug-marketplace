import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mockSql }));

const validBody = {
  sellerId: 'seller-1',
  sellerName: 'Taylor Brooks',
  sellerEmail: 'seller@example.com',
  subject: 'Help',
  body: 'Need assistance with a listing.',
};

function makeRequest(
  init: { secret?: string; body?: unknown } = {},
): Request {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (init.secret !== undefined) {
    headers.set('X-Internal-Secret', init.secret);
  }

  return new Request('http://localhost/admin/api/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(init.body ?? validBody),
  });
}

describe('POST /api/messages', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSql.mockClear();
    mockSql.mockResolvedValue([]);
  });

  async function loadPost(secretEnv: string | undefined = 'test-internal-secret') {
    if (secretEnv === undefined) {
      delete process.env.ADMIN_INTERNAL_SECRET;
    } else {
      process.env.ADMIN_INTERNAL_SECRET = secretEnv;
    }
    const route = await import('@/app/api/messages/route');
    return route.POST;
  }

  it('returns 403 when internal secret is missing or wrong', async () => {
    const POST = await loadPost();

    const missing = await POST(makeRequest({ body: validBody }));
    expect(missing.status).toBe(403);
    await expect(missing.json()).resolves.toEqual({ error: 'Forbidden' });

    const wrong = await POST(
      makeRequest({ secret: 'wrong-secret', body: validBody }),
    );
    expect(wrong.status).toBe(403);
  });

  it('returns 400 when request body is invalid', async () => {
    const POST = await loadPost();

    const response = await POST(
      makeRequest({
        secret: 'test-internal-secret',
        body: { sellerId: 'only-id' },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid request' });
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('inserts a message and returns 201 when authorized', async () => {
    const POST = await loadPost();

    const response = await POST(
      makeRequest({ secret: 'test-internal-secret', body: validBody }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockSql).toHaveBeenCalledOnce();
  });

  it('uses dev-internal-secret when ADMIN_INTERNAL_SECRET is unset', async () => {
    vi.stubEnv('ADMIN_INTERNAL_SECRET', '');
    vi.resetModules();
    const { POST } = await import('@/app/api/messages/route');

    const response = await POST(
      makeRequest({ secret: 'dev-internal-secret', body: validBody }),
    );

    expect(response.status).toBe(201);
    vi.unstubAllEnvs();
  });
});
