'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Rating,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import type { SearchFilters as SearchFilterValues } from './SearchList';

const MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 2000;
const PRICE_STEP = 5;

const ratingOptions = [
  { label: 'allRatings', value: undefined },
  { label: 'fourPlusStars', value: 4, stars: 4 },
  { label: 'threePlusStars', value: 3, stars: 3 },
  { label: 'twoPlusStars', value: 2, stars: 2 },
  { label: 'onePlusStars', value: 1, stars: 1 },
] as const;

interface SearchFiltersProps {
  filters?: SearchFilterValues;
  maxItemPrice?: number;
}

function roundUpToPriceStep(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_PRICE;
  }

  return Math.ceil(value / PRICE_STEP) * PRICE_STEP;
}

function clampPrice(value: number, fallback: number, maxPrice: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(maxPrice, Math.max(MIN_PRICE, value));
}

export default function SearchFilters({ filters, maxItemPrice = DEFAULT_MAX_PRICE }: SearchFiltersProps) {
  const t = useTranslations('Search');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMinStars = filters?.minStars;
  const maxPrice = Math.max(
    DEFAULT_MAX_PRICE,
    roundUpToPriceStep(maxItemPrice),
    roundUpToPriceStep(filters?.maxPrice ?? DEFAULT_MAX_PRICE),
  );
  const initialPriceRange = useMemo<[number, number]>(() => {
    const min = clampPrice(filters?.minPrice ?? MIN_PRICE, MIN_PRICE, maxPrice);
    const max = clampPrice(filters?.maxPrice ?? maxPrice, maxPrice, maxPrice);
    return min <= max ? [min, max] : [max, min];
  }, [filters?.maxPrice, filters?.minPrice, maxPrice]);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange);

  function updateParams(updates: Record<string, number | string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function commitPriceRange(nextRange = priceRange) {
    const [min, max] = nextRange;
    updateParams({
      minPrice: min > MIN_PRICE ? min : undefined,
      maxPrice: max < maxPrice ? max : undefined,
    });
  }

  function updateRating(minStars?: number) {
    updateParams({ minStars });
  }

  function clearFilters() {
    setPriceRange([MIN_PRICE, maxPrice]);
    updateParams({
      maxPrice: undefined,
      minPrice: undefined,
      minStars: undefined,
    });
  }

  function ratingLabel(option: (typeof ratingOptions)[number]) {
    if (option.value === undefined) {
      return t(option.label);
    }

    return (
      <Box
        component="span"
        aria-label={t(option.label)}
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
    <Box
      component="aside"
      aria-label={t('filters')}
      sx={{
        pr: { md: 3 },
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography component="h2" sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {t('filters')}
          </Typography>
          <Button
            size="small"
            onClick={clearFilters}
            sx={{ minWidth: 0, px: 1, textTransform: 'none' }}
          >
            {t('clearFilters')}
          </Button>
        </Box>

        <Divider />

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
                setPriceRange([min, max]);
              }}
              onChangeCommitted={(_, value) => {
                const [min, max] = value as number[];
                commitPriceRange([min, max]);
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
                setPriceRange([Math.min(nextMin, priceRange[1]), priceRange[1]]);
              }}
              onBlur={() => commitPriceRange()}
              slotProps={{ htmlInput: { min: MIN_PRICE, max: maxPrice, step: PRICE_STEP } }}
            />
            <TextField
              label={t('maxPrice')}
              size="small"
              type="number"
              value={priceRange[1]}
              onChange={(event) => {
                const nextMax = clampPrice(Number(event.target.value), maxPrice, maxPrice);
                setPriceRange([priceRange[0], Math.max(nextMax, priceRange[0])]);
              }}
              onBlur={() => commitPriceRange()}
              slotProps={{ htmlInput: { min: MIN_PRICE, max: maxPrice, step: PRICE_STEP } }}
            />
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={0.1}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0 }}>
            {t('rating')}
          </Typography>
          {ratingOptions.map((option) => (
            <FormControlLabel
              key={option.label}
              control={
                <Checkbox
                  checked={selectedMinStars === option.value}
                  onChange={() => updateRating(option.value)}
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
      </Stack>
    </Box>
  );
}
