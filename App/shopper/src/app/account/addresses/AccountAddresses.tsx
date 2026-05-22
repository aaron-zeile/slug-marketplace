'use client';

import { Alert, Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { listAddressesClient } from '../../../address/client';
import type { ShippingAddress } from '../../../address/types';
import AddressList from '../AddressList';

export default function AccountAddresses() {
  const t = useTranslations('Address');
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await listAddressesClient();
      if (result.success && result.data) {
        setAddresses(result.data);
      } else {
        setError(result.error ?? t('loadError'));
      }
      setLoading(false);
    }

    void load();
  }, [t]);

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t('subtitle')}</Typography>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'text.secondary' }}>{t('loading')}</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <AddressList addresses={addresses} onChange={setAddresses} />
      )}
    </Container>
  );
}
