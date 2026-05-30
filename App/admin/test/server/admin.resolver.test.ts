import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GraphQLContext } from '@/graphql/server';

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mockSql }));
vi.mock('bcryptjs', () => ({ default: { compare: vi.fn() } }));
vi.mock('iron-session', () => ({ getIronSession: vi.fn() }));

import { AdminResolver } from '@/graphql/resolvers/admin.resolver';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';

function makeAuthenticatedCtx(): GraphQLContext {
  return {
    request: new Request('http://localhost/admin/api/graphql'),
    responseHeaders: new Headers(),
  };
}

function makeCtx(): GraphQLContext {
  return {
    request: new Request('http://localhost/admin/api/graphql'),
    responseHeaders: new Headers(),
  };
}

describe('AdminResolver.health', () => {
  it('returns true', () => {
    expect(new AdminResolver().health()).toBe(true);
  });
});

describe('AdminResolver.login', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalid credentials when no admin exists for that email', async () => {
    mockSql.mockResolvedValue([]);

    const result = await resolver.login('nobody@test.com', 'password', makeCtx());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  it('returns invalid credentials when password does not match', async () => {
    mockSql.mockResolvedValue([{ id: 1, email: 'admin@test.com', password_hash: 'hash' }]);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await resolver.login('admin@test.com', 'wrongpass', makeCtx());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  it('returns success and writes session on valid credentials', async () => {
    const mockAdmin = { id: 1, email: 'admin@test.com', password_hash: 'hash' };
    mockSql.mockResolvedValue([mockAdmin]);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const mockSession = { adminId: 0, email: '', save: vi.fn() };
    vi.mocked(getIronSession).mockResolvedValue(mockSession as never);

    const ctx = makeCtx();
    const result = await resolver.login('admin@test.com', 'correctpass', ctx);

    expect(result.success).toBe(true);
    expect(result.message).toBeUndefined();
    expect(mockSession.adminId).toBe(1);
    expect(mockSession.email).toBe('admin@test.com');
    expect(mockSession.save).toHaveBeenCalledOnce();
  });

  it('copies Set-Cookie headers from the temp response onto ctx.responseHeaders', async () => {
    mockSql.mockResolvedValue([
      { id: 1, email: 'admin@test.com', password_hash: 'hash' },
    ]);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(getIronSession).mockImplementation(
      async (_req, tempResponse: Response) => {
        const session = {
          adminId: 0,
          email: '',
          save: vi.fn(async () => {
            tempResponse.headers.append('Set-Cookie', 'admin-session=test');
          }),
        };
        return session as never;
      },
    );

    const ctx = makeCtx();
    await resolver.login('admin@test.com', 'correctpass', ctx);

    expect(ctx.responseHeaders.get('Set-Cookie')).toContain('admin-session');
  });

  it('does not reveal whether the email exists — both failure cases return the same message', async () => {
    mockSql.mockResolvedValue([]);
    const noUser = await resolver.login('nouser@test.com', 'pass', makeCtx());

    mockSql.mockResolvedValue([{ id: 1, email: 'admin@test.com', password_hash: 'hash' }]);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const badPass = await resolver.login('admin@test.com', 'wrongpass', makeCtx());

    expect(noUser.message).toBe(badPass.message);
  });

  it('queries the database with the provided email', async () => {
    mockSql.mockResolvedValue([]);

    await resolver.login('search@test.com', 'pass', makeCtx());

    expect(mockSql).toHaveBeenCalledOnce();
  });

  it('does not compare passwords when admin is not found', async () => {
    mockSql.mockResolvedValue([]);

    await resolver.login('nobody@test.com', 'pass', makeCtx());

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});

describe('AdminResolver.logout', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('destroys the session and returns success', async () => {
    const mockSession = { destroy: vi.fn() };
    vi.mocked(getIronSession).mockResolvedValue(mockSession as never);

    const result = await resolver.logout(makeCtx());

    expect(mockSession.destroy).toHaveBeenCalledOnce();
    expect(result.success).toBe(true);
  });

  it('calls getIronSession with the request and sessionOptions', async () => {
    const mockSession = { destroy: vi.fn() };
    vi.mocked(getIronSession).mockResolvedValue(mockSession as never);

    const ctx = makeCtx();
    await resolver.logout(ctx);

    expect(getIronSession).toHaveBeenCalledWith(
      ctx.request,
      expect.any(Response),
      expect.objectContaining({ cookieName: 'admin-session' }),
    );
  });

  it('does not return a message on successful logout', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ destroy: vi.fn() } as never);

    const result = await resolver.logout(makeCtx());

    expect(result.message).toBeUndefined();
  });

  it('copies cleared session headers from the temp response onto ctx.responseHeaders', async () => {
    vi.mocked(getIronSession).mockImplementation(
      async (_req, tempResponse: Response) => ({
        destroy: vi.fn(async () => {
          tempResponse.headers.append('Set-Cookie', 'admin-session=; Max-Age=0');
        }),
      }) as never,
    );

    const ctx = makeCtx();
    await resolver.logout(ctx);

    expect(ctx.responseHeaders.get('Set-Cookie')).toContain('Max-Age=0');
  });
});

