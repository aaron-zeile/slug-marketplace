'use client';

import StarRounded from '@mui/icons-material/StarRounded';
import { Avatar, Box, Rating, Typography } from '@mui/material';
import type { Review } from '../../../item/review';
import { initialsFromName } from './reviewDisplayUtils';

export default function ReviewCard({ review }: { review: Review }) {
  const created = new Date(review.created_at).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });

  return (
    <Box
      sx={{
        py: 1.25,
        px: 1.5,
        borderRadius: 1.5,
        bgcolor: 'grey.50',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          alignItems: 'flex-start',
        }}
      >
        <Avatar
          alt={review.user.name}
          sx={{
            width: 36,
            height: 36,
            fontSize: '0.8125rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {initialsFromName(review.user.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              columnGap: 1,
              rowGap: 0.25,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.35 }}
            >
              {review.user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >
              {created}
            </Typography>
          </Box>
          <Rating
            name={`rating-${review.id}`}
            value={review.rating}
            readOnly
            size="small"
            emptyIcon={
              <StarRounded sx={{ opacity: 0.35 }} fontSize="inherit" />
            }
            icon={<StarRounded fontSize="inherit" />}
            sx={{
              color: 'warning.main',
              mt: 0.25,
              '& .MuiRating-icon': { fontSize: '1rem' },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              color: 'text.primary',
              lineHeight: 1.55,
              fontSize: '0.875rem',
            }}
          >
            {review.content}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
