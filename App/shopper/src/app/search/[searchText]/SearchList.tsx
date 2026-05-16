import { Box, Container, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import { fetchSearchItemsAction } from './actions';
import SearchItem from './SearchItem';

interface SearchListProps {
  searchText: string;
}

export default async function SearchList({ searchText }: SearchListProps) {
  const t = await getTranslations('Search');
  const decodedSearchText = decodeURIComponent(searchText);
  const result = await fetchSearchItemsAction(decodedSearchText);
  const items = result.success && result.data ? result.data : [];

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('resultsFor', { query: decodedSearchText })}
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
