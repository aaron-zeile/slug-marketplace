import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function ReportsPage() {
  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 2, p: 4, border: '1px solid #e5e7eb', bgcolor: '#fff' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <AssessmentIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Reports
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Review flagged content and incident reports. Reporting tools are coming soon.
      </Typography>
    </Paper>
  );
}
