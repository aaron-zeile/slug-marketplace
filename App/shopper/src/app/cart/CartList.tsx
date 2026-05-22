'use client';

import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CartItem as CartListItem } from '../../cart';
import { checkLogin } from '../buyer/login/actions';
import CartItem from './CartItem';
import { fetchCartItemsAction } from './actions';

export default function CartList() {
  const t = useTranslations('Cart');
  const [cartItems, setCartItems] = useState<CartListItem[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchCartItems() {
      const [result, session] = await Promise.all([
        fetchCartItemsAction(),
        checkLogin().catch(() => ({})),
      ]);

      if (result.success && result.data) {
        setCartItems(result.data);
      } else {
        setError(true);
      }
      setIsAuthenticated(Boolean(session.user));
      setLoading(false);
    }

    fetchCartItems();
  }, []);

  const itemCount = cartItems.reduce((total, cartItem) => (
    total + cartItem.quantity
  ), 0);

  const itemsInCartSummary =
    itemCount === 1
      ? t('itemsInCart_one', { count: itemCount })
      : t('itemsInCart_other', { count: itemCount });

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setCartItems((currentCartItems) => (
      currentCartItems
        .map((cartItem) => (
          cartItem.item.id === itemId
            ? { ...cartItem, quantity }
            : cartItem
        ))
        .filter((cartItem) => cartItem.quantity > 0)
    ));
  };

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {itemsInCartSummary}
        </Typography>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('loading')}
        </Typography>
      ) : error ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('loadError')}
        </Typography>
      ) : cartItems.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          {t('empty')}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {cartItems.map((cartItem) => (
            <CartItem
              key={cartItem.item.id}
              item={cartItem.item}
              onQuantityChange={handleQuantityChange}
              quantity={cartItem.quantity}
            />
          ))}
          <Box sx={{ pt: 2 }}>
            {isAuthenticated ? (
              <Button
                component={Link}
                href="/checkout/shipping"
                variant="contained"
              >
                {t('checkout')}
              </Button>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                {t('signInToCheckout')}
              </Typography>
            )}
          </Box>
        </Stack>
      )}
    </Container>
  );
}
