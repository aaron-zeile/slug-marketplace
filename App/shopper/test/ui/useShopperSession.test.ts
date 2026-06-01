import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { checkLogin } from '../../src/app/buyer/login/actions';
import { useShopperSession } from '../../src/app/buyer/topbar/useShopperSession';

vi.mock('../../src/app/buyer/login/actions', () => ({
  checkLogin: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
});

it('restores authenticated state from session storage before checkLogin resolves', async () => {
  window.sessionStorage.setItem('name', 'Riley');
  vi.mocked(checkLogin).mockImplementation(
    () => new Promise(() => {}),
  );

  const { result } = renderHook(() => useShopperSession());

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.name).toBe('Riley');
  });
});

it('clears authenticated state when checkLogin returns no user', async () => {
  window.sessionStorage.setItem('name', 'Riley');
  vi.mocked(checkLogin).mockResolvedValue({});

  const { result } = renderHook(() => useShopperSession());

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.name).toBeNull();
  });
  expect(window.sessionStorage.getItem('name')).toBeNull();
});

it('keeps authenticated state when checkLogin returns a user', async () => {
  vi.mocked(checkLogin).mockResolvedValue({
    user: {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'riley@example.com',
      name: 'Riley',
    },
  });

  const { result } = renderHook(() => useShopperSession());

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.name).toBe('Riley');
  });
});

it('ignores stale session checks after clearSession is called', async () => {
  window.sessionStorage.setItem('name', 'Riley');
  let resolveCheck: (value: {
    user?: { id: string; email: string; name: string };
  }) => void = () => {};
  vi.mocked(checkLogin).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveCheck = resolve;
      }),
  );

  const { result } = renderHook(() => useShopperSession());

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
  });

  result.current.clearSession();

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(false);
  });

  resolveCheck({
    user: {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'riley@example.com',
      name: 'Riley',
    },
  });

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(false);
  });
});
