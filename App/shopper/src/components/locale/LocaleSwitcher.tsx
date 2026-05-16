'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const [locale, setLocale] = React.useState(currentLocale);
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');

  React.useEffect(() => {
    setLocale(currentLocale);
  }, [currentLocale]);

  const handleChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value as string;
    setLocale(newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="shopper-locale-label">{t('label')}</InputLabel>
        <Select
          labelId="shopper-locale-label"
          id="shopper-locale-select"
          value={locale}
          label={t('label')}
          onChange={handleChange}
        >
          <MenuItem value="en">{t('en')}</MenuItem>
          <MenuItem value="fr">{t('fr')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
