'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { submitReportAction } from './actions';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'counterfeit', label: 'Counterfeit or fake' },
  { value: 'misleading', label: 'Misleading or inaccurate' },
  { value: 'other', label: 'Other' },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  type: 'item' | 'review';
  targetId: string;
  targetName: string;
}

export default function ReportModal({ open, onClose, type, targetId, targetName }: Props) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; success: boolean; message: string }>({
    open: false,
    success: true,
    message: '',
  });

  const handleClose = () => {
    if (submitting) return;
    setReason('');
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    const result = await submitReportAction({
      type,
      targetId,
      targetName,
      reason,
      description: description.trim() || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setReason('');
      setDescription('');
      onClose();
      setSnackbar({ open: true, success: true, message: 'Report submitted. Thank you for your feedback.' });
    } else {
      setSnackbar({ open: true, success: false, message: result.error ?? 'Failed to submit report.' });
    }
  };

  const label = type === 'item' ? 'listing' : 'review';

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Report this {label}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary">
            Help us keep the marketplace safe. Reports are reviewed by our moderation team.
          </Typography>
          <FormControl fullWidth size="small" required>
            <InputLabel id="report-reason-label">Reason</InputLabel>
            <Select
              labelId="report-reason-label"
              value={reason}
              label="Reason"
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Additional details (optional)"
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            helperText={`${description.length}/500`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!reason || submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.success ? 'success' : 'error'}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
