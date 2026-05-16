'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { enUS, frFR } from '@mui/material/locale';

const muiLocales: Record<string, typeof enUS> = {
  en: enUS,
  fr: frFR,
};

export default function MuiLocaleProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const theme = useMemo(
    () => createTheme({}, muiLocales[locale] ?? enUS),
    [locale],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
