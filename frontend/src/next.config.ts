import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  compress: true,

  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
