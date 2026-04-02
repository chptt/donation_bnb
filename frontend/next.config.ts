import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local backend (dev only)
      { protocol: "http", hostname: "localhost", port: "5000" },
      // Production backend — set NEXT_PUBLIC_API_URL to your deployed backend
      { protocol: "https", hostname: "**" },
    ],
  },
  // Silence ESLint errors during Vercel builds (warnings still show)
  eslint: {
    ignoreDuringBuilds: false,
  },
  // TypeScript errors will still fail the build (good)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
