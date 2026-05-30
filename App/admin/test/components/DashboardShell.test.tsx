import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('@/components/dashboard/LogoutButton', () => ({
  default: () => <button>Logout</button>,
}));

vi.mock('@/components/dashboard/localeSwitcher/localeSwitcher', () => ({
  default: ({ currentLocale }: { currentLocale: string }) => (
    <div data-testid="locale-switcher" data-locale={currentLocale} />
  ),
}));

import DashboardShell from '@/components/dashboard/DashboardShell';

describe('DashboardShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard title after mounting', async () => {
    render(<DashboardShell currentLocale="en">content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByText('title')).toBeInTheDocument();
    });
  });

  it('renders children after mounting', async () => {
    render(
      <DashboardShell currentLocale="en">
        <div>child content</div>
      </DashboardShell>,
    );
    await waitFor(() => {
      expect(screen.getByText('child content')).toBeInTheDocument();
    });
  });

  it('renders the logout button', async () => {
    render(<DashboardShell currentLocale="en">content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('renders the sidebar nav links', async () => {
    render(<DashboardShell currentLocale="en">content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /profits/i })).toHaveAttribute(
      'href',
      '/dashboard/profits',
    );
    expect(screen.getByRole('link', { name: /listings/i })).toHaveAttribute(
      'href',
      '/dashboard/listings',
    );
    expect(screen.getByRole('link', { name: /reviews/i })).toHaveAttribute(
      'href',
      '/dashboard/reviews',
    );
    expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute(
      'href',
      '/dashboard/seller-messages',
    );
    expect(screen.getByRole('link', { name: /accounts/i })).toHaveAttribute(
      'href',
      '/dashboard/accounts',
    );
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute(
      'href',
      '/dashboard/reports',
    );
  });

  it('passes the current locale to the LocaleSwitcher', async () => {
    render(<DashboardShell currentLocale="fr">content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByTestId('locale-switcher')).toHaveAttribute('data-locale', 'fr');
    });
  });

  it('returns null on the server snapshot before hydration', () => {
    const html = renderToString(
      <DashboardShell currentLocale="en">hidden</DashboardShell>,
    );

    expect(html).toBe('');
  });
});
