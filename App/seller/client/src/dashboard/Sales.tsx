import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { enUS, frFR } from '@mui/x-data-grid/locales'
import { Box, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { Order } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { listOrders } from './model'

function formatAddress(order: Order): string {
  return [
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.state,
    order.address.postalCode,
    order.address.country,
  ]
    .filter(Boolean)
    .join(', ')
}

export default function Sales() {
  const locale = useLocale()
  const t = useTranslations('Sales')
  const errorCtx = useContext(ErrorContext)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>()

  const setError = useCallback((error: string | undefined) => {
    setLoadError(error)
    errorCtx?.setError(error)
  }, [errorCtx])

  const columns = useMemo<GridColDef<Order>[]>(() => [
    {
      field: 'id',
      headerName: t('order'),
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ overflowWrap: 'anywhere' }}>
          {params.row.id}
        </Typography>
      ),
    },
    {
      field: 'orderedAt',
      headerName: t('date'),
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Typography>
          {new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(params.row.orderedAt))}
        </Typography>
      ),
    },
    {
      field: 'items',
      headerName: t('items'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Typography>{params.row.items.length}</Typography>
      ),
    },
    {
      field: 'purchaseAmount',
      headerName: t('amount'),
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Typography>
          {new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD',
          }).format(params.row.purchaseAmount)}
        </Typography>
      ),
    },
    {
      field: 'address',
      headerName: t('shipTo'),
      flex: 1,
      minWidth: 260,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatAddress(params.row)}
        </Typography>
      ),
    },
  ], [locale, t])

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      await listOrders(setError, setOrders)
      setLoading(false)
    }

    void loadOrders()
  }, [setError])

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        disableVirtualization
        getRowId={(row) => row.id}
        getRowHeight={() => 72}
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
  )
}
