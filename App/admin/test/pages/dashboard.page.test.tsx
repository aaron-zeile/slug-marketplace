import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import DashboardPage from '@/app/dashboard/page';

describe('DashboardPage', () => {
  it('renders the Dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the welcome description text', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/slug marketplace admin panel/i)).toBeInTheDocument();
  });

  it('renders quick-link cards for the main sections', () => {
    render(<DashboardPage />);
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
});
