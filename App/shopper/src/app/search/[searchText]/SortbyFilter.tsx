'use client';

import {
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import type { SearchFilters } from './SearchList';

type SortBy = NonNullable<SearchFilters['sortBy']>;
type SortOptionValue = SortBy | '';

const sortOptions = [
  { label: 'noSort', value: '' },
  { label: 'newestArrivals', value: 'newest' },
  { label: 'lowestPrice', value: 'priceAsc' },
  { label: 'highestPrice', value: 'priceDesc' },
  { label: 'highestRating', value: 'ratingDesc' },
] as const satisfies ReadonlyArray<{ label: string; value: SortOptionValue }>;

interface SortbyFilterProps {
  selectedSortBy?: SearchFilters['sortBy'];
  onSortChange: (sortBy?: SortBy) => void;
}

export default function SortbyFilter({
  selectedSortBy,
  onSortChange,
}: SortbyFilterProps) {
  const t = useTranslations('Search');
  const value = selectedSortBy ?? '';

  function handleSortChange(event: SelectChangeEvent<SortOptionValue>) {
    const nextSort = event.target.value as SortOptionValue;
    onSortChange(nextSort === '' ? undefined : nextSort);
  }

  function renderSortValue(sortValue: SortOptionValue) {
    const option = sortOptions.find((sortOption) => sortOption.value === sortValue);
    return t(option?.label ?? 'noSort');
  }

  return (
    <Stack spacing={1}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0 }}>
        {t('sortBy')}
      </Typography>
      <FormControl size="small" fullWidth>
        <Select
          id="search-sort-by"
          inputProps={{ 'aria-label': t('sortBy') }}
          displayEmpty
          renderValue={(sortValue) => renderSortValue(sortValue as SortOptionValue)}
          value={value}
          onChange={handleSortChange}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {t(option.label)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
