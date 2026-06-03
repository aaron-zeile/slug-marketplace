'use client';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { WISHLIST_UPDATED_EVENT } from '../../../wishlist/events';
import { fetchWishlistItemsAction } from '../../wishlist/actions';

const brandColor = '#0f766e';

export default function WishlistButton() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Wishlist');
  const [itemCount, setItemCount] = useState(0);

  const loadItemCount = useCallback(async () => {
    const result = await fetchWishlistItemsAction();
    if (result.success && result.data) {
      setItemCount(result.data.length);
      return;
    }
    setItemCount(0);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await fetchWishlistItemsAction();
      if (!active) {
        return;
      }
      if (result.success && result.data) {
        setItemCount(result.data.length);
        return;
      }
      setItemCount(0);
    })();

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleWishlistUpdated = () => {
      void loadItemCount();
    };

    window.addEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdated);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdated);
    };
  }, [loadItemCount]);

  const wishlistLabel =
    itemCount > 0
      ? t('openWishlistWithCount', { count: itemCount })
      : t('openWishlist');

  return (
    <Tooltip title={t('tooltip')}>
      <IconButton
        aria-label={wishlistLabel}
        onClick={() => {
          router.push('/wishlist');
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
          <FavoriteBorderIcon aria-hidden sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
