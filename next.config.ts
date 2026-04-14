import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  reactStrictMode: true,

  images: {
    unoptimized: true,
    remotePatterns: [],
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      sury: false,
    };
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
