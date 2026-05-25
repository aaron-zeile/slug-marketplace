import {
  Alert,
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { redirect } from 'next/navigation';

import type { Order } from '../../../order/service';
import Topbar from '../../buyer/topbar';
import { checkLogin } from '../../buyer/login/actions';
import { fetchCurrentUserOrdersAction } from '../../order/actions';

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
    .join(', ');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default async function AccountOrdersPage() {
  const session = await checkLogin();

  if (!session.user) {
    redirect('/');
  }

  const result = await fetchCurrentUserOrdersAction();
  const orders = result.success && result.data ? result.data : [];

  return (
    <>
      <Topbar />
      <Container component="main" maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography component="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Orders
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            View your current order history.
          </Typography>
        </Box>

        {!result.success ? (
          <Alert severity="error">
            {typeof result.error === 'string'
              ? result.error
              : 'Unable to load orders.'}
          </Alert>
        ) : orders.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have any orders yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {orders.map((order) => (
              <Paper
                key={order.id}
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
                      Order {order.id}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatDate(order.orderedAt)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    {formatCurrency(order.purchaseAmount)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.75}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {order.items.length === 1
                      ? '1 item'
                      : `${order.items.length} items`}
                  </Typography>
                  <Typography variant="body2">
                    Shipping to: {formatAddress(order)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    Items: {order.items.map((item) => item.itemId).join(', ')}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </>
  );
}
