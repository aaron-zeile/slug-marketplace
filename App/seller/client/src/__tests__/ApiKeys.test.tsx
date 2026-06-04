import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ApiKeys from '../dashboard/ApiKeys';
import { renderWithProviders } from '../test/renderWithProviders';

describe('ApiKeys', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url;

        if (url === '/seller/api/keys' && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({
              id: 'key-2',
              name: 'Bulk uploader',
              key: 'slug_sk_created',
              created_at: '2026-05-18T00:00:00.000Z',
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            keys: [
              {
                id: 'key-1',
                name: 'Existing key',
                created_at: '2026-05-17T00:00:00.000Z',
              },
            ],
          }),
        };
      }),
    );
  });

  it('creates and displays a seller API key', async () => {
    const fetchMock = vi.mocked(fetch);
    renderWithProviders(<ApiKeys />);

    await screen.findByText('Existing key');
    fireEvent.change(screen.getByRole('textbox', { name: /Key name/ }), {
      target: { value: 'Bulk uploader' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Key' }));

    await screen.findByText('slug_sk_created');

    expect({
      fetchCalls: fetchMock.mock.calls.slice(0, 3),
      headerVisible: screen.queryByText('X-API-Key: slug_sk_created') !== null,
    }).toEqual({
      fetchCalls: [
        ['/seller/api/keys'],
        [
          '/seller/api/keys',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'Bulk uploader' }),
          },
        ],
        ['/seller/api/keys'],
      ],
      headerVisible: true,
    });
  });

  it('copies the created API key', async () => {
    const writeText = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText },
    });
    renderWithProviders(<ApiKeys />);

    await screen.findByText('Existing key');
    fireEvent.click(screen.getByRole('button', { name: 'Create Key' }));
    await screen.findByText('slug_sk_created');
    fireEvent.click(screen.getByRole('button', { name: 'Copy API key' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('slug_sk_created');
    });
  });

  it('revokes an existing API key', async () => {
    const fetchMock = vi.mocked(fetch);
    renderWithProviders(<ApiKeys />);

    await screen.findByText('Existing key');
    fireEvent.click(
      screen.getByRole('button', { name: 'Revoke Existing key' }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Existing key')).toBeNull();
    });
    expect(fetchMock.mock.calls[1]).toEqual([
      '/seller/api/keys/key-1',
      {
        method: 'DELETE',
      },
    ]);
  });

  it('does not create an API key with a blank name', async () => {
    const fetchMock = vi.mocked(fetch);
    renderWithProviders(<ApiKeys />);

    await screen.findByText('Existing key');
    fireEvent.change(screen.getByRole('textbox', { name: /Key name/ }), {
      target: { value: '   ' },
    });
    const form = screen
      .getByRole('textbox', { name: /Key name/ })
      .closest('form');
    if (!form) {
      throw new Error('form not found');
    }
    fireEvent.submit(form);

    expect(fetchMock.mock.calls).toHaveLength(1);
  });

  it('renders without an error provider when key loading fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        statusText: 'Unauthorized',
      })),
    );

    render(<ApiKeys />);

    expect(await screen.findByText('No API keys yet.')).toBeInTheDocument();
  });
});
