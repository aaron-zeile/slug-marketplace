import React from 'react'
import {
  Avatar,
  Box
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useContext } from 'react'

import type { Listing } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { list } from './model'

const columns: GridColDef<Listing>[] = [
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
]

export default function SellerListings() {
  const errorCtx = useContext(ErrorContext)
  // const taskCtx = useContext(TaskContext)
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    void list(errorCtx?.setError ?? (() => { /* nullish coalesce */}), setListings);
  }, []); //[taskCtx?.task, errorCtx?.setError]);

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={listings}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
      />
    </Box>
  )
}