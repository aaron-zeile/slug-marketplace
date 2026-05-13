'use client';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CartButton() {
  const router = useRouter();

  return (
    <Tooltip title="Cart">
      <IconButton
        aria-label="cart button"
        onClick={() => {
          router.push('/cart');
        }}
        size="small"
      >
        <ShoppingCartIcon />
      </IconButton>
    </Tooltip>
  );
}
