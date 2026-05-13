import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

const messageLoaders: Record<string, () => Promise<{default: Record<string, unknown>}>> = {
  en: () => import('../../messages/en.json'),
  fr: () => import('../../messages/fr.json'),
};

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get('locale')?.value || 'en';
  const loader = messageLoaders[locale] ?? messageLoaders['en'];

  return {
    locale,
    messages: (await loader()).default
  };
});