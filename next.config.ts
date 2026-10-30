import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large prescription photo uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/parse-prescription',
        destination: '/api/parse-prescription',
      },
      {
        source: '/chat',
        destination: '/api/chat',
      },
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
};

export default nextConfig;
