import { Box, Container, Stack, Typography } from '@mui/material';
import { getSearchItems } from '../../../item/service';
import SearchItem from './SearchItem';

interface SearchListProps {
  searchText: string;
}

export default async function SearchList({ searchText }: SearchListProps) {
  const decodedSearchText = decodeURIComponent(searchText);
  const items = await getSearchItems(decodedSearchText);

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Search results for {decodedSearchText}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {items.length} items found
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          No items match your search.
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
