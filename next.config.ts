import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment configuration
  trailingSlash: true,
  images: {
    domains: [], // Add any external image domains if needed
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  }
};

export default nextConfig;
