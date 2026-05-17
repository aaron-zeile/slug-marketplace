import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

export type AppLocale = 'en' | 'fr';

export const messages = {
  en,
  fr,
} as const;

export function getLocaleFromCookie(): AppLocale {
  if (typeof document === 'undefined') {
    return 'en';
  }

  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1] === 'fr' ? 'fr' : 'en';
}

export function persistLocaleCookie(locale: AppLocale): void {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
}
