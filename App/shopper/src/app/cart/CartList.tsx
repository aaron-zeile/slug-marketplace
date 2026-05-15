'use client';

import { Box, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { CartItem as CartListItem } from '../../cart';
import CartItem from './CartItem';
import { fetchCartItemsAction } from './actions';

export default function CartList() {
  const [cartItems, setCartItems] = useState<CartListItem[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCartItems() {
      const result = await fetchCartItemsAction();

      if (result.success && result.data) {
        setCartItems(result.data);
      } else {
        setError(true);
      }
      setLoading(false);
    }

    fetchCartItems();
  }, []);

  const itemCount = cartItems.reduce((total, cartItem) => (
    total + cartItem.quantity
  ), 0);

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
          Cart
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {itemCount} items in your cart
        </Typography>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'text.secondary' }}>
          Loading your cart...
        </Typography>
      ) : error ? (
        <Typography sx={{ color: 'text.secondary' }}>
          Unable to load your cart.
        </Typography>
      ) : cartItems.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          Your cart is empty.
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
        </Stack>
      )}
    </Container>
  );
}