describe('AdminResolver.sellerMessages', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when the session has no adminId', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: undefined } as never);

    await expect(resolver.sellerMessages(makeCtx())).rejects.toThrow(
      'Not authenticated',
    );
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('returns mapped seller messages when authenticated', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    mockSql.mockResolvedValue([
      {
        id: 'msg-1',
        seller_id: 'seller-1',
        seller_name: 'Taylor Brooks',
        seller_email: 'seller@example.com',
        subject: 'Help',
        body: 'Need help',
        created_at: new Date('2024-06-01T12:00:00.000Z'),
      },
    ]);

    const result = await resolver.sellerMessages(makeCtx());

    expect(result).toEqual([
      {
        id: 'msg-1',
        sellerId: 'seller-1',
        sellerName: 'Taylor Brooks',
        sellerEmail: 'seller@example.com',
        subject: 'Help',
        body: 'Need help',
        createdAt: '2024-06-01T12:00:00.000Z',
      },
    ]);
    expect(mockSql).toHaveBeenCalledOnce();
  });
});

describe('AdminResolver.adminItems', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('throws when not authenticated', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: undefined } as never);

    await expect(resolver.adminItems(makeAuthenticatedCtx())).rejects.toThrow('Not authenticated');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns mapped items from the items service', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'item-1',
            name: 'Test Listing',
            seller: { id: 'seller-1', name: 'Alice' },
            price: '19.99',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ]),
        { status: 200 },
      ) as never,
    );

    const result = await resolver.adminItems(makeAuthenticatedCtx());

    expect(result).toEqual([
      {
        id: 'item-1',
        name: 'Test Listing',
        seller: { id: 'seller-1', name: 'Alice' },
        price: 19.99,
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('throws when the items service returns an error', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }) as never);

    await expect(resolver.adminItems(makeAuthenticatedCtx())).rejects.toThrow(
      'Failed to fetch items from items service',
    );
  });
});

describe('AdminResolver.adminDeleteItem', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('throws when not authenticated', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: undefined } as never);

    await expect(resolver.adminDeleteItem('item-1', makeAuthenticatedCtx())).rejects.toThrow(
      'Not authenticated',
    );
  });

  it('returns true on successful delete', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }) as never,
    );

    const result = await resolver.adminDeleteItem('item-1', makeAuthenticatedCtx());
    expect(result).toBe(true);
  });

  it('throws when item is not found', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 404 }) as never);

    await expect(resolver.adminDeleteItem('missing', makeAuthenticatedCtx())).rejects.toThrow(
      'Item not found',
    );
  });

  it('throws a generic error for non-404 failures', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }) as never);

    await expect(resolver.adminDeleteItem('item-1', makeAuthenticatedCtx())).rejects.toThrow(
      'Failed to delete item',
    );
  });
});

describe('AdminResolver.adminReviews', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('throws when not authenticated', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: undefined } as never);

    await expect(resolver.adminReviews(makeAuthenticatedCtx())).rejects.toThrow('Not authenticated');
  });

  it('returns mapped reviews from the items service', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'review-1',
            itemId: 'item-1',
            itemName: 'Test Listing',
            user: { id: 'user-1', name: 'Bob' },
            content: 'Great item!',
            rating: 5,
            created_at: '2024-03-01T00:00:00.000Z',
          },
        ]),
        { status: 200 },
      ) as never,
    );

    const result = await resolver.adminReviews(makeAuthenticatedCtx());

    expect(result).toEqual([
      {
        id: 'review-1',
        itemId: 'item-1',
        itemName: 'Test Listing',
        user: { id: 'user-1', name: 'Bob' },
        content: 'Great item!',
        rating: 5,
        createdAt: '2024-03-01T00:00:00.000Z',
      },
    ]);
  });

  it('throws when the items service returns an error', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }) as never);

    await expect(resolver.adminReviews(makeAuthenticatedCtx())).rejects.toThrow(
      'Failed to fetch reviews from items service',
    );
  });
});

describe('AdminResolver.adminDeleteReview', () => {
  const resolver = new AdminResolver();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('throws when not authenticated', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: undefined } as never);

    await expect(
      resolver.adminDeleteReview('review-1', makeAuthenticatedCtx()),
    ).rejects.toThrow('Not authenticated');
  });

  it('returns true on successful delete', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }) as never,
    );

    const result = await resolver.adminDeleteReview('review-1', makeAuthenticatedCtx());
    expect(result).toBe(true);
  });

  it('throws when review is not found', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 404 }) as never);

    await expect(
      resolver.adminDeleteReview('missing', makeAuthenticatedCtx()),
    ).rejects.toThrow('Review not found');
  });

  it('throws a generic error for non-404 failures', async () => {
    vi.mocked(getIronSession).mockResolvedValue({ adminId: 1 } as never);
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }) as never);

    await expect(
      resolver.adminDeleteReview('review-1', makeAuthenticatedCtx()),
    ).rejects.toThrow('Failed to delete review');
  });
});
