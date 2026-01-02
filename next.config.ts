import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  experimental: {
    // appDir is no longer experimental in Next.js 13.4+
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
