'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MONTHLY_PROFIT_QUERY = `
  query MonthlyProfit {
    monthlyProfit {
      month
      profit
    }
  }
`;

interface MonthlyProfit {
  month: string;
  profit: number;
}

interface SimpleChartsProps {
  width?: number;
  height?: number;
  onData?: (data: MonthlyProfit[]) => void;
}

function subscribe() {
  return () => {};
}

export default function SimpleCharts({
  width = 500,
  height = 300,
  onData,
}: SimpleChartsProps = {}) {
  const [data, setData] = useState<MonthlyProfit[]>([]);

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    fetch('/admin/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: MONTHLY_PROFIT_QUERY }),
    })
      .then((res) => res.json())
      .then(({ data }) => {
        if (data?.monthlyProfit) {
          setData(data.monthlyProfit);
          onData?.(data.monthlyProfit);
        }
      });
  }, [onData]);

  if (!mounted) return null;

  return (
    <Box>
      {data.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 2, textAlign: 'center' }}
        >
          No data available
        </Typography>
      )}
      <BarChart
        xAxis={[
          {
            id: 'barCategories',
            data: data.map((d) => d.month),
            height: 30,
          },
        ]}
        series={[
          {
            data: data.map((d) => d.profit),
            color: '#1976d2',
          },
        ]}
        height={height}
        width={width}
      />
    </Box>
  );
}
