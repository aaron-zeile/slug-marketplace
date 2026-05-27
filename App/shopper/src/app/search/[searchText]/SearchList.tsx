import { Box, Container, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import { fetchFilteredItemsAction, fetchSearchItemsAction } from './actions';
import SearchFiltersPanel from './SearchFilters';
import SearchItem from './SearchItem';

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStars?: number;
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc' | 'ratingDesc';
}

interface SearchListProps {
  searchText?: string;
  filters?: SearchFilters;
}

function hasFilters(filters?: SearchFilters) {
  return Object.values(filters ?? {}).some((value) => value !== undefined);
}

function filterLabel(filters?: SearchFilters) {
  return filters?.category ? decodeURIComponent(filters.category) : 'all items';
}

function filterStateKey(filters?: SearchFilters) {
  return [
    filters?.category,
    filters?.maxPrice,
    filters?.minPrice,
    filters?.minStars,
    filters?.sortBy,
  ].join(':');
}

export default async function SearchList({ searchText, filters }: SearchListProps) {
  const t = await getTranslations('Search');
  const decodedSearchText = searchText ? decodeURIComponent(searchText) : '';
  const filterInput = {
    maxPrice: filters?.maxPrice,
    minPrice: filters?.minPrice,
    minStars: filters?.minStars,
    searchText: decodedSearchText || undefined,
    sortBy: filters?.sortBy,
    status: 'active' as const,
    tag: filters?.category,
  };
  const shouldUseFilteredItems = hasFilters(filters) || !decodedSearchText;
  const result = shouldUseFilteredItems
    ? await fetchFilteredItemsAction(filterInput)
    : await fetchSearchItemsAction(decodedSearchText);
  const priceCeilingResult = await fetchFilteredItemsAction({
    searchText: decodedSearchText || undefined,
    status: 'active',
    tag: filters?.category,
  });
  const items = result.success && result.data ? result.data : [];
  const priceCeilingItems =
    priceCeilingResult.success && priceCeilingResult.data
      ? priceCeilingResult.data
      : items;
  const titleQuery = decodedSearchText || filterLabel(filters);
  const maxItemPrice = priceCeilingItems.reduce(
    (maxPrice, item) => Math.max(maxPrice, item.price),
    0,
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 2, sm: 4, md: 4 },
        py: 3,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 3, md: 4 },
          gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' },
          alignItems: 'start',
        }}
      >
        <SearchFiltersPanel
          key={filterStateKey(filters)}
          filters={filters}
          maxItemPrice={maxItemPrice}
        />

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {t('resultsFor', { query: titleQuery })}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {t('itemsFound', { count: items.length })}
            </Typography>
          </Box>

          {items.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>
              {t('noResults')}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {items.map((item) => (
                <SearchItem key={item.id} item={item} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Container>
  );
}
