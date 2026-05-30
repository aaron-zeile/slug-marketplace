import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import PeopleIcon from '@mui/icons-material/People';

export default function AccountsPage() {
  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 2, p: 4, border: '1px solid #e5e7eb', bgcolor: '#fff' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <PeopleIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Accounts
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Manage admin and staff accounts. Account management tools are coming soon.
      </Typography>
    </Paper>
  );
}
