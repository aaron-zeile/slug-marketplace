import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { enUS, frFR } from '@mui/x-data-grid/locales'
import { Box, Button, Chip, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { Order } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { listOrders, updateOrderStatus } from './model'

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

function statusLabel(
  status: Order['status'],
  t: ReturnType<typeof useTranslations<'Sales'>>,
): string {
  const labels = {
    ordered: t('statusOrdered'),
    shipping: t('statusShipping'),
    delivered: t('statusDelivered'),
  }

  return labels[status]
}

export default function Sales() {
  const locale = useLocale()
  const t = useTranslations('Sales')
  const errorCtx = useContext(ErrorContext)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>()
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const setError = useCallback((error: string | undefined) => {
    setLoadError(error)
    errorCtx?.setError(error)
  }, [errorCtx])

  const handleStatusUpdate = useCallback(async (
    orderId: string,
    status: 'shipping' | 'delivered',
  ) => {
    setUpdatingOrderId(orderId)
    await updateOrderStatus(
      orderId,
      status,
      setError,
      (updated) => {
        setOrders((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        )
      },
    )
    setUpdatingOrderId(null)
  }, [setError])

  const columns = useMemo<GridColDef<Order>[]>(() => [
    {
      field: 'id',
      headerName: t('order'),
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ overflowWrap: 'anywhere', fontSize: 13 }}>
          {params.row.id}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('status'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Chip
          size="small"
          label={statusLabel(params.row.status, t)}
          color={
            params.row.status === 'delivered'
              ? 'success'
              : params.row.status === 'shipping'
                ? 'info'
                : 'default'
          }
        />
      ),
    },
    {
      field: 'orderedAt',
      headerName: t('date'),
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
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
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Typography>{params.row.items.length}</Typography>
      ),
    },
    {
      field: 'purchaseAmount',
      headerName: t('amount'),
      width: 110,
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
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatAddress(params.row)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('actions'),
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const busy = updatingOrderId === params.row.id

        if (params.row.status === 'ordered') {
          return (
            <Button
              size="small"
              variant="contained"
              disabled={busy}
              onClick={() => void handleStatusUpdate(params.row.id, 'shipping')}
            >
              {busy ? t('updating') : t('markShipped')}
            </Button>
          )
        }

        if (params.row.status === 'shipping') {
          return (
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={busy}
              onClick={() => void handleStatusUpdate(params.row.id, 'delivered')}
            >
              {busy ? t('updating') : t('markDelivered')}
            </Button>
          )
        }

        return (
          <Typography variant="body2" color="text.secondary">
            {t('statusDelivered')}
          </Typography>
        )
      },
    },
  ], [handleStatusUpdate, locale, t, updatingOrderId])

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
          getRowHeight={() => 80}
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
