'use client';

import { Alert, Snackbar } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function CartExpiredToast() {
  const t = useTranslations('Checkout');
  const searchParams = useSearchParams();
  const message = useMemo(() => {
    if (searchParams.get('outOfStock') === '1') {
      return t('insufficientStock');
    }
    if (searchParams.get('cartExpired') === '1') {
      return t('cartExpired');
    }
    return null;
  }, [searchParams, t]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!message) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('cartExpired');
    url.searchParams.delete('outOfStock');
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [message]);

  if (!message || dismissed) {
    return null;
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={6000}
      open
      onClose={() => setDismissed(true)}
    >
      <Alert
        aria-label={message}
        onClose={() => setDismissed(true)}
        severity="warning"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
