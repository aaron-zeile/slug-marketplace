'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react';
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

export default function SimpleCharts() {
  const [data, setData] = useState<MonthlyProfit[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: MONTHLY_PROFIT_QUERY }),
    })
      .then((res) => res.json())
      .then(({ data }) => {
        if (data?.monthlyProfit) setData(data.monthlyProfit);
      });
  }, []);

  if (!mounted) return null;

  return (
    <Box>
      {data.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
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
        height={300}
        width={500}
      />
    </Box>
  );
}
