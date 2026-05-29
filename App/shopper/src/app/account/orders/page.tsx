import {
  Alert,
  Box,
  Container,
  Typography,
} from '@mui/material';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import Topbar from '../../buyer/topbar';
import { checkLogin } from '../../buyer/login/actions';
import { fetchCurrentUserOrdersAction } from '../../order/actions';
import OrderHistory from './OrderHistory';

export default async function AccountOrdersPage() {
  const session = await checkLogin();
  const t = await getTranslations('Orders');

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
            {t('title')}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {t('subtitle')}
          </Typography>
        </Box>

        {!result.success ? (
          <Alert severity="error">
            {typeof result.error === 'string'
              ? result.error
              : t('loadError')}
          </Alert>
        ) : orders.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            {t('empty')}
          </Typography>
        ) : (
          <OrderHistory orders={orders} />
        )}
      </Container>
    </>
  );
}
