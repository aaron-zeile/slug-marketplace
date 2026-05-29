import type { Order } from '../order/schema';
import { sendMailgunMessage } from './mailgun';
import { buildOrderDeliveredEmail } from './orderDeliveredTemplate';

export async function sendOrderDeliveredEmail(
  order: Order,
  buyerEmail: string,
): Promise<void> {
  const { subject, text, html } = buildOrderDeliveredEmail(order);

  await sendMailgunMessage({
    to: buyerEmail,
    subject,
    text,
    html,
  });
}
