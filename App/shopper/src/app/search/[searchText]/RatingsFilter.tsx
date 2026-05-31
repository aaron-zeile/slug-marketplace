'use client';

import { Box, Checkbox, FormControlLabel, Rating, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const ratingOptions = [
  { label: 'allRatings', value: undefined },
  { label: 'fourPlusStars', value: 4, stars: 4 },
  { label: 'threePlusStars', value: 3, stars: 3 },
  { label: 'twoPlusStars', value: 2, stars: 2 },
  { label: 'onePlusStars', value: 1, stars: 1 },
] as const;

interface RatingsFilterProps {
  selectedMinStars?: number;
  onRatingChange: (minStars?: number) => void;
}

export default function RatingsFilter({ selectedMinStars, onRatingChange }: RatingsFilterProps) {
  const t = useTranslations('Search');

  function ratingLabel(option: (typeof ratingOptions)[number]) {
    if (option.value === undefined) {
      return t(option.label);
    }

    return (
      <Box
        component="span"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          gap: 0.25,
          lineHeight: 1,
        }}
      >
        <Rating
          aria-hidden="true"
          max={5}
          precision={1}
          readOnly
          size="small"
          value={option.stars}
          sx={{
            color: '#ff8a00',
            fontSize: '1rem',
            gap: 0,
            '& .MuiRating-iconEmpty': {
              color: 'grey.400',
            },
            '& .MuiRating-icon': {
              mx: '-1px',
            },
          }}
        />
        <Typography
          component="span"
          sx={{ color: 'text.secondary', fontSize: '0.82rem', fontWeight: 600 }}
        >
          +
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0.1}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0 }}>
        {t('rating')}
      </Typography>
      {ratingOptions.map((option) => (
        <FormControlLabel
          aria-label={t(option.label)}
          key={option.label}
          control={
            <Checkbox
              checked={selectedMinStars === option.value}
              onChange={() => onRatingChange(option.value)}
              size="small"
            />
          }
          label={ratingLabel(option)}
          sx={{
            m: 0,
            minHeight: 22,
            alignItems: 'center',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.9rem',
              lineHeight: 1,
            },
            '& .MuiCheckbox-root': {
              ml: 0,
              mr: 0.75,
              p: 0,
              py: 0.25,
            },
          }}
        />
      ))}
    </Stack>
  );
}
