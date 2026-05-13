import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Admin | Slug Marketplace',
  description: 'Slug Marketplace admin dashboard',
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const store = await cookies();
  const currentLocale = store.get('locale')?.value ?? 'en';

  return (
    <html lang={currentLocale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}