'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  deleteAddressClient,
  setDefaultAddressClient,
} from '../../address/client';
import type { ShippingAddress } from '../../address/types';
import AddressForm from './AddressForm';

interface Props {
  addresses: ShippingAddress[];
  onChange: (addresses: ShippingAddress[]) => void;
}

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

export default function AddressList({ addresses, onChange }: Props) {
  const t = useTranslations('Address');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (addressId: string) => {
    setError(null);
    const result = await deleteAddressClient(addressId);
    if (!result.success) {
      setError(result.error ?? t('deleteError'));
      return;
    }
    onChange(addresses.filter((entry) => entry.id !== addressId));
  };

  const handleSetDefault = async (addressId: string) => {
    setError(null);
    const result = await setDefaultAddressClient(addressId);
    if (!result.success || !result.data) {
      setError(result.error ?? t('defaultError'));
      return;
    }
    onChange(
      addresses.map((entry) => ({
        ...entry,
        is_default: entry.id === result.data!.id,
      })),
    );
  };

  const handleSaved = (saved: ShippingAddress) => {
    const exists = addresses.some((entry) => entry.id === saved.id);
    const next = exists
      ? addresses.map((entry) => (entry.id === saved.id ? saved : {
          ...entry,
          is_default: saved.is_default ? false : entry.is_default,
        }))
      : [...addresses, saved];
    const normalized = saved.is_default
      ? next.map((entry) => ({
          ...entry,
          is_default: entry.id === saved.id,
        }))
      : next;
    onChange(normalized);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      {addresses.map((address) => (
        <Box
          key={address.id}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: 1,
            borderColor: 'divider',
          }}
        >
          {editingId === address.id ? (
            <AddressForm
              address={address}
              onSaved={handleSaved}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {address.label || t('untitled')}
                </Typography>
                {address.is_default ? (
                  <Chip size="small" label={t('defaultBadge')} color="primary" />
                ) : null}
              </Stack>
              <Typography sx={{ color: 'text.secondary' }}>
                {formatAddress(address)}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap' }}
              >
                <Button size="small" onClick={() => setEditingId(address.id)}>
                  {t('edit')}
                </Button>
                {!address.is_default ? (
                  <Button size="small" onClick={() => void handleSetDefault(address.id)}>
                    {t('makeDefault')}
                  </Button>
                ) : null}
                <Button
                  size="small"
                  color="error"
                  onClick={() => void handleDelete(address.id)}
                >
                  {t('delete')}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      ))}

      {showForm ? (
        <AddressForm
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button variant="outlined" onClick={() => setShowForm(true)}>
          {t('addNew')}
        </Button>
      )}
    </Stack>
  );
}
