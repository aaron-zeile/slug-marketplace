import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useContext, useEffect, useState } from 'react';
import { ErrorContext } from '../../error/Context';
import { avgRating } from '../model';

const ratingColors = (rating: number | undefined) => {
  if (rating === undefined || rating <= 0) {
    return {
      main: 'text.secondary',
      background: 'grey.50',
      border: 'grey.200',
    };
  }

  if (rating >= 4.5) {
    return {
      main: 'success.dark',
      background: '#edf7ed',
      border: '#8bc48a',
    };
  }

  if (rating >= 3.5) {
    return {
      main: 'primary.main',
      background: '#e6f3f1',
      border: '#70aaa4',
    };
  }

  if (rating >= 2.5) {
    return {
      main: 'warning.dark',
      background: '#fff7e0',
      border: '#f0c55f',
    };
  }

  if (rating >= 1.5) {
    return {
      main: '#c56a16',
      background: '#fff0e1',
      border: '#e0a15f',
    };
  }

  return {
    main: 'error.dark',
    background: '#fdecea',
    border: '#e5938d',
  };
};

export default function RatingCard() {
  const [averageRating, setAverageRating] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const errorCtx = useContext(ErrorContext);
  const rating = averageRating && averageRating > 0 ? averageRating : undefined;
  const colors = ratingColors(rating);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const setError = errorCtx?.setError ?? (() => {});

  useEffect(() => {
    const loadRating = async () => {
      setLoading(true);
      const rating = await avgRating(setError);
      setAverageRating(rating);
      setLoading(false);
    };

    void loadRating();
  }, [setError]);

  return (
    <Card
      sx={{
        width: { xs: '100%', sm: 260 },
        maxWidth: 300,
        aspectRatio: '1 / 1',
        bgcolor: colors.background,
        border: 1,
        borderColor: colors.border,
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.10)',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1,
          p: 3,
          '&:last-child': { pb: 3 },
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          Seller Rating
        </Typography>

        <Typography
          component="div"
          sx={{
            color: colors.main,
            fontSize: { xs: 58, sm: 72 },
            fontWeight: 800,
            lineHeight: 0.95,
          }}
        >
          {loading ? '...' : (rating?.toFixed(1) ?? 'N/A')}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          {loading || rating === undefined
            ? 'Average review score'
            : 'out of 5'}
        </Typography>
      </CardContent>
    </Card>
  );
}
