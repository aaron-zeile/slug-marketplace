import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {LineChart} from '@mui/x-charts/LineChart'
import React from 'react'

const dataset = [
  {month: 'Jan', earnings: 420, orders: 8},
  {month: 'Feb', earnings: 680, orders: 13},
  {month: 'Mar', earnings: 510, orders: 10},
  {month: 'Apr', earnings: 940, orders: 18},
  {month: 'May', earnings: 760, orders: 15},
  {month: 'Jun', earnings: 1180, orders: 22},
]

export default function SalesGraph() {
  return (
    <Box
      sx={{
        mt: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{fontWeight: 700, mb: 1}}
      >
        Sales trend
      </Typography>
      <LineChart
        dataset={dataset}
        xAxis={[{
          scaleType: 'point',
          dataKey: 'month',
        }]}
        yAxis={[
          {id: 'earnings-axis', position: 'left'},
          {id: 'orders-axis', position: 'right'},
        ]}
        series={[
          {
            dataKey: 'earnings',
            label: 'Earnings',
            color: '#0b5a54',
            yAxisId: 'earnings-axis',
            valueFormatter: (value) =>
              value == null
                ? ''
                : new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(value),
          },
          {
            dataKey: 'orders',
            label: 'Orders',
            color: '#70aaa4',
            yAxisId: 'orders-axis',
          },
        ]}
        height={320}
      />
    </Box>
  )
}
