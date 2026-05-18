import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  getLocaleFromCookie,
  persistLocaleCookie,
  type AppLocale,
} from './locale';

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getLocaleFromCookie());

  const value = useMemo(
    () => ({
      locale,
      setLocale: (nextLocale: AppLocale) => {
        persistLocaleCookie(nextLocale);
        setLocaleState(nextLocale);
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useAppLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useAppLocale must be used within LocaleProvider');
  }
  return context;
}
