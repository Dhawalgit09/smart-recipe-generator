import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors during builds (useful for Vercel deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
