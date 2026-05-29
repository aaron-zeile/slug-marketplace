import type { Order } from '../order/schema';
import {
  BRAND_NAME,
  formatAddress,
  formatCurrency,
  orderDetailRows,
  wrapOrderEmail,
  type OrderEmailContent,
} from './orderEmailLayout';

export function buildOrderPurchasedEmail(order: Order): OrderEmailContent {
  const total = formatCurrency(order.purchaseAmount);
  const rows = orderDetailRows(order);
  const shippingText = formatAddress(order);

  const subject = `Your ${BRAND_NAME} order is confirmed (${total})`;
  const text = [
    `Thanks for shopping with ${BRAND_NAME}!`,
    '',
    ...rows.map((row) => `${row.label}: ${row.value}`),
    '',
    'Ship to:',
    shippingText,
    '',
    'We will email you when your order ships and when it is delivered.',
    '',
    `— ${BRAND_NAME}`,
  ].join('\n');

  return wrapOrderEmail({
    subject,
    text,
    title: 'Order confirmed',
    subtitle: 'Thanks for your purchase. We are getting it ready.',
    iconChar: '&#10003;',
    iconBackground: '#2563eb',
    highlightLabel: 'Order total',
    highlightValue: total,
    detailRows: rows,
    order,
    footerNote:
      'You will receive another email when your order ships and when it is delivered.',
  });
}
