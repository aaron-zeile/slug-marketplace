import type { Order } from '../order/schema';
import { sendMailgunMessage } from './mailgun';
import { buildOrderShippedEmail } from './orderShippedTemplate';

export async function sendOrderShippedEmail(
  order: Order,
  buyerEmail: string,
): Promise<void> {
  const { subject, text, html } = buildOrderShippedEmail(order);

  await sendMailgunMessage({
    to: buyerEmail,
    subject,
    text,
    html,
  });
}
