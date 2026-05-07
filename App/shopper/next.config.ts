import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/shopper',
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
