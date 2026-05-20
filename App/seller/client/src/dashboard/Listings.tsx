import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { enUS, frFR } from '@mui/x-data-grid/locales'
import {
  // Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  capitalize
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useContext, useMemo, useCallback } from 'react'

import type { Listing } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { list, remove, update } from './model'

type ListingDraft = {
  name: string
  description: string
  price: string
  images: string
}

const draftFromListing = (listing: Listing): ListingDraft => ({
  name: listing.name,
  description: listing.description,
  price: String(listing.price),
  images: listing.images.join('\n'),
})

const normalizeImages = (images: string) =>
  images
    .split(/\r?\n/)
    .map((image) => image.trim())
    .filter(Boolean)

export default function SellerListings() {
  const locale = useLocale()
  const t = useTranslations('Listings')
  const errorCtx = useContext(ErrorContext)
  // const taskCtx = useContext(TaskContext)
  const [listings, setListings] = useState<Listing[]>([])
  const [drafts, setDrafts] = useState<Record<string, ListingDraft>>({})
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [savingId, setSavingId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>()

  const setError = useCallback((error: string | undefined) => {
    setLoadError(error)
    errorCtx?.setError(error)
  }, [errorCtx])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const deleted = await remove(id, setError)
    setDeletingId(undefined)

    if (deleted) {
      setListings((current) => current.filter((listing) => listing.id !== id))
    }
  }

  const getDraft = useCallback(
    (listing: Listing) => drafts[listing.id] ?? draftFromListing(listing),
    [drafts],
  )

  const handleDraftChange = useCallback(
    (id: string, field: keyof ListingDraft, value: string) => {
      setDrafts((current) => {
        const listing = listings.find((item) => item.id === id)
        if (!listing) {
          return current
        }

        return {
          ...current,
          [id]: {
            ...(current[id] ?? draftFromListing(listing)),
            [field]: value,
          },
        }
      })
    },
    [listings],
  )

  const hasChanges = useCallback(
    (listing: Listing) => {
      const draft = getDraft(listing)
      return (
        draft.name !== listing.name ||
        draft.description !== listing.description ||
        Number(draft.price) !== listing.price ||
        draft.images !== listing.images.join('\n')
      )
    },
    [getDraft],
  )

  const handleUpdate = useCallback(
    async (listing: Listing) => {
      const draft = getDraft(listing)
      const price = Number(draft.price)
      if (
        !draft.name.trim() ||
        !draft.description.trim() ||
        !Number.isFinite(price) ||
        price < 0.01
      ) {
        return
      }

      setSavingId(listing.id)
      const updated = await update(
        listing.id,
        {
          name: draft.name.trim(),
          description: draft.description.trim(),
          price,
          images: normalizeImages(draft.images),
        },
        setError,
      )
      setSavingId(undefined)

      if (updated) {
        setListings((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        )
        setDrafts((current) => {
          const next = { ...current }
          delete next[updated.id]
          return next
        })
      }
    },
    [getDraft, setError],
  )

  const stopGridKeyDown = useCallback((event: React.KeyboardEvent) => {
    event.stopPropagation()
  }, [])

  const columns = useMemo<GridColDef<Listing>[]>(() => [
    {
      field: 'status',
      headerName: t('status'),
      width: 90,
      sortable: false,
      renderCell: (params) => {
        return (
          <Typography>
            {capitalize(params.row.status)}
          </Typography>
        )
      },
    },
    {
      field: 'image',
      headerName: t('image'),
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          variant="rounded"
          src={params.row.images?.[0]}
          alt={params.row.name}
        />
      ),
    },
    {
      field: 'name',
      headerName: t('name'),
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => {
        const draft = getDraft(params.row)
        return (
          <TextField
            value={draft.name}
            onChange={(event) =>
              handleDraftChange(params.row.id, 'name', event.target.value)
            }
            onKeyDown={stopGridKeyDown}
            required
            size="small"
            inputProps={{
              'aria-label': t('nameInput', { name: params.row.name }),
              maxLength: 256,
            }}
            fullWidth
          />
        )
      },
    },
    {
      field: 'description',
      headerName: t('description'),
      flex: 2,
      minWidth: 260,
      sortable: false,
      renderCell: (params) => {
        const draft = getDraft(params.row)
        return (
          <TextField
            value={draft.description}
            onChange={(event) =>
              handleDraftChange(params.row.id, 'description', event.target.value)
            }
            onKeyDown={stopGridKeyDown}
            required
            multiline
            minRows={2}
            size="small"
            inputProps={{
              'aria-label': t('descriptionInput', { name: params.row.name }),
              maxLength: 1024,
            }}
            fullWidth
          />
        )
      },
    },
    {
      field: 'price',
      headerName: t('price'),
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const draft = getDraft(params.row)
        const price = Number(draft.price)
        const priceError =
          draft.price !== '' && (!Number.isFinite(price) || price < 0.01)
        return (
          <TextField
            value={draft.price}
            onChange={(event) =>
              handleDraftChange(params.row.id, 'price', event.target.value)
            }
            onKeyDown={stopGridKeyDown}
            required
            error={priceError}
            type="number"
            size="small"
            inputProps={{
              'aria-label': t('priceInput', { name: params.row.name }),
              min: 0.01,
              step: '0.01',
            }}
            fullWidth
          />
        )
      },
    },
    {
      field: 'images',
      headerName: t('images'),
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        const draft = getDraft(params.row)
        return (
          <TextField
            value={draft.images}
            onChange={(event) =>
              handleDraftChange(params.row.id, 'images', event.target.value)
            }
            onKeyDown={stopGridKeyDown}
            multiline
            minRows={2}
            size="small"
            inputProps={{
              'aria-label': t('imagesInput', { name: params.row.name }),
            }}
            fullWidth
          />
        )
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const draft = getDraft(params.row)
        const price = Number(draft.price)
        const priceError =
          !Number.isFinite(price) || price < 0.01
        const changed = hasChanges(params.row)

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {changed && (
              <Button
                aria-label={t('updateAria', { name: params.row.name })}
                disabled={
                  savingId === params.row.id ||
                  priceError ||
                  !draft.name.trim() ||
                  !draft.description.trim()
                }
                size="small"
                type="button"
                variant="contained"
                startIcon={<SaveIcon fontSize="small" />}
                onClick={() => void handleUpdate(params.row)}
              >
                {savingId === params.row.id ? t('updating') : t('update')}
              </Button>
            )}
            <Tooltip title={t('deleteTooltip')}>
              <span>
                <IconButton
                  aria-label={t('deleteAria', { name: params.row.name })}
                  color="error"
                  disabled={deletingId === params.row.id}
                  size="small"
                  onClick={() => void handleDelete(params.row.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )
      },
    },
  ], [
    deletingId,
    getDraft,
    handleDraftChange,
    handleUpdate,
    hasChanges,
    savingId,
    stopGridKeyDown,
    t,
  ])

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true)
      await list(setError, setListings)
      setLoading(false)
    }

    void loadListings();
  }, [setError]); //[taskCtx?.task, errorCtx?.setError]);

  return (
    <Stack spacing={2}>
      {/* {loadError && (
        <Alert severity="error">
          Failed to load listings: {loadError}
        </Alert>
      )} */}
      {/* {!loading && !loadError && listings.length === 0 && (
        <Alert severity="info">
          No listings found for this seller.
        </Alert>
      )} */}
      {/* {!loading && !loadError && listings.length > 0 && (
        <Alert severity="success">
          Loaded {listings.length} listing{listings.length === 1 ? '' : 's'}.
        </Alert>
      )} */}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={listings}
          columns={columns}
          disableColumnVirtualization
          getRowId={(row) => row.id}
          getRowHeight={() => 96}
          loading={loading}
          localeText={{
            ...(locale === 'fr' ? frFR : enUS).components.MuiDataGrid.defaultProps
              .localeText,
            noRowsLabel: loadError ? t('gridLoadError') : t('gridNoRows'),
          }}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />
      </Box>
    </Stack>
  )
}
