import React, { type ReactNode } from 'react';
import { useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { enUS, frFR } from '@mui/material/locale';

import { LocaleProvider, useAppLocale } from '../i18n/LocaleContext';
import { messages } from '../i18n/locale';

const brandColor = '#0b5a54';

const muiLocales = {
  en: enUS,
  fr: frFR,
} as const;

function ThemedApp({ children }: { children: ReactNode }) {
  const { locale } = useAppLocale();

  const theme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            primary: {
              main: brandColor,
              contrastText: '#fff',
            },
          },
        },
        muiLocales[locale],
      ),
    [locale],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <LocaleIntlBridge>{children}</LocaleIntlBridge>
    </LocaleProvider>
  );
}

function LocaleIntlBridge({ children }: { children: ReactNode }) {
  const { locale } = useAppLocale();

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      <ThemedApp>{children}</ThemedApp>
    </NextIntlClientProvider>
  );
}
