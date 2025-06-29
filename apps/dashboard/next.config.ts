import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Validate environment variables
import "@/lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Disabled typechecking because of Hono RPC cross-project references
    ignoreBuildErrors: true,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      // Guilders Bucket
      {
        hostname: "db.guilders.app",
      },
      // SnapTrade
      {
        hostname: "passiv-brokerage-logos.s3.ca-central-1.amazonaws.com",
      },
      // SnapTrade Stock Logos
      {
        hostname: "storage.googleapis.com",
        pathname: "/iexcloud-hl37opg/api/logos/**",
      },
      // EnableBanking
      {
        hostname: "enablebanking.com",
      },
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
