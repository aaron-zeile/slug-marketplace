import React, { useContext, useState } from 'react'
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
          Create Listing
        </Typography>

        {createdName && (
          <Alert
            severity="success"
            action={
              <Button color="inherit" size="small" onClick={() => setTab(0)}>
                View
              </Button>
            }
          >
            Created {createdName}.
          </Alert>
        )}

        <TextField
          label="Name"
          value={form.name}
          onChange={updateField('name')}
          required
          inputProps={{ maxLength: 256 }}
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={updateField('description')}
          required
          multiline
          minRows={4}
          inputProps={{ maxLength: 1024 }}
        />

        <TextField
          label="Price"
          value={form.price}
          onChange={updateField('price')}
          required
          type="number"
          error={priceError}
          helperText={priceError ? 'Price must be at least $0.01.' : undefined}
          inputProps={{ min: 0.01, step: '0.01' }}
        />

        <TextField
          label="Image URLs"
          value={form.images}
          onChange={updateField('images')}
          multiline
          minRows={3}
          helperText="Enter one image URL per line."
        />

        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || priceError}
          >
            {saving ? 'Creating...' : 'Create Listing'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
