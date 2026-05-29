'use client';

import { Stack } from '@mui/material';

import type { OrderWithDetails } from '../../../order/enrich';
import OrderCard from './OrderCard';

interface OrderHistoryProps {
  orders: OrderWithDetails[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  return (
    <Stack spacing={1.5}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </Stack>
  );
}
