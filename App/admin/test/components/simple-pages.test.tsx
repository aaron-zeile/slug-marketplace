import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AccountsPage from '@/app/dashboard/accounts/page';
import ReportsPage from '@/app/dashboard/reports/page';
import LoginPage from '@/app/login/page';
import { LogoutPage } from '@/components/dashboard/LogoutPage';

describe('AccountsPage', () => {
  it('renders the Accounts heading', () => {
    render(<AccountsPage />);
    expect(
      screen.getByRole('heading', { name: /accounts/i }),
    ).toBeInTheDocument();
  });

  it('renders a description hint about coming soon', () => {
    render(<AccountsPage />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});

describe('ReportsPage', () => {
  it('renders the Reports heading', () => {
    render(<ReportsPage />);
    expect(
      screen.getByRole('heading', { name: /reports/i }),
    ).toBeInTheDocument();
  });
});

describe('LoginPage', () => {
  it('renders the Login heading', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});

describe('LogoutPage', () => {
  it('renders the logging out message', () => {
    render(<LogoutPage />);
    expect(
      screen.getByRole('heading', { name: /logging out/i }),
    ).toBeInTheDocument();
  });
});
