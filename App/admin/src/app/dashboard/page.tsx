import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { cookies } from 'next/headers';
import LocaleSwitcher from '@/components/dashboard/localeSwitcher/localeSwitcher';


export default async function DashboardPage() {
  const locale = (await cookies()).get('locale')?.value ?? 'en';
  return (
    <Paper elevation={2} sx={{ borderRadius: 2, p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <DashboardIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <LocaleSwitcher currentLocale={locale} />
      </Box>
      <Typography variant="body1" color="text.secondary">
        Welcome to the Slug Marketplace admin panel. Use the navigation to manage listings, accounts, reviews, and reports.
      </Typography>
    </Paper>
  );
}
