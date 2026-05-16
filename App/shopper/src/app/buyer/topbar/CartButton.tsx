'use client';

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const brandColor = '#0f766e';

export default function CartButton() {
  const router = useRouter();
  const t = useTranslations('Cart');

  return (
    <Tooltip title={t('tooltip')}>
      <IconButton
        aria-label={t('openCart')}
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
        <ShoppingCartOutlinedIcon aria-hidden sx={{ fontSize: 20 }} />
      </IconButton>
    </Tooltip>
  );
}
