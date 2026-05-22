'use client';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { ShippingAddress, ShippingAddressInput } from '../../address/types';
import {
  createAddressAction,
  updateAddressAction,
} from './actions';

interface Props {
  address?: ShippingAddress;
  onSaved: (address: ShippingAddress) => void;
  onCancel?: () => void;
}

const emptyInput: ShippingAddressInput = {
  line1: '',
  city: '',
  postal_code: '',
  country: 'US',
};

export default function AddressForm({ address, onSaved, onCancel }: Props) {
  const t = useTranslations('Address');
  const [input, setInput] = useState<ShippingAddressInput>(emptyInput);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      setInput({
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default,
      });
      return;
    }
    setInput(emptyInput);
  }, [address]);

  const updateField = <K extends keyof ShippingAddressInput>(
    field: K,
    value: ShippingAddressInput[K],
  ) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    setError(null);

    if (!input.line1.trim()) {
      setError(t('line1Required'));
      return;
    }
    if (!input.city.trim()) {
      setError(t('cityRequired'));
      return;
    }
    if (!input.postal_code.trim()) {
      setError(t('postalCodeRequired'));
      return;
    }

    const payload: ShippingAddressInput = {
      label: input.label?.trim() || undefined,
      line1: input.line1.trim(),
      line2: input.line2?.trim() || undefined,
      city: input.city.trim(),
      state: input.state?.trim() || undefined,
      postal_code: input.postal_code.trim(),
      country: input.country?.trim() || 'US',
      is_default: input.is_default,
    };

    setSubmitting(true);
    const result = address?.id
      ? await updateAddressAction(address.id, payload)
      : await createAddressAction(payload);
    setSubmitting(false);

    if (result.success && result.data) {
      onSaved(result.data);
      if (!address) {
        setInput(emptyInput);
      }
      return;
    }

    setError(result.error ?? t('saveError'));
  };

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <TextField
          label={t('label')}
          value={input.label ?? ''}
          onChange={(event) => updateField('label', event.target.value)}
          fullWidth
        />
        <TextField
          label={t('line1')}
          value={input.line1}
          onChange={(event) => updateField('line1', event.target.value)}
          required
          fullWidth
        />
        <TextField
          label={t('line2')}
          value={input.line2 ?? ''}
          onChange={(event) => updateField('line2', event.target.value)}
          fullWidth
        />
        <TextField
          label={t('city')}
          value={input.city}
          onChange={(event) => updateField('city', event.target.value)}
          required
          fullWidth
        />
        <TextField
          label={t('state')}
          value={input.state ?? ''}
          onChange={(event) => updateField('state', event.target.value)}
          fullWidth
        />
        <TextField
          label={t('postalCode')}
          value={input.postal_code}
          onChange={(event) => updateField('postal_code', event.target.value)}
          required
          fullWidth
        />
        <TextField
          label={t('country')}
          value={input.country ?? 'US'}
          onChange={(event) => updateField('country', event.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 2 } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(input.is_default)}
              onChange={(event) => updateField('is_default', event.target.checked)}
            />
          }
          label={t('setDefault')}
        />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {address ? t('update') : t('add')}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outlined" onClick={onCancel}>
              {t('cancel')}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
