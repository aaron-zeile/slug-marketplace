import { Box, Container, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import { fetchFilteredItemsAction, fetchSearchItemsAction } from './actions';
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

export default async function SearchList({ searchText, filters }: SearchListProps) {
  const t = await getTranslations('Search');
  const decodedSearchText = searchText ? decodeURIComponent(searchText) : '';
  const shouldUseFilteredItems = hasFilters(filters) || !decodedSearchText;
  const result = shouldUseFilteredItems
    ? await fetchFilteredItemsAction({
        maxPrice: filters?.maxPrice,
        minPrice: filters?.minPrice,
        minStars: filters?.minStars,
        searchText: decodedSearchText || undefined,
        sortBy: filters?.sortBy,
        status: 'active',
        tag: filters?.category,
      })
    : await fetchSearchItemsAction(decodedSearchText);
  const items = result.success && result.data ? result.data : [];
  const titleQuery = decodedSearchText || filterLabel(filters);

  return (
    <Container sx={{ py: 3 }}>
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
    </Container>
  );
}
