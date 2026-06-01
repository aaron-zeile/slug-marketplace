'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FlagIcon from '@mui/icons-material/Flag';

interface AdminReport {
  id: string;
  type: string;
  targetId: string;
  targetName: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const STATUS_FILTERS = ['all', 'open', 'investigating', 'resolved', 'dismissed'] as const;

const STATUS_CHIP: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' }> = {
  open: { label: 'Open', color: 'warning' },
  investigating: { label: 'Investigating', color: 'info' },
  resolved: { label: 'Resolved', color: 'success' },
  dismissed: { label: 'Dismissed', color: 'default' },
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Inappropriate',
  counterfeit: 'Counterfeit',
  misleading: 'Misleading',
  other: 'Other',
};

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch('/admin/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('open');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reportId: string;
    targetType: string;
    targetId: string;
    targetName: string;
  } | null>(null);

  const fetchReports = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gql(
        `query($status: String) {
          adminReports(status: $status) {
            id type targetId targetName reporterName reason description
            status adminNotes createdAt resolvedAt resolvedBy
          }
        }`,
        { status: status === 'all' ? null : status },
      );
      setReports(data.adminReports);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(activeFilter); }, [activeFilter, fetchReports]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleInvestigate = async (id: string) => {
    setActionInProgress(id);
    try {
      await gql(
        `mutation($id: String!, $status: String!, $adminNotes: String) {
          adminUpdateReportStatus(id: $id, status: $status, adminNotes: $adminNotes)
        }`,
        { id, status: 'investigating', adminNotes: null },
      );
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'investigating' } : r)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update report');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setActionInProgress(id);
    try {
      await gql(
        `mutation($id: String!, $status: String!, $adminNotes: String) {
          adminUpdateReportStatus(id: $id, status: $status, adminNotes: $adminNotes)
        }`,
        { id, status: 'dismissed', adminNotes: null },
      );
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to dismiss report');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteAndResolve = async () => {
    if (!confirmDialog) return;
    const { reportId, targetType, targetId } = confirmDialog;
    setConfirmDialog(null);
    setActionInProgress(reportId);
    try {
      await gql(
        `mutation($reportId: String!, $targetType: String!, $targetId: String!) {
          adminDeleteReportTarget(reportId: $reportId, targetType: $targetType, targetId: $targetId)
        }`,
        { reportId, targetType, targetId },
      );
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete and resolve report');
    } finally {
      setActionInProgress(null);
    }
  };

  const openCount = reports.filter((r) => r.status === 'open').length;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 2, p: 4, border: '1px solid #e5e7eb', bgcolor: '#fff' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <FlagIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Reports
        </Typography>
        {!loading && openCount > 0 && (
          <Chip
            label={`${openCount} open`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            variant={activeFilter === f ? 'filled' : 'outlined'}
            color={activeFilter === f ? 'primary' : 'default'}
            onClick={() => handleFilterChange(f)}
            sx={{ cursor: 'pointer', fontWeight: activeFilter === f ? 700 : 400 }}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Typography color="text.secondary">
          No {activeFilter === 'all' ? '' : activeFilter} reports found.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Target</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Reporter</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => {
                const chipInfo = STATUS_CHIP[report.status] ?? { label: report.status, color: 'default' as const };
                const busy = actionInProgress === report.id;
                const isActive = report.status === 'open' || report.status === 'investigating';
                return (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Chip
                        label={report.type === 'item' ? 'Listing' : 'Review'}
                        size="small"
                        color={report.type === 'item' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" title={report.targetName}>
                        {report.targetName}
                      </Typography>
                      {report.description && (
                        <Typography variant="caption" color="text.secondary" title={report.description} sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                          {report.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{REASON_LABELS[report.reason] ?? report.reason}</TableCell>
                    <TableCell>{report.reporterName}</TableCell>
                    <TableCell>
                      <Chip
                        label={chipInfo.label}
                        color={chipInfo.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'nowrap' }}>
                        {report.status === 'open' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            disabled={busy}
                            onClick={() => handleInvestigate(report.id)}
                          >
                            Investigate
                          </Button>
                        )}
                        {isActive && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={busy}
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                reportId: report.id,
                                targetType: report.type,
                                targetId: report.targetId,
                                targetName: report.targetName,
                              })
                            }
                          >
                            Delete &amp; Resolve
                          </Button>
                        )}
                        {isActive && (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={busy}
                            onClick={() => handleDismiss(report.id)}
                          >
                            Dismiss
                          </Button>
                        )}
                        {busy && <CircularProgress size={18} sx={{ alignSelf: 'center' }} />}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={confirmDialog?.open ?? false} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>Delete and resolve report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete{' '}
            <strong>{confirmDialog?.targetName}</strong> and mark the report as resolved.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAndResolve}>
            Delete &amp; Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
