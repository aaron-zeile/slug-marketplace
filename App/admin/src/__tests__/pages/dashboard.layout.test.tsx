import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'en' }),
  }),
}));

vi.mock('@/app/dashboard/DashboardShell', () => ({
  default: ({ children, currentLocale }: { children: React.ReactNode; currentLocale: string }) => (
    <div data-testid="dashboard-shell" data-locale={currentLocale}>
      {children}
    </div>
  ),
}));

import React from 'react';
import DashboardLayout from '@/app/dashboard/layout';

describe('DashboardLayout', () => {
  it('renders children inside DashboardShell', async () => {
    render(await DashboardLayout({ children: <div>page content</div> }));
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('passes the locale from the cookie to DashboardShell', async () => {
    render(await DashboardLayout({ children: <span>x</span> }));
    expect(screen.getByTestId('dashboard-shell')).toHaveAttribute('data-locale', 'en');
  });

  it('defaults to "en" when the locale cookie is not set', async () => {
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    render(await DashboardLayout({ children: <span>x</span> }));
    expect(screen.getByTestId('dashboard-shell')).toHaveAttribute('data-locale', 'en');
  });
});
