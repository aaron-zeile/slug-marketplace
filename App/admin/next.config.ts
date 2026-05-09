import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/admin',
  serverExternalPackages: [
    'reflect-metadata',
    'type-graphql',
    'graphql',
    'graphql-yoga',
  ],
};

export default nextConfig;
