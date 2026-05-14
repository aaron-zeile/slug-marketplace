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
    it('redirects /admin/dashboard to /admin/login', () => {
      middleware(makeRequest('/admin/dashboard', false));
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/admin/login' }),
      );
    });

    it('redirects /admin/dashboard/accounts to /admin/login', () => {
      middleware(makeRequest('/admin/dashboard/accounts', false));
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('allows access to /admin/login', () => {
      middleware(makeRequest('/admin/login', false));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows access to /admin (root)', () => {
      middleware(makeRequest('/admin', false));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows access to /admin/ (trailing slash)', () => {
      middleware(makeRequest('/admin/', false));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    it('redirects /admin/login to /admin/dashboard', () => {
      middleware(makeRequest('/admin/login', true));
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/admin/dashboard' }),
      );
    });

    it('redirects /admin to /admin/dashboard', () => {
      middleware(makeRequest('/admin', true));
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/admin/dashboard' }),
      );
    });

    it('allows access to /admin/dashboard', () => {
      middleware(makeRequest('/admin/dashboard', true));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('allows access to /admin/dashboard/reports', () => {
      middleware(makeRequest('/admin/dashboard/reports', true));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
