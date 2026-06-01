import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/seller',
        destination: 'http://localhost:3010/seller',
      },
      {
        source: '/seller/:path*',
        destination: 'http://localhost:3010/seller/:path*',
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
