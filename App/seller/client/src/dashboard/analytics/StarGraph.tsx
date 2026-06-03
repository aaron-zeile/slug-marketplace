import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useContext, useEffect, useState } from 'react';

import { ErrorContext } from '../../error/Context';
import { starDistribution } from '../model';

const emptyRatings = [0, 0, 0, 0, 0]
const ignoreError = () => {}

export default function StarGraph() {
  const [ratings, setRatings] = useState(emptyRatings)
  const [loading, setLoading] = useState(true)
  const errorCtx = useContext(ErrorContext)
  const setError = errorCtx?.setError ?? ignoreError

  useEffect(() => {
    const loadRatings = async () => {
      setLoading(true)
      const distribution = await starDistribution(setError)
      setRatings(distribution ?? emptyRatings)
      setLoading(false)
    }

    void loadRatings()
  }, [setError])

  return (
    <BarChart
      xAxis={[{
        scaleType: 'band',
        data: ['★', '★★', '★★★', '★★★★', '★★★★★'],
      }]}
      series={[{data: loading ? emptyRatings : ratings, color: '#0b5a54'}]}
      height={300}
    />
  );
}
