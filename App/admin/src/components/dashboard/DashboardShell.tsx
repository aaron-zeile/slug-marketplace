'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import LocaleSwitcher from './localeSwitcher/localeSwitcher';

const DRAWER_WIDTH = 248;

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <DashboardIcon fontSize="small" /> },
  { href: '/dashboard/profits', label: 'Profits', icon: <TrendingUpIcon fontSize="small" /> },
  { href: '/dashboard/listings', label: 'Listings', icon: <ListAltIcon fontSize="small" /> },
  { href: '/dashboard/reviews', label: 'Reviews', icon: <RateReviewIcon fontSize="small" /> },
  { href: '/dashboard/seller-messages', label: 'Messages', icon: <EmailIcon fontSize="small" /> },
  { href: '/dashboard/accounts', label: 'Accounts', icon: <PeopleIcon fontSize="small" /> },
  { href: '/dashboard/reports', label: 'Reports', icon: <AssessmentIcon fontSize="small" /> },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const pathname = usePathname();

  if (!mounted) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#0f172a',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <StorefrontIcon sx={{ color: '#60a5fa' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.4 }}
          >
            {t('title')}
          </Typography>
          <LocaleSwitcher currentLocale={currentLocale} />
          <LogoutButton />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ px: 2, pt: 3, pb: 1 }}>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', letterSpacing: 1, fontWeight: 600 }}
            >
              Navigation
            </Typography>
          </Box>
          <List sx={{ px: 1.5 }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={active}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      '&.Mui-selected': {
                        bgcolor: '#e0f2fe',
                        color: '#0369a1',
                        '& .MuiListItemIcon-root': { color: '#0369a1' },
                        '&:hover': { bgcolor: '#bae6fd' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Slug Marketplace · Admin
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, md: 4 },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
