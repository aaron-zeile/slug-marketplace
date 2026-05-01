import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slug Marketplace',
  description: 'Best Quality, Cheapest Prices.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
