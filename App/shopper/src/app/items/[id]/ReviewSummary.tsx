'use client';

import StarRounded from '@mui/icons-material/StarRounded';
import { Box, Rating, Typography } from '@mui/material';
import type { Review } from '../../../item/review';
import { averageRating, formatAverage } from './reviewDisplayUtils';

export default function ReviewSummary({ reviews }: { reviews: Review[] }) {
  const avg = averageRating(reviews);
  const formatted = formatAverage(avg);

  return (
    <Box
      sx={{
        mb: 2,
        pb: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.75,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          fontSize: '0.65rem',
          lineHeight: 1.2,
        }}
      >
        Customer rating
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 1.25,
          rowGap: 0.5,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
            color: 'text.primary',
          }}
        >
          {formatted}
        </Typography>
        <Rating
          name="average-rating"
          value={avg}
          precision={0.1}
          readOnly
          size="small"
          emptyIcon={<StarRounded sx={{ opacity: 0.35 }} fontSize="inherit" />}
          icon={<StarRounded fontSize="inherit" />}
          sx={{
            color: 'warning.main',
          }}
        />
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.8125rem',
            lineHeight: 1.2,
          }}
        >
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </Typography>
      </Box>
    </Box>
  );
}
