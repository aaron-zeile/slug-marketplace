'use client';

import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Button } from '@mui/material';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const brandColor = '#0f766e';

interface OrdersButtonProps {
  isAuthenticated: boolean;
}

export default function OrdersButton({ isAuthenticated }: OrdersButtonProps) {
  const t = useTranslations('Topbar');

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      component={Link}
      href="/account/orders"
      startIcon={<ReceiptLongOutlinedIcon aria-hidden />}
      sx={{
        display: { xs: 'none', md: 'inline-flex' },
        borderRadius: 2,
        color: 'text.primary',
        fontWeight: 600,
        px: 1.75,
        textTransform: 'none',
        whiteSpace: 'nowrap',
        '&:hover': {
          bgcolor: 'action.hover',
          color: brandColor,
        },
      }}
    >
      {t('orders')}
    </Button>
  );
}
