'use client';

import { Box, Slider, Stack, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export const MIN_PRICE = 0;
export const DEFAULT_MAX_PRICE = 2000;
export const PRICE_STEP = 5;

interface PriceFilterProps {
  maxPrice: number;
  priceRange: [number, number];
  onPriceRangeChange: (priceRange: [number, number]) => void;
  onPriceRangeCommit: (priceRange?: [number, number]) => void;
}

export function roundUpToPriceStep(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_PRICE;
  }

  return Math.ceil(value / PRICE_STEP) * PRICE_STEP;
}

export function clampPrice(value: number, fallback: number, maxPrice: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(maxPrice, Math.max(MIN_PRICE, value));
}

export default function PriceFilter({
  maxPrice,
  priceRange,
  onPriceRangeChange,
  onPriceRangeCommit,
}: PriceFilterProps) {
  const t = useTranslations('Search');

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0 }}>
        {t('price')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'primary.main',
          fontSize: '0.8rem',
        }}
      >
        <span>${priceRange[0]}</span>
        <span>${priceRange[1]}</span>
      </Box>
      <Box sx={{ px: 1 }}>
        <Slider
          aria-label={t('priceRange')}
          min={MIN_PRICE}
          max={maxPrice}
          step={PRICE_STEP}
          value={priceRange}
          onChange={(_, value) => {
            const [min, max] = value as number[];
            onPriceRangeChange([min, max]);
          }}
          onChangeCommitted={(_, value) => {
            const [min, max] = value as number[];
            onPriceRangeCommit([min, max]);
          }}
          valueLabelDisplay="auto"
          sx={{ display: 'block' }}
        />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <TextField
          label={t('minPrice')}
          size="small"
          type="number"
          value={priceRange[0]}
          onChange={(event) => {
            const nextMin = clampPrice(Number(event.target.value), MIN_PRICE, maxPrice);
            onPriceRangeChange([Math.min(nextMin, priceRange[1]), priceRange[1]]);
          }}
          onBlur={() => onPriceRangeCommit()}
          slotProps={{ htmlInput: { min: MIN_PRICE, max: maxPrice, step: PRICE_STEP } }}
        />
        <TextField
          label={t('maxPrice')}
          size="small"
          type="number"
          value={priceRange[1]}
          onChange={(event) => {
            const nextMax = clampPrice(Number(event.target.value), maxPrice, maxPrice);
            onPriceRangeChange([priceRange[0], Math.max(nextMax, priceRange[0])]);
          }}
          onBlur={() => onPriceRangeCommit()}
          slotProps={{ htmlInput: { min: MIN_PRICE, max: maxPrice, step: PRICE_STEP } }}
        />
      </Box>
    </Stack>
  );
}
