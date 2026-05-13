import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AccountsPage from '@/app/dashboard/accounts/page';
import ReportsPage from '@/app/dashboard/reports/page';
import ReviewsPage from '@/app/dashboard/reviews/page';
import ListingsPage from '@/app/dashboard/listings/page';
import LoginPage from '@/app/login/page';
import { LogoutPage } from '@/app/dashboard/logout';

describe('AccountsPage', () => {
  it('renders the Accounts heading', () => {
    render(<AccountsPage />);
    expect(screen.getByRole('heading', { name: /accounts/i })).toBeInTheDocument();
  });
});

describe('ReportsPage', () => {
  it('renders the Reports heading', () => {
    render(<ReportsPage />);
    expect(screen.getByRole('heading', { name: /reports/i })).toBeInTheDocument();
  });
});

describe('ReviewsPage', () => {
  it('renders the Reviews heading', () => {
    render(<ReviewsPage />);
    expect(screen.getByRole('heading', { name: /reviews/i })).toBeInTheDocument();
  });
});

describe('ListingsPage', () => {
  it('renders the Listings heading', () => {
    render(<ListingsPage />);
    expect(screen.getByRole('heading', { name: /listings/i })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: /logging out/i })).toBeInTheDocument();
  });
});
