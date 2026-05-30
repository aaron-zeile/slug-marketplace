'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SimpleCharts from '@/components/dashboard/charts/chart';

interface MonthlyProfit {
  month: string;
  profit: number;
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 180,
        p: 2.5,
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        bgcolor: '#fff',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {helper && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {helper}
        </Typography>
      )}
    </Paper>
  );
}

export default function ProfitsPage() {
  const [data, setData] = useState<MonthlyProfit[]>([]);

  const total = data.reduce((sum, d) => sum + d.profit, 0);
  const avg = data.length > 0 ? total / data.length : 0;
  const best = data.reduce<MonthlyProfit | null>(
    (acc, d) => (acc === null || d.profit > acc.profit ? d : acc),
    null,
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TrendingUpIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Monthly Profits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Month-to-month revenue performance across the marketplace.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard
          label="Total profit"
          value={formatUSD(total)}
          helper={data.length > 0 ? `Across ${data.length} months` : 'No data yet'}
        />
        <StatCard
          label="Average / month"
          value={formatUSD(avg)}
          helper={data.length > 0 ? 'Mean across all months' : 'No data yet'}
        />
        <StatCard
          label="Best month"
          value={best ? formatUSD(best.profit) : '—'}
          helper={best?.month ?? 'No data yet'}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          bgcolor: '#fff',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Monthly profit trend
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <SimpleCharts width={900} height={360} onData={setData} />
        </Box>
      </Paper>
    </Box>
  );
}
