import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { enUS, frFR } from '@mui/x-data-grid/locales'
import {
  // Alert,
  Avatar,
  Box,
  Stack,
  Typography,
  capitalize
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useContext, useMemo, useCallback } from 'react'

import type { Listing } from '../../../shared'
import { ErrorContext } from '../error/Context'
import ListingEditDialog from './ListingEditDialog'
import { list } from './model'

export default function SellerListings() {
  const locale = useLocale()
  const t = useTranslations('Listings')
  const errorCtx = useContext(ErrorContext)
  // const taskCtx = useContext(TaskContext)
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedListing, setSelectedListing] = useState<Listing | undefined>()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>()

  const setError = useCallback((error: string | undefined) => {
    setLoadError(error)
    errorCtx?.setError(error)
  }, [errorCtx])

  const handleListingDeleted = useCallback((id: string) => {
    setListings((current) => current.filter((listing) => listing.id !== id))
  }, [])

  const handleListingUpdated = useCallback((updated: Listing) => {
    setListings((current) =>
      current.map((listing) => (listing.id === updated.id ? updated : listing)),
    )
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
      renderCell: (params) => (
        <Typography sx={{fontWeight: 600}}>{params.row.name}</Typography>
      ),
    },
    {
      field: 'description',
      headerName: t('description'),
      flex: 2,
      minWidth: 260,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.description}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: t('price'),
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Typography>
          {new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD',
          }).format(params.row.price)}
        </Typography>
      ),
    },
    {
      field: 'quantity',
      headerName: t('quantity'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Typography>{params.row.quantity}</Typography>
      ),
    },
  ], [locale, t])

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
          disableVirtualization
          getRowId={(row) => row.id}
          getRowHeight={() => 72}
          loading={loading}
          onRowClick={(params) => setSelectedListing(params.row)}
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
      <ListingEditDialog
        open={Boolean(selectedListing)}
        listing={selectedListing}
        onClose={() => setSelectedListing(undefined)}
        onDeleted={handleListingDeleted}
        onUpdated={handleListingUpdated}
      />
    </Stack>
  )
}
