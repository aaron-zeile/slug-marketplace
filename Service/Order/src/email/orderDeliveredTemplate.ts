import type { Order } from '../order/schema';
import {
  BRAND_NAME,
  formatCurrency,
  orderDetailRows,
  wrapOrderEmail,
  type OrderEmailContent,
} from './orderEmailLayout';

export function buildOrderDeliveredEmail(order: Order): OrderEmailContent {
  const total = formatCurrency(order.purchaseAmount);
  const rows = orderDetailRows(order);

  const subject = `Your ${BRAND_NAME} order was delivered`;
  const text = [
    `Your order from ${BRAND_NAME} has been delivered.`,
    '',
    ...rows.map((row) => `${row.label}: ${row.value}`),
    '',
    'We hope you enjoy your purchase. Thank you for shopping with us.',
    '',
    `— ${BRAND_NAME}`,
  ].join('\n');

  return wrapOrderEmail({
    subject,
    text,
    title: 'Delivered',
    subtitle: 'Your package has arrived. Enjoy your order!',
    iconChar: '&#10003;',
    iconBackground: '#16a34a',
    highlightLabel: 'Status',
    highlightValue: 'Delivered',
    detailRows: rows,
    order,
    footerNote:
      'If anything looks wrong with your order, sign in to your account for help.',
    showShipping: false,
  });
}
