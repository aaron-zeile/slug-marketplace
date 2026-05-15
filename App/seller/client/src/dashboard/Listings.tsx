import React from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
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
  const errorCtx = useContext(ErrorContext)
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
      headerName: 'Image',
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
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 260,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      field: 'actions',
      headerName: '',
      width: 72,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Delete listing">
          <span>
            <IconButton
              aria-label={`Delete ${params.row.name}`}
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
  ], [deletingId])

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
            noRowsLabel: loadError ? 'Listings failed to load' : 'No listings found'
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
