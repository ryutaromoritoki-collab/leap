import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.0.115'],
  devIndicators: false,
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
