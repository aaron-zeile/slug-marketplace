import { describe, it, expect, vi, beforeEach } from 'vitest';

type RequestConfigFn = (
  params: Record<string, unknown>,
) => Promise<{ locale: string; messages: Record<string, unknown> }>;

vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: RequestConfigFn) => fn,
}));

const { mockCookiesGet } = vi.hoisted(() => ({
  mockCookiesGet: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));

import requestConfig from '@/i18n/request';

describe('i18n requestConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns "en" locale when no cookie is set', async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const result = await (requestConfig as RequestConfigFn)({});
    expect(result.locale).toBe('en');
  });

  it('returns the locale value from the cookie when set', async () => {
    mockCookiesGet.mockReturnValue({ value: 'fr' });
    const result = await (requestConfig as RequestConfigFn)({});
    expect(result.locale).toBe('fr');
  });

  it('loads the messages for the resolved locale', async () => {
    mockCookiesGet.mockReturnValue({ value: 'en' });
    const result = await (requestConfig as RequestConfigFn)({});
    expect(result.messages).toBeDefined();
    expect(typeof result.messages).toBe('object');
  });

  it('loads fr messages when locale cookie is "fr"', async () => {
    mockCookiesGet.mockReturnValue({ value: 'fr' });
    const result = await (requestConfig as RequestConfigFn)({});
    expect(result.locale).toBe('fr');
    expect(result.messages).toBeDefined();
  });
});
