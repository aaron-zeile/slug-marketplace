import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

import { useAppLocale } from '../i18n/LocaleContext';
import type { AppLocale } from '../i18n/locale';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useAppLocale();
  const t = useTranslations('LocaleSwitcher');

  const handleChange = (event: SelectChangeEvent) => {
    setLocale(event.target.value as AppLocale);
  };

  return (
    <Box sx={{ minWidth: 120, ml: 'auto' }}>
      <FormControl fullWidth size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)' }}>
        <InputLabel id="seller-locale-label" sx={{ color: 'inherit' }}>
          {t('label')}
        </InputLabel>
        <Select
          labelId="seller-locale-label"
          id="seller-locale-select"
          value={locale}
          label={t('label')}
          onChange={handleChange}
          sx={{
            color: 'inherit',
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.7)',
            },
            '.MuiSvgIcon-root': { color: 'inherit' },
          }}
        >
          <MenuItem value="en">{t('en')}</MenuItem>
          <MenuItem value="fr">{t('fr')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
