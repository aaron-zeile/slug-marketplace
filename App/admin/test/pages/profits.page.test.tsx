import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@mui/x-charts/BarChart', () => ({
  BarChart: () => <div data-testid="bar-chart" />,
}));

import ProfitsPage from '@/app/dashboard/profits/page';

function mockMonthlyProfit(rows: { month: string; profit: number }[]) {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { monthlyProfit: rows } }),
  });
}

describe('ProfitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Monthly Profits heading', () => {
    mockMonthlyProfit([]);
    render(<ProfitsPage />);
    expect(screen.getByRole('heading', { name: /monthly profits/i })).toBeInTheDocument();
  });

  it('renders the three summary stat cards', () => {
    mockMonthlyProfit([]);
    render(<ProfitsPage />);
    expect(screen.getByText(/total profit/i)).toBeInTheDocument();
    expect(screen.getByText(/average \/ month/i)).toBeInTheDocument();
    expect(screen.getByText(/best month/i)).toBeInTheDocument();
  });

  it('shows zero totals when there is no data', () => {
    mockMonthlyProfit([]);
    render(<ProfitsPage />);
    // Total profit and average are formatted as currency with no decimals.
    const zeros = screen.getAllByText('$0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('embeds the BarChart visualisation', async () => {
    mockMonthlyProfit([{ month: '2024-01', profit: 100 }]);
    render(<ProfitsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('updates the summary cards when chart data is loaded', async () => {
    mockMonthlyProfit([
      { month: '2024-01', profit: 1000 },
      { month: '2024-02', profit: 3000 },
    ]);
    render(<ProfitsPage />);

    await waitFor(() => {
      expect(screen.getByText('$4,000')).toBeInTheDocument();
    });
    expect(screen.getByText('$2,000')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('2024-02')).toBeInTheDocument();
  });

  it('keeps the best month when later months have lower profit', async () => {
    mockMonthlyProfit([
      { month: '2024-01', profit: 5000 },
      { month: '2024-02', profit: 1000 },
    ]);
    render(<ProfitsPage />);

    await waitFor(() => {
      expect(screen.getByText('2024-01')).toBeInTheDocument();
    });
    // best month stays at the first (highest) entry
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });
});
