'use client';

import { Alert, Snackbar } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartExpiredToast() {
  const t = useTranslations('Checkout');
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('outOfStock') === '1') {
      setMessage(t('insufficientStock'));
      setOpen(true);
    } else if (searchParams.get('cartExpired') === '1') {
      setMessage(t('cartExpired'));
      setOpen(true);
    } else {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('cartExpired');
    url.searchParams.delete('outOfStock');
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [searchParams, t]);

  if (!message) {
    return null;
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={6000}
      open={open}
      onClose={() => setOpen(false)}
    >
      <Alert
        aria-label={message}
        onClose={() => setOpen(false)}
        severity="warning"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
