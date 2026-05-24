import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';

const { mockCookiesGet } = vi.hoisted(() => ({
  mockCookiesGet: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="intl-provider">{children}</div>
  ),
}));

import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children with locale from cookie', async () => {
    mockCookiesGet.mockReturnValue({ value: 'fr' });

    const element = await RootLayout({ children: <div>app child</div> });
    const html = renderToString(element);

    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('fr');
    expect(html).toContain('app child');
  });

  it('defaults html lang to en when locale cookie is missing', async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const element = await RootLayout({ children: <span>fallback</span> });
    const html = renderToString(element);

    expect(element.props.lang).toBe('en');
    expect(html).toContain('fallback');
  });
});
