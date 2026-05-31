'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material';
import { Item } from '../../item';
import { dispatchCartUpdated } from '../../cart/events';
import { dispatchWishlistUpdated } from '../../wishlist/events';
import { addCartItemAction } from '../cart/actions';
import { removeWishlistItemAction } from './actions';

interface WishlistItemProps {
  item: Item;
  onRemove?: (itemId: string) => void;
}

function localeTagForNumbers(locale: string): string {
  if (locale.startsWith('fr')) {
    return 'fr-FR';
  }
  return 'en-US';
}

export default function WishlistItem({ item, onRemove }: WishlistItemProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Wishlist');
  const [addingToCart, setAddingToCart] = useState(false);
  const [removing, setRemoving] = useState(false);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForNumbers(locale), {
        style: 'currency',
        currency: 'USD',
      }),
    [locale],
  );

  const image = item.images[0];

  const handleRemove = async () => {
    setRemoving(true);
    const result = await removeWishlistItemAction(item.id);

    if (result.success) {
      onRemove?.(item.id);
      dispatchWishlistUpdated();
    }

    setRemoving(false);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const result = await addCartItemAction(item.id);

    if (result.success) {
      dispatchCartUpdated();
    }

    setAddingToCart(false);
  };

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: { xs: '116px 1fr', sm: '168px 1fr' },
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
        component="button"
        aria-label={t('itemAriaLabel', { name: item.name })}
        onClick={() => router.push(`/items/${item.id}`)}
        sx={{
          appearance: 'none',
          background: 'transparent',
          border: 0,
          color: 'inherit',
          cursor: 'pointer',
          display: 'grid',
          m: 0,
          minHeight: { xs: 132, sm: 172 },
          p: 0,
          placeItems: 'center',
          textAlign: 'inherit',
          width: '100%',
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
        <Box
          component="button"
          aria-label={t('itemAriaLabel', { name: item.name })}
          onClick={() => router.push(`/items/${item.id}`)}
          sx={{
            appearance: 'none',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            display: 'grid',
            gap: 0.5,
            m: 0,
            minWidth: 0,
            p: 0,
            textAlign: 'left',
          }}
        >
          <Typography
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
          <Typography
            sx={{
              mt: 0.5,
              fontSize: '1.35rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {currencyFormatter.format(item.price)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
            mt: 1,
          }}
        >
          <Button
            aria-label={t('addToCartAria', { name: item.name })}
            disabled={addingToCart}
            onClick={handleAddToCart}
            size="small"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('addToCart')}
          </Button>
          <IconButton
            aria-label={t('removeAria', { name: item.name })}
            disabled={removing}
            onClick={handleRemove}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
