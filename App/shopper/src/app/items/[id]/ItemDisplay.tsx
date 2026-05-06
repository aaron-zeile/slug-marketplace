'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Divider,
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Item } from '../../../item';
import { fetchItemAction } from './actions';

interface Props {
  id: string;
}

const ItemDisplay = ({ id }: Props) => {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemAction(id).then((result) => {
      if (result.success && result.data) {
        setItem(result.data);
      } else {
        router.push('/');
      }
      setLoading(false);
    });
  }, [id, router]);

  if (loading || !item) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          padding: 1,
        }}
      >
        <Typography sx={{ fontSize: '1.5rem' }}>{item.name}</Typography>
        <Typography sx={{ color: 'grey', textAlign: 'center' }}>
          {item.description}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Box>
          <Typography>Price</Typography>
          <Typography>${item.price.toFixed(2)}</Typography>
        </Box>

        <Box>
          <Typography>Seller</Typography>
          <Typography>{item.seller.name}</Typography>
          <Typography>{item.seller.id}</Typography>
        </Box>

        <Box>
          <Typography>Item ID</Typography>
          <Typography>{item.id}</Typography>
        </Box>
        <Box>
          <Typography>Created</Typography>
          <Typography>{new Date(item.created_at).toLocaleString()}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ItemDisplay;
