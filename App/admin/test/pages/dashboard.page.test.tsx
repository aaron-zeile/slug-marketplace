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
});
