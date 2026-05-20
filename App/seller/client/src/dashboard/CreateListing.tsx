import React, { useContext, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { ErrorContext } from '../error/Context'
import { create } from './model'
import { useDashboard } from './useDashboard'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  images: '',
}

export default function CreateListing() {
  const t = useTranslations('CreateListing')
  const errorCtx = useContext(ErrorContext)
  const { setTab } = useDashboard()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [createdName, setCreatedName] = useState<string | undefined>()
  const price = Number(form.price)
  const priceError =
    form.price !== '' && (!Number.isFinite(price) || price < 0.01)

  const setError = errorCtx?.setError ?? (() => { /* no error provider */ })

  const updateField =
    (field: keyof typeof emptyForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (priceError) {
      return
    }

    setSaving(true)
    setCreatedName(undefined)

    const listing = await create(
      {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        images: form.images
          .split(/\r?\n/)
          .map((image) => image.trim())
          .filter(Boolean),
      },
      setError,
    )

    setSaving(false)

    if (listing) {
      setCreatedName(listing.name)
      setForm(emptyForm)
    }
  }

  return (
    <Box sx={{ maxWidth: 720, p: 3 }}>
      <Stack
        component="form"
        spacing={2}
        onSubmit={submit}
      >
        <Typography variant="h5" component="h2">
          {t('title')}
        </Typography>

        {createdName && (
          <Alert
            severity="success"
            action={
              <Button color="inherit" size="small" onClick={() => setTab(0)}>
                {t('viewListings')}
              </Button>
            }
          >
            {t('createdSuccess', { name: createdName })}
          </Alert>
        )}

        <TextField
          label={t('nameLabel')}
          value={form.name}
          onChange={updateField('name')}
          required
          inputProps={{ maxLength: 256 }}
        />

        <TextField
          label={t('descriptionLabel')}
          value={form.description}
          onChange={updateField('description')}
          required
          multiline
          minRows={4}
          inputProps={{ maxLength: 1024 }}
        />

        <TextField
          label={t('priceLabel')}
          value={form.price}
          onChange={updateField('price')}
          required
          type="number"
          error={priceError}
          helperText={priceError ? t('priceError') : undefined}
          inputProps={{ min: 0.01, step: '0.01' }}
        />

        <TextField
          label={t('imagesLabel')}
          value={form.images}
          onChange={updateField('images')}
          multiline
          minRows={3}
          helperText={t('imagesHelper')}
        />

        <Box>
          <Button
            type="submit"
            aria-label={t('submit')}
            variant="contained"
            disabled={saving || priceError}
          >
            {saving ? t('submitting') : t('submit')}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
