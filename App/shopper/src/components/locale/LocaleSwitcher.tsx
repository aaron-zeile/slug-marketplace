'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

const visuallyHiddenSx = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
} as const;

export default function LocaleSwitcher({
  compact = false,
  variant,
}: {
  compact?: boolean;
  variant?: 'default' | 'compact' | 'menu';
}) {
  const resolvedVariant = variant ?? (compact ? 'compact' : 'default');
  const currentLocale = useLocale();
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');

  const handleChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value as string;
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const isCompact = resolvedVariant === 'compact';
  const isMenu = resolvedVariant === 'menu';

  return (
    <Box sx={{ minWidth: isCompact ? { xs: 76, sm: 88 } : '100%' }}>
      <FormControl
        sx={{
          width: '100%',
          ...(isCompact || isMenu
            ? {}
            : {
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                },
              }),
        }}
      >
        <InputLabel
          id="shopper-locale-label"
          sx={{
            fontSize: '0.875rem',
            ...(isCompact || isMenu ? visuallyHiddenSx : {}),
          }}
        >
          {isCompact || isMenu ? t('selectLocale') : t('label')}
        </InputLabel>
        <Select
          labelId="shopper-locale-label"
          id="shopper-locale-select"
          value={currentLocale}
          label={isCompact || isMenu ? t('selectLocale') : t('label')}
          onChange={handleChange}
          sx={{
            fontSize: '0.875rem',
            ...(isCompact
              ? {
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  '& .MuiSelect-select': { py: 0.75, px: 1.25 },
                  '&:before, &:after': { display: 'none' },
                }
              : isMenu
                ? {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '& .MuiSelect-select': { py: 1 },
                  }
                : {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '& .MuiSelect-select': { py: 1 },
                  }),
          }}
        >
          <MenuItem value="en" sx={{ fontSize: '0.875rem' }}>
            {t('en')}
          </MenuItem>
          <MenuItem value="fr" sx={{ fontSize: '0.875rem' }}>
            {t('fr')}
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
