import type { Order } from '../order/schema';

export const BRAND_NAME = 'SlugMarketplace';
const ACCENT = '#2563eb';
const HEADER_BG = '#0f172a';
const MUTED = '#64748b';

export interface OrderEmailContent {
  subject: string;
  text: string;
  html: string;
}

export interface OrderEmailDetailRow {
  label: string;
  value: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatOrderDate(orderedAt: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(orderedAt);
}

export function formatAddress(order: Order): string {
  const { address } = order;
  return [
    address.label,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatAddressHtml(order: Order): string {
  return formatAddress(order)
    .split('\n')
    .map((line) => escapeHtml(line))
    .join('<br />');
}

export function orderDetailRows(order: Order): OrderEmailDetailRow[] {
  const itemCount = order.items.length;
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;

  return [
    { label: 'Order ID', value: order.id },
    { label: 'Placed', value: formatOrderDate(order.orderedAt) },
    { label: 'Items', value: itemLabel },
    { label: 'Total', value: formatCurrency(order.purchaseAmount) },
  ];
}

function renderDetailRows(rows: OrderEmailDetailRow[]): string {
  return rows
    .map((row, index) => {
      const border =
        index < rows.length - 1
          ? 'border-bottom:1px solid #e2e8f0;'
          : '';
      return `<tr>
        <td style="padding:10px 0;${border}color:${MUTED};width:120px;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;${border}color:#0f172a;${row.label === 'Order ID' ? 'font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;word-break:break-all;' : ''}">${escapeHtml(row.value)}</td>
      </tr>`;
    })
    .join('');
}

export interface WrapOrderEmailInput {
  subject: string;
  text: string;
  title: string;
  subtitle: string;
  iconChar: string;
  iconBackground: string;
  highlightLabel: string;
  highlightValue: string;
  detailRows: OrderEmailDetailRow[];
  order: Order;
  footerNote: string;
  showShipping?: boolean;
}

export function wrapOrderEmail(input: WrapOrderEmailInput): OrderEmailContent {
  const {
    subject,
    text,
    title,
    subtitle,
    iconChar,
    iconBackground,
    highlightLabel,
    highlightValue,
    detailRows,
    order,
    footerNote,
    showShipping = true,
  } = input;

  const shippingHtml = formatAddressHtml(order);
  const detailsHtml = renderDetailRows(detailRows);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <span style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${escapeHtml(BRAND_NAME)}</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:${HEADER_BG};padding:28px 32px;text-align:center;">
                    <div style="width:48px;height:48px;margin:0 auto 16px auto;background:${iconBackground};border-radius:50%;line-height:48px;font-size:22px;color:#ffffff;">${iconChar}</div>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${escapeHtml(title)}</h1>
                    <p style="margin:10px 0 0 0;font-size:15px;color:#94a3b8;line-height:1.5;">${escapeHtml(subtitle)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="padding:16px 20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                          <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${MUTED};">${escapeHtml(highlightLabel)}</p>
                          <p style="margin:0;font-size:28px;font-weight:700;color:#0f172a;">${escapeHtml(highlightValue)}</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="padding-bottom:12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${MUTED};">Order details</td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:15px;line-height:1.6;">
                            ${detailsHtml}
                          </table>
                        </td>
                      </tr>
                    </table>
                    ${
                      showShipping
                        ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom:12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${MUTED};">Shipping to</td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;font-size:15px;line-height:1.6;color:#334155;">
                          ${shippingHtml}
                        </td>
                      </tr>
                    </table>`
                        : ''
                    }
                    <p style="margin:28px 0 0 0;padding-top:24px;border-top:1px solid #e2e8f0;font-size:14px;line-height:1.6;color:${MUTED};">
                      ${escapeHtml(footerNote)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;font-size:12px;line-height:1.6;color:#94a3b8;">
              <p style="margin:0;">This message was sent by ${escapeHtml(BRAND_NAME)} about your recent order.</p>
              <p style="margin:8px 0 0 0;">Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
