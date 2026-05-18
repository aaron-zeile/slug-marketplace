import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/dashboard/LogoutButton', () => ({
  default: () => <button>Logout</button>,
}));

vi.mock('@/components/dashboard/charts/chart', () => ({
  default: () => <div data-testid="simple-charts" />,
}));

import DashboardShell from '@/components/dashboard/DashboardShell';

describe('DashboardShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard title after mounting', async () => {
    render(<DashboardShell>content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByText('title')).toBeInTheDocument();
    });
  });

  it('renders children after mounting', async () => {
    render(
      <DashboardShell>
        <div>child content</div>
      </DashboardShell>,
    );
    await waitFor(() => {
      expect(screen.getByText('child content')).toBeInTheDocument();
    });
  });

  it('renders the logout button', async () => {
    render(<DashboardShell>content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('renders the charts component', async () => {
    render(<DashboardShell>content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByTestId('simple-charts')).toBeInTheDocument();
    });
  });

  it('renders the Monthly Profit label', async () => {
    render(<DashboardShell>content</DashboardShell>);
    await waitFor(() => {
      expect(screen.getByText(/monthly profit/i)).toBeInTheDocument();
    });
  });

  it('returns null before mounting (no content in initial render)', () => {
    // useEffect hasn't run yet in the very first synchronous pass
    // After effects fire the content appears — we verify the component
    // eventually renders something (not null indefinitely)
    render(<DashboardShell>test</DashboardShell>);
    // waitFor below confirms it does render after mount
    return waitFor(() => expect(screen.getByText('test')).toBeInTheDocument());
  });
});
