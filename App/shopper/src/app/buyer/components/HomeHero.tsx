'use client';

import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function HomeHero() {
  const t = useTranslations('Home');

  return (
    <Box
      component="section"
      aria-label={t('heroAriaLabel')}
      sx={{
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        pt: { xs: 3, md: 5, lg: 6 },
        pb: { xs: 4.5, sm: 5, md: 6, lg: 7 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          background: `
            radial-gradient(ellipse 90% 70% at 100% 0%, rgba(20, 184, 166, 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 70% 55% at 0% 100%, rgba(45, 212, 191, 0.25) 0%, transparent 50%),
            linear-gradient(165deg, #0f766e 0%, #0b5a54 42%, #064e3b 100%)
          `,
          inset: 0,
          position: 'absolute',
        }}
      />
      <Box
        aria-hidden
        sx={{
          bgcolor: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%',
          filter: 'blur(1px)',
          height: { xs: 140, md: 220, lg: 280 },
          position: 'absolute',
          right: { xs: -40, md: 40, lg: 80 },
          top: { xs: -30, md: -60, lg: -80 },
          width: { xs: 140, md: 220, lg: 280 },
        }}
      />
      <Box
        aria-hidden
        sx={{
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          bottom: { xs: 20, md: 40 },
          height: { xs: 90, md: 140, lg: 180 },
          left: { xs: -24, md: 48, lg: 96 },
          position: 'absolute',
          width: { xs: 90, md: 140, lg: 180 },
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          px: { xs: 2, sm: 3 },
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            maxWidth: { md: 640, lg: 720 },
            mx: { md: 0 },
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              backdropFilter: 'blur(8px)',
              display: 'inline-flex',
              gap: 0.75,
              mb: { xs: 2, md: 2.5 },
              px: { xs: 1.5, md: 2 },
              py: { xs: 0.75, md: 0.9 },
            }}
          >
            <StorefrontOutlinedIcon
              sx={{ fontSize: { xs: 18, md: 20 }, opacity: 0.95 }}
            />
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', md: '0.8rem' },
                fontWeight: 600,
                letterSpacing: '0.04em',
                lineHeight: 1,
                textTransform: 'uppercase',
              }}
            >
              {t('heroBadge')}
            </Typography>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '2rem', md: '2.75rem', lg: '3.25rem' },
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: { xs: 1.08, md: 1.05 },
              maxWidth: { xs: 300, md: 520, lg: 600 },
              mb: { xs: 1.25, md: 1.75 },
            }}
          >
            {t('heroTitleLine1')}
            <Box component="span" sx={{ display: 'block' }}>
              {t('heroTitleLine2')}
            </Box>
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.86)',
              fontSize: { xs: '0.95rem', md: '1.05rem', lg: '1.125rem' },
              lineHeight: 1.55,
              maxWidth: { xs: 320, md: 480, lg: 540 },
              mb: { xs: 2.5, md: 3 },
            }}
          >
            {t('heroSubtitle')}
          </Typography>
        </Box>
      </Container>

      <Box
        aria-hidden
        sx={{
          bgcolor: '#f6f8f7',
          borderTopLeftRadius: { xs: 28, md: 36, lg: 40 },
          borderTopRightRadius: { xs: 28, md: 36, lg: 40 },
          bottom: 0,
          height: { xs: 28, md: 36, lg: 40 },
          left: 0,
          position: 'absolute',
          right: 0,
          zIndex: 1,
        }}
      />
    </Box>
  );
}
