import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

interface QuickLink {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    href: '/dashboard/profits',
    title: 'Profits',
    description: 'Track month-to-month profit trends.',
    icon: <TrendingUpIcon />,
    accent: '#10b981',
  },
  {
    href: '/dashboard/listings',
    title: 'Listings',
    description: 'Review and moderate marketplace listings.',
    icon: <ListAltIcon />,
    accent: '#3b82f6',
  },
  {
    href: '/dashboard/reviews',
    title: 'Reviews',
    description: 'Audit and moderate user reviews.',
    icon: <RateReviewIcon />,
    accent: '#f59e0b',
  },
  {
    href: '/dashboard/seller-messages',
    title: 'Messages',
    description: 'Read messages from sellers.',
    icon: <EmailIcon />,
    accent: '#8b5cf6',
  },
  {
    href: '/dashboard/accounts',
    title: 'Accounts',
    description: 'Manage admin accounts.',
    icon: <PeopleIcon />,
    accent: '#ef4444',
  },
  {
    href: '/dashboard/reports',
    title: 'Reports',
    description: 'View flagged content and reports.',
    icon: <AssessmentIcon />,
    accent: '#0ea5e9',
  },
];

export default function DashboardPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DashboardIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome to the Slug Marketplace admin panel. Use the navigation to manage
            listings, accounts, reviews, and reports.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                bgcolor: '#fff',
                transition:
                  'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: `${link.accent}1a`,
                  color: link.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {link.icon}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {link.title}
                  </Typography>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {link.description}
                </Typography>
              </Box>
            </Paper>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
