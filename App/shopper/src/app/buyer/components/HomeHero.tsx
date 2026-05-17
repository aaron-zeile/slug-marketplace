'use client';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const brandLight = '#14b8a6';

export default function HomeHero() {
  const t = useTranslations('Home');

  const chips = [
    { icon: VerifiedOutlinedIcon, label: t('heroChipCurated') },
    { icon: SellOutlinedIcon, label: t('heroChipPrices') },
    { icon: LocalShippingOutlinedIcon, label: t('heroChipEasy') },
  ];

  return (
    <Box
      component="section"
      aria-label={t('heroAriaLabel')}
      sx={{
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        px: 2,
        pt: 3,
        pb: { xs: 4.5, sm: 5 },
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
          height: 140,
          position: 'absolute',
          right: -40,
          top: -30,
          width: 140,
        }}
      />
      <Box
        aria-hidden
        sx={{
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          bottom: 20,
          height: 90,
          left: -24,
          position: 'absolute',
          width: 90,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 999,
            backdropFilter: 'blur(8px)',
            display: 'inline-flex',
            gap: 0.75,
            mb: 2,
            px: 1.5,
            py: 0.75,
          }}
        >
          <StorefrontOutlinedIcon sx={{ fontSize: 18, opacity: 0.95 }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
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
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.08,
            maxWidth: 300,
            mb: 1.25,
          }}
        >
          {t('heroTitleLine1')}
          <Box
            component="span"
            sx={{
              background: `linear-gradient(90deg, #fff 0%, ${brandLight} 100%)`,
              backgroundClip: 'text',
              display: 'block',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('heroTitleLine2')}
          </Box>
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.86)',
            fontSize: '0.95rem',
            lineHeight: 1.55,
            maxWidth: 320,
            mb: 2.5,
          }}
        >
          {t('heroSubtitle')}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            width: '100%',
          }}
        >
          {chips.map(({ icon: Icon, label }) => (
            <Box
              key={label}
              sx={{
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.35,
                justifyContent: 'center',
                minWidth: 0,
                px: 0.5,
                py: 0.85,
                textAlign: 'center',
              }}
            >
              <Icon sx={{ fontSize: 15, opacity: 0.9 }} />
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  lineHeight: 1.25,
                }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        aria-hidden
        sx={{
          bgcolor: '#f6f8f7',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          bottom: 0,
          height: 28,
          left: 0,
          position: 'absolute',
          right: 0,
          zIndex: 1,
        }}
      />
    </Box>
  );
}
