import path from 'path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
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
