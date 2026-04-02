import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5000" },
      { protocol: "https", hostname: "**" },
    ],
  },
  // All pages use wallet/blockchain — skip static generation entirely
  experimental: {
    // force all pages to be dynamic (no prerendering)
  },
};

export default nextConfig;
