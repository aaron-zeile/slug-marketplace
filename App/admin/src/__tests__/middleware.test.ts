import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { mockRedirect, mockNext } = vi.hoisted(() => ({
  mockRedirect: vi.fn((url: URL) => ({ type: 'redirect', destination: url.pathname })),
  mockNext: vi.fn(() => ({ type: 'next' })),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
  },
}));

import { middleware } from '@/middleware';

function makeRequest(pathname: string, hasSession: boolean): NextRequest {
  return {
    cookies: {
      get: (name: string) =>
        hasSession && name === 'admin-session' ? { value: 'mock-token' } : undefined,
    },
    nextUrl: { pathname },
    url: `http://localhost:3002${pathname}`,
  } as unknown as NextRequest;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unauthenticated user', () => {
    it('redirects /dashboard to /login', () => {
      middleware(makeRequest('/dashboard', false));
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/login' }),
      );
    });

    it('redirects /dashboard/accounts to /login', () => {
      middleware(makeRequest('/dashboard/accounts', false));
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('allows access to /login', () => {
      middleware(makeRequest('/login', false));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows access to / (root login page)', () => {
      middleware(makeRequest('/', false));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('redirects /login to /dashboard', () => {
      middleware(makeRequest('/login', true));
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/dashboard' }),
      );
    });

    it('redirects / to /dashboard', () => {
      middleware(makeRequest('/', true));
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/dashboard' }),
      );
    });

    it('allows access to /dashboard', () => {
      middleware(makeRequest('/dashboard', true));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows access to /dashboard/reports', () => {
      middleware(makeRequest('/dashboard/reports', true));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
