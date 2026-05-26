'use client';

import { useRouter } from 'next/navigation';
import { Box, CardActionArea, CardMedia, Chip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Item } from '../../../item';

interface SearchItemProps {
  item: Item;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function SearchItem({ item }: SearchItemProps) {
  const router = useRouter();
  const t = useTranslations('Search');
  const image = item.images[0];
  const isSold = item.quantity <= 0 || item.status === 'sold';

  return (
    <CardActionArea
      aria-label={`Search Item ${item.name}`}
      onClick={() => router.push(`/items/${item.id}`)}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '116px 1fr', sm: '168px 1fr auto' },
        alignItems: 'stretch',
        gap: 2,
        width: '100%',
        p: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          minHeight: { xs: 132, sm: 172 },
        }}
      >
        <CardMedia
          component="img"
          src={image}
          alt={item.name}
          sx={{
            maxWidth: '100%',
            maxHeight: { xs: 120, sm: 160 },
            objectFit: 'contain',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          alignContent: 'start',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <Typography
          aria-label={item.name}
          component="h2"
          sx={{
            display: '-webkit-box',
            fontSize: '1rem',
            fontWeight: 700,
            lineHeight: 1.25,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          }}
        >
          {item.name}
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            display: '-webkit-box',
            fontSize: '0.9rem',
            lineHeight: 1.3,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
          }}
        >
          {item.description}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
          {item.seller.name}
        </Typography>
        <Box
          sx={{
            mt: 0.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: '1.35rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {currencyFormatter.format(item.price)}
          </Typography>
          {isSold ? (
            <Chip
              aria-label={t('sold')}
              label={t('sold')}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: 'grey.400',
                color: 'grey.900',
              }}
            />
          ) : null}
        </Box>
      </Box>
    </CardActionArea>
  );
}
