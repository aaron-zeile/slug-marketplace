'use client';

import {
  Alert,
  Box,
  Button,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AddressForm from '../../account/AddressForm';
import { listAddressesAction } from '../../account/actions';
import type { ShippingAddress } from '../../../address/types';

function formatAddress(address: ShippingAddress): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export default function CheckoutShipping() {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await listAddressesAction();
      if (result.success && result.data) {
        setAddresses(result.data);
        const defaultAddress = result.data.find((entry) => entry.is_default);
        setSelectedId(defaultAddress?.id ?? result.data[0]?.id ?? '');
        if (result.data.length === 0) {
          setShowForm(true);
        }
      } else {
        setError(result.error ?? t('loadError'));
      }
      setLoading(false);
    }

    void load();
    // Load once on mount; `t` is stable enough and must not retrigger fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    if (!selectedId) {
      setError(t('selectRequired'));
      return;
    }
    router.push(`/checkout/payment?addressId=${selectedId}`);
  };

  const handleSaved = async (saved: ShippingAddress) => {
    const refreshed = await listAddressesAction();
    if (refreshed.success && refreshed.data) {
      setAddresses(refreshed.data);
      setSelectedId(
        refreshed.data.some((entry) => entry.id === saved.id)
          ? saved.id
          : refreshed.data[0]?.id ?? '',
      );
    } else {
      const others = addresses.filter((entry) => entry.id !== saved.id);
      setAddresses([
        ...others.map((entry) => ({
          ...entry,
          is_default: saved.is_default ? false : entry.is_default,
        })),
        saved,
      ]);
      setSelectedId(saved.id);
    }
    setShowForm(false);
    setError(null);
  };

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('shippingTitle')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t('shippingSubtitle')}</Typography>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'text.secondary' }}>{t('loading')}</Typography>
      ) : (
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {addresses.length > 0 ? (
            <RadioGroup
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setError(null);
              }}
            >
              {addresses.map((address) => (
                <Box
                  key={address.id}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: selectedId === address.id ? 'primary.main' : 'divider',
                  }}
                >
                  <FormControlLabel
                    value={address.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {address.label || t('untitledAddress')}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          {formatAddress(address)}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              ))}
            </RadioGroup>
          ) : null}

          {showForm ? (
            <AddressForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          ) : (
            <Button variant="outlined" onClick={() => setShowForm(true)}>
              {t('addAddress')}
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={!selectedId}
          >
            {t('continueToPayment')}
          </Button>
        </Stack>
      )}
    </Container>
  );
}
