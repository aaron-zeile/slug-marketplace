import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import type { Discount, Listing } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { createDiscount, list, listDiscounts } from './model'

const emptyForm = {
  discountPercent: '',
  duration: '',
}

export default function Discounts() {
  const locale = useLocale()
  const t = useTranslations('Discounts')
  const errorCtx = useContext(ErrorContext)
  const [listings, setListings] = useState<Listing[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [loadingListings, setLoadingListings] = useState(true)
  const [loadingDiscounts, setLoadingDiscounts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | undefined>()

  const setError = useCallback(
    (error: string | undefined) => errorCtx?.setError(error),
    [errorCtx],
  )

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedItemId),
    [listings, selectedItemId],
  )
  const percent = Number(form.discountPercent)
  const duration = Number(form.duration)
  const percentError =
    form.discountPercent !== '' &&
    (!Number.isFinite(percent) || percent < 0 || percent > 100)
  const durationError =
    form.duration !== '' && (!Number.isInteger(duration) || duration < 1)
  const submitDisabled =
    saving ||
    selectedItemId === '' ||
    form.discountPercent === '' ||
    form.duration === '' ||
    percentError ||
    durationError

  useEffect(() => {
    const loadListings = async () => {
      setLoadingListings(true)
      await list(setError, (loaded) => {
        setListings(loaded)
        setSelectedItemId((current) => current || loaded[0]?.id || '')
      })
      setLoadingListings(false)
    }

    void loadListings()
  }, [setError])

  useEffect(() => {
    if (!selectedItemId) {
      setDiscounts([])
      return
    }

    const loadDiscounts = async () => {
      setLoadingDiscounts(true)
      const loaded = await listDiscounts(selectedItemId, setError)
      setDiscounts(loaded)
      setLoadingDiscounts(false)
    }

    void loadDiscounts()
  }, [selectedItemId, setError])

  const updateField =
    (field: keyof typeof emptyForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
      setSuccess(undefined)
    }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitDisabled) {
      return
    }

    setSaving(true)
    setSuccess(undefined)

    const discount = await createDiscount(
      {
        itemId: selectedItemId,
        discountPercent: percent,
        duration,
      },
      setError,
    )

    setSaving(false)

    if (discount) {
      setDiscounts((current) => [discount, ...current])
      setForm(emptyForm)
      setSuccess(t('createdSuccess', { name: selectedListing?.name ?? '' }))
    }
  }

  return (
    <Box sx={{ maxWidth: 980, p: 3 }}>
      <Stack component="form" spacing={2.5} onSubmit={submit}>
        <Typography variant="h5" component="h2">
          {t('title')}
        </Typography>

        {success && <Alert severity="success">{success}</Alert>}

        <FormControl fullWidth disabled={loadingListings || listings.length === 0}>
          <InputLabel id="discount-listing-label">{t('listingLabel')}</InputLabel>
          <Select
            labelId="discount-listing-label"
            label={t('listingLabel')}
            value={selectedItemId}
            onChange={(event) => {
              setSelectedItemId(event.target.value)
              setSuccess(undefined)
            }}
          >
            {listings.map((listing) => (
              <MenuItem key={listing.id} value={listing.id}>
                {listing.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('percentLabel')}
            value={form.discountPercent}
            onChange={updateField('discountPercent')}
            required
            type="number"
            error={percentError}
            helperText={percentError ? t('percentError') : undefined}
            inputProps={{ min: 0, max: 100, step: '0.01' }}
            sx={{ flex: 1 }}
          />

          <TextField
            label={t('durationLabel')}
            value={form.duration}
            onChange={updateField('duration')}
            required
            type="number"
            error={durationError}
            helperText={durationError ? t('durationError') : undefined}
            inputProps={{ min: 1, step: 1 }}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Box>
          <Button
            type="submit"
            aria-label={t('submit')}
            variant="contained"
            disabled={submitDisabled}
          >
            {saving ? t('submitting') : t('submit')}
          </Button>
        </Box>
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          {t('activeTitle')}
        </Typography>
        <Table aria-label={t('tableLabel')} size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('percentColumn')}</TableCell>
              <TableCell>{t('durationColumn')}</TableCell>
              <TableCell>{t('createdColumn')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loadingDiscounts && discounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>{t('empty')}</TableCell>
              </TableRow>
            )}
            {loadingDiscounts && (
              <TableRow>
                <TableCell colSpan={3}>{t('loading')}</TableCell>
              </TableRow>
            )}
            {!loadingDiscounts &&
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>{discount.discountPercent}%</TableCell>
                  <TableCell>
                    {t('durationValue', { count: discount.duration })}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                    }).format(new Date(discount.created_at))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
