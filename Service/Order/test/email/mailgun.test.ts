import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isMailgunConfigured,
  sendMailgunMessage,
} from '../../src/email/mailgun';

describe('sendMailgunMessage', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('reports when Mailgun env vars are missing', () => {
    delete process.env.MAILGUN_API_KEY;
    delete process.env.MAILGUN_DOMAIN;
    delete process.env.MAILGUN_FROM;

    expect(isMailgunConfigured()).toBe(false);
  });

  it('skips the API call when Mailgun is not configured', async () => {
    delete process.env.MAILGUN_API_KEY;
    delete process.env.MAILGUN_DOMAIN;
    delete process.env.MAILGUN_FROM;

    await sendMailgunMessage({
      to: 'buyer@example.com',
      subject: 'Test',
      text: 'Hello',
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts to the Mailgun messages API when configured', async () => {
    process.env.MAILGUN_API_KEY = 'key-test';
    process.env.MAILGUN_DOMAIN = 'mg.example.com';
    process.env.MAILGUN_FROM = 'orders@mg.example.com';

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => '',
    } as Response);

    await sendMailgunMessage({
      to: 'buyer@example.com',
      subject: 'Order confirmed',
      text: 'Thanks',
      html: '<p>Thanks</p>',
    });

    expect(isMailgunConfigured()).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.mailgun.net/v3/mg.example.com/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic '),
        }),
      }),
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = options?.body as string;
    expect(body).toContain('to=buyer%40example.com');
    expect(body).toContain('subject=Order+confirmed');
  });

  it('throws when Mailgun returns a non-success response', async () => {
    process.env.MAILGUN_API_KEY = 'key-test';
    process.env.MAILGUN_DOMAIN = 'mg.example.com';
    process.env.MAILGUN_FROM = 'orders@mg.example.com';

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Forbidden',
    } as Response);

    await expect(
      sendMailgunMessage({
        to: 'buyer@example.com',
        subject: 'Order confirmed',
        text: 'Thanks',
      }),
    ).rejects.toThrow('Mailgun request failed (401)');
  });
});
