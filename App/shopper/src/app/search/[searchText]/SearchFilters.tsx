'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslations } from 'next-intl';
import type { SearchFilters as SearchFilterValues } from './SearchList';
import PriceFilter, {
  DEFAULT_MAX_PRICE,
  MIN_PRICE,
  clampPrice,
  roundUpToPriceStep,
} from './PriceFilter';
import RatingsFilter from './RatingsFilter';
import SortbyFilter from './SortbyFilter';

interface SearchFiltersProps {
  filters?: SearchFilterValues;
  maxItemPrice?: number;
}

export default function SearchFilters({ filters, maxItemPrice = DEFAULT_MAX_PRICE }: SearchFiltersProps) {
  const t = useTranslations('Search');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMinStars = filters?.minStars;
  const selectedSortBy = filters?.sortBy;
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  function updateSort(sortBy?: SearchFilterValues['sortBy']) {
    updateParams({ sortBy });
  }

  function clearFilters() {
    setPriceRange([MIN_PRICE, maxPrice]);
    updateParams({
      maxPrice: undefined,
      minPrice: undefined,
      minStars: undefined,
      sortBy: undefined,
    });
  }

  return (
    <Box
      component="aside"
      aria-labelledby="search-filters-heading"
      sx={{
        pr: { md: 3 },
      }}
    >
      <Stack spacing={{ xs: 1, md: 2 }}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
            <Typography
              component="h2"
              id="search-filters-heading"
              sx={{ fontSize: '1.1rem', fontWeight: 700 }}
            >
              <Box
                component="button"
                aria-label={t('filters')}
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
                sx={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: { xs: 'inline', md: 'contents' },
                }}
              >
                {t('filters')}
              </Box>
            </Typography>
            <IconButton
              aria-expanded={filtersOpen}
              aria-label={t('toggleFilters')}
              onClick={() => setFiltersOpen((open) => !open)}
              sx={{
                color: 'common.black',
                display: { xs: 'inline-flex', md: 'none' },
                p: 0.25,
                transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
              }}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 42, strokeWidth: 2 }} />
            </IconButton>
          </Box>
          <Button
            size="small"
            onClick={clearFilters}
            sx={{ minWidth: 0, px: 1, textTransform: 'none' }}
          >
            {t('clearFilters')}
          </Button>
        </Box>

        <Divider />

        <Box sx={{ display: { xs: filtersOpen ? 'block' : 'none', md: 'block' } }}>
          <Stack spacing={2}>
            <SortbyFilter selectedSortBy={selectedSortBy} onSortChange={updateSort} />

            <Divider />

            <PriceFilter
              maxPrice={maxPrice}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              onPriceRangeCommit={commitPriceRange}
            />

            <Divider />

            <RatingsFilter selectedMinStars={selectedMinStars} onRatingChange={updateRating} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
