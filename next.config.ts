import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingExcludes: {
    "*": ["**/*.map", "node_modules/**", ".next/cache/**"],
  },
};

export default nextConfig;
