'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import EmailIcon from '@mui/icons-material/Email';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import SimpleCharts from './charts/chart';
import LocaleSwitcher from './localeSwitcher/localeSwitcher';

export default function DashboardShell({
  children,
  currentLocale,
}: {
  children: ReactNode;
  currentLocale: string;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const t = useTranslations('Dashboard');

  if (!mounted) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}
          >
            {t('title')}
          </Typography>
          <Button
            component={Link}
            href="/dashboard/seller-messages"
            color="inherit"
            startIcon={<EmailIcon />}
            sx={{ mr: 1 }}
          >
            Messages
          </Button>
          <LocaleSwitcher currentLocale={currentLocale} />
          <LogoutButton />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          gap: 3,
          p: 3,
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>

        <Paper elevation={2} sx={{ flexShrink: 0, borderRadius: 2, p: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={1}
            color="text.secondary"
          >
            Monthly Profit
          </Typography>
          <SimpleCharts />
        </Paper>
      </Box>
    </Box>
  );
}
