import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';

vi.stubGlobal('fetch', vi.fn());

import ReportsPage from '@/app/dashboard/reports/page';

const openItemReport = {
  id: 'report-1',
  type: 'item',
  targetId: 'item-1',
  targetName: 'Fake Rolex',
  reporterName: 'Alice',
  reason: 'counterfeit',
  description: 'Obvious knockoff',
  status: 'open',
  adminNotes: null,
  createdAt: '2024-06-01T00:00:00.000Z',
  resolvedAt: null,
  resolvedBy: null,
};

const investigatingReviewReport = {
  id: 'report-2',
  type: 'review',
  targetId: 'review-1',
  targetName: 'Spam review',
  reporterName: 'Bob',
  reason: 'spam',
  description: null,
  status: 'investigating',
  adminNotes: null,
  createdAt: '2024-06-02T00:00:00.000Z',
  resolvedAt: null,
  resolvedBy: null,
};

const resolvedReport = {
  id: 'report-3',
  type: 'item',
  targetId: 'item-2',
  targetName: 'Resolved listing',
  reporterName: 'Carol',
  reason: 'weird-reason',
  description: null,
  status: 'resolved',
  adminNotes: 'done',
  createdAt: '2024-06-03T00:00:00.000Z',
  resolvedAt: '2024-06-04T00:00:00.000Z',
  resolvedBy: 'admin@test.com',
};

function mockReportsFetch(reports = [openItemReport]) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { adminReports: reports } }), {
      status: 200,
    }) as never,
  );
}

function mockReportsError(message: string) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ errors: [{ message }] }), { status: 200 }) as never,
  );
}

function mockMutationSuccess(field: string) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { [field]: true } }), { status: 200 }) as never,
  );
}

