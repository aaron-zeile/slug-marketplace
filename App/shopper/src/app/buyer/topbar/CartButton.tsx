'use client';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function CartButton() {
  const router = useRouter();
  const t = useTranslations('Cart');

  return (
    <Tooltip title={t('tooltip')}>
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
