import type { Order } from '../order/schema';
import {
  BRAND_NAME,
  formatAddress,
  formatCurrency,
  orderDetailRows,
  wrapOrderEmail,
  type OrderEmailContent,
} from './orderEmailLayout';

export function buildOrderShippedEmail(order: Order): OrderEmailContent {
  const total = formatCurrency(order.purchaseAmount);
  const rows = orderDetailRows(order);
  const shippingText = formatAddress(order);

  const subject = `Your ${BRAND_NAME} order has shipped`;
  const text = [
    `Good news — your order from ${BRAND_NAME} is on the way.`,
    '',
    ...rows.map((row) => `${row.label}: ${row.value}`),
    '',
    'Ship to:',
    shippingText,
    '',
    'We will email you again when it is delivered.',
    '',
    `— ${BRAND_NAME}`,
  ].join('\n');

  return wrapOrderEmail({
    subject,
    text,
    title: 'Your order has shipped',
    subtitle: 'It is on the way to your shipping address.',
    iconChar: '&#128666;',
    iconBackground: '#0ea5e9',
    highlightLabel: 'Status',
    highlightValue: 'Shipped',
    detailRows: rows,
    order,
    footerNote:
      'Tracking may appear in your account soon. We will email you when the order is delivered.',
  });
}
