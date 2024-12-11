import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
    ];
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;