import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Proxy API requests to Express backend in development.
  // In production, configure this via environment variable or reverse proxy.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
