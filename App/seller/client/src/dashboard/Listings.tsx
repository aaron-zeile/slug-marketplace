import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import DeleteIcon from '@mui/icons-material/Delete'
import { enUS, frFR } from '@mui/x-data-grid/locales'
import {
  // Alert,
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useContext, useMemo } from 'react'

import type { Listing } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { list, remove } from './model'

export default function SellerListings() {
  const locale = useLocale()
  const t = useTranslations('Listings')
  const errorCtx = useContext(ErrorContext)
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
      }),
    [locale],
  )
  // const taskCtx = useContext(TaskContext)
  const [listings, setListings] = useState<Listing[]>([])
  const [deletingId, setDeletingId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>()

  const setError = (error: string | undefined) => {
    setLoadError(error)
    errorCtx?.setError(error)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const deleted = await remove(id, setError)
    setDeletingId(undefined)

    if (deleted) {
      setListings((current) => current.filter((listing) => listing.id !== id))
    }
  }

  const columns = useMemo<GridColDef<Listing>[]>(() => [
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
    },
    {
      field: 'description',
      headerName: t('description'),
      flex: 2,
      minWidth: 260,
    },
    {
      field: 'price',
      headerName: t('price'),
      width: 120,
      valueFormatter: (value) => priceFormatter.format(Number(value)),
    },
    {
      field: 'actions',
      headerName: '',
      width: 72,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
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
      ),
    },
  ], [deletingId, priceFormatter, t])

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true)
      await list(setError, setListings)
      setLoading(false)
    }

    void loadListings();
  }, []); //[taskCtx?.task, errorCtx?.setError]);

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
          getRowId={(row) => row.id}
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
