import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'en' }),
  }),
}));

vi.mock('@/components/dashboard/localeSwitcher/localeSwitcher', () => ({
  default: ({ currentLocale }: { currentLocale: string }) => (
    <div data-testid="locale-switcher" data-locale={currentLocale} />
  ),
}));

import DashboardPage from '@/app/dashboard/page';

describe('DashboardPage', () => {
  it('renders the Dashboard heading', async () => {
    render(await DashboardPage());
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the welcome description text', async () => {
    render(await DashboardPage());
    expect(screen.getByText(/slug marketplace admin panel/i)).toBeInTheDocument();
  });

  it('renders the LocaleSwitcher with the locale from the cookie', async () => {
    render(await DashboardPage());
    expect(screen.getByTestId('locale-switcher')).toHaveAttribute('data-locale', 'en');
  });

  it('defaults locale to "en" when cookie is not set', async () => {
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    render(await DashboardPage());
    expect(screen.getByTestId('locale-switcher')).toHaveAttribute('data-locale', 'en');
  });
});
