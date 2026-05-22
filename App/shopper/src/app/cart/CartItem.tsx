'use client';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  Box,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material';
import { Item } from '../../item';
import { dispatchCartUpdated } from '../../cart/events';
import { addCartItemAction, removeCartItemAction } from './actions';

interface CartItemProps {
  item: Item;
  quantity?: number;
  onQuantityChange?: (itemId: string, quantity: number) => void;
}

function localeTagForNumbers(locale: string): string {
  if (locale.startsWith('fr')) {
    return 'fr-FR';
  }
  return 'en-US';
}

export default function CartItem({
  item,
  quantity = 1,
  onQuantityChange,
}: CartItemProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Cart');

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForNumbers(locale), {
        style: 'currency',
        currency: 'USD',
      }),
    [locale],
  );

  const image = item.images[0];

  const handleDecrease = async () => {
    const result = await removeCartItemAction(item.id);

    if (result.success) {
      onQuantityChange?.(item.id, quantity - 1);
      dispatchCartUpdated();
    }
  };

  const handleIncrease = async () => {
    const result = await addCartItemAction(item.id);

    if (result.success) {
      onQuantityChange?.(item.id, quantity + 1);
      dispatchCartUpdated();
    }
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
            border: 2,
            borderColor: 'gray',
            borderRadius: '999px',
            display: 'grid',
            gridTemplateColumns: '36px 44px 36px',
            height: 34,
            mt: 1,
            overflow: 'hidden',
            width: 116,
          }}
        >
          <IconButton
            aria-label={t('decreaseQuantityAria', { name: item.name })}
            onClick={handleDecrease}
            size="small"
            sx={{ borderRadius: 0 }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography
            aria-label={t('quantityAria', { name: item.name })}
            sx={{
              alignItems: 'center',
              display: 'flex',
              fontWeight: 700,
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {quantity}
          </Typography>
          <IconButton
            aria-label={t('increaseQuantityAria', { name: item.name })}
            onClick={handleIncrease}
            size="small"
            sx={{ borderRadius: 0 }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
