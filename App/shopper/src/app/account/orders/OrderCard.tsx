'use client';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  CardMedia,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { OrderWithDetails } from '../../../order/enrich';

interface OrderCardProps {
  order: OrderWithDetails;
}

function localeTagForNumbers(locale: string): string {
  if (locale.startsWith('fr')) {
    return 'fr-FR';
  }
  return 'en-US';
}

function formatAddress(order: OrderWithDetails): string {
  return [
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.state,
    order.address.postalCode,
    order.address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(localeTagForNumbers(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function OrderCard({ order }: OrderCardProps) {
  const locale = useLocale();
  const t = useTranslations('Orders');
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForNumbers(locale), {
        style: 'currency',
        currency: 'USD',
      }),
    [locale],
  );

  const itemCount = order.lineItems.reduce(
    (total, lineItem) => total + lineItem.quantity,
    0,
  );
  const itemCountLabel =
    itemCount === 1
      ? t('itemsInOrder_one', { count: itemCount })
      : t('itemsInOrder_other', { count: itemCount });

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {t('orderLabel', { id: order.id })}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {formatDate(order.orderedAt, locale)}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 800 }}>
          {currencyFormatter.format(order.purchaseAmount)}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={0.75}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {itemCountLabel}
        </Typography>
        <Typography variant="body2">
          {t('shippingTo', { address: formatAddress(order) })}
        </Typography>
      </Stack>

      <Box
        sx={{
          mt: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          overflow: 'hidden',
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => setBreakdownOpen((open) => !open)}
          aria-expanded={breakdownOpen}
          aria-controls={`order-breakdown-${order.id}`}
          sx={{
            appearance: 'none',
            background: 'transparent',
            border: 0,
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            m: 0,
            px: 1.75,
            py: 1.25,
            textAlign: 'left',
            width: '100%',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {breakdownOpen ? t('hideBreakdown') : t('viewBreakdown')}
          </Typography>
          <KeyboardArrowDown
            sx={{
              color: 'action.active',
              flexShrink: 0,
              transition: 'transform 0.2s ease',
              transform: breakdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            aria-hidden
          />
        </Box>

        <Collapse in={breakdownOpen} unmountOnExit>
          <Box
            id={`order-breakdown-${order.id}`}
            sx={{
              px: 1.75,
              py: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
            }}
          >
            <Stack spacing={1.25}>
              {order.lineItems.map((line, index) => (
                <Box
                  key={`${order.id}-${line.itemId}-${index}`}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr auto',
                    gap: 1.25,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      display: 'grid',
                      placeItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {line.image && !line.unavailable ? (
                      <CardMedia
                        component="img"
                        src={line.image}
                        alt={line.name}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', px: 0.5, textAlign: 'center' }}
                      >
                        {t('noImage')}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    {line.unavailable ? (
                      <Typography sx={{ fontWeight: 600 }}>{line.name}</Typography>
                    ) : (
                      <Typography
                        component={Link}
                        href={`/items/${line.itemId}`}
                        sx={{
                          color: 'inherit',
                          display: '-webkit-box',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textDecoration: 'none',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {line.name}
                      </Typography>
                    )}
                    {line.unavailable ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('itemUnavailable')}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('quantityLine', { count: line.quantity })}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {line.unavailable
                      ? '—'
                      : currencyFormatter.format(line.price * line.quantity)}
                  </Typography>
                </Box>
              ))}

              <Divider />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{t('orderTotal')}</Typography>
                <Typography sx={{ fontWeight: 800 }}>
                  {currencyFormatter.format(order.purchaseAmount)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}
