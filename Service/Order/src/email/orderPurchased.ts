import type { Order } from '../order/schema';
import { sendMailgunMessage } from './mailgun';
import { buildOrderPurchasedEmail } from './orderPurchasedTemplate';

export async function sendOrderPurchasedEmail(
  order: Order,
  buyerEmail: string,
): Promise<void> {
  const { subject, text, html } = buildOrderPurchasedEmail(order);

  await sendMailgunMessage({
    to: buyerEmail,
    subject,
    text,
    html,
  });
}
