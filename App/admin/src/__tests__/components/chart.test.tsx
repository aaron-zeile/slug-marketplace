import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@mui/x-charts/BarChart', () => ({
  BarChart: () => <div data-testid="bar-chart" />,
}));

import SimpleCharts from '@/app/dashboard/charts/chart';

function mockFetch(monthlyProfit: { month: string; profit: number }[]) {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: { monthlyProfit } }),
  });
}

describe('SimpleCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches monthly profit data from the graphql endpoint on mount', async () => {
    mockFetch([]);
    render(<SimpleCharts />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/admin/api/graphql',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('monthlyProfit'),
        }),
      );
    });
  });

  it('shows "No data available" when the API returns an empty array', async () => {
    mockFetch([]);
    render(<SimpleCharts />);
    await waitFor(() => {
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });

  it('renders the BarChart after mounting', async () => {
    mockFetch([]);
    render(<SimpleCharts />);
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('hides the "No data available" message when data is present', async () => {
    mockFetch([
      { month: '2024-01', profit: 100 },
      { month: '2024-02', profit: 200 },
    ]);
    render(<SimpleCharts />);
    await waitFor(() => {
      expect(screen.queryByText(/no data available/i)).not.toBeInTheDocument();
    });
  });

  it('renders the BarChart with data present', async () => {
    mockFetch([{ month: '2024-01', profit: 500 }]);
    render(<SimpleCharts />);
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('does not crash when fetch returns no monthlyProfit field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: {} }),
    });
    render(<SimpleCharts />);
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});
