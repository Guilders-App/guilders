import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Validate environment variables
import "@/lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: {
    appIsrStatus: false,
  },
  typescript: {
    // Disabled typechecking because of Hono RPC cross-project references
    ignoreBuildErrors: true,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      // Guilders Bucket
      {
        hostname: "evolcpeagtzeheagxreb.supabase.co",
      },
      // SnapTrade
      {
        hostname: "passiv-brokerage-logos.s3.ca-central-1.amazonaws.com",
      },
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
