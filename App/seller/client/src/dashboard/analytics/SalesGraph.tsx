import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {LineChart} from '@mui/x-charts/LineChart'
import React, {useContext, useEffect, useState} from 'react'

import type {SalesStat} from '../../../../shared'
import {ErrorContext} from '../../error/Context'
import {salesStats} from '../model'

const emptyStats: SalesStat[] = []
// eslint-disable-next-line @typescript-eslint/no-empty-function
const ignoreError = () => {}

export default function SalesGraph() {
  const [dataset, setDataset] = useState<SalesStat[]>(emptyStats)
  const [loading, setLoading] = useState(true)
  const errorCtx = useContext(ErrorContext)
  const setError = errorCtx?.setError ?? ignoreError

  useEffect(() => {
    const loadSalesStats = async () => {
      setLoading(true)
      const stats = await salesStats(setError)
      setDataset(stats ?? emptyStats)
      setLoading(false)
    }

    void loadSalesStats()
  }, [setError])

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
      {!loading && dataset.length === 0 ? (
        <Typography color="text.secondary" sx={{py: 10, textAlign: 'center'}}>
          No sales yet
        </Typography>
      ) : (
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
      )}
    </Box>
  )
}
