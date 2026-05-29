export interface SendMailgunMessageInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export function isMailgunConfigured(): boolean {
  return Boolean(
    process.env.MAILGUN_API_KEY &&
      process.env.MAILGUN_DOMAIN &&
      process.env.MAILGUN_FROM,
  );
}

export async function sendMailgunMessage(
  input: SendMailgunMessageInput,
): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM;

  if (!apiKey || !domain || !from) {
    return;
  }

  const body = new URLSearchParams({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  if (input.html) {
    body.set('html', input.html);
  }

  const response = await fetch(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Mailgun request failed (${response.status}): ${responseText || response.statusText}`,
    );
  }
}
