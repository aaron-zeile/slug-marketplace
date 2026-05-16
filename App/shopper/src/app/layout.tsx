import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { cookies } from 'next/headers';
import { getMessages } from 'next-intl/server';
import AppProviders from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Slug Marketplace',
  description: 'Best Quality, Cheapest Prices.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const locale = store.get('locale')?.value ?? 'en';
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <AppRouterCacheProvider>
          <AppProviders locale={locale} messages={messages}>
            {children}
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
