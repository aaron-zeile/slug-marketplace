'use client';

import { Box, Container, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { WishlistItem as WishlistListItem } from '../../wishlist';
import { checkLogin, type CheckLoginResult } from '../buyer/login/actions';
import WishlistItem from './WishlistItem';
import { fetchWishlistItemsAction } from './actions';

export default function WishlistList() {
  const t = useTranslations('Wishlist');
  const [wishlistItems, setWishlistItems] = useState<WishlistListItem[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchWishlistItems() {
      const [result, session] = await Promise.all([
        fetchWishlistItemsAction(),
        checkLogin().catch((): CheckLoginResult => ({})),
      ]);

      if (result.success && result.data) {
        setWishlistItems(result.data);
      } else {
        setError(true);
      }
      setIsAuthenticated(Boolean(session.user));
      setLoading(false);
    }

    fetchWishlistItems();
  }, []);

  const itemCount = wishlistItems.length;

  const itemsSummary =
    itemCount === 1
      ? t('itemsInWishlist_one', { count: itemCount })
      : t('itemsInWishlist_other', { count: itemCount });

  const handleRemove = (itemId: string) => {
    setWishlistItems((currentItems) =>
      currentItems.filter((wishlistItem) => wishlistItem.item.id !== itemId),
    );
  };

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('title')}
        </Typography>
        {!loading && !error && isAuthenticated && itemCount > 0 && (
          <Typography sx={{ color: 'text.secondary' }}>
            {itemsSummary}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('loading')}
        </Typography>
      ) : error ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('loadError')}
        </Typography>
      ) : !isAuthenticated ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('signInToView')}
        </Typography>
      ) : wishlistItems.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('empty')}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {wishlistItems.map((wishlistItem) => (
            <WishlistItem
              key={wishlistItem.item.id}
              item={wishlistItem.item}
              onRemove={handleRemove}
            />
          ))}
        </Stack>
      )}
    </Container>
  );
}
