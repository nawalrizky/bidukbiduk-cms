import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'backend.bidukbiduk.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend.bidukbiduk.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'backend.bidukbiduk.com',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      }
    ]
  }
};

export default nextConfig;
