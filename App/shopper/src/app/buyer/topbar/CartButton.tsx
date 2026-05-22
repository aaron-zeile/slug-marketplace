'use client';

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CART_UPDATED_EVENT } from '../../../cart/events';
import { fetchCartItemsAction } from '../../cart/actions';

const brandColor = '#0f766e';

export default function CartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Cart');
  const [itemCount, setItemCount] = useState(0);

  const loadItemCount = useCallback(async () => {
    const result = await fetchCartItemsAction();
    if (result.success && result.data) {
      const count = result.data.reduce(
        (total, cartItem) => total + cartItem.quantity,
        0,
      );
      setItemCount(count);
      return;
    }
    setItemCount(0);
  }, []);

  useEffect(() => {
    void loadItemCount();
  }, [loadItemCount, pathname]);

  useEffect(() => {
    const handleCartUpdated = () => {
      void loadItemCount();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [loadItemCount]);

  const cartLabel =
    itemCount > 0
      ? t('openCartWithCount', { count: itemCount })
      : t('openCart');

  return (
    <Tooltip title={t('tooltip')}>
      <IconButton
        aria-label={cartLabel}
        onClick={() => {
          router.push('/cart');
        }}
        sx={{
          bgcolor: 'action.hover',
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.selected',
            color: brandColor,
          },
        }}
      >
        <Badge
          badgeContent={itemCount}
          color="primary"
          max={99}
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: brandColor,
              color: 'common.white',
              fontSize: '0.65rem',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <ShoppingCartOutlinedIcon aria-hidden sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
