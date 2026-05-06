'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react';

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

  return (
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
        },
      ]}
      height={300}
      width={500}
    />
  );
}
