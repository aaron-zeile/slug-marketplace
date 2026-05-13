import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  basePath: '/admin',
  assetPrefix: '/admin',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
        basePath: false,
      },
    ];
  },

  serverExternalPackages: [
    'reflect-metadata',
    'type-graphql',
    'graphql',
    'graphql-yoga',
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