function mockMutationError(message: string) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ errors: [{ message }] }), { status: 200 }) as never,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReportsPage', () => {
  it('renders the Reports heading immediately', () => {
    mockReportsFetch();
    render(<ReportsPage />);
    expect(screen.getByRole('heading', { name: /reports/i })).toBeInTheDocument();
  });

  it('shows a loading spinner while fetching', () => {
    mockReportsFetch();
    render(<ReportsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders reports after loading and shows the open count chip', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));
    expect(screen.getByText('Counterfeit')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('1 open')).toBeInTheDocument();
    // description shown beneath target
    expect(screen.getByText('Obvious knockoff')).toBeInTheDocument();
  });

  it('renders the Listing/Review type chips', async () => {
    mockReportsFetch([openItemReport, investigatingReviewReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));
    expect(screen.getByText('Listing')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('falls back to the raw reason and status when no label/chip mapping exists', async () => {
    mockReportsFetch([resolvedReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Resolved listing'));
    // reason has no REASON_LABELS entry → raw value
    expect(screen.getByText('weird-reason')).toBeInTheDocument();
  });

  it('shows the empty state for the all filter', async () => {
    mockReportsFetch([]); // initial "open" load
    render(<ReportsPage />);
    await waitFor(() => screen.getByText(/No open reports found\./i));

    mockReportsFetch([]); // after switching to All
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    await waitFor(() => {
      expect(screen.getByText(/No\s+reports found\./i)).toBeInTheDocument();
    });
  });

  it('shows a filter-specific empty state when a status filter is active', async () => {
    mockReportsFetch([]); // initial "open" load
    render(<ReportsPage />);
    await waitFor(() => screen.getByText(/No open reports found\./i));

    mockReportsFetch([]); // after switching to resolved
    fireEvent.click(screen.getByRole('button', { name: 'Resolved' }));
    await waitFor(() => {
      expect(screen.getByText(/No resolved reports found\./i)).toBeInTheDocument();
    });
  });

  it('refetches when a status filter chip is clicked', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    mockReportsFetch([resolvedReport]);
    fireEvent.click(screen.getByRole('button', { name: 'Resolved' }));
    await waitFor(() => screen.getByText('Resolved listing'));
  });

  it('shows an error alert when the fetch fails', async () => {
    mockReportsError('Not authenticated');
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });

  it('shows a fallback error for non-Error rejections', async () => {
    vi.mocked(fetch).mockRejectedValueOnce('boom' as never);
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load reports')).toBeInTheDocument();
    });
  });

  it('closes the error alert when the close button is clicked', async () => {
    mockReportsError('Some error');
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Some error'));

    fireEvent.click(screen.getByTitle('Close'));
    expect(screen.queryByText('Some error')).not.toBeInTheDocument();
  });

  it('marks an open report as investigating and leaves other reports untouched', async () => {
    const secondOpen = {
      ...openItemReport,
      id: 'report-9',
      targetName: 'Another report',
    };
    mockReportsFetch([openItemReport, secondOpen]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    mockMutationSuccess('adminUpdateReportStatus');
    // Click Investigate on the first report; the second must stay open.
    fireEvent.click(screen.getAllByRole('button', { name: 'Investigate' })[0]);

    await waitFor(() => {
      expect(screen.getByText('Investigating')).toBeInTheDocument();
    });
    // The untouched report still has its Investigate button.
    expect(screen.getAllByRole('button', { name: 'Investigate' })).toHaveLength(1);
  });

  it('shows an error alert when investigate fails', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    mockMutationError('Update failed');
    fireEvent.click(screen.getByRole('button', { name: 'Investigate' }));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when investigate rejects with a non-Error', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    vi.mocked(fetch).mockRejectedValueOnce('boom' as never);
    fireEvent.click(screen.getByRole('button', { name: 'Investigate' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to update report')).toBeInTheDocument();
    });
  });

  it('dismisses a report and removes it from the list', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    mockMutationSuccess('adminUpdateReportStatus');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    await waitFor(() => {
      expect(screen.queryByText('Fake Rolex')).not.toBeInTheDocument();
    });
  });

  it('shows an error alert when dismiss fails', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    mockMutationError('Dismiss failed');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    await waitFor(() => {
      expect(screen.getByText('Dismiss failed')).toBeInTheDocument();
    });
    expect(screen.getByText('Fake Rolex')).toBeInTheDocument();
  });

  it('shows a fallback error when dismiss rejects with a non-Error', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    vi.mocked(fetch).mockRejectedValueOnce('boom' as never);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to dismiss report')).toBeInTheDocument();
    });
  });

  it('opens the confirm dialog and cancels without deleting', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    fireEvent.click(screen.getByRole('button', { name: /delete & resolve/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    // report still present
    expect(screen.getByText('Fake Rolex')).toBeInTheDocument();
  });

  it('deletes the target and resolves the report on confirm', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    fireEvent.click(screen.getByRole('button', { name: /delete & resolve/i }));
    const dialog = screen.getByRole('dialog');

    mockMutationSuccess('adminDeleteReportTarget');
    fireEvent.click(within(dialog).getByRole('button', { name: /delete & resolve/i }));

    await waitFor(() => {
      expect(screen.queryByText('Fake Rolex')).not.toBeInTheDocument();
    });
  });

  it('shows an error alert when delete & resolve fails', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    fireEvent.click(screen.getByRole('button', { name: /delete & resolve/i }));
    const dialog = screen.getByRole('dialog');

    mockMutationError('Delete failed');
    fireEvent.click(within(dialog).getByRole('button', { name: /delete & resolve/i }));

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
    expect(screen.getByText('Fake Rolex')).toBeInTheDocument();
  });

  it('shows a fallback error when delete & resolve rejects with a non-Error', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    fireEvent.click(screen.getByRole('button', { name: /delete & resolve/i }));
    const dialog = screen.getByRole('dialog');

    vi.mocked(fetch).mockRejectedValueOnce('boom' as never);
    fireEvent.click(within(dialog).getByRole('button', { name: /delete & resolve/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete and resolve report')).toBeInTheDocument();
    });
  });

  it('closing the dialog with no selection is a no-op (handleDeleteAndResolve guard)', async () => {
    mockReportsFetch([openItemReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Fake Rolex'));

    // Open then close via backdrop/escape path: onClose sets confirmDialog to null
    fireEvent.click(screen.getByRole('button', { name: /delete & resolve/i }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Fake Rolex')).toBeInTheDocument();
  });

  it('falls back to the raw status label for an unrecognised status', async () => {
    const oddReport = {
      ...resolvedReport,
      id: 'report-odd',
      targetName: 'Odd status report',
      status: 'archived',
    };
    mockReportsFetch([oddReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Odd status report'));
    // STATUS_CHIP has no 'archived' entry → chip label is the raw status
    expect(screen.getByText('archived')).toBeInTheDocument();
  });

  it('does not render action buttons for terminal-status reports', async () => {
    mockReportsFetch([resolvedReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Resolved listing'));
    expect(screen.queryByRole('button', { name: 'Investigate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete & resolve/i })).not.toBeInTheDocument();
  });

  it('shows Delete & Resolve and Dismiss but not Investigate for investigating reports', async () => {
    mockReportsFetch([investigatingReviewReport]);
    render(<ReportsPage />);
    await waitFor(() => screen.getByText('Spam review'));
    expect(screen.queryByRole('button', { name: 'Investigate' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete & resolve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });
});
