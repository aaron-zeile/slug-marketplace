import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mockSql }));

import MessagesPage from '@/app/dashboard/seller-messages/page';

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when there are no messages', async () => {
    mockSql.mockResolvedValue([]);

    render(await MessagesPage());

    expect(screen.getByRole('heading', { name: /seller messages/i })).toBeInTheDocument();
    expect(screen.getByText('No messages yet.')).toBeInTheDocument();
  });

  it('renders seller messages from the database', async () => {
    mockSql.mockResolvedValue([
      {
        id: 'msg-1',
        seller_name: 'Taylor Brooks',
        seller_email: 'seller@example.com',
        subject: 'Listing question',
        body: 'Can you review my item?',
        created_at: new Date('2024-06-01T12:00:00Z'),
      },
    ]);

    render(await MessagesPage());

    expect(screen.getByText('Listing question')).toBeInTheDocument();
    expect(screen.getByText(/Taylor Brooks/)).toBeInTheDocument();
    expect(screen.getByText(/seller@example.com/)).toBeInTheDocument();
    expect(screen.getByText('Can you review my item?')).toBeInTheDocument();
  });
});
